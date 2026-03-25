from fastapi import Depends
from sqlmodel import Session

from app.db.session import get_session


def get_db_session(session: Session = Depends(get_session)) -> Session:
    return session
