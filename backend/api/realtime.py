from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, HTTPException
from typing import List, Dict, Set
from datetime import datetime
from .auth import get_current_active_user
from pydantic import BaseModel
import json
import asyncio

router = APIRouter(prefix="/api/realtime", tags=["realtime"])

# Active WebSocket connections
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, Set[WebSocket]] = {}
        self.user_presence: Dict[str, Dict] = {}
        
    async def connect(self, websocket: WebSocket, user_id: str, session_id: str):
        await websocket.accept()
        if session_id not in self.active_connections:
            self.active_connections[session_id] = set()
        self.active_connections[session_id].add(websocket)
        
        # Update user presence
        self.user_presence[user_id] = {
            "status": "online",
            "last_seen": datetime.now().isoformat(),
            "session_id": session_id
        }
        
        # Broadcast user joined
        await self.broadcast_to_session(session_id, {
            "type": "user_joined",
            "user_id": user_id,
            "timestamp": datetime.now().isoformat()
        })
    
    def disconnect(self, websocket: WebSocket, user_id: str, session_id: str):
        if session_id in self.active_connections:
            self.active_connections[session_id].discard(websocket)
            if not self.active_connections[session_id]:
                del self.active_connections[session_id]
        
        # Update user presence
        if user_id in self.user_presence:
            self.user_presence[user_id]["status"] = "offline"
            self.user_presence[user_id]["last_seen"] = datetime.now().isoformat()
    
    async def broadcast_to_session(self, session_id: str, message: dict):
        if session_id in self.active_connections:
            disconnected = set()
            for connection in self.active_connections[session_id]:
                try:
                    await connection.send_json(message)
                except:
                    disconnected.add(connection)
            
            # Clean up disconnected clients
            for conn in disconnected:
                self.active_connections[session_id].discard(conn)
    
    async def send_to_user(self, user_id: str, message: dict):
        if user_id in self.user_presence:
            session_id = self.user_presence[user_id]["session_id"]
            await self.broadcast_to_session(session_id, message)

manager = ConnectionManager()

class CollaborationSession(BaseModel):
    session_id: str
    document_id: str
    participants: List[str]
    created_at: str

@router.websocket("/ws/{session_id}")
async def websocket_endpoint(websocket: WebSocket, session_id: str):
    # Extract user from token (in production, validate properly)
    user_id = "user_" + str(id(websocket))[:8]
    
    await manager.connect(websocket, user_id, session_id)
    try:
        while True:
            data = await websocket.receive_json()
            message_type = data.get("type")
            
            if message_type == "cursor_move":
                # Broadcast cursor position
                await manager.broadcast_to_session(session_id, {
                    "type": "cursor_update",
                    "user_id": user_id,
                    "position": data.get("position"),
                    "timestamp": datetime.now().isoformat()
                })
            
            elif message_type == "text_edit":
                # Broadcast text changes
                await manager.broadcast_to_session(session_id, {
                    "type": "content_update",
                    "user_id": user_id,
                    "operation": data.get("operation"),
                    "content": data.get("content"),
                    "timestamp": datetime.now().isoformat()
                })
            
            elif message_type == "selection":
                # Broadcast selection
                await manager.broadcast_to_session(session_id, {
                    "type": "selection_update",
                    "user_id": user_id,
                    "selection": data.get("selection"),
                    "timestamp": datetime.now().isoformat()
                })
            
            elif message_type == "typing":
                # Broadcast typing indicator
                await manager.broadcast_to_session(session_id, {
                    "type": "user_typing",
                    "user_id": user_id,
                    "is_typing": data.get("is_typing"),
                    "timestamp": datetime.now().isoformat()
                })
            
            elif message_type == "comment":
                # Broadcast comment
                await manager.broadcast_to_session(session_id, {
                    "type": "new_comment",
                    "user_id": user_id,
                    "comment": data.get("comment"),
                    "position": data.get("position"),
                    "timestamp": datetime.now().isoformat()
                })
            
    except WebSocketDisconnect:
        manager.disconnect(websocket, user_id, session_id)
        await manager.broadcast_to_session(session_id, {
            "type": "user_left",
            "user_id": user_id,
            "timestamp": datetime.now().isoformat()
        })

@router.post("/sessions/create")
async def create_session(
    document_id: str,
    current_user: dict = Depends(get_current_active_user)
):
    """Create a new real-time collaboration session"""
    import uuid
    session_id = str(uuid.uuid4())
    
    return {
        "session_id": session_id,
        "document_id": document_id,
        "host": current_user["sub"],
        "created_at": datetime.now().isoformat(),
        "ws_url": f"ws://localhost:8000/api/realtime/ws/{session_id}"
    }

@router.get("/sessions/{session_id}/participants")
async def get_session_participants(
    session_id: str,
    current_user: dict = Depends(get_current_active_user)
):
    """Get active participants in a session"""
    participants = []
    
    for user_id, presence in manager.user_presence.items():
        if presence.get("session_id") == session_id and presence.get("status") == "online":
            participants.append({
                "user_id": user_id,
                "status": "online",
                "joined_at": presence.get("last_seen")
            })
    
    return {"participants": participants, "count": len(participants)}

@router.get("/presence")
async def get_user_presence(current_user: dict = Depends(get_current_active_user)):
    """Get presence status of all users"""
    return {
        "users": [
            {
                "user_id": user_id,
                "status": presence["status"],
                "last_seen": presence["last_seen"]
            }
            for user_id, presence in manager.user_presence.items()
        ]
    }

@router.post("/broadcast/{session_id}")
async def broadcast_message(
    session_id: str,
    message: dict,
    current_user: dict = Depends(get_current_active_user)
):
    """Broadcast a message to all participants in a session"""
    await manager.broadcast_to_session(session_id, {
        **message,
        "sender": current_user["sub"],
        "timestamp": datetime.now().isoformat()
    })
    return {"status": "broadcasted"}
