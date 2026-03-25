from sqlmodel import Session, SQLModel, create_engine

from app.core.config import settings

connect_args = {"check_same_thread": False} if settings.database_url.startswith("sqlite") else {}
engine = create_engine(settings.database_url, echo=False, connect_args=connect_args)


def SessionLocal() -> Session:
    return Session(engine)


def get_session():
    with SessionLocal() as session:
        yield session


def init_db() -> None:
    SQLModel.metadata.create_all(engine)
