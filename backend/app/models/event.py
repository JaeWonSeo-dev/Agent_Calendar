from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import Optional
from uuid import UUID

from sqlmodel import Field, SQLModel

from app.models.base import TimestampedModel, UUIDModel


class EventStatus(str, Enum):
    scheduled = "scheduled"
    completed = "completed"
    cancelled = "cancelled"
    skipped = "skipped"


class EventBase(SQLModel):
    calendar_id: UUID = Field(foreign_key="calendars.id", index=True)
    owner_user_id: UUID = Field(foreign_key="users.id", index=True)
    title: str
    description: Optional[str] = None
    location: Optional[str] = None
    category: Optional[str] = None
    start_at: datetime
    end_at: datetime
    all_day: bool = False
    status: EventStatus = EventStatus.scheduled


class Event(UUIDModel, TimestampedModel, EventBase, table=True):
    __tablename__ = "events"
