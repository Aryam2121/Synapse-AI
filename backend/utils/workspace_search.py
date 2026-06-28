"""Keyword search across real user data (chats, documents, tasks)."""
from __future__ import annotations

import re
from datetime import datetime
from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from db.database import Conversation, Message, Task


def _score(query: str, *texts: str) -> float:
    q = query.lower().strip()
    if not q:
        return 0.0
    score = 0.0
    for text in texts:
        if not text:
            continue
        t = text.lower()
        if q in t:
            score += 0.5 + (len(q) / max(len(t), 1))
        for word in q.split():
            if len(word) > 2 and word in t:
                score += 0.15
    return min(score, 1.0)


def _snippet(text: str, query: str, max_len: int = 160) -> str:
    if not text:
        return ""
    t = re.sub(r"\s+", " ", text).strip()
    idx = t.lower().find(query.lower()[:20])
    if idx < 0:
        return t[:max_len] + ("..." if len(t) > max_len else "")
    start = max(0, idx - 40)
    chunk = t[start : start + max_len]
    return ("..." if start > 0 else "") + chunk + ("..." if start + max_len < len(t) else "")


async def search_workspace(
    db: AsyncSession,
    user_id: str,
    query: str,
    *,
    type_filter: list[str] | None = None,
    limit: int = 20,
) -> list[dict[str, Any]]:
    uid = str(user_id)
    q = query.strip()
    results: list[dict[str, Any]] = []
    allowed = set(type_filter) if type_filter else None

    # Conversations / chat messages
    if allowed is None or "chat" in allowed:
        conv_result = await db.execute(
            select(Conversation).where(Conversation.user_id == uid).order_by(Conversation.updated_at.desc())
        )
        for conv in conv_result.scalars().all():
            title = conv.title or "Chat"
            s = _score(q, title)
            if s > 0.1:
                results.append(
                    {
                        "id": conv.id,
                        "type": "chat",
                        "title": title,
                        "content": _snippet(title, q),
                        "relevance_score": round(s, 2),
                        "highlights": [w for w in q.split() if w.lower() in title.lower()],
                        "metadata": {"conversation_id": conv.id},
                        "timestamp": (conv.updated_at or conv.created_at or datetime.utcnow()).isoformat(),
                    }
                )

        msg_result = await db.execute(
            select(Message, Conversation)
            .join(Conversation, Message.conversation_id == Conversation.id)
            .where(Conversation.user_id == uid)
            .order_by(Message.created_at.desc())
            .limit(200)
        )
        for msg, conv in msg_result.all():
            s = _score(q, msg.content, conv.title or "")
            if s > 0.15:
                results.append(
                    {
                        "id": msg.id,
                        "type": "chat",
                        "title": conv.title or "Chat message",
                        "content": _snippet(msg.content, q),
                        "relevance_score": round(s, 2),
                        "highlights": [w for w in q.split() if w.lower() in msg.content.lower()][:3],
                        "metadata": {
                            "conversation_id": conv.id,
                            "role": msg.role,
                        },
                        "timestamp": (msg.created_at or datetime.utcnow()).isoformat(),
                    }
                )

    # Documents
    if allowed is None or "document" in allowed:
        from utils.document_store import list_documents

        for doc in list_documents(user_id=uid):
            name = doc.get("filename") or doc.get("name") or "Document"
            s = _score(q, name)
            if s > 0.1:
                results.append(
                    {
                        "id": doc["id"],
                        "type": "document",
                        "title": name,
                        "content": f"Uploaded document ({doc.get('size', 0)} bytes)",
                        "relevance_score": round(s, 2),
                        "highlights": [w for w in q.split() if w.lower() in name.lower()],
                        "metadata": {"filename": name, "status": doc.get("status")},
                        "timestamp": doc.get("created_at") or datetime.utcnow().isoformat(),
                    }
                )

    # Tasks
    if allowed is None or "task" in allowed:
        task_result = await db.execute(select(Task).where(Task.user_id == uid))
        for task in task_result.scalars().all():
            s = _score(q, task.title, task.description or "")
            if s > 0.1:
                results.append(
                    {
                        "id": task.id,
                        "type": "task",
                        "title": task.title,
                        "content": _snippet(task.description or task.title, q),
                        "relevance_score": round(s, 2),
                        "highlights": [w for w in q.split() if w.lower() in task.title.lower()],
                        "metadata": {
                            "completed": task.completed,
                            "priority": task.priority,
                        },
                        "timestamp": (task.updated_at or task.created_at or datetime.utcnow()).isoformat(),
                    }
                )

    results.sort(key=lambda r: r["relevance_score"], reverse=True)
    seen: set[str] = set()
    unique: list[dict[str, Any]] = []
    for r in results:
        key = f"{r['type']}:{r['id']}"
        if key in seen:
            continue
        seen.add(key)
        unique.append(r)
    return unique[:limit]
