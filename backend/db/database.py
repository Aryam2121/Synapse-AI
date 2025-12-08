from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy import Column, String, DateTime, Integer, Text, Boolean
import os
from datetime import datetime

# Database URL
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./universal_ai.db")

# Convert PostgreSQL URL to use async driver
if DATABASE_URL.startswith("postgresql://") or DATABASE_URL.startswith("postgres://"):
    # Replace postgresql:// with postgresql+asyncpg:// for async support
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://")
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+asyncpg://")

# Create async engine with optimized connection pooling
engine = create_async_engine(
    DATABASE_URL,
    echo=False,  # Disable SQL logging in production for speed
    pool_size=5,  # Reduced for faster startup
    max_overflow=10,  # Fewer overflow connections
    pool_pre_ping=True,  # Verify connections before use
    pool_recycle=1800,  # Recycle connections after 30 min
    pool_timeout=10,  # Faster timeout for connection acquisition
    connect_args={"timeout": 10} if "sqlite" in DATABASE_URL else {"command_timeout": 10}
)

# Create session factory
async_session_maker = sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)

# Base class for models
Base = declarative_base()

# Models
class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True)
    email = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    name = Column(String)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Conversation(Base):
    __tablename__ = "conversations"
    
    id = Column(String, primary_key=True)
    user_id = Column(String, nullable=False)
    title = Column(String)
    agent_type = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Message(Base):
    __tablename__ = "messages"
    
    id = Column(String, primary_key=True)
    conversation_id = Column(String, nullable=False)
    role = Column(String, nullable=False)  # user or assistant
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class Document(Base):
    __tablename__ = "documents"
    
    id = Column(String, primary_key=True)
    user_id = Column(String, nullable=False)
    filename = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    file_type = Column(String)
    file_size = Column(Integer)
    status = Column(String, default="processing")
    created_at = Column(DateTime, default=datetime.utcnow)

class Task(Base):
    __tablename__ = "tasks"
    
    id = Column(String, primary_key=True)
    user_id = Column(String, nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text)
    completed = Column(Boolean, default=False)
    priority = Column(String, default="medium")
    due_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# Database initialization
async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

# Get database session
async def get_db():
    async with async_session_maker() as session:
        yield session
