from typing import Optional
from datetime import datetime
from sqlmodel import SQLModel, Field


class UserSession(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    session_id: str = Field(index=True, unique=True)
    email: str
    name: str
    picture: Optional[str] = None
    access_token: str
    refresh_token: Optional[str] = None
    token_expiry: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
