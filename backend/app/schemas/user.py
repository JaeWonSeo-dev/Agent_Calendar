from datetime import date
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, EmailStr


class UserSignup(BaseModel):
    email: EmailStr
    password: str
    username: str


class UserOnboardingUpdate(BaseModel):
    display_name: str
    nickname: str
    birth_date: Optional[date] = None
    profile_image_url: Optional[str] = None
    preferred_event_color: str


class UserProfileUpdate(BaseModel):
    display_name: Optional[str] = None
    nickname: Optional[str] = None
    birth_date: Optional[date] = None
    profile_image_url: Optional[str] = None
    preferred_event_color: Optional[str] = None


class UserRead(BaseModel):
    id: UUID
    email: Optional[EmailStr] = None
    username: str
    display_name: str
    nickname: Optional[str] = None
    birth_date: Optional[date] = None
    timezone: str
    profile_image_url: Optional[str] = None
    preferred_event_color: Optional[str] = None
    onboarding_completed: bool


class UserSummary(BaseModel):
    id: UUID
    display_name: str
    nickname: Optional[str] = None
    preferred_event_color: Optional[str] = None
    profile_image_url: Optional[str] = None
