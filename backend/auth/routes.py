"""
Authentication routes
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import uuid

from .schemas import (
    UserRegister,
    UserLogin,
    AuthResponse,
    UserResponse,
    Token,
    ForgotPasswordRequest,
    FirebaseAuthRequest,
)
from .auth_utils import verify_password, get_password_hash, create_access_token
from .firebase_utils import verify_firebase_id_token
from .user_helpers import get_or_create_google_user, auth_response_for_user
from .dependencies import get_current_active_user
from db.database import get_db, User

router = APIRouter(prefix="/api/auth", tags=["authentication"])


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserRegister, db: AsyncSession = Depends(get_db)):
    """Register a new user"""
    try:
        # Check if user already exists
        result = await db.execute(select(User).where(User.email == user_data.email))
        existing_user = result.scalar_one_or_none()
        
        if existing_user:
            provider = getattr(existing_user, "auth_provider", "local")
            if provider == "google":
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="This email is registered with Google. Please sign in with Google.",
                )
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Create new user
        user = User(
            id=str(uuid.uuid4()),
            email=user_data.email,
            password_hash=get_password_hash(user_data.password),
            name=user_data.name,
            is_active=True,
            is_verified=False
        )
        
        db.add(user)
        await db.commit()
        await db.refresh(user)
        
        # Create access token
        access_token = create_access_token(data={"sub": user.id})
        
        return AuthResponse(
            user=UserResponse.model_validate(user),
            token=Token(access_token=access_token)
        )
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        print(f"Registration error: {str(e)}")
        print(traceback.format_exc())
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Registration failed: {str(e)}"
        )


@router.post("/login", response_model=AuthResponse)
async def login(credentials: UserLogin, db: AsyncSession = Depends(get_db)):
    """Login user and return token"""
    
    # Find user by email
    result = await db.execute(select(User).where(User.email == credentials.email))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )

    if getattr(user, "auth_provider", "local") == "google":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This account uses Google sign-in. Please continue with Google.",
        )
    
    # Verify password
    if not verify_password(credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Account is inactive"
        )
    
    # Create access token
    access_token = create_access_token(data={"sub": user.id})
    
    return AuthResponse(
        user=UserResponse.model_validate(user),
        token=Token(access_token=access_token)
    )


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_active_user)):
    """Get current user information"""
    return UserResponse.model_validate(current_user)


@router.post("/logout")
async def logout(current_user: User = Depends(get_current_active_user)):
    """Logout user (client should delete token)"""
    return {"message": "Successfully logged out"}


@router.post("/forgot-password")
async def forgot_password(
    request: ForgotPasswordRequest,
    db: AsyncSession = Depends(get_db),
):
    """Request password reset. Always returns success to avoid email enumeration."""
    result = await db.execute(select(User).where(User.email == request.email))
    user = result.scalar_one_or_none()
    if user:
        # Production: send email with reset token
        pass
    return {
        "message": "If an account exists with this email, you will receive reset instructions shortly."
    }


@router.post("/firebase", response_model=AuthResponse)
async def firebase_auth(
    body: FirebaseAuthRequest,
    db: AsyncSession = Depends(get_db),
):
    """Sign in or sign up with Firebase (Google) ID token."""
    try:
        decoded = verify_firebase_id_token(body.id_token)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
        )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired Google sign-in token",
        )

    firebase_uid = decoded.get("sub") or decoded.get("user_id")
    if not firebase_uid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid token: missing user id",
        )

    email = decoded.get("email", "")
    name = decoded.get("name") or decoded.get("display_name") or email.split("@")[0]
    email_verified = bool(decoded.get("email_verified", False))

    try:
        user, _is_new = await get_or_create_google_user(
            db,
            firebase_uid=firebase_uid,
            email=email,
            name=name,
            email_verified=email_verified,
        )
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Account is inactive",
            )
        return auth_response_for_user(user)
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        print(f"Firebase auth error: {e}")
        print(traceback.format_exc())
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Google sign-in failed",
        )
