from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel

from app.models.event import EventStatus


class EventCreate(BaseModel):
    calendar_id: UUID
    owner_user_id: UUID
    title: str
    description: Optional[str] = None
    location: Optional[str] = None
    category: Optional[str] = None
    start_at: datetime
    end_at: datetime
    all_day: bool = False
    status: EventStatus = EventStatus.scheduled


class EventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = None
    category: Optional[str] = None
    start_at: Optional[datetime] = None
    end_at: Optional[datetime] = None
    all_day: Optional[bool] = None
    status: Optional[EventStatus] = None


class EventRead(EventCreate):
    id: UUID
