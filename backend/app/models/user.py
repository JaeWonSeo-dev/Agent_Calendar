from __future__ import annotations

from datetime import date
from typing import Optional

from sqlmodel import Field, SQLModel

from app.models.base import TimestampedModel, UUIDModel


class UserBase(SQLModel):
    email: Optional[str] = Field(default=None, index=True)
    username: str = Field(index=True)
    display_name: str
    nickname: Optional[str] = None
    birth_date: Optional[date] = None
    timezone: str = "Asia/Seoul"
    color: Optional[str] = None
    profile_image_url: Optional[str] = None
    preferred_event_color: Optional[str] = None
    agent_display_name: Optional[str] = 'AGENT'
    discord_user_id: Optional[str] = Field(default=None, index=True)
    discord_username: Optional[str] = None
    onboarding_completed: bool = False
    password_hash: Optional[str] = None


class User(UUIDModel, TimestampedModel, UserBase, table=True):
    __tablename__ = "users"
