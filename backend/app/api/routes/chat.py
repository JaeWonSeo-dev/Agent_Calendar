from datetime import datetime, timedelta, timezone
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select

from app.api.deps import get_db_session
from app.models.chat import ChatMessage, ChatSession
from app.models.event import Event
from app.schemas.chat import ChatMessageCreate, ChatMessageRead, ChatSessionCreate, ChatSessionRead
from app.services.calendar_service import CalendarService
from app.services.chat_service import ChatService
from app.services.llm_service import LLMService

router = APIRouter()
chat_service = ChatService()
llm_service = LLMService()
calendar_service = CalendarService()


@router.get("/sessions", response_model=list[ChatSessionRead])
def list_sessions(user_id: UUID | None = Query(default=None), session: Session = Depends(get_db_session)) -> list[ChatSession]:
    statement = select(ChatSession)
    if user_id:
        statement = statement.where(ChatSession.user_id == user_id)
    statement = statement.order_by(ChatSession.last_message_at.desc())
    return list(session.exec(statement).all())


@router.post("/sessions", response_model=ChatSessionRead)
def create_session(payload: ChatSessionCreate, session: Session = Depends(get_db_session)) -> ChatSession:
    chat_session = ChatSession(**payload.model_dump())
    session.add(chat_session)
    session.commit()
    session.refresh(chat_session)
    return chat_session


@router.get("/sessions/{session_id}/messages", response_model=list[ChatMessageRead])
def list_messages(session_id: UUID, session: Session = Depends(get_db_session)) -> list[ChatMessage]:
    statement = select(ChatMessage).where(ChatMessage.session_id == session_id).order_by(ChatMessage.created_at.asc())
    return list(session.exec(statement).all())


@router.post("/messages", response_model=ChatMessageRead)
def create_message(payload: ChatMessageCreate, session: Session = Depends(get_db_session)) -> ChatMessage:
    chat_session = session.get(ChatSession, payload.session_id)
    if not chat_session:
        raise HTTPException(status_code=404, detail="Chat session not found")

    message = ChatMessage(**payload.model_dump())
    chat_session.last_message_at = datetime.now(timezone.utc)

    session.add(message)
    session.add(chat_session)
    session.commit()
    session.refresh(message)
    return message


@router.post("/sessions/{session_id}/ask")
def ask_chatbot(session_id: UUID, body: dict, session: Session = Depends(get_db_session)) -> dict:
    chat_session = session.get(ChatSession, session_id)
    if not chat_session:
        raise HTTPException(status_code=404, detail="Chat session not found")

    user_message_text = str(body.get("message", "")).strip()
    if not user_message_text:
        raise HTTPException(status_code=400, detail="Message is required")

    history_statement = select(ChatMessage).where(ChatMessage.session_id == session_id).order_by(ChatMessage.created_at.asc())
    history = list(session.exec(history_statement).all())
    context = chat_service.build_agent_style_context([
        {"role": msg.role.value, "content": msg.content} for msg in history
    ])

    user_message = ChatMessage(
        session_id=chat_session.id,
        user_id=chat_session.user_id,
        role="user",
        content=user_message_text,
    )
    session.add(user_message)

    default_calendar = calendar_service.get_default_calendar(session)
    now = datetime.now(timezone.utc) - timedelta(days=7)
    end_window = datetime.now(timezone.utc) + timedelta(days=30)
    events = calendar_service.list_events_in_range(
        session=session,
        calendar_id=default_calendar.id if default_calendar else None,
        start_at=now,
        end_at=end_window,
    )
    serialized_events = calendar_service.serialize_events(events)

    llm_result = llm_service.answer_schedule_question(
        user_id=str(chat_session.user_id),
        message=user_message_text,
        context=context,
        events=serialized_events,
    )

    assistant_message = ChatMessage(
        session_id=chat_session.id,
        user_id=chat_session.user_id,
        role="assistant",
        content=llm_result["message"],
    )
    chat_session.last_message_at = datetime.now(timezone.utc)

    session.add(assistant_message)
    session.add(chat_session)
    session.commit()
    session.refresh(user_message)
    session.refresh(assistant_message)

    return {
        "session_id": str(session_id),
        "user_message": user_message.content,
        "assistant_message": assistant_message.content,
        "context_count": len(context),
        "event_count": len(serialized_events),
    }
