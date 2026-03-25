from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from app.api.deps import get_db_session
from app.models.calendar import Calendar, CalendarType
from app.models.calendar_member import CalendarMember, CalendarMemberRole
from app.schemas.calendar import CalendarCreate, CalendarRead

router = APIRouter()


@router.get("/default", response_model=CalendarRead)
def get_default_calendar(session: Session = Depends(get_db_session)) -> Calendar:
    calendar = session.exec(select(Calendar).where(Calendar.is_default == True)).first()
    if not calendar:
        raise HTTPException(status_code=404, detail="Default shared calendar not found")
    return calendar


@router.post("/bootstrap-default", response_model=CalendarRead)
def bootstrap_default_calendar(session: Session = Depends(get_db_session)) -> Calendar:
    existing = session.exec(select(Calendar).where(Calendar.is_default == True)).first()
    if existing:
        return existing

    calendar = Calendar(name="Shared Calendar", type=CalendarType.shared, is_default=True)
    session.add(calendar)
    session.commit()
    session.refresh(calendar)
    return calendar


@router.post("", response_model=CalendarRead)
def create_calendar(payload: CalendarCreate, session: Session = Depends(get_db_session)) -> Calendar:
    calendar = Calendar(**payload.model_dump())
    session.add(calendar)
    session.commit()
    session.refresh(calendar)
    return calendar


@router.get("/{calendar_id}", response_model=CalendarRead)
def get_calendar(calendar_id: str, session: Session = Depends(get_db_session)) -> Calendar:
    calendar = session.get(Calendar, calendar_id)
    if not calendar:
        raise HTTPException(status_code=404, detail="Calendar not found")
    return calendar


@router.post("/{calendar_id}/members/{user_id}")
def add_member(calendar_id: str, user_id: str, session: Session = Depends(get_db_session)) -> dict:
    calendar = session.get(Calendar, calendar_id)
    if not calendar:
        raise HTTPException(status_code=404, detail="Calendar not found")

    existing_member = session.exec(
        select(CalendarMember).where(
            CalendarMember.calendar_id == calendar_id,
            CalendarMember.user_id == user_id,
        )
    ).first()
    if existing_member:
        return {"message": "User already joined shared calendar"}

    member = CalendarMember(calendar_id=calendar_id, user_id=user_id, role=CalendarMemberRole.editor)
    session.add(member)
    session.commit()
    session.refresh(member)
    return {"message": "User added to shared calendar", "member_id": str(member.id)}
