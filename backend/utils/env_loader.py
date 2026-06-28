"""Load backend/.env reliably regardless of process working directory."""
import os
from pathlib import Path
from dotenv import load_dotenv

BACKEND_ROOT = Path(__file__).resolve().parent.parent
ENV_FILE = BACKEND_ROOT / ".env"


def _apply_env_file_manual() -> None:
    """Fallback: parse .env when dotenv does not populate os.environ (e.g. uvicorn reload on Windows)."""
    if not ENV_FILE.is_file():
        return
    try:
        text = ENV_FILE.read_text(encoding="utf-8-sig")
    except OSError:
        return
    for line in text.splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, value = line.partition("=")
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        if key and value and not os.getenv(key):
            os.environ[key] = value


def load_backend_env() -> None:
    if ENV_FILE.is_file():
        load_dotenv(ENV_FILE, override=True)
    _apply_env_file_manual()


def get_groq_api_key() -> str | None:
    load_backend_env()
    value = (os.getenv("GROQ_API_KEY") or "").strip()
    return value or None
