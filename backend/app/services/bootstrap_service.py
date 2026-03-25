from sqlmodel import Session, select

from app.models.calendar import Calendar, CalendarType


class BootstrapService:
    def ensure_default_shared_calendar(self, session: Session) -> Calendar:
        calendar = session.exec(select(Calendar).where(Calendar.is_default == True)).first()
        if calendar:
            return calendar

        calendar = Calendar(
            name="Shared Calendar",
            type=CalendarType.shared,
            is_default=True,
        )
        session.add(calendar)
        session.commit()
        session.refresh(calendar)
        return calendar
