"""Create LLM clients with optional per-request model override."""
from __future__ import annotations

import os
from typing import Optional

from utils.env_loader import get_groq_api_key, load_backend_env

load_backend_env()

GROQ_MODELS = [
    {"id": "llama-3.1-8b-instant", "name": "Llama 3.1 8B — Fast", "description": "Best for quick replies"},
    {"id": "llama-3.3-70b-versatile", "name": "Llama 3.3 70B — Smart", "description": "Better reasoning"},
    {"id": "mixtral-8x7b-32768", "name": "Mixtral 8x7B", "description": "Long context"},
    {"id": "gemma2-9b-it", "name": "Gemma 2 9B", "description": "Balanced"},
]


def get_default_model() -> str:
    return os.getenv("GROQ_MODEL", "llama-3.1-8b-instant")


def create_llm(model: Optional[str] = None):
    """Return a LangChain chat model for the given model id."""
    groq_api_key = get_groq_api_key()
    openai_api_key = (os.getenv("OPENAI_API_KEY") or "").strip() or None
    use_ollama = os.getenv("USE_OLLAMA", "false").lower() == "true"
    model_name = model or get_default_model()

    if groq_api_key:
        from langchain_groq import ChatGroq

        return ChatGroq(
            model=model_name,
            temperature=0.3,
            api_key=groq_api_key,
            streaming=True,
            max_tokens=2048,
            timeout=60,
            max_retries=3,
            request_timeout=60,
        )
    if openai_api_key:
        from langchain_openai import ChatOpenAI

        return ChatOpenAI(
            model=model_name if model_name.startswith("gpt") else "gpt-4o-mini",
            temperature=0.7,
            api_key=openai_api_key,
        )
    if use_ollama:
        from langchain_ollama import ChatOllama

        return ChatOllama(
            model=os.getenv("OLLAMA_MODEL", "llama3.1"),
            temperature=0.7,
            base_url=os.getenv("OLLAMA_BASE_URL", "http://localhost:11434"),
        )
    raise ValueError("No AI provider configured")
