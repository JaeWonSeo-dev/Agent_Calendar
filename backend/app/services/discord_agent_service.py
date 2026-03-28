from __future__ import annotations

import re
from dataclasses import dataclass
from datetime import datetime, timedelta
from typing import Any
from zoneinfo import ZoneInfo

from sqlmodel import Session, select

from app.models.event import Event
from app.models.user import User
from app.services.calendar_service import CalendarService

KST = ZoneInfo('Asia/Seoul')
UTC = ZoneInfo('UTC')


@dataclass
class AgentActionPlan:
    intent: str
    confidence: float
    message: str
    requires_confirmation: bool
    params: dict[str, Any]


class DiscordAgentService:
    def __init__(self) -> None:
        self.calendar_service = CalendarService()

    def build_plan(self, message: str, *, now: datetime | None = None) -> AgentActionPlan:
        now = now or datetime.now(KST)
        normalized = ' '.join(message.strip().split())
        lower = normalized.lower()

        if self._looks_like_schedule_question(lower):
            return AgentActionPlan(
                intent='ask',
                confidence=0.92,
                message='일정 질문으로 처리할게요.',
                requires_confirmation=False,
                params={},
            )

        if any(token in lower for token in ['추가', '등록', '잡아', '만들어', '생성']):
            create_params = self._parse_create_message(normalized, now=now)
            if create_params:
                return AgentActionPlan(
                    intent='create_event',
                    confidence=0.82,
                    message='일정 추가 요청으로 이해했어요. 확인받고 생성할게요.',
                    requires_confirmation=True,
                    params=create_params,
                )

        if any(token in lower for token in ['삭제', '지워', '없애', '취소']) and '일정' in normalized:
            delete_params = self._parse_event_lookup(normalized)
            return AgentActionPlan(
                intent='delete_event',
                confidence=0.7,
                message='삭제 요청으로 이해했어요. 대상 확인 후 삭제할게요.',
                requires_confirmation=True,
                params=delete_params,
            )

        if any(token in lower for token in ['옮겨', '변경', '수정', '바꿔']):
            update_params = self._parse_update_message(normalized, now=now)
            return AgentActionPlan(
                intent='update_event',
                confidence=0.72,
                message='수정 요청으로 이해했어요. 대상 확인 후 반영할게요.',
                requires_confirmation=True,
                params=update_params,
            )

        return AgentActionPlan(
            intent='ask',
            confidence=0.55,
            message='일반 일정 질문으로 처리할게요.',
            requires_confirmation=False,
            params={},
        )

    def serialize_params(self, params: dict[str, Any]) -> dict[str, Any]:
        serialized: dict[str, Any] = {}
        for key, value in params.items():
            if isinstance(value, datetime):
                serialized[key] = value.isoformat()
            else:
                serialized[key] = value
        return serialized

    def normalize_params(self, params: dict[str, Any]) -> dict[str, Any]:
        normalized: dict[str, Any] = {}
        for key, value in params.items():
            if key in {'start_at', 'end_at'} and isinstance(value, str):
                normalized[key] = datetime.fromisoformat(value)
            else:
                normalized[key] = value
        return normalized

    def describe_pending_action(self, plan: AgentActionPlan) -> str:
        if plan.intent == 'create_event':
            start = self._fmt(plan.params.get('start_at'))
            end = self._fmt(plan.params.get('end_at'))
            title = plan.params.get('title') or '새 일정'
            desc = plan.params.get('description') or '-'
            return (
                '이렇게 이해했어요. 맞으면 `확인`, 취소하려면 `취소`라고 답해줘.\n'
                f'- 작업: 일정 생성\n- 제목: {title}\n- 시작: {start}\n- 종료: {end}\n- 설명: {desc}'
            )

        if plan.intent == 'update_event':
            changes = []
            if plan.params.get('title'):
                changes.append(f"제목 → {plan.params['title']}")
            if plan.params.get('start_at'):
                changes.append(f"시작 → {self._fmt(plan.params['start_at'])}")
            if plan.params.get('end_at'):
                changes.append(f"종료 → {self._fmt(plan.params['end_at'])}")
            if plan.params.get('description') is not None:
                changes.append(f"설명 → {plan.params.get('description') or '-'}")
            change_text = '\n'.join(f'- {item}' for item in changes) if changes else '- 바뀌는 값이 아직 모호함'
            title_hint = plan.params.get('title_hint') or '(제목 단서 없음)'
            return (
                '수정 요청으로 이해했어요. 맞으면 `확인`, 그만두려면 `취소`라고 답해줘.\n'
                f'- 대상 단서: {title_hint}\n{change_text}'
            )

        if plan.intent == 'delete_event':
            title_hint = plan.params.get('title_hint') or '(제목 단서 없음)'
            return (
                '삭제 요청으로 이해했어요. 맞으면 `확인`, 그만두려면 `취소`라고 답해줘.\n'
                f'- 삭제 대상 단서: {title_hint}'
            )

        return '작업 확인이 필요해요. 맞으면 `확인`, 아니면 `취소`라고 답해줘.'

    def execute_plan(self, session: Session, *, plan: AgentActionPlan, user: User) -> str:
        plan.params = self.normalize_params(plan.params)
        default_calendar = self.calendar_service.get_default_calendar(session)
        if not default_calendar:
            raise RuntimeError('기본 공유 캘린더를 찾지 못했어요.')

        if plan.intent == 'create_event':
            event = Event(
                calendar_id=default_calendar.id,
                owner_user_id=user.id,
                title=str(plan.params['title']),
                description=plan.params.get('description'),
                start_at=plan.params['start_at'],
                end_at=plan.params['end_at'],
                all_day=False,
                status='scheduled',
            )
            session.add(event)
            session.commit()
            session.refresh(event)
            return (
                '일정 추가 완료.\n'
                f"- 제목: {event.title}\n- 시간: {self._fmt(event.start_at)} ~ {self._fmt(event.end_at)}\n- event_id: {event.id}"
            )

        if plan.intent == 'update_event':
            event = self._find_target_event(session, user=user, params=plan.params)
            if not event:
                return '수정할 일정을 못 찾았어요. 제목을 조금 더 정확히 말해주거나 event_id를 알려줘.'

            if plan.params.get('title'):
                event.title = str(plan.params['title'])
            if plan.params.get('description') is not None:
                event.description = plan.params.get('description')
            if plan.params.get('start_at'):
                event.start_at = plan.params['start_at']
            if plan.params.get('end_at'):
                event.end_at = plan.params['end_at']

            session.add(event)
            session.commit()
            session.refresh(event)
            return (
                '일정 수정 완료.\n'
                f"- 제목: {event.title}\n- 시간: {self._fmt(event.start_at)} ~ {self._fmt(event.end_at)}\n- event_id: {event.id}"
            )

        if plan.intent == 'delete_event':
            event = self._find_target_event(session, user=user, params=plan.params)
            if not event:
                return '삭제할 일정을 못 찾았어요. 제목을 더 정확히 말해주거나 event_id를 알려줘.'
            title = event.title
            event_id = event.id
            session.delete(event)
            session.commit()
            return f'일정 삭제 완료.\n- 제목: {title}\n- event_id: {event_id}'

        raise RuntimeError('실행할 수 없는 액션이에요.')

    def _find_target_event(self, session: Session, *, user: User, params: dict[str, Any]) -> Event | None:
        event_id = params.get('event_id')
        if event_id:
            return session.get(Event, event_id)

        title_hint = str(params.get('title_hint') or '').strip().lower()
        events = list(
            session.exec(
                select(Event)
                .where(Event.owner_user_id == user.id)
                .order_by(Event.start_at.asc())
            ).all()
        )
        if not title_hint:
            return events[0] if events else None

        for event in events:
            if title_hint in event.title.lower():
                return event
        return None

    def _looks_like_schedule_question(self, lower: str) -> bool:
        return any(token in lower for token in ['뭐', '언제', '일정', '보여', '알려', '정리', 'what', 'when']) and not any(
            token in lower for token in ['추가', '등록', '변경', '수정', '삭제', '지워', '옮겨']
        )

    def _parse_create_message(self, text: str, *, now: datetime) -> dict[str, Any] | None:
        time_matches = re.findall(r'(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2})', text)
        if len(time_matches) >= 2:
            start_at = self._parse_absolute(time_matches[0])
            end_at = self._parse_absolute(time_matches[1])
            title = text
            for matched in time_matches[:2]:
                title = title.replace(matched, ' ')
            for token in ['일정', '추가', '등록', '만들어', '생성', '해줘', '해 줘', '잡아줘', '잡아 줘']:
                title = title.replace(token, ' ')
            title = ' '.join(title.split()) or '새 일정'
            if end_at <= start_at:
                end_at = start_at + timedelta(hours=1)
            return {
                'title': title,
                'description': None,
                'start_at': start_at,
                'end_at': end_at,
            }

        rel = re.search(r'(오늘|내일|모레)\s*(오전|오후)?\s*(\d{1,2})시(?:\s*(\d{1,2})분?)?', text)
        duration = re.search(r'(\d{1,2})시간', text)
        if not rel:
            return None
        day_word, meridiem, hour_text, minute_text = rel.groups()
        base_date = now.date()
        if day_word == '내일':
            base_date = (now + timedelta(days=1)).date()
        elif day_word == '모레':
            base_date = (now + timedelta(days=2)).date()
        hour = int(hour_text)
        minute = int(minute_text or 0)
        if meridiem == '오후' and hour < 12:
            hour += 12
        if meridiem == '오전' and hour == 12:
            hour = 0
        start_at = datetime(base_date.year, base_date.month, base_date.day, hour, minute, tzinfo=KST).astimezone(UTC)
        hours = int(duration.group(1)) if duration else 1
        end_at = start_at + timedelta(hours=hours)
        title = text
        for token in ['오늘', '내일', '모레', '오전', '오후', '일정', '추가', '등록', '만들어', '생성', '해줘', '해 줘']:
            title = title.replace(token, ' ')
        title = re.sub(r'\d{1,2}시(?:\s*\d{1,2}분?)?', ' ', title)
        title = re.sub(r'\d{1,2}시간', ' ', title)
        title = ' '.join(title.split()) or '새 일정'
        return {
            'title': title,
            'description': None,
            'start_at': start_at,
            'end_at': end_at,
        }

    def _parse_update_message(self, text: str, *, now: datetime) -> dict[str, Any]:
        params: dict[str, Any] = self._parse_event_lookup(text)
        title_change = re.search(r'제목\s*(?:을|를)?\s*([\w가-힣\s]+?)\s*(?:으로|로)\s*바꿔', text)
        if title_change:
            params['title'] = title_change.group(1).strip()

        rel = re.search(r'(오늘|내일|모레)?\s*(오전|오후)?\s*(\d{1,2})시(?:\s*(\d{1,2})분?)?\s*(?:으로|로)\s*(?:옮겨|변경|수정|바꿔)', text)
        if rel:
            day_word, meridiem, hour_text, minute_text = rel.groups()
            base = now
            if day_word == '내일':
                base = now + timedelta(days=1)
            elif day_word == '모레':
                base = now + timedelta(days=2)
            hour = int(hour_text)
            minute = int(minute_text or 0)
            if meridiem == '오후' and hour < 12:
                hour += 12
            if meridiem == '오전' and hour == 12:
                hour = 0
            start_at = datetime(base.year, base.month, base.day, hour, minute, tzinfo=KST).astimezone(UTC)
            params['start_at'] = start_at
            params['end_at'] = start_at + timedelta(hours=1)

        abs_match = re.findall(r'(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2})', text)
        if abs_match:
            params['start_at'] = self._parse_absolute(abs_match[0])
            params['end_at'] = self._parse_absolute(abs_match[1]) if len(abs_match) > 1 else params['start_at'] + timedelta(hours=1)

        return params

    def _parse_event_lookup(self, text: str) -> dict[str, Any]:
        event_id_match = re.search(r'([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})', text.lower())
        if event_id_match:
            return {'event_id': event_id_match.group(1)}

        title_hint = text
        for token in ['일정', '삭제', '지워', '없애', '취소', '수정', '변경', '옮겨', '바꿔', '해줘', '해 줘']:
            title_hint = title_hint.replace(token, ' ')
        title_hint = ' '.join(title_hint.split())
        return {'title_hint': title_hint}

    def _parse_absolute(self, text: str) -> datetime:
        dt = datetime.strptime(' '.join(text.split()), '%Y-%m-%d %H:%M')
        return dt.replace(tzinfo=KST).astimezone(UTC)

    def _fmt(self, value: Any) -> str:
        if not isinstance(value, datetime):
            return str(value)
        return value.astimezone(KST).strftime('%Y-%m-%d %H:%M')
