from __future__ import annotations

from enum import Enum
from typing import Optional
from uuid import UUID

from sqlmodel import Field, SQLModel

from app.models.base import TimestampedModel, UUIDModel


class CalendarType(str, Enum):
    shared = "shared"


class CalendarBase(SQLModel):
    name: str
    type: CalendarType = CalendarType.shared
    owner_user_id: Optional[UUID] = Field(default=None, foreign_key="users.id", index=True)
    is_default: bool = False


class Calendar(UUIDModel, TimestampedModel, CalendarBase, table=True):
    __tablename__ = "calendars"
