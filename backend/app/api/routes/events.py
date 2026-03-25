from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select

from app.api.deps import get_db_session
from app.models.event import Event
from app.schemas.event import EventCreate, EventRead, EventUpdate

router = APIRouter()


@router.get("", response_model=list[EventRead])
def list_events(
    calendar_id: str | None = Query(default=None),
    owner_user_id: str | None = Query(default=None),
    start_at: datetime | None = Query(default=None),
    end_at: datetime | None = Query(default=None),
    session: Session = Depends(get_db_session),
) -> list[Event]:
    statement = select(Event)
    if calendar_id:
        statement = statement.where(Event.calendar_id == calendar_id)
    if owner_user_id:
        statement = statement.where(Event.owner_user_id == owner_user_id)
    if start_at:
        statement = statement.where(Event.start_at >= start_at)
    if end_at:
        statement = statement.where(Event.end_at <= end_at)
    return list(session.exec(statement).all())


@router.post("", response_model=EventRead)
def create_event(payload: EventCreate, session: Session = Depends(get_db_session)) -> Event:
    event = Event(**payload.model_dump())
    session.add(event)
    session.commit()
    session.refresh(event)
    return event


@router.get("/{event_id}", response_model=EventRead)
def get_event(event_id: str, session: Session = Depends(get_db_session)) -> Event:
    event = session.get(Event, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return event


@router.patch("/{event_id}", response_model=EventRead)
def update_event(event_id: str, payload: EventUpdate, session: Session = Depends(get_db_session)) -> Event:
    event = session.get(Event, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(event, key, value)

    session.add(event)
    session.commit()
    session.refresh(event)
    return event


@router.delete("/{event_id}")
def delete_event(event_id: str, session: Session = Depends(get_db_session)) -> dict:
    event = session.get(Event, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    session.delete(event)
    session.commit()
    return {"message": "Event deleted"}
