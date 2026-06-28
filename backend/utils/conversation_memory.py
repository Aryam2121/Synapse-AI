"""Shared in-memory conversation history (all agent types use the same thread)."""
from __future__ import annotations

from langchain_core.messages import AIMessage, HumanMessage

_MAX_MESSAGES = 20
_store: dict[str, list] = {}


def get_history(conversation_id: str) -> list:
    return list(_store.get(conversation_id, []))


def append_exchange(conversation_id: str, human: str, ai: str) -> None:
    if conversation_id not in _store:
        _store[conversation_id] = []
    _store[conversation_id].append(HumanMessage(content=human))
    _store[conversation_id].append(AIMessage(content=ai))
    if len(_store[conversation_id]) > _MAX_MESSAGES:
        _store[conversation_id] = _store[conversation_id][-_MAX_MESSAGES:]


def clear(conversation_id: str) -> None:
    _store.pop(conversation_id, None)


def hydrate(conversation_id: str, messages: list[tuple[str, str]]) -> None:
    """Load DB messages into memory for a conversation."""
    _store[conversation_id] = []
    for role, content in messages:
        if role == "user":
            _store[conversation_id].append(HumanMessage(content=content))
        elif role == "assistant":
            _store[conversation_id].append(AIMessage(content=content))
    if len(_store[conversation_id]) > _MAX_MESSAGES:
        _store[conversation_id] = _store[conversation_id][-_MAX_MESSAGES:]
