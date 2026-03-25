from typing import Optional
from uuid import UUID

from pydantic import BaseModel

from app.models.calendar import CalendarType


class CalendarCreate(BaseModel):
    name: str
    type: CalendarType = CalendarType.shared
    owner_user_id: Optional[UUID] = None
    is_default: bool = False


class CalendarRead(CalendarCreate):
    id: UUID
