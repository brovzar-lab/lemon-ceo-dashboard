from datetime import datetime, timezone, timedelta
from typing import Optional
from googleapiclient.discovery import build
from google.oauth2.credentials import Credentials


def _build_service(access_token: str, refresh_token: Optional[str] = None):
    import os
    creds = Credentials(
        token=access_token,
        refresh_token=refresh_token,
        client_id=os.environ.get("GOOGLE_CLIENT_ID"),
        client_secret=os.environ.get("GOOGLE_CLIENT_SECRET"),
        token_uri="https://oauth2.googleapis.com/token",
    )
    return build("calendar", "v3", credentials=creds, cache_discovery=False)


def _format_event(event: dict) -> dict:
    start = event.get("start", {})
    end = event.get("end", {})
    attendees = [
        {"email": a.get("email"), "name": a.get("displayName")}
        for a in event.get("attendees", [])
        if not a.get("self")
    ]
    return {
        "id": event["id"],
        "title": event.get("summary", "(no title)"),
        "start": start.get("dateTime") or start.get("date"),
        "end": end.get("dateTime") or end.get("date"),
        "isAllDay": "date" in start and "dateTime" not in start,
        "location": event.get("location"),
        "hangoutLink": event.get("hangoutLink"),
        "attendees": attendees,
        "attendeeCount": len(attendees),
        "description": event.get("description"),
    }


def get_today_events(access_token: str, refresh_token: Optional[str]) -> list:
    service = _build_service(access_token, refresh_token)
    now = datetime.now(timezone.utc)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    today_end = today_start + timedelta(days=1)
    result = service.events().list(
        calendarId="primary",
        timeMin=today_start.isoformat(),
        timeMax=today_end.isoformat(),
        singleEvents=True,
        orderBy="startTime",
    ).execute()
    return [_format_event(e) for e in result.get("items", [])]


def get_week_events(access_token: str, refresh_token: Optional[str]) -> list:
    service = _build_service(access_token, refresh_token)
    now = datetime.now(timezone.utc)
    week_end = now + timedelta(days=7)
    result = service.events().list(
        calendarId="primary",
        timeMin=now.isoformat(),
        timeMax=week_end.isoformat(),
        singleEvents=True,
        orderBy="startTime",
        maxResults=50,
    ).execute()
    return [_format_event(e) for e in result.get("items", [])]
