import os
from contextlib import contextmanager
from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import SQLModel, Session, create_engine

from routers import auth, emails, calendar

DATABASE_URL = os.environ.get("DATABASE_URL", "sqlite:////data/sessions.db")
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})


def init_db():
    SQLModel.metadata.create_all(engine)


@contextmanager
def get_db():
    with Session(engine) as session:
        yield session


app = FastAPI(title="Lemon Films CEO Dashboard API")

frontend_url = os.environ.get("FRONTEND_URL", "http://localhost:5173")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[frontend_url, "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(emails.router)
app.include_router(calendar.router)


@app.on_event("startup")
def on_startup():
    init_db()


@app.get("/health")
def health():
    return {"status": "ok"}
