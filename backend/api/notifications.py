from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from typing import Dict, List
import json
import asyncio
from datetime import datetime
from auth.dependencies import get_current_active_user
from db.database import User

router = APIRouter(prefix="/api/notifications", tags=["notifications"])

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[int, WebSocket] = {}

    async def connect(self, websocket: WebSocket, user_id: int):
        await websocket.accept()
        self.active_connections[user_id] = websocket

    def disconnect(self, user_id: int):
        if user_id in self.active_connections:
            del self.active_connections[user_id]

    async def send_personal_message(self, message: dict, user_id: int):
        if user_id in self.active_connections:
            try:
                await self.active_connections[user_id].send_json(message)
            except Exception as e:
                print(f"Error sending message to user {user_id}: {e}")
                self.disconnect(user_id)

    async def broadcast(self, message: dict):
        disconnected = []
        for user_id, connection in self.active_connections.items():
            try:
                await connection.send_json(message)
            except Exception:
                disconnected.append(user_id)
        
        for user_id in disconnected:
            self.disconnect(user_id)

manager = ConnectionManager()

@router.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: int):
    await manager.connect(websocket, user_id)
    try:
        while True:
            data = await websocket.receive_text()
            # Echo back for heartbeat
            await websocket.send_json({"type": "pong", "timestamp": datetime.now().isoformat()})
    except WebSocketDisconnect:
        manager.disconnect(user_id)

@router.get("/history")
async def get_notification_history(
    limit: int = 50,
    current_user: User = Depends(get_current_active_user)
):
    """Get user's notification history"""
    # In production, fetch from database
    return {
        "notifications": [
            {
                "id": "1",
                "type": "task_completed",
                "title": "Task Completed",
                "message": "Your task 'Deploy Backend' has been marked as complete",
                "timestamp": "2024-12-04T10:30:00Z",
                "read": False,
                "priority": "medium"
            },
            {
                "id": "2",
                "type": "document_processed",
                "title": "Document Ready",
                "message": "Your document 'requirements.pdf' has been processed",
                "timestamp": "2024-12-04T09:15:00Z",
                "read": False,
                "priority": "low"
            },
            {
                "id": "3",
                "type": "code_analysis",
                "title": "Code Analysis Complete",
                "message": "Found 3 potential issues in your codebase",
                "timestamp": "2024-12-04T08:45:00Z",
                "read": True,
                "priority": "high"
            }
        ],
        "unread_count": 2
    }

@router.patch("/{notification_id}/read")
async def mark_notification_read(
    notification_id: str,
    current_user: User = Depends(get_current_active_user)
):
    """Mark a notification as read"""
    # In production, update database
    return {"message": "Notification marked as read", "id": notification_id}

@router.post("/mark-all-read")
async def mark_all_notifications_read(
    current_user: User = Depends(get_current_active_user)
):
    """Mark all notifications as read"""
    # In production, update database
    return {"message": "All notifications marked as read"}

@router.delete("/{notification_id}")
async def delete_notification(
    notification_id: str,
    current_user: User = Depends(get_current_active_user)
):
    """Delete a notification"""
    # In production, delete from database
    return {"message": "Notification deleted", "id": notification_id}

# Helper function to send notifications (used by other endpoints)
async def send_notification(user_id: int, notification: dict):
    """Send real-time notification to user"""
    await manager.send_personal_message(notification, user_id)
