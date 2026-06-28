"""Persisted conversation threads (ChatGPT-style history)."""
from __future__ import annotations

import uuid
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from auth.dependencies import get_current_active_user
from db.database import Conversation, Message, User, get_db
from utils import conversation_memory

router = APIRouter(prefix="/api/conversations", tags=["conversations"])


class ConversationOut(BaseModel):
    id: str
    title: Optional[str]
    agent_type: Optional[str]
    created_at: datetime
    updated_at: datetime


class MessageOut(BaseModel):
    id: str
    role: str
    content: str
    created_at: datetime


@router.get("")
async def list_conversations(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    uid = str(current_user.id)
    result = await db.execute(
        select(Conversation)
        .where(Conversation.user_id == uid)
        .order_by(Conversation.updated_at.desc())
        .limit(50)
    )
    rows = result.scalars().all()
    return {
        "conversations": [
            {
                "id": c.id,
                "title": c.title or "New chat",
                "agent_type": c.agent_type,
                "created_at": c.created_at.isoformat() if c.created_at else None,
                "updated_at": c.updated_at.isoformat() if c.updated_at else None,
            }
            for c in rows
        ]
    }


@router.post("")
async def create_conversation(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    uid = str(current_user.id)
    conv_id = str(uuid.uuid4())
    now = datetime.utcnow()
    db.add(
        Conversation(
            id=conv_id,
            user_id=uid,
            title="New chat",
            agent_type="general",
            created_at=now,
            updated_at=now,
        )
    )
    await db.commit()
    return {"id": conv_id, "title": "New chat"}


@router.get("/{conversation_id}/messages")
async def get_conversation_messages(
    conversation_id: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    uid = str(current_user.id)
    conv_result = await db.execute(
        select(Conversation).where(
            Conversation.id == conversation_id,
            Conversation.user_id == uid,
        )
    )
    if not conv_result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Conversation not found")

    result = await db.execute(
        select(Message)
        .where(Message.conversation_id == conversation_id)
        .order_by(Message.created_at.asc())
    )
    messages = result.scalars().all()
    return {
        "messages": [
            {
                "id": m.id,
                "role": m.role,
                "content": m.content,
                "created_at": m.created_at.isoformat() if m.created_at else None,
            }
            for m in messages
        ]
    }


@router.patch("/{conversation_id}")
async def rename_conversation(
    conversation_id: str,
    body: dict,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    title = (body.get("title") or "").strip()
    if not title:
        raise HTTPException(status_code=400, detail="Title is required")

    uid = str(current_user.id)
    result = await db.execute(
        select(Conversation).where(
            Conversation.id == conversation_id,
            Conversation.user_id == uid,
        )
    )
    conv = result.scalar_one_or_none()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    conv.title = title[:120]
    conv.updated_at = datetime.utcnow()
    await db.commit()
    return {"id": conversation_id, "title": conv.title}


@router.delete("/{conversation_id}/messages/from/{message_id}")
async def truncate_from_message(
    conversation_id: str,
    message_id: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Remove a message and everything after it (for edit & resend)."""
    uid = str(current_user.id)
    conv_result = await db.execute(
        select(Conversation).where(
            Conversation.id == conversation_id,
            Conversation.user_id == uid,
        )
    )
    if not conv_result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Conversation not found")

    msg_result = await db.execute(
        select(Message).where(
            Message.id == message_id,
            Message.conversation_id == conversation_id,
        )
    )
    target = msg_result.scalar_one_or_none()
    if not target:
        raise HTTPException(status_code=404, detail="Message not found")

    all_result = await db.execute(
        select(Message)
        .where(Message.conversation_id == conversation_id)
        .order_by(Message.created_at.asc())
    )
    all_msgs = list(all_result.scalars().all())
    to_delete = []
    found = False
    for m in all_msgs:
        if m.id == message_id:
            found = True
        if found:
            to_delete.append(m)
    for m in to_delete:
        await db.delete(m)
    await db.commit()

    from utils.chat_service import load_messages_for_memory

    pairs = await load_messages_for_memory(db, conversation_id)
    conversation_memory.hydrate(conversation_id, pairs)

    return {"deleted": len(to_delete), "remaining": len(pairs)}


@router.delete("/{conversation_id}")
async def delete_conversation(
    conversation_id: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    uid = str(current_user.id)
    result = await db.execute(
        select(Conversation).where(
            Conversation.id == conversation_id,
            Conversation.user_id == uid,
        )
    )
    conv = result.scalar_one_or_none()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")

    msg_result = await db.execute(
        select(Message).where(Message.conversation_id == conversation_id)
    )
    for msg in msg_result.scalars().all():
        await db.delete(msg)
    await db.delete(conv)
    await db.commit()
    conversation_memory.clear(conversation_id)
    return {"status": "deleted"}
