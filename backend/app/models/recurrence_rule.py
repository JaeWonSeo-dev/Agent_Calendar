from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import Optional
from uuid import UUID

from sqlmodel import Field, SQLModel

from app.models.base import TimestampedModel, UUIDModel


class RecurrenceFrequency(str, Enum):
    daily = "daily"
    weekly = "weekly"
    monthly = "monthly"
    yearly = "yearly"


class RecurrenceRuleBase(SQLModel):
    event_id: UUID = Field(foreign_key="events.id", index=True)
    freq: RecurrenceFrequency
    interval: int = 1
    by_day: Optional[str] = None
    by_month_day: Optional[int] = None
    until_at: Optional[datetime] = None
    count: Optional[int] = None


class RecurrenceRule(UUIDModel, TimestampedModel, RecurrenceRuleBase, table=True):
    __tablename__ = "recurrence_rules"
