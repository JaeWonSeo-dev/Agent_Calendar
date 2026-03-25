from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import Optional
from uuid import UUID

from sqlmodel import Field, SQLModel

from app.models.base import TimestampedModel, UUIDModel


class ReminderDeliveryChannel(str, Enum):
    bot = "bot"
    email = "email"
    web = "web"


class ReminderStatus(str, Enum):
    pending = "pending"
    sent = "sent"
    failed = "failed"
    cancelled = "cancelled"


class ReminderBase(SQLModel):
    event_id: UUID = Field(foreign_key="events.id", index=True)
    offset_minutes_before: Optional[int] = None
    remind_at: Optional[datetime] = None
    delivery_channel: ReminderDeliveryChannel = ReminderDeliveryChannel.bot
    status: ReminderStatus = ReminderStatus.pending


class Reminder(UUIDModel, TimestampedModel, ReminderBase, table=True):
    __tablename__ = "reminders"
