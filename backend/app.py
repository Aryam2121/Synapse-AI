from utils.env_loader import load_backend_env

load_backend_env()

from fastapi import FastAPI, HTTPException, UploadFile, File, WebSocket, WebSocketDisconnect, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import StreamingResponse, Response, ORJSONResponse
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import os
import asyncio
from datetime import datetime
from functools import lru_cache

# Import our modules
from agents.router import AgentRouter
from agents.code_agent import CodeAgent
from db.database import get_db, init_db, User, describe_database_target, DATABASE_URL
from sqlalchemy.ext.asyncio import AsyncSession
from utils.logger import logger
from auth.routes import router as auth_router
from auth.dependencies import get_current_active_user
from api.tasks import router as tasks_router
from api.analytics import router as analytics_router
from api.settings import router as settings_router
from api.notifications import router as notifications_router
from api.insights import router as insights_router
from api.collab import router as collab_router
from api.collaboration import router as collaboration_router
from api.exports import router as exports_router
from api.voice import router as voice_router
from api.search import router as search_router
from api.automation import router as automation_router
from api.visualization import router as visualization_router
from api.realtime import router as realtime_router
from api.code_assistant import router as code_assistant_router
from api.gamification import router as gamification_router
from api.smart_scheduling import router as smart_scheduling_router
from api.knowledge_base import router as knowledge_base_router
from api.ai_assistant import router as ai_assistant_router
from api.conversations import router as conversations_router

app = FastAPI(
    title="Synapse AI Workspace API",
    description="Backend API for Synapse AI Workspace with multi-agent system and RAG",
    version="1.0.0",
    default_response_class=ORJSONResponse
)

# Startup event to initialize database
@app.on_event("startup")
async def startup_event():
    try:
        from utils.env_loader import get_groq_api_key
        logger.info("Starting Synapse AI Backend...")
        logger.info("Groq API key: %s", "configured" if get_groq_api_key() else "MISSING")
        logger.info("Initializing database (%s)...", describe_database_target(DATABASE_URL))
        await init_db()
        logger.info("Database initialized successfully")
        logger.info("Backend is ready to accept requests")
    except Exception as e:
        logger.error("Startup error: %s", e)
        err = str(e).lower()
        if "postgresql" in DATABASE_URL or "postgres" in DATABASE_URL:
            if "supabase.co" in DATABASE_URL and (
                "network is unreachable" in err or "errno 101" in err
            ):
                logger.error(
                    "Supabase Direct connection uses IPv6; Render cannot reach it. "
                    "In Supabase → Database → Connection string, choose "
                    "'Session pooler' (not Direct), copy the URI, and set DATABASE_URL on Render. "
                    "User must be postgres.vmnwupaexrzpnygksvtn (with project ref), "
                    "host must be aws-0-REGION.pooler.supabase.com:5432."
                )
            elif "db." in DATABASE_URL and ".supabase.co" in DATABASE_URL:
                logger.error(
                    "Do not use Supabase Direct (db.*.supabase.co) on Render. "
                    "Use Session pooler URI from Supabase → Database → Connection string."
                )
            else:
                logger.error(
                    "PostgreSQL connection failed. Check DATABASE_URL on Render. "
                    "For Supabase use Session pooler URI; for Render Postgres use Internal or External URL."
                )
        logger.error("Backend will still run but auth and data features may not work")
        # Don't crash the app, let it start anyway

# Include authentication routes
app.include_router(auth_router)
app.include_router(tasks_router)
app.include_router(analytics_router)
app.include_router(settings_router)
app.include_router(notifications_router)
app.include_router(insights_router)
app.include_router(collab_router)
app.include_router(collaboration_router)
app.include_router(exports_router)
app.include_router(voice_router)
app.include_router(search_router)
app.include_router(automation_router)
app.include_router(visualization_router)
app.include_router(realtime_router)
app.include_router(code_assistant_router)
app.include_router(gamification_router)
app.include_router(smart_scheduling_router)
app.include_router(knowledge_base_router)
app.include_router(ai_assistant_router)
app.include_router(conversations_router)

# CORS Configuration
# Allow localhost for development and production domains
allowed_origins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "https://synapse-ai-theta.vercel.app",
    "http://127.0.0.1:5500",
]

