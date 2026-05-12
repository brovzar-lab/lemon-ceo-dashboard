import os
import secrets
from datetime import datetime
from typing import Optional
from fastapi import Request, Response
from sqlmodel import Session, select

COOKIE_NAME = "ceo_session"
COOKIE_MAX_AGE = 7 * 24 * 60 * 60  # 7 days


def create_session_id() -> str:
    return secrets.token_urlsafe(32)


def set_session_cookie(response: Response, session_id: str) -> None:
    response.set_cookie(
        key=COOKIE_NAME,
        value=session_id,
        max_age=COOKIE_MAX_AGE,
        httponly=True,
        secure=True,
        samesite="none",
    )


def clear_session_cookie(response: Response) -> None:
    response.delete_cookie(key=COOKIE_NAME, samesite="none", secure=True)


def get_session_id(request: Request) -> Optional[str]:
    return request.cookies.get(COOKIE_NAME)
