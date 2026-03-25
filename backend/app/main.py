from fastapi import FastAPI

from app.api.routes.calendars import router as calendars_router
from app.api.routes.chat import router as chat_router
from app.api.routes.events import router as events_router
from app.api.routes.users import router as users_router
from app.core.config import settings
from app.db.session import SessionLocal, init_db
from app.services.bootstrap_service import BootstrapService

app = FastAPI(
    title=settings.app_name,
    version="0.1.0",
    description="Agent Calendar backend API",
)


@app.on_event("startup")
def on_startup() -> None:
    init_db()
    bootstrap_service = BootstrapService()
    with SessionLocal() as session:
        bootstrap_service.ensure_default_shared_calendar(session)


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}


app.include_router(users_router, prefix="/api/users", tags=["users"])
app.include_router(calendars_router, prefix="/api/calendars", tags=["calendars"])
app.include_router(events_router, prefix="/api/events", tags=["events"])
app.include_router(chat_router, prefix="/api/chat", tags=["chat"])
