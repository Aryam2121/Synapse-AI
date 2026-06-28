from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import time

from auth.dependencies import get_current_active_user
from db.database import User, get_db
from sqlalchemy.ext.asyncio import AsyncSession
from utils.workspace_search import search_workspace

router = APIRouter(prefix="/api/search", tags=["search"])


class SearchQuery(BaseModel):
    query: str
    filters: Optional[Dict[str, Any]] = None
    limit: int = 20


class SearchResult(BaseModel):
    id: str
    type: str
    title: str
    content: str
    relevance_score: float
    highlights: List[str]
    metadata: Dict[str, Any]
    timestamp: str


class SearchResponse(BaseModel):
    results: List[SearchResult]
    total: int
    query: str
    processing_time: float
    suggestions: List[str]


@router.post("/semantic", response_model=SearchResponse)
async def semantic_search(
    search: SearchQuery,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Search your real chats, documents, and tasks (keyword match)."""
    start = time.time()
    type_filter = None
    if search.filters and search.filters.get("types"):
        type_filter = search.filters["types"]

    raw = await search_workspace(
        db,
        str(current_user.id),
        search.query,
        type_filter=type_filter,
        limit=search.limit,
    )

    results = [SearchResult(**r) for r in raw]
    elapsed = time.time() - start

    suggestions = []
    if not results and len(search.query) >= 2:
        suggestions = ["resume", "tasks", "documents", "meeting"]
    elif results:
        suggestions = list({r.type + "s" for r in results})[:4]

    return SearchResponse(
        results=results,
        total=len(results),
        query=search.query,
        processing_time=round(elapsed, 3),
        suggestions=suggestions,
    )


@router.get("/suggestions")
async def get_search_suggestions(
    prefix: str = Query(..., min_length=1),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Autocomplete from your real workspace content."""
    from sqlalchemy import select
    from db.database import Conversation

    uid = str(current_user.id)
    prefix_lower = prefix.lower()
    suggestions: list[str] = []

    result = await db.execute(
        select(Conversation.title)
        .where(Conversation.user_id == uid)
        .order_by(Conversation.updated_at.desc())
        .limit(20)
    )
    for (title,) in result.all():
        if title and prefix_lower in title.lower():
            suggestions.append(title)

    from utils.document_store import list_documents

    for doc in list_documents(user_id=uid)[:15]:
        name = doc.get("filename") or ""
        if prefix_lower in name.lower():
            suggestions.append(name)

    defaults = ["my resume", "tasks due", "recent chats", "uploaded documents"]
    for d in defaults:
        if prefix_lower in d and d not in suggestions:
            suggestions.append(d)

    return {"suggestions": suggestions[:8], "prefix": prefix}


@router.get("/filters")
async def get_available_filters(current_user: User = Depends(get_current_active_user)):
    from utils.document_store import list_documents
    from sqlalchemy import select, func
    from db.database import Conversation, Task

    doc_count = len(list_documents(user_id=str(current_user.id)))

    return {
        "filters": {
            "type": {
                "label": "Content Type",
                "options": [
                    {"value": "task", "label": "Tasks"},
                    {"value": "document", "label": "Documents"},
                    {"value": "chat", "label": "Conversations"},
                ],
            },
        },
        "counts": {"documents": doc_count},
    }


@router.get("/trending")
async def get_trending_searches(current_user: User = Depends(get_current_active_user)):
    return {
        "trending": [
            {"query": "resume", "count": 0, "trend": "stable"},
            {"query": "tasks", "count": 0, "trend": "stable"},
        ]
    }
