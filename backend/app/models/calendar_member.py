from __future__ import annotations

from enum import Enum
from uuid import UUID

from sqlmodel import Field, SQLModel

from app.models.base import TimestampedModel, UUIDModel


class CalendarMemberRole(str, Enum):
    owner = "owner"
    editor = "editor"
    viewer = "viewer"


class CalendarMemberBase(SQLModel):
    calendar_id: UUID = Field(foreign_key="calendars.id", index=True)
    user_id: UUID = Field(foreign_key="users.id", index=True)
    role: CalendarMemberRole = CalendarMemberRole.viewer


class CalendarMember(UUIDModel, TimestampedModel, CalendarMemberBase, table=True):
    __tablename__ = "calendar_members"
