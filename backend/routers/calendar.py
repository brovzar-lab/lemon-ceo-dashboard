from fastapi import APIRouter, Request, HTTPException
from sqlmodel import select
from models import UserSession
from services import calendar as calendar_service

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


@router.get("/api/calendar/today")
def today_events(request: Request):
    user = _get_user(request)
    return calendar_service.get_today_events(user.access_token, user.refresh_token)


@router.get("/api/calendar/week")
def week_events(request: Request):
    user = _get_user(request)
    return calendar_service.get_week_events(user.access_token, user.refresh_token)
