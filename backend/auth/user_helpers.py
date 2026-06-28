"""Shared helpers for creating and linking auth users."""
import secrets
import uuid
from datetime import datetime

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from auth.auth_utils import create_access_token, get_password_hash
from auth.schemas import AuthResponse, Token, UserResponse
from db.database import User


def user_id(user: User) -> str:
    """Return authenticated user's id for API payloads."""
    return user.id


async def get_or_create_google_user(
    db: AsyncSession,
    *,
    firebase_uid: str,
    email: str,
    name: str,
    email_verified: bool = False,
) -> tuple[User, bool]:
    """Find or create a user from Firebase/Google sign-in. Returns (user, is_new)."""
    result = await db.execute(select(User).where(User.firebase_uid == firebase_uid))
    user = result.scalar_one_or_none()
    if user:
        if name and user.name != name:
            user.name = name
        if email_verified:
            user.is_verified = True
        user.updated_at = datetime.utcnow()
        await db.commit()
        await db.refresh(user)
        return user, False

    result = await db.execute(select(User).where(User.email == email))
    existing = result.scalar_one_or_none()
    if existing:
        existing.firebase_uid = firebase_uid
        existing.auth_provider = "google"
        if name:
            existing.name = name
        if email_verified:
            existing.is_verified = True
        existing.updated_at = datetime.utcnow()
        await db.commit()
        await db.refresh(existing)
        return existing, False

    user = User(
        id=str(uuid.uuid4()),
        email=email,
        password_hash=get_password_hash(secrets.token_urlsafe(32)),
        name=name or email.split("@")[0],
        firebase_uid=firebase_uid,
        auth_provider="google",
        is_active=True,
        is_verified=email_verified,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user, True


def auth_response_for_user(user: User) -> AuthResponse:
    access_token = create_access_token(data={"sub": user.id})
    return AuthResponse(
        user=UserResponse.model_validate(user),
        token=Token(access_token=access_token),
    )
