from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy import Column, String, DateTime, Integer, Text, Boolean, text
from sqlalchemy.engine import make_url
import os
from datetime import datetime


def _normalize_database_url(raw: str | None) -> str:
    """Strip quotes/whitespace from env vars (common Render dashboard mistake)."""
    url = (raw or "").strip().strip('"').strip("'")
    return url or "sqlite+aiosqlite:///./universal_ai.db"


def _to_async_postgres_url(url: str) -> str:
    if url.startswith("postgresql+asyncpg://"):
        return url
    if url.startswith("postgresql://"):
        return url.replace("postgresql://", "postgresql+asyncpg://", 1)
    if url.startswith("postgres://"):
        return url.replace("postgres://", "postgresql+asyncpg://", 1)
    return url


def _postgres_connect_args(url: str) -> dict:
    # Render and most hosted Postgres providers require TLS.
    return {"command_timeout": 10, "ssl": "require"}


def describe_database_target(url: str) -> str:
    """Human-readable DB target for logs (no credentials)."""
    try:
        parsed = make_url(url)
        driver = parsed.drivername or "unknown"
        host = parsed.host or "(file)"
        database = parsed.database or "default"
        user = parsed.username or "unknown"
        return f"{driver} @ {host}/{database} (user={user})"
    except Exception:
        return "unknown"


# Database URL
DATABASE_URL = _normalize_database_url(os.getenv("DATABASE_URL"))
if DATABASE_URL.startswith(("postgresql://", "postgres://", "postgresql+asyncpg://")):
    DATABASE_URL = _to_async_postgres_url(DATABASE_URL)

_is_sqlite = "sqlite" in DATABASE_URL
_connect_args = {"timeout": 10} if _is_sqlite else _postgres_connect_args(DATABASE_URL)

# Create async engine with optimized connection pooling
engine = create_async_engine(
    DATABASE_URL,
    echo=False,  # Disable SQL logging in production for speed
    pool_size=5,  # Reduced for faster startup
    max_overflow=10,  # Fewer overflow connections
    pool_pre_ping=True,  # Verify connections before use
    pool_recycle=1800,  # Recycle connections after 30 min
    pool_timeout=10,  # Faster timeout for connection acquisition
    connect_args=_connect_args,
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
    firebase_uid = Column(String, unique=True, nullable=True)
    auth_provider = Column(String, default="local")
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
_POSTGRES_BOOTSTRAP_SQL = """
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR PRIMARY KEY,
    email VARCHAR NOT NULL UNIQUE,
    password_hash VARCHAR NOT NULL,
    name VARCHAR,
    firebase_uid VARCHAR UNIQUE,
    auth_provider VARCHAR DEFAULT 'local',
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
CREATE TABLE IF NOT EXISTS conversations (
    id VARCHAR PRIMARY KEY,
    user_id VARCHAR NOT NULL,
    title VARCHAR,
    agent_type VARCHAR,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
CREATE TABLE IF NOT EXISTS messages (
    id VARCHAR PRIMARY KEY,
    conversation_id VARCHAR NOT NULL,
    role VARCHAR NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP
);
CREATE TABLE IF NOT EXISTS documents (
    id VARCHAR PRIMARY KEY,
    user_id VARCHAR NOT NULL,
    filename VARCHAR NOT NULL,
    file_path VARCHAR NOT NULL,
    file_type VARCHAR,
    file_size INTEGER,
    status VARCHAR DEFAULT 'processing',
    created_at TIMESTAMP
);
CREATE TABLE IF NOT EXISTS tasks (
    id VARCHAR PRIMARY KEY,
    user_id VARCHAR NOT NULL,
    title VARCHAR NOT NULL,
    description TEXT,
    completed BOOLEAN DEFAULT FALSE,
    priority VARCHAR DEFAULT 'medium',
    due_date TIMESTAMP,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
"""


async def _list_table_names(conn) -> list[str]:
    def sync_list(sync_conn):
        from sqlalchemy import inspect

        return inspect(sync_conn).get_table_names()

    return await conn.run_sync(sync_list)


async def init_db():
    is_postgres = "postgresql" in DATABASE_URL or "postgres" in DATABASE_URL

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        if is_postgres:
            tables = await _list_table_names(conn)
            if "users" not in tables:
                for statement in _POSTGRES_BOOTSTRAP_SQL.strip().split(";"):
                    stmt = statement.strip()
                    if stmt:
                        await conn.execute(text(stmt))

    async with engine.connect() as conn:
        tables = await _list_table_names(conn)

    import logging

    logging.getLogger("UniversalAI").info("Database tables: %s", ", ".join(tables) or "(none)")

    if "users" not in tables:
        raise RuntimeError(
            "users table was not created. For Supabase, use Session pooler on port 5432."
        )

    await _migrate_users_schema()


async def _migrate_users_schema():
    """Add OAuth columns to existing SQLite and PostgreSQL databases."""
    is_sqlite = "sqlite" in DATABASE_URL

    async with engine.begin() as conn:
        def sync_migrate(sync_conn):
            from sqlalchemy import inspect

            insp = inspect(sync_conn)
            if "users" not in insp.get_table_names():
                return
            cols = {c["name"] for c in insp.get_columns("users")}
            if "firebase_uid" not in cols:
                if is_sqlite:
                    sync_conn.execute(text("ALTER TABLE users ADD COLUMN firebase_uid VARCHAR"))
                else:
                    sync_conn.execute(
                        text("ALTER TABLE users ADD COLUMN IF NOT EXISTS firebase_uid VARCHAR")
                    )
            if "auth_provider" not in cols:
                if is_sqlite:
                    sync_conn.execute(
                        text("ALTER TABLE users ADD COLUMN auth_provider VARCHAR DEFAULT 'local'")
                    )
                else:
                    sync_conn.execute(
                        text(
                            "ALTER TABLE users ADD COLUMN IF NOT EXISTS "
                            "auth_provider VARCHAR DEFAULT 'local'"
                        )
                    )

        await conn.run_sync(sync_migrate)

# Get database session
async def get_db():
    async with async_session_maker() as session:
        yield session
