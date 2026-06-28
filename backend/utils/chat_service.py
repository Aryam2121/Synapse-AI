"""Shared chat preparation and database persistence."""
from __future__ import annotations

import uuid
from datetime import datetime
from typing import Any, Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from db.database import Conversation, Message


def build_document_context(document_ids: list[str], user_id: str) -> tuple[list[dict[str, Any]], list[str]]:
    from utils.document_store import extract_text, get_document

    doc_context: list[dict[str, Any]] = []
    errors: list[str] = []
    uid = str(user_id)

    for doc_id in document_ids[:5]:
        record = get_document(doc_id, user_id=uid)
        if not record:
            errors.append(f"{doc_id}: document not found")
            continue
        try:
            text = extract_text(record["file_path"], record["filename"])
            if text.strip():
                doc_context.append(
                    {
                        "content": text[:12000],
                        "metadata": {"source": record["filename"], "document_id": doc_id},
                    }
                )
        except Exception as e:
            errors.append(f"{record.get('filename', doc_id)}: {e}")

    return doc_context, errors


async def ensure_conversation(
    db: AsyncSession,
    *,
    user_id: str,
    conversation_id: Optional[str],
    first_message: str,
) -> str:
    uid = str(user_id)
    if conversation_id:
        result = await db.execute(
            select(Conversation).where(
                Conversation.id == conversation_id,
                Conversation.user_id == uid,
            )
        )
        if result.scalar_one_or_none():
            return conversation_id

    conv_id = str(uuid.uuid4())
    title = (first_message.strip()[:60] or "New chat").replace("\n", " ")
    db.add(
        Conversation(
            id=conv_id,
            user_id=uid,
            title=title,
            agent_type="general",
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
    )
    await db.commit()
    return conv_id


async def save_message(
    db: AsyncSession,
    *,
    conversation_id: str,
    role: str,
    content: str,
) -> str:
    msg_id = str(uuid.uuid4())
    db.add(
        Message(
            id=msg_id,
            conversation_id=conversation_id,
            role=role,
            content=content,
            created_at=datetime.utcnow(),
        )
    )
    result = await db.execute(select(Conversation).where(Conversation.id == conversation_id))
    conv = result.scalar_one_or_none()
    if conv:
        conv.updated_at = datetime.utcnow()
    await db.commit()
    return msg_id


async def load_messages_for_memory(db: AsyncSession, conversation_id: str) -> list[tuple[str, str]]:
    result = await db.execute(
        select(Message)
        .where(Message.conversation_id == conversation_id)
        .order_by(Message.created_at.asc())
    )
    rows = result.scalars().all()
    return [(m.role, m.content) for m in rows]


def resolve_agent_and_context(
    message: str,
    doc_context: list[dict[str, Any]],
    agent_router,
    get_rag_pipeline,
) -> tuple[str, str, list[dict[str, Any]]]:
    """Returns (agent_type, chat_message, relevant_docs)."""
    if doc_context:
        agent_type = "document"
        relevant_docs = list(doc_context)
    else:
        agent_type, _ = agent_router.route(message)
        relevant_docs = []

    chat_message = message
    if doc_context and not message.strip():
        chat_message = (
            "The user attached document(s). Summarize them and answer any implied questions."
        )

    return agent_type, chat_message, relevant_docs
