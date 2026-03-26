from pathlib import Path
from uuid import UUID, uuid4

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlmodel import Session, select

from app.api.deps import get_db_session
from app.models.calendar import Calendar
from app.models.calendar_member import CalendarMember, CalendarMemberRole
from app.models.user import User
from app.core.paths import PROFILE_UPLOADS_DIR, ensure_upload_dirs
from app.schemas.auth import LoginRequest
from app.schemas.user import UserOnboardingUpdate, UserProfileUpdate, UserRead, UserSignup, UserSummary
from app.services.auth_service import AuthService

router = APIRouter()
auth_service = AuthService()

ensure_upload_dirs()
UPLOAD_DIR = PROFILE_UPLOADS_DIR


@router.post("/signup", response_model=UserRead)
def signup(payload: UserSignup, session: Session = Depends(get_db_session)) -> User:
    existing_user = session.exec(select(User).where(User.email == payload.email)).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already exists")

    user = User(
        email=payload.email,
        username=payload.username,
        display_name=payload.username,
        password_hash=auth_service.hash_password(payload.password),
    )
    session.add(user)
    session.commit()
    session.refresh(user)

    default_calendar = session.exec(select(Calendar).where(Calendar.is_default == True)).first()
    if default_calendar:
        existing_member = session.exec(
            select(CalendarMember).where(
                CalendarMember.calendar_id == default_calendar.id,
                CalendarMember.user_id == user.id,
            )
        ).first()
        if not existing_member:
            session.add(
                CalendarMember(
                    calendar_id=default_calendar.id,
                    user_id=user.id,
                    role=CalendarMemberRole.editor,
                )
            )
            session.commit()

    return user


@router.post("/login", response_model=UserRead)
def login(payload: LoginRequest, session: Session = Depends(get_db_session)) -> User:
    identifier = payload.identifier.strip()
    user = session.exec(
        select(User).where(
            (User.email == identifier) | (User.username == identifier)
        )
    ).first()
    if not user or user.password_hash != auth_service.hash_password(payload.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return user


@router.get("/{user_id}", response_model=UserRead)
def get_user(user_id: UUID, session: Session = Depends(get_db_session)) -> User:
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.get("", response_model=list[UserSummary])
def list_users(session: Session = Depends(get_db_session)) -> list[User]:
    return list(session.exec(select(User)).all())


@router.patch("/{user_id}/onboarding", response_model=UserRead)
def complete_onboarding(user_id: UUID, payload: UserOnboardingUpdate, session: Session = Depends(get_db_session)) -> User:
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.display_name = payload.display_name
    user.nickname = payload.nickname
    user.birth_date = payload.birth_date
    if payload.profile_image_url is not None:
        user.profile_image_url = payload.profile_image_url
    user.preferred_event_color = payload.preferred_event_color
    user.color = payload.preferred_event_color
    user.onboarding_completed = True

    session.add(user)
    session.commit()
    session.refresh(user)
    return user


@router.patch("/{user_id}/profile", response_model=UserRead)
def update_profile(user_id: UUID, payload: UserProfileUpdate, session: Session = Depends(get_db_session)) -> User:
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(user, key, value)

    if payload.preferred_event_color:
        user.color = payload.preferred_event_color

    session.add(user)
    session.commit()
    session.refresh(user)
    return user


@router.post("/{user_id}/profile-image", response_model=UserRead)
def upload_profile_image(user_id: UUID, file: UploadFile = File(...), session: Session = Depends(get_db_session)) -> User:
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    suffix = Path(file.filename or "avatar.png").suffix or ".png"
    filename = f"{user_id}_{uuid4().hex}{suffix}"
    target = UPLOAD_DIR / filename
    content = file.file.read()
    target.write_bytes(content)

    user.profile_image_url = f"/uploads/profiles/{filename}"
    session.add(user)
    session.commit()
    session.refresh(user)
    return user
