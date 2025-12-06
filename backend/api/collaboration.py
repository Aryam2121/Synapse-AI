from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from auth.dependencies import get_current_active_user
from db.database import User
import json

router = APIRouter(prefix="/api/collaboration", tags=["collaboration"])

class TeamMember(BaseModel):
    id: str
    name: str
    email: str
    role: str
    avatar_url: Optional[str] = None
    status: str  # online, offline, busy

class SharedWorkspace(BaseModel):
    id: str
    name: str
    description: str
    members: List[str]
    created_at: str
    permissions: Dict[str, List[str]]

class Comment(BaseModel):
    id: str
    author_id: str
    author_name: str
    content: str
    timestamp: str
    replies: List[Dict[str, Any]] = []

@router.get("/workspaces")
async def get_shared_workspaces(current_user: User = Depends(get_current_active_user)):
    """Get all shared workspaces user has access to"""
    
    workspaces = [
        {
            "id": "ws-1",
            "name": "Frontend Development",
            "description": "React and Next.js development workspace",
            "members": ["user-1", "user-2", "user-3"],
            "created_at": "2024-11-15T10:00:00Z",
            "permissions": {
                "read": ["user-1", "user-2", "user-3"],
                "write": ["user-1", "user-2"],
                "admin": ["user-1"]
            },
            "activity_count": 45,
            "last_activity": "2 hours ago"
        },
        {
            "id": "ws-2",
            "name": "Backend API Design",
            "description": "FastAPI backend development and documentation",
            "members": ["user-1", "user-4"],
            "created_at": "2024-11-20T14:30:00Z",
            "permissions": {
                "read": ["user-1", "user-4"],
                "write": ["user-1", "user-4"],
                "admin": ["user-1"]
            },
            "activity_count": 28,
            "last_activity": "5 hours ago"
        }
    ]
    
    return {"workspaces": workspaces, "count": len(workspaces)}

@router.post("/workspaces")
async def create_shared_workspace(
    name: str,
    description: str,
    members: List[str],
    current_user: User = Depends(get_current_active_user)
):
    """Create a new shared workspace"""
    
    workspace = {
        "id": f"ws-{datetime.now().timestamp()}",
        "name": name,
        "description": description,
        "members": [current_user.id] + members,
        "created_at": datetime.now().isoformat(),
        "permissions": {
            "read": [current_user.id] + members,
            "write": [current_user.id],
            "admin": [current_user.id]
        }
    }
    
    return {"workspace": workspace, "message": "Workspace created successfully"}

@router.get("/workspaces/{workspace_id}/activity")
async def get_workspace_activity(
    workspace_id: str,
    current_user: User = Depends(get_current_active_user)
):
    """Get activity feed for a workspace"""
    
    activities = [
        {
            "id": "act-1",
            "type": "comment",
            "user": "Alice Chen",
            "action": "commented on",
            "target": "API Design Document",
            "timestamp": "2 hours ago",
            "preview": "I think we should add rate limiting to the auth endpoints..."
        },
        {
            "id": "act-2",
            "type": "document",
            "user": "Bob Smith",
            "action": "uploaded",
            "target": "requirements_v2.pdf",
            "timestamp": "5 hours ago",
            "preview": "Updated project requirements"
        },
        {
            "id": "act-3",
            "type": "task",
            "user": "Carol Davis",
            "action": "completed task",
            "target": "Implement OAuth",
            "timestamp": "1 day ago",
            "preview": "OAuth2 implementation finished"
        }
    ]
    
    return {"activities": activities, "count": len(activities)}

@router.post("/items/{item_id}/comments")
async def add_comment(
    item_id: str,
    content: str,
    current_user: User = Depends(get_current_active_user)
):
    """Add a comment to any item (document, task, conversation)"""
    
    comment = {
        "id": f"comment-{datetime.now().timestamp()}",
        "author_id": current_user.id,
        "author_name": current_user.name,
        "content": content,
        "timestamp": datetime.now().isoformat(),
        "replies": []
    }
    
    return {"comment": comment, "message": "Comment added successfully"}

@router.get("/items/{item_id}/comments")
async def get_comments(
    item_id: str,
    current_user: User = Depends(get_current_active_user)
):
    """Get all comments for an item"""
    
    comments = [
        {
            "id": "comment-1",
            "author_id": "user-2",
            "author_name": "Alice Chen",
            "content": "This looks great! One suggestion - we should add error handling.",
            "timestamp": "2024-12-03T14:30:00Z",
            "replies": [
                {
                    "id": "reply-1",
                    "author_name": "Bob Smith",
                    "content": "Good catch! I'll add try-catch blocks.",
                    "timestamp": "2024-12-03T15:00:00Z"
                }
            ]
        }
    ]
    
    return {"comments": comments, "count": len(comments)}

@router.post("/share")
async def share_item(
    item_type: str,  # conversation, document, task
    item_id: str,
    recipients: List[str],
    permissions: str = "read",  # read, write
    current_user: User = Depends(get_current_active_user)
):
    """Share an item with other users"""
    
    share_link = f"https://synapse-ai.app/shared/{item_type}/{item_id}"
    
    return {
        "share_link": share_link,
        "share_id": f"share-{datetime.now().timestamp()}",
        "recipients": recipients,
        "permissions": permissions,
        "expires_at": "7 days",
        "message": "Item shared successfully"
    }

@router.get("/team-members")
async def get_team_members(current_user: User = Depends(get_current_active_user)):
    """Get list of team members and their current status"""
    
    members = [
        {
            "id": "user-2",
            "name": "Alice Chen",
            "email": "alice@example.com",
            "role": "Frontend Developer",
            "avatar_url": None,
            "status": "online",
            "last_seen": "now",
            "current_activity": "Reviewing code in workspace #1"
        },
        {
            "id": "user-3",
            "name": "Bob Smith",
            "email": "bob@example.com",
            "role": "Backend Developer",
            "avatar_url": None,
            "status": "busy",
            "last_seen": "5 minutes ago",
            "current_activity": "In a meeting"
        },
        {
            "id": "user-4",
            "name": "Carol Davis",
            "email": "carol@example.com",
            "role": "DevOps Engineer",
            "avatar_url": None,
            "status": "offline",
            "last_seen": "2 hours ago",
            "current_activity": None
        }
    ]
    
    return {"members": members, "online_count": 1, "total_count": len(members)}

@router.post("/live-collaboration/join")
async def join_live_session(
    session_id: str,
    current_user: User = Depends(get_current_active_user)
):
    """Join a live collaboration session"""
    
    session = {
        "session_id": session_id,
        "participants": ["user-1", "user-2", current_user.id],
        "started_at": "2024-12-04T10:00:00Z",
        "type": "code_review",
        "websocket_url": f"wss://synapse-ai.app/collab/{session_id}"
    }
    
    return session

@router.get("/mentions")
async def get_mentions(current_user: User = Depends(get_current_active_user)):
    """Get all mentions of current user"""
    
    mentions = [
        {
            "id": "mention-1",
            "author": "Alice Chen",
            "content": "@you Can you review this API design?",
            "location": "workspace-1/document-5",
            "timestamp": "2 hours ago",
            "read": False
        },
        {
            "id": "mention-2",
            "author": "Bob Smith",
            "content": "@you Great work on the authentication system!",
            "location": "workspace-2/comment-12",
            "timestamp": "1 day ago",
            "read": True
        }
    ]
    
    return {"mentions": mentions, "unread_count": 1}
