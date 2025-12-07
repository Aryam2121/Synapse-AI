from fastapi import FastAPI, HTTPException, UploadFile, File, WebSocket, WebSocketDisconnect, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import os
from dotenv import load_dotenv
import asyncio
from datetime import datetime

# Import our modules
from agents.router import AgentRouter
from agents.code_agent import CodeAgent
from agents.document_agent import DocumentAgent
from agents.task_agent import TaskAgent
from agents.research_agent import ResearchAgent
from rag.pipeline import RAGPipeline
from db.database import get_db, init_db, User
from utils.logger import logger
from auth.routes import router as auth_router
from auth.dependencies import get_current_active_user
from api.tasks import router as tasks_router
from api.analytics import router as analytics_router
from api.settings import router as settings_router
from api.notifications import router as notifications_router
from api.insights import router as insights_router
from api.collab import router as collab_router
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

load_dotenv()

app = FastAPI(
    title="Synapse AI Workspace API",
    description="Backend API for Synapse AI Workspace with multi-agent system and RAG",
    version="1.0.0"
)

# Startup event to initialize database
@app.on_event("startup")
async def startup_event():
    logger.info("Initializing database...")
    await init_db()
    logger.info("Database initialized successfully")

# Include authentication routes
app.include_router(auth_router)
app.include_router(tasks_router)
app.include_router(analytics_router)
app.include_router(settings_router)
app.include_router(notifications_router)
app.include_router(insights_router)
app.include_router(collab_router)
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

# CORS Configuration
# Allow localhost for development and production domains
allowed_origins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "https://synapse-ai-theta.vercel.app",  # Production Vercel URL
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

# Initialize components
rag_pipeline = RAGPipeline()
agent_router = AgentRouter()

# Models
class ChatMessage(BaseModel):
    message: str
    conversation_id: Optional[str] = None
    agent_type: Optional[str] = None

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

# Startup Event
@app.on_event("startup")
async def startup_event():
    logger.info("Starting Universal AI Workspace API...")
    await init_db()
    logger.info("Database initialized")
    logger.info("RAG Pipeline ready")
    logger.info("Multi-Agent System ready")

# Health Check
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "1.0.0"
    }

# Chat Endpoint
@app.post("/api/chat", response_model=ChatResponse)
async def chat(
    request: ChatMessage,
    current_user: User = Depends(get_current_active_user)
):
    try:
        logger.info(f"User {current_user.email} - Received chat message: {request.message[:50]}...")
        
        # Route to appropriate agent
        agent_type, confidence = agent_router.route(request.message)
        logger.info(f"Routed to {agent_type} agent (confidence: {confidence})")
        
        # Get agent
        agent = agent_router.get_agent(agent_type)
        
        # Process with RAG (handle empty results gracefully)
        relevant_docs = []
        try:
            relevant_docs = await rag_pipeline.search(request.message, k=3)
        except Exception as rag_error:
            logger.warning(f"RAG search failed: {str(rag_error)}, continuing without context")
        
        # Generate response
        response = await agent.process(
            message=request.message,
            context=relevant_docs if relevant_docs else [],
            conversation_id=request.conversation_id
        )
        
        return ChatResponse(
            response=response["content"],
            agent_used=agent_type,
            conversation_id=response["conversation_id"],
            sources=response.get("sources", [])
        )
        
    except Exception as e:
        logger.error(f"Error in chat endpoint: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))

# Stream Chat Endpoint (for real-time streaming)
@app.post("/api/chat/stream")
async def chat_stream(request: ChatMessage):
    async def generate():
        try:
            agent_type, _ = agent_router.route(request.message)
            agent = agent_router.get_agent(agent_type)
            
            async for chunk in agent.stream_process(request.message):
                yield f"data: {chunk}\n\n"
                
        except Exception as e:
            yield f"data: {{\"error\": \"{str(e)}\"}}\n\n"
    
    return StreamingResponse(generate(), media_type="text/event-stream")

# Document Upload
@app.post("/api/documents/upload")
async def upload_document(file: UploadFile = File(...)):
    try:
        logger.info(f"Uploading document: {file.filename}")
        
        # Save file
        upload_dir = "uploads"
        os.makedirs(upload_dir, exist_ok=True)
        file_path = os.path.join(upload_dir, file.filename)
        
        with open(file_path, "wb") as f:
            content = await file.read()
            f.write(content)
        
        # Process with RAG
        doc_id = await rag_pipeline.add_document(file_path, file.filename)
        
        return {
            "status": "success",
            "document_id": doc_id,
            "filename": file.filename,
            "size": len(content)
        }
        
    except Exception as e:
        logger.error(f"Error uploading document: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# List Documents
@app.get("/api/documents")
async def list_documents():
    try:
        documents = await rag_pipeline.list_documents()
        return {"documents": documents}
    except Exception as e:
        logger.error(f"Error listing documents: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Delete Document
@app.delete("/api/documents/{document_id}")
async def delete_document(document_id: str):
    try:
        await rag_pipeline.delete_document(document_id)
        return {"status": "success", "message": "Document deleted"}
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
    import uvicorn
    # Use PORT from environment (for Render/cloud) or default to 8000
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=port,
        reload=True,
        reload_excludes=["*.db", "*.db-*"],
        log_level="info"
    )
