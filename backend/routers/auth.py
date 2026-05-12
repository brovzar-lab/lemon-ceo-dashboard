import os
import secrets
from fastapi import APIRouter, Request, Response
from fastapi.responses import RedirectResponse
from sqlmodel import Session, select
from auth.google_oauth import create_flow
from auth.session import create_session_id, set_session_cookie, clear_session_cookie, get_session_id
from models import UserSession
from googleapiclient.discovery import build
from google.oauth2.credentials import Credentials

router = APIRouter()

_state_store: dict[str, str] = {}


@router.get("/auth/google")
def google_login():
    flow = create_flow()
    state = secrets.token_urlsafe(16)
    auth_url, _ = flow.authorization_url(
        access_type="offline",
        include_granted_scopes="true",
        state=state,
        prompt="consent",
    )
    return RedirectResponse(auth_url)


@router.get("/auth/google/callback")
def google_callback(request: Request, response: Response, code: str, state: str = ""):
    from main import get_db
    flow = create_flow()
    flow.fetch_token(code=code)
    creds = flow.credentials

    user_service = build("oauth2", "v2", credentials=creds, cache_discovery=False)
    user_info = user_service.userinfo().get().execute()

    session_id = create_session_id()
    with next(get_db()) as db:
        session = UserSession(
            session_id=session_id,
            email=user_info["email"],
            name=user_info.get("name", ""),
            picture=user_info.get("picture"),
            access_token=creds.token,
            refresh_token=creds.refresh_token,
            token_expiry=creds.expiry,
        )
        db.add(session)
        db.commit()

    redirect = RedirectResponse(url=os.environ.get("FRONTEND_URL", "/"))
    set_session_cookie(redirect, session_id)
    return redirect


@router.get("/auth/me")
def get_me(request: Request):
    from main import get_db
    session_id = get_session_id(request)
    if not session_id:
        return {"authenticated": False}
    with next(get_db()) as db:
        stmt = select(UserSession).where(UserSession.session_id == session_id)
        user = db.exec(stmt).first()
        if not user:
            return {"authenticated": False}
        return {
            "authenticated": True,
            "email": user.email,
            "name": user.name,
            "picture": user.picture,
        }


@router.post("/auth/logout")
def logout(request: Request, response: Response):
    from main import get_db
    session_id = get_session_id(request)
    if session_id:
        with next(get_db()) as db:
            stmt = select(UserSession).where(UserSession.session_id == session_id)
            user = db.exec(stmt).first()
            if user:
                db.delete(user)
                db.commit()
    clear_session_cookie(response)
    return {"ok": True}
