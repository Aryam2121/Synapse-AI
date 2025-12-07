"""
Authentication utilities for JWT tokens and password hashing
"""
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
import os
from dotenv import load_dotenv

load_dotenv()

# Configuration
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-this-in-production")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 10080))  # 7 days default

# Password hashing - use argon2 instead of bcrypt to avoid compatibility issues
# Argon2 is more modern and doesn't have the 72-byte limitation
pwd_context = CryptContext(
    schemes=["argon2", "bcrypt"],
    deprecated="auto",
    argon2__rounds=4
)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against a hash"""
    # Truncate password to 72 bytes for bcrypt (byte-level truncation)
    password_bytes = plain_password.encode('utf-8')
    if len(password_bytes) > 72:
        password_bytes = password_bytes[:72]
        # Decode back, handling potential decoding errors
        try:
            plain_password = password_bytes.decode('utf-8')
        except UnicodeDecodeError:
            # If we cut in the middle of a character, trim one more byte
            plain_password = password_bytes[:71].decode('utf-8', errors='ignore')
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Hash a password"""
    # Bcrypt has a 72-byte limit, so truncate at byte level
    password_bytes = password.encode('utf-8')
    
    # Debug logging
    print(f"Password length in chars: {len(password)}")
    print(f"Password length in bytes: {len(password_bytes)}")
    
    if len(password_bytes) > 72:
        password_bytes = password_bytes[:72]
        # Decode back, handling potential decoding errors
        try:
            password = password_bytes.decode('utf-8')
        except UnicodeDecodeError:
            # If we cut in the middle of a character, trim one more byte
            password = password_bytes[:71].decode('utf-8', errors='ignore')
    
    # Final check
    final_bytes = password.encode('utf-8')
    print(f"Final password length in bytes: {len(final_bytes)}")
    
    if len(final_bytes) > 72:
        # Force truncate to exactly 72 bytes
        password = final_bytes[:72].decode('utf-8', errors='ignore')
        print(f"Force truncated to: {len(password.encode('utf-8'))} bytes")
    
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT access token"""
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    
    return encoded_jwt


def decode_access_token(token: str) -> Optional[dict]:
    """Decode and verify a JWT token"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None
