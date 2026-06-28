"""Verify Firebase ID tokens from Google / Firebase Auth sign-in."""
import os

from google.auth.transport import requests as google_requests
from google.oauth2 import id_token as google_id_token

from utils.env_loader import load_backend_env

load_backend_env()

FIREBASE_PROJECT_ID = os.getenv("FIREBASE_PROJECT_ID", "")


def verify_firebase_id_token(token: str) -> dict:
    """Verify a Firebase ID token and return decoded claims."""
    if not FIREBASE_PROJECT_ID:
        raise ValueError(
            "FIREBASE_PROJECT_ID is not set in backend/.env — required for Google sign-in"
        )

    request = google_requests.Request()
    decoded = google_id_token.verify_firebase_token(
        token,
        request,
        audience=FIREBASE_PROJECT_ID,
    )

    expected_issuer = f"https://securetoken.google.com/{FIREBASE_PROJECT_ID}"
    if decoded.get("iss") != expected_issuer:
        raise ValueError("Invalid token issuer")

    email = decoded.get("email")
    if not email:
        raise ValueError("Google account has no email address")

    return decoded
