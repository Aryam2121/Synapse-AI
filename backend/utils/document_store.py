"""Simple document metadata store (no RAG required for upload/list/delete)."""
from __future__ import annotations

import json
import os
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

BACKEND_ROOT = Path(__file__).resolve().parent.parent
UPLOADS_DIR = BACKEND_ROOT / "uploads"
INDEX_FILE = UPLOADS_DIR / "_index.json"


def _load_index() -> dict[str, dict[str, Any]]:
    UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
    if not INDEX_FILE.exists():
        return {}
    try:
        return json.loads(INDEX_FILE.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, OSError):
        return {}


def _save_index(index: dict[str, dict[str, Any]]) -> None:
    UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
    INDEX_FILE.write_text(json.dumps(index, indent=2), encoding="utf-8")


def save_upload(
    *,
    user_id: str,
    filename: str,
    content: bytes,
) -> dict[str, Any]:
    user_id = str(user_id)
    doc_id = str(uuid.uuid4())
    safe_name = os.path.basename(filename) or "upload.bin"
    user_dir = UPLOADS_DIR / user_id
    user_dir.mkdir(parents=True, exist_ok=True)
    stored_name = f"{doc_id}_{safe_name}"
    file_path = user_dir / stored_name
    file_path.write_bytes(content)

    record = {
        "id": doc_id,
        "filename": safe_name,
        "name": safe_name,
        "file_path": str(file_path),
        "size": len(content),
        "file_type": _guess_type(safe_name),
        "user_id": user_id,
        "status": "ready",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    index = _load_index()
    index[doc_id] = record
    _save_index(index)
    return record


def list_documents(user_id: str | None = None) -> list[dict[str, Any]]:
    index = _load_index()
    docs = list(index.values())
    if user_id:
        docs = [d for d in docs if d.get("user_id") == user_id]
    return sorted(docs, key=lambda d: d.get("created_at", ""), reverse=True)


def get_document(document_id: str, user_id: str | None = None) -> dict[str, Any] | None:
    index = _load_index()
    record = index.get(document_id)
    if not record:
        return None
    if user_id and str(record.get("user_id")) != str(user_id):
        return None
    return record


def extract_text(file_path: str, filename: str) -> str:
    """Extract plain text from uploaded file for AI analysis."""
    path = Path(file_path)
    if not path.is_file():
        raise FileNotFoundError(f"File not found: {file_path}")

    ext = os.path.splitext(filename)[1].lower()
    if ext in {".txt", ".md", ".markdown"}:
        return path.read_text(encoding="utf-8", errors="ignore")[:50000]

    if ext == ".pdf":
        try:
            from pypdf import PdfReader
        except ImportError as e:
            raise ValueError(
                "PDF support is not installed. Run: npm run install-backend"
            ) from e

        try:
            reader = PdfReader(str(path))
            parts = []
            for page in reader.pages[:30]:
                text = page.extract_text()
                if text:
                    parts.append(text)
            content = "\n".join(parts).strip()
            if content:
                return content[:50000]
            raise ValueError(
                "This PDF has little or no selectable text (it may be a scanned image). "
                "Export a text-based PDF from Word/Google Docs and try again."
            )
        except ValueError:
            raise
        except Exception as e:
            raise ValueError(f"Could not read PDF: {e}") from e

    if ext == ".docx":
        try:
            from docx import Document as DocxDocument

            doc = DocxDocument(str(path))
            return "\n".join(p.text for p in doc.paragraphs if p.text)[:50000]
        except Exception as e:
            raise ValueError(f"Could not read DOCX: {e}") from e

    raise ValueError(f"Unsupported file type for analysis: {ext or 'unknown'}")


def delete_document(document_id: str, user_id: str | None = None) -> bool:
    index = _load_index()
    record = index.get(document_id)
    if not record:
        return False
    if user_id and record.get("user_id") != user_id:
        return False
    path = record.get("file_path")
    if path and os.path.isfile(path):
        try:
            os.remove(path)
        except OSError:
            pass
    del index[document_id]
    _save_index(index)
    return True


def _guess_type(filename: str) -> str:
    ext = os.path.splitext(filename)[1].lower()
    return {
        ".pdf": "application/pdf",
        ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ".txt": "text/plain",
        ".md": "text/markdown",
    }.get(ext, "application/octet-stream")
