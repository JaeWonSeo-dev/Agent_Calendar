from sqlalchemy import text
from sqlmodel import Session, SQLModel, create_engine

from app.core.config import settings

connect_args = {"check_same_thread": False} if settings.database_url.startswith("sqlite") else {}
engine = create_engine(settings.database_url, echo=False, connect_args=connect_args)


def SessionLocal() -> Session:
    return Session(engine)


def get_session():
    with SessionLocal() as session:
        yield session


def ensure_sqlite_user_columns() -> None:
    if not settings.database_url.startswith('sqlite'):
        return

    with engine.begin() as conn:
        columns = {
            row[1]
            for row in conn.execute(text("PRAGMA table_info(users)"))
        }

        if 'agent_display_name' not in columns:
            conn.execute(text("ALTER TABLE users ADD COLUMN agent_display_name VARCHAR"))
        if 'discord_user_id' not in columns:
            conn.execute(text("ALTER TABLE users ADD COLUMN discord_user_id VARCHAR"))
        if 'discord_username' not in columns:
            conn.execute(text("ALTER TABLE users ADD COLUMN discord_username VARCHAR"))


def init_db() -> None:
    SQLModel.metadata.create_all(engine)
    ensure_sqlite_user_columns()
