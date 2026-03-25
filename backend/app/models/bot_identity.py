from __future__ import annotations

from enum import Enum
from uuid import UUID

from sqlmodel import Field, SQLModel

from app.models.base import TimestampedModel, UUIDModel


class BotProvider(str, Enum):
    discord = "discord"
    telegram = "telegram"
    web = "web"


class BotIdentityBase(SQLModel):
    user_id: UUID = Field(foreign_key="users.id", index=True)
    provider: BotProvider
    provider_user_id: str = Field(index=True)


class BotIdentity(UUIDModel, TimestampedModel, BotIdentityBase, table=True):
    __tablename__ = "bot_identities"
