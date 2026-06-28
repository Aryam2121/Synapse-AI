-- Run in Supabase → SQL Editor if tables are missing after deploy.
-- Safe to run multiple times (IF NOT EXISTS).

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
