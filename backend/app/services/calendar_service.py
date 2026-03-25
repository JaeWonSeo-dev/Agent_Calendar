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
        if start_at:
            statement = statement.where(Event.start_at >= start_at)
        if end_at:
            statement = statement.where(Event.end_at <= end_at)
        statement = statement.order_by(Event.start_at.asc())
        return list(session.exec(statement).all())

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
