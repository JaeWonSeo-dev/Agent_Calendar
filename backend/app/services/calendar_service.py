from datetime import datetime
from typing import Any
from uuid import UUID

from sqlmodel import Session, select

from app.models.calendar import Calendar
from app.models.event import Event


class CalendarService:
    def get_default_calendar(self, session: Session) -> Calendar | None:
        return session.exec(select(Calendar).where(Calendar.is_default == True)).first()

    def list_events_in_range(
        self,
        *,
        session: Session,
        user_id: UUID | None = None,
        start_at: datetime | None = None,
        end_at: datetime | None = None,
        calendar_id: UUID | None = None,
    ) -> list[Event]:
        statement = select(Event)
        if calendar_id:
            statement = statement.where(Event.calendar_id == calendar_id)
        if user_id:
            statement = statement.where(Event.owner_user_id == user_id)
        statement = statement.order_by(Event.start_at.asc())
        events = list(session.exec(statement).all())

        if not start_at and not end_at:
            return events

        normalized_start = start_at.replace(tzinfo=None) if start_at and start_at.tzinfo else start_at
        normalized_end = end_at.replace(tzinfo=None) if end_at and end_at.tzinfo else end_at

        filtered: list[Event] = []
        for event in events:
            event_start = event.start_at.replace(tzinfo=None) if event.start_at.tzinfo else event.start_at
            event_end = event.end_at.replace(tzinfo=None) if event.end_at.tzinfo else event.end_at
            if normalized_start and event_end < normalized_start:
                continue
            if normalized_end and event_start > normalized_end:
                continue
            filtered.append(event)
        return filtered

    def serialize_events(self, events: list[Event]) -> list[dict[str, Any]]:
        return [
            {
                "id": str(event.id),
                "title": event.title,
                "owner_user_id": str(event.owner_user_id),
                "start_at": event.start_at.isoformat(),
                "end_at": event.end_at.isoformat(),
            }
            for event in events
        ]

    def check_missing_recurring_events(self, *, user_id: str, start_at: datetime, end_at: datetime) -> list[dict[str, Any]]:
        return []
