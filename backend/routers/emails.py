from fastapi import APIRouter, Request, HTTPException
from sqlmodel import Session, select
from models import UserSession
from services import gmail as gmail_service

router = APIRouter()


def _get_user(request: Request):
    from main import get_db
    from auth.session import get_session_id
    session_id = get_session_id(request)
    if not session_id:
        raise HTTPException(status_code=401, detail="Not authenticated")
    with next(get_db()) as db:
        stmt = select(UserSession).where(UserSession.session_id == session_id)
        user = db.exec(stmt).first()
        if not user:
            raise HTTPException(status_code=401, detail="Session expired")
        return user


@router.get("/api/emails")
def list_emails(request: Request, limit: int = 50):
    user = _get_user(request)
    return gmail_service.list_emails(user.access_token, user.refresh_token, limit=limit)


@router.get("/api/emails/important")
def list_important(request: Request):
    user = _get_user(request)
    return gmail_service.list_important_emails(user.access_token, user.refresh_token)


@router.get("/api/emails/{email_id}")
def get_email(request: Request, email_id: str):
    user = _get_user(request)
    return gmail_service.get_email(user.access_token, user.refresh_token, email_id)
