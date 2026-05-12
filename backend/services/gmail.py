import base64
import re
from datetime import datetime
from typing import Optional
from googleapiclient.discovery import build
from google.oauth2.credentials import Credentials

IMPORTANT_KEYWORDS = {"contract", "deal", "urgent", "invoice", "distribution", "offer", "rights"}
VIP_DOMAINS = {"a24films.com", "wmeagency.com", "caa.com", "endeavorco.com", "unitedtalent.com"}


def _build_service(access_token: str, refresh_token: Optional[str] = None):
    import os
    creds = Credentials(
        token=access_token,
        refresh_token=refresh_token,
        client_id=os.environ.get("GOOGLE_CLIENT_ID"),
        client_secret=os.environ.get("GOOGLE_CLIENT_SECRET"),
        token_uri="https://oauth2.googleapis.com/token",
    )
    return build("gmail", "v1", credentials=creds, cache_discovery=False)


def _is_important(subject: str, sender: str, gmail_labels: list) -> bool:
    if "IMPORTANT" in gmail_labels:
        return True
    subject_lower = subject.lower()
    if any(kw in subject_lower for kw in IMPORTANT_KEYWORDS):
        return True
    domain = sender.split("@")[-1].rstrip(">").lower() if "@" in sender else ""
    return domain in VIP_DOMAINS


def _decode_body(payload: dict) -> str:
    """Extract plain text body from message payload."""
    if payload.get("mimeType") == "text/plain":
        data = payload.get("body", {}).get("data", "")
        if data:
            return base64.urlsafe_b64decode(data + "==").decode("utf-8", errors="replace")
    for part in payload.get("parts", []):
        result = _decode_body(part)
        if result:
            return result
    return ""


def list_emails(access_token: str, refresh_token: Optional[str], limit: int = 50) -> list:
    service = _build_service(access_token, refresh_token)
    result = service.users().messages().list(
        userId="me", maxResults=limit, labelIds=["INBOX"]
    ).execute()
    messages = result.get("messages", [])

    emails = []
    for msg_ref in messages:
        msg = service.users().messages().get(
            userId="me", id=msg_ref["id"], format="metadata",
            metadataHeaders=["Subject", "From", "Date"]
        ).execute()
        headers = {h["name"]: h["value"] for h in msg.get("payload", {}).get("headers", [])}
        labels = msg.get("labelIds", [])
        subject = headers.get("Subject", "(no subject)")
        sender = headers.get("From", "")
        emails.append({
            "id": msg["id"],
            "subject": subject,
            "from": sender,
            "date": headers.get("Date", ""),
            "snippet": msg.get("snippet", ""),
            "isImportant": _is_important(subject, sender, labels),
            "isRead": "UNREAD" not in labels,
            "labels": labels,
        })
    return emails


def list_important_emails(access_token: str, refresh_token: Optional[str]) -> list:
    all_emails = list_emails(access_token, refresh_token, limit=100)
    return [e for e in all_emails if e["isImportant"]]


def get_email(access_token: str, refresh_token: Optional[str], email_id: str) -> dict:
    service = _build_service(access_token, refresh_token)
    msg = service.users().messages().get(
        userId="me", id=email_id, format="full"
    ).execute()
    headers = {h["name"]: h["value"] for h in msg.get("payload", {}).get("headers", [])}
    labels = msg.get("labelIds", [])
    subject = headers.get("Subject", "(no subject)")
    sender = headers.get("From", "")
    body = _decode_body(msg.get("payload", {}))
    return {
        "id": msg["id"],
        "subject": subject,
        "from": sender,
        "date": headers.get("Date", ""),
        "snippet": msg.get("snippet", ""),
        "body": body,
        "isImportant": _is_important(subject, sender, labels),
        "isRead": "UNREAD" not in labels,
        "labels": labels,
    }
