from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel

from app.models.chat import ChatMessageRole


class ChatSessionCreate(BaseModel):
    user_id: UUID
    title: Optional[str] = None


class ChatSessionRead(BaseModel):
    id: UUID
    user_id: UUID
    title: Optional[str] = None
    is_active: bool
    last_message_at: datetime


class ChatMessageCreate(BaseModel):
    session_id: UUID
    user_id: UUID
    role: ChatMessageRole
    content: str
    calendar_id: Optional[UUID] = None


class ChatMessageRead(ChatMessageCreate):
    id: UUID
    created_at: datetime
