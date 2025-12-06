from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from typing import Optional
from auth.dependencies import get_current_active_user
from db.database import User, get_db
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter(prefix="/api/settings", tags=["settings"])

class UserSettings(BaseModel):
    notifications: bool = True
    auto_save: bool = True
    data_collection: bool = False
    ai_model: str = "llama3.1"
    temperature: float = Field(default=0.7, ge=0.0, le=2.0)
    theme: str = "dark"
    language: str = "en"

class UserProfileUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None

class PasswordChange(BaseModel):
    current_password: str
    new_password: str

@router.get("/preferences")
async def get_user_preferences(current_user: User = Depends(get_current_active_user)):
    """Get user preferences and settings"""
    # In production, these would be stored in database
    # For now, returning default settings
    return {
        "notifications": True,
        "auto_save": True,
        "data_collection": False,
        "ai_model": "llama3.1",
        "temperature": 0.7,
        "theme": "dark",
        "language": "en",
        "max_tokens": 4096,
        "streaming": True
    }

@router.patch("/preferences")
async def update_user_preferences(
    settings: UserSettings,
    current_user: User = Depends(get_current_active_user)
):
    """Update user preferences"""
    # In production, save to database
    # For now, just return the updated settings
    return {
        "message": "Settings updated successfully",
        "settings": settings.dict()
    }

@router.get("/profile")
async def get_user_profile(current_user: User = Depends(get_current_active_user)):
    """Get user profile information"""
    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "created_at": current_user.created_at.isoformat(),
        "is_active": current_user.is_active,
        "is_verified": current_user.is_verified,
        "bio": None,  # Add to User model if needed
        "avatar_url": None  # Add to User model if needed
    }

@router.patch("/profile")
async def update_user_profile(
    profile: UserProfileUpdate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Update user profile information"""
    try:
        # Update user fields
        if profile.name is not None:
            current_user.name = profile.name
        if profile.email is not None:
            # Check if email already exists
            # In production, add email uniqueness check
            current_user.email = profile.email
        
        await db.commit()
        await db.refresh(current_user)
        
        return {
            "message": "Profile updated successfully",
            "user": {
                "id": current_user.id,
                "name": current_user.name,
                "email": current_user.email
            }
        }
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/change-password")
async def change_password(
    password_data: PasswordChange,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Change user password"""
    from auth.auth_utils import verify_password, get_password_hash
    
    # Verify current password
    if not verify_password(password_data.current_password, current_user.password_hash):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    
    # Hash and update new password
    current_user.password_hash = get_password_hash(password_data.new_password)
    
    try:
        await db.commit()
        return {"message": "Password changed successfully"}
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/account")
async def delete_account(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete user account (soft delete)"""
    try:
        # Soft delete by deactivating
        current_user.is_active = False
        await db.commit()
        
        return {"message": "Account deactivated successfully"}
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/usage-stats")
async def get_usage_stats(current_user: User = Depends(get_current_active_user)):
    """Get user's usage statistics"""
    # In production, query from database
    return {
        "total_api_calls": 1247,
        "storage_used_mb": 342.5,
        "storage_limit_mb": 5000,
        "tokens_used": 1250000,
        "tokens_limit": 5000000,
        "active_days": 28,
        "last_active": datetime.now().isoformat()
    }

from datetime import datetime