# Add production frontend URL from environment variable
frontend_url = os.getenv("FRONTEND_URL")
if frontend_url and frontend_url not in allowed_origins:
    allowed_origins.append(frontend_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add GZip compression for faster responses
app.add_middleware(GZipMiddleware, minimum_size=1000)

# Add performance monitoring middleware (only in production, optional)
if os.getenv("ENABLE_PERFORMANCE_MONITORING", "false").lower() == "true":
    try:
        from utils.performance import PerformanceMiddleware
        app.add_middleware(PerformanceMiddleware)
        logger.info("✓ Performance monitoring enabled")
    except Exception as e:
        logger.warning(f"⚠️ Could not load performance middleware: {e}")

# Initialize components
# Use lazy loading for RAG pipeline to avoid startup timeout
rag_pipeline = None
agent_router = AgentRouter()

def get_rag_pipeline():
    """Lazy-load RAG pipeline to avoid startup timeout and heavy import at boot"""
    global rag_pipeline
    if rag_pipeline is None:
        try:
            from rag.pipeline import RAGPipeline

            logger.info("Initializing RAG pipeline (this may take a moment on first use)...")
            rag_pipeline = RAGPipeline()
            logger.info("RAG pipeline initialized successfully")
        except ImportError as e:
            logger.error(f"RAG dependencies missing: {e}")
            raise HTTPException(
                status_code=503,
                detail="Document AI is unavailable. Install backend requirements: pip install -r requirements.txt",
            )
    return rag_pipeline

# Models
class ChatMessage(BaseModel):
    message: str
    conversation_id: Optional[str] = None
    agent_type: Optional[str] = None
    document_ids: Optional[List[str]] = None
    model: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    agent_used: str
    conversation_id: str
    sources: Optional[List[Dict[str, Any]]] = None

class DocumentUpload(BaseModel):
    name: str
    content: str
    type: str

class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    priority: str = "medium"
    due_date: Optional[str] = None

class CodeAnalysisRequest(BaseModel):
    code: Optional[str] = None
    file_path: Optional[str] = None
    analysis_type: str = "full"

# WebSocket Connection Manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def send_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)

manager = ConnectionManager()

# Root endpoint
@app.get("/")
async def root():
    """Root endpoint to verify backend is running"""
    return {
        "app": "Synapse AI Backend",
        "status": "running",
        "version": "1.0.0",
        "endpoints": {
            "health": "/health",
            "config": "/api/config-check",
            "chat": "/api/chat",
            "docs": "/docs"
        }
    }

# Health Check - Simple and fast, no caching to avoid issues
@app.get("/health")
async def health_check():
    """Lightweight health check that always responds"""
    return {
        "status": "healthy",
        "version": "1.0.0",
        "timestamp": datetime.now().isoformat()
    }

# Configuration Check Endpoint
@app.get("/api/config-check")
async def config_check():
    """Check which AI provider is configured - useful for debugging"""
    from utils.env_loader import get_groq_api_key
    groq_key = get_groq_api_key()
    openai_key = os.getenv("OPENAI_API_KEY")
    use_ollama_env = os.getenv("USE_OLLAMA", "false")
    use_ollama = use_ollama_env.lower() == "true"
    
    try:
        import pypdf  # noqa: F401

        pdf_extraction_ready = True
    except ImportError:
        pdf_extraction_ready = False

    config = {
        "pdf_extraction_ready": pdf_extraction_ready,
        "groq_configured": bool(groq_key),
        "groq_key_preview": f"{groq_key[:10]}...{groq_key[-4:]}" if groq_key else "NOT SET",
        "groq_key_length": len(groq_key) if groq_key else 0,
        "openai_configured": bool(openai_key),
        "use_ollama_env_var": use_ollama_env,
        "ollama_enabled": use_ollama,
        "active_provider": "groq" if groq_key else ("openai" if openai_key else ("ollama" if use_ollama else "NONE - ERROR!")),
        "groq_model": os.getenv("GROQ_MODEL", "llama-3.1-8b-instant"),
        "database_url_set": bool(os.getenv("DATABASE_URL")),
        "frontend_url": os.getenv("FRONTEND_URL", "not set"),
        "all_env_vars": list(os.environ.keys()),  # Show all env var names
        "timestamp": datetime.now().isoformat()
    }
    
    logger.info(f"Config check requested - Active provider: {config['active_provider']}")
    logger.info(f"Groq configured: {config['groq_configured']}, Key length: {config['groq_key_length']}")
    return config

@app.get("/api/chat/models")
async def list_chat_models(current_user: User = Depends(get_current_active_user)):
    """Available LLM models for the chat model picker."""
    from utils.env_loader import get_groq_api_key
    from utils.llm_factory import GROQ_MODELS, get_default_model

    if get_groq_api_key():
        return {
            "provider": "groq",
            "default": get_default_model(),
            "models": GROQ_MODELS,
        }
    return {
        "provider": "none",
        "default": get_default_model(),
        "models": [],
    }


async def _prepare_chat_turn(
    request: ChatMessage,
    current_user: User,
    db: AsyncSession,
) -> tuple[str, Any, str, list, str]:
    """Returns agent_type, agent, chat_message, relevant_docs, conversation_id."""
    from utils import conversation_memory
    from utils.chat_service import (
        build_document_context,
        ensure_conversation,
        load_messages_for_memory,
        resolve_agent_and_context,
    )

    doc_context, extract_errors = (
        build_document_context(request.document_ids or [], str(current_user.id))
        if request.document_ids
        else ([], [])
    )

    if request.document_ids and not doc_context:
        detail = (
            "; ".join(extract_errors)
            if extract_errors
            else "Could not read attached document(s). Try PDF, DOCX, TXT, or MD."
        )
        if "not installed" in detail.lower():
            detail += " Run from project root: npm run install-backend"
        raise HTTPException(status_code=400, detail=detail)

    conv_id = await ensure_conversation(
        db,
        user_id=str(current_user.id),
        conversation_id=request.conversation_id,
        first_message=request.message,
    )

    if request.conversation_id and not conversation_memory.get_history(conv_id):
        pairs = await load_messages_for_memory(db, conv_id)
        if pairs:
            conversation_memory.hydrate(conv_id, pairs)

    agent_type, chat_message, relevant_docs = resolve_agent_and_context(
        request.message, doc_context, agent_router, get_rag_pipeline
    )

    if not doc_context:
        try:
            pipeline = get_rag_pipeline()
            rag_docs = await pipeline.search(request.message, k=2)
            relevant_docs = list(relevant_docs) + list(rag_docs)
        except Exception as rag_error:
            logger.warning(f"RAG search failed: {str(rag_error)}")

    agent = agent_router.get_agent(agent_type)
    logger.info(f"Routed to {agent_type} for conversation {conv_id}")
    return agent_type, agent, chat_message, relevant_docs, conv_id


# Chat Endpoint (non-streaming fallback)
@app.post("/api/chat", response_model=ChatResponse)
async def chat(
    request: ChatMessage,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    import time
    from utils.chat_service import save_message

    start_time = time.time()
    try:
        logger.info(f"User {current_user.email} - chat: {request.message[:50]}...")
        agent_type, agent, chat_message, relevant_docs, conv_id = await _prepare_chat_turn(
            request, current_user, db
        )

        await save_message(db, conversation_id=conv_id, role="user", content=request.message)

        response = await agent.process(
            message=chat_message,
            context=relevant_docs if relevant_docs else [],
            conversation_id=conv_id,
            model=request.model,
        )

        await save_message(
            db, conversation_id=conv_id, role="assistant", content=response["content"]
        )

        elapsed_time = time.time() - start_time
        logger.info(f"Chat response in {elapsed_time:.2f}s")

        return ChatResponse(
            response=response["content"],
            agent_used=agent_type,
            conversation_id=conv_id,
            sources=response.get("sources", []),
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in chat endpoint: {str(e)}")
        import traceback

        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))


# Stream Chat Endpoint (ChatGPT-style token streaming)
@app.post("/api/chat/stream")
async def chat_stream(
    request: ChatMessage,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    import json
    from utils.chat_service import save_message

    async def generate():
        try:
            agent_type, agent, chat_message, relevant_docs, conv_id = await _prepare_chat_turn(
                request, current_user, db
            )
            yield f"data: {json.dumps({'conversation_id': conv_id, 'agent_used': agent_type})}\n\n"

            await save_message(db, conversation_id=conv_id, role="user", content=request.message)

            full_response = ""
            async for chunk in agent.stream_process(
                chat_message,
                context=relevant_docs if relevant_docs else [],
                conversation_id=conv_id,
                model=request.model,
            ):
                full_response += chunk
                yield f"data: {json.dumps({'content': chunk})}\n\n"

            if full_response:
                await save_message(
                    db, conversation_id=conv_id, role="assistant", content=full_response
                )
            yield "data: [DONE]\n\n"
        except HTTPException as e:
            yield f"data: {json.dumps({'error': e.detail})}\n\n"
        except Exception as e:
            logger.error(f"Stream error: {e}")
            yield f"data: {json.dumps({'error': str(e)})}\n\n"

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )

# Document Upload (works without full RAG stack)
@app.post("/api/documents/upload")
async def upload_document(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user),
):
    from utils.document_store import save_upload

    try:
        filename = file.filename or "upload.bin"
        logger.info(f"Uploading document: {filename} for user {current_user.email}")
        content = await file.read()
        if not content:
            raise HTTPException(status_code=400, detail="Empty file")

        record = save_upload(
            user_id=current_user.id,
            filename=filename,
            content=content,
        )

        rag_indexed = False
        try:
            pipeline = get_rag_pipeline()
            await pipeline.add_document(record["file_path"], filename)
            rag_indexed = True
        except Exception as rag_error:
            logger.warning(f"RAG indexing skipped: {rag_error}")

        return {
            "status": "success",
            "document_id": record["id"],
            "filename": record["filename"],
            "size": record["size"],
            "rag_indexed": rag_indexed,
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error uploading document: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/documents")
async def list_documents(current_user: User = Depends(get_current_active_user)):
    from utils.document_store import list_documents as store_list

    try:
        documents = store_list(user_id=current_user.id)
        return {"documents": documents}
    except Exception as e:
        logger.error(f"Error listing documents: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/documents/{document_id}/analyze")
async def analyze_document(
    document_id: str,
    current_user: User = Depends(get_current_active_user),
):
    """Summarize and extract insights from an uploaded document."""
    from utils.document_store import get_document, extract_text
    from agents.document_agent import DocumentAgent

    record = get_document(document_id, user_id=current_user.id)
    if not record:
        raise HTTPException(status_code=404, detail="Document not found")

    try:
        text = extract_text(record["file_path"], record["filename"])
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    if len(text.strip()) < 20:
        raise HTTPException(
            status_code=400,
            detail="Could not extract enough text from this file. Try a text-based PDF or DOCX.",
        )

    agent = DocumentAgent()
    summary = await agent.summarize(text, max_length=400)
    response = await agent.process(
        message=(
            "List 5 key takeaways and 3 suggested follow-up questions the user should ask "
            "to learn more from this document."
        ),
        context=[{"content": text[:12000], "metadata": {"source": record["filename"]}}],
    )

    return {
        "document_id": document_id,
        "filename": record["filename"],
        "summary": summary,
        "insights": response["content"],
        "word_count": len(text.split()),
    }


@app.delete("/api/documents/{document_id}")
async def delete_document(
    document_id: str,
    current_user: User = Depends(get_current_active_user),
):
    from utils.document_store import delete_document as store_delete

    try:
        deleted = store_delete(document_id, user_id=current_user.id)
        if not deleted:
            raise HTTPException(status_code=404, detail="Document not found")
        try:
            pipeline = get_rag_pipeline()
            await pipeline.delete_document(document_id)
        except Exception:
            pass
        return {"status": "success", "message": "Document deleted"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting document: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Code Analysis
@app.post("/api/code/analyze")
async def analyze_code(request: CodeAnalysisRequest):
    try:
        code_agent = CodeAgent()
        
        if request.code:
            analysis = await code_agent.analyze_code(request.code)
        elif request.file_path:
            analysis = await code_agent.analyze_file(request.file_path)
        else:
            raise HTTPException(status_code=400, detail="Either code or file_path must be provided")
        
        return analysis
        
    except Exception as e:
        logger.error(f"Error analyzing code: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# WebSocket for real-time chat
@app.websocket("/ws/chat")
async def websocket_chat(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            
            # Process message
            agent_type, _ = agent_router.route(data)
            agent = agent_router.get_agent(agent_type)
            
            response = await agent.process(message=data, context=[])
            
            await manager.send_message(response["content"], websocket)
            
    except WebSocketDisconnect:
        manager.disconnect(websocket)

# Analytics Endpoint
@app.get("/api/analytics")
async def get_analytics():
    try:
        # This would fetch real analytics from your database
        return {
            "total_conversations": 324,
            "documents_processed": 152,
            "code_analyses": 48,
            "time_saved_hours": 42.5,
            "agent_usage": {
                "code_agent": 35,
                "document_agent": 28,
                "task_agent": 20,
                "research_agent": 17
            }
        }
    except Exception as e:
        logger.error(f"Error fetching analytics: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import sys
    import uvicorn

    port = int(os.getenv("PORT", 8000))
    use_reload = os.getenv("UVICORN_RELOAD", "").lower() == "true"
    if sys.platform == "win32" and os.getenv("UVICORN_RELOAD") is None:
        use_reload = False

    from utils.env_loader import get_groq_api_key
    logger.info(
        "Starting server on port %s (reload=%s, groq=%s)",
        port,
        use_reload,
        "configured" if get_groq_api_key() else "MISSING",
    )

    try:
        uvicorn.run(
            "app:app",
            host="0.0.0.0",
            port=port,
            reload=use_reload,
            reload_excludes=["*.db", "*.db-*"],
            log_level="info",
        )
    except OSError as e:
        if getattr(e, "winerror", None) == 10048 or e.errno in (98, 10048):
            logger.error(
                "Port %s is already in use. Another backend is still running. "
                "Use it at http://localhost:%s/health or run: npm run backend:stop",
                port,
                port,
            )
        raise
