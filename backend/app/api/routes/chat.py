from datetime import datetime, timezone
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select

from app.api.deps import get_db_session
from app.models.chat import ChatMessage, ChatSession
from app.models.event import Event
from app.models.user import User
from app.schemas.chat import ChatMessageCreate, ChatMessageRead, ChatSessionCreate, ChatSessionRead
from app.services.calendar_service import CalendarService
from app.services.chat_service import ChatService
from app.services.discord_agent_service import DiscordAgentService
from app.services.llm_service import LLMService

router = APIRouter()
chat_service = ChatService()
llm_service = LLMService()
calendar_service = CalendarService()
discord_agent_service = DiscordAgentService()


@router.get('/sessions', response_model=list[ChatSessionRead])
def list_sessions(user_id: UUID | None = Query(default=None), session: Session = Depends(get_db_session)) -> list[ChatSession]:
    statement = select(ChatSession)
    if user_id:
        statement = statement.where(ChatSession.user_id == user_id)
    statement = statement.order_by(ChatSession.last_message_at.desc())
    return list(session.exec(statement).all())


@router.post('/sessions', response_model=ChatSessionRead)
def create_session(payload: ChatSessionCreate, session: Session = Depends(get_db_session)) -> ChatSession:
    chat_session = ChatSession(**payload.model_dump())
    session.add(chat_session)
    session.commit()
    session.refresh(chat_session)
    return chat_session


@router.get('/sessions/{session_id}/messages', response_model=list[ChatMessageRead])
def list_messages(session_id: UUID, session: Session = Depends(get_db_session)) -> list[ChatMessage]:
    statement = select(ChatMessage).where(ChatMessage.session_id == session_id).order_by(ChatMessage.created_at.asc())
    return list(session.exec(statement).all())


@router.post('/messages', response_model=ChatMessageRead)
def create_message(payload: ChatMessageCreate, session: Session = Depends(get_db_session)) -> ChatMessage:
    chat_session = session.get(ChatSession, payload.session_id)
    if not chat_session:
        raise HTTPException(status_code=404, detail='Chat session not found')

    message = ChatMessage(**payload.model_dump())
    chat_session.last_message_at = datetime.now(timezone.utc)

    session.add(message)
    session.add(chat_session)
    session.commit()
    session.refresh(message)
    return message


@router.post('/discord-agent/{user_id}/preview')
def preview_discord_agent_action(user_id: UUID, body: dict, session: Session = Depends(get_db_session)) -> dict:
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail='User not found')

    message = str(body.get('message', '')).strip()
    if not message:
        raise HTTPException(status_code=400, detail='Message is required')

    plan = discord_agent_service.build_plan(message)
    action_payload = {
        'intent': plan.intent,
        'params': discord_agent_service.serialize_params(plan.params),
    }
    return {
        'intent': plan.intent,
        'confidence': plan.confidence,
        'requires_confirmation': plan.requires_confirmation,
        'message': discord_agent_service.describe_pending_action(plan) if plan.requires_confirmation else plan.message,
        'action_payload': action_payload,
    }


@router.post('/discord-agent/{user_id}/execute')
def execute_discord_agent_action(user_id: UUID, body: dict, session: Session = Depends(get_db_session)) -> dict:
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail='User not found')

    intent = str(body.get('intent', '')).strip()
    params = body.get('params') or {}
    if not intent:
        raise HTTPException(status_code=400, detail='Intent is required')

    plan = discord_agent_service.build_plan('')
    plan.intent = intent
    plan.params = params
    plan.requires_confirmation = False
    result_message = discord_agent_service.execute_plan(session, plan=plan, user=user)
    return {
        'ok': True,
        'message': result_message,
    }


@router.post('/sessions/{session_id}/ask')
def ask_chatbot(session_id: UUID, body: dict, session: Session = Depends(get_db_session)) -> dict:
    chat_session = session.get(ChatSession, session_id)
    if not chat_session:
        raise HTTPException(status_code=404, detail='Chat session not found')

    user_message_text = str(body.get('message', '')).strip()
    if not user_message_text:
        raise HTTPException(status_code=400, detail='Message is required')

    user = session.get(User, chat_session.user_id)
    user_nickname = user.nickname or user.display_name or user.username if user else '사용자'
    agent_name = user.agent_display_name or 'AGENT' if user else 'AGENT'

    history_statement = select(ChatMessage).where(ChatMessage.session_id == session_id).order_by(ChatMessage.created_at.asc())
    history = list(session.exec(history_statement).all())
    context = chat_service.build_agent_style_context([
        {'role': msg.role.value, 'content': msg.content} for msg in history
    ])

    user_message = ChatMessage(
        session_id=chat_session.id,
        user_id=chat_session.user_id,
        role='user',
        content=user_message_text,
    )
    session.add(user_message)

    default_calendar = calendar_service.get_default_calendar(session)
    events: list[Event] = []
    if default_calendar:
        events = list(
            session.exec(
                select(Event)
                .where(Event.calendar_id == default_calendar.id)
                .order_by(Event.start_at.asc())
            ).all()
        )
    if not events:
        events = list(session.exec(select(Event).order_by(Event.start_at.asc())).all())
    serialized_events = calendar_service.serialize_events(events)
    debug_event_titles = [event.title for event in events[:10]]

    action_plan = discord_agent_service.build_plan(user_message_text)
    if action_plan.intent in {'create_event', 'update_event', 'delete_event'}:
        action_message = discord_agent_service.execute_plan(session, plan=action_plan, user=user) if user else '사용자 정보를 찾지 못해 작업을 실행할 수 없어요.'
        llm_result = {
            'message': action_message,
            'provider': 'agent-action',
        }
    else:
        llm_result = llm_service.answer_schedule_question(
            user_id=str(chat_session.user_id),
            message=user_message_text,
            context=context,
            events=serialized_events,
            user_nickname=user_nickname,
            agent_name=agent_name,
        )

    assistant_message = ChatMessage(
        session_id=chat_session.id,
        user_id=chat_session.user_id,
        role='assistant',
        content=llm_result['message'],
    )
    chat_session.last_message_at = datetime.now(timezone.utc)

    session.add(assistant_message)
    session.add(chat_session)
    session.commit()
    session.refresh(user_message)
    session.refresh(assistant_message)

    return {
        'session_id': str(session_id),
        'user_message': user_message.content,
        'assistant_message': assistant_message.content,
        'context_count': len(context),
        'event_count': len(serialized_events),
        'provider': llm_result.get('provider'),
        'debug': {
            'default_calendar_id': str(default_calendar.id) if default_calendar else None,
            'default_calendar_name': default_calendar.name if default_calendar else None,
            'raw_event_count': len(events),
            'serialized_event_count': len(serialized_events),
            'event_titles': debug_event_titles,
            'agent_name': agent_name,
            'user_nickname': user_nickname,
        },
    }
