from __future__ import annotations

from datetime import datetime, timezone
from enum import Enum
from typing import Optional
from uuid import UUID

from sqlmodel import Field, SQLModel

from app.models.base import TimestampedModel, UUIDModel


class ChatMessageRole(str, Enum):
    user = "user"
    assistant = "assistant"
    system = "system"


class ChatSessionBase(SQLModel):
    user_id: UUID = Field(foreign_key="users.id", index=True)
    title: Optional[str] = None
    is_active: bool = True
    last_message_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), nullable=False)


class ChatSession(UUIDModel, TimestampedModel, ChatSessionBase, table=True):
    __tablename__ = "chat_sessions"


class ChatMessageBase(SQLModel):
    session_id: UUID = Field(foreign_key="chat_sessions.id", index=True)
    user_id: UUID = Field(foreign_key="users.id", index=True)
    role: ChatMessageRole
    content: str
    calendar_id: Optional[UUID] = Field(default=None, foreign_key="calendars.id")


class ChatMessage(UUIDModel, TimestampedModel, ChatMessageBase, table=True):
    __tablename__ = "chat_messages"
