from fastapi import APIRouter, Depends, BackgroundTasks
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import json
from auth.dependencies import get_current_active_user
from db.database import User

router = APIRouter(prefix="/api/collaboration", tags=["collaboration"])

class ShareRequest(BaseModel):
    item_type: str  # 'chat', 'document', 'task', 'workspace'
    item_id: str
    recipient_emails: List[str]
    permission: str  # 'view', 'edit', 'admin'
    message: Optional[str] = None

class TeamMember(BaseModel):
    email: str
    role: str
    permissions: List[str]

@router.post("/share")
async def share_item(
    request: ShareRequest,
    current_user: User = Depends(get_current_active_user)
):
    """Share workspace items with team members"""
    
    # In production, create share links and send invitations
    share_link = f"https://synapse-ai.app/shared/{request.item_type}/{request.item_id}"
    
    return {
        "message": f"Shared with {len(request.recipient_emails)} recipients",
        "share_link": share_link,
        "expires_at": "2025-12-11T00:00:00Z",
        "recipients": request.recipient_emails,
        "permission": request.permission
    }

@router.get("/shared-with-me")
async def get_shared_items(current_user: User = Depends(get_current_active_user)):
    """Get items shared with current user"""
    
    return {
        "items": [
            {
                "id": "shared-1",
                "type": "document",
                "title": "Q4 Product Roadmap",
                "shared_by": "john@example.com",
                "shared_at": "2024-12-01T10:00:00Z",
                "permission": "edit",
                "status": "active"
            },
            {
                "id": "shared-2",
                "type": "chat",
                "title": "Customer Support Conversation",
                "shared_by": "sarah@example.com",
                "shared_at": "2024-12-03T14:30:00Z",
                "permission": "view",
                "status": "active"
            }
        ],
        "total": 2
    }

@router.post("/workspace/invite")
async def invite_team_member(
    member: TeamMember,
    current_user: User = Depends(get_current_active_user)
):
    """Invite team member to workspace"""
    
    invitation_link = f"https://synapse-ai.app/invite/{current_user.id}/{member.email}"
    
    return {
        "message": f"Invitation sent to {member.email}",
        "invitation_link": invitation_link,
        "role": member.role,
        "expires_in": "7 days"
    }

@router.get("/workspace/members")
async def get_workspace_members(current_user: User = Depends(get_current_active_user)):
    """Get all workspace members"""
    
    return {
        "members": [
            {
                "id": current_user.id,
                "name": current_user.name,
                "email": current_user.email,
                "role": "owner",
                "status": "active",
                "joined_at": current_user.created_at.isoformat()
            }
        ],
        "total": 1,
        "plan": "professional",
        "seats_available": 4
    }

@router.post("/comments/add")
async def add_comment(
    item_type: str,
    item_id: str,
    content: str,
    current_user: User = Depends(get_current_active_user)
):
    """Add comment to shared item"""
    
    return {
        "comment_id": f"comment-{datetime.now().timestamp()}",
        "user": current_user.name,
        "content": content,
        "timestamp": datetime.now().isoformat(),
        "likes": 0
    }

@router.get("/activity-feed")
async def get_activity_feed(
    limit: int = 20,
    current_user: User = Depends(get_current_active_user)
):
    """Get team activity feed"""
    
    return {
        "activities": [
            {
                "id": "act-1",
                "user": "John Doe",
                "action": "completed task",
                "item": "Deploy Backend API",
                "timestamp": "2024-12-04T10:30:00Z",
                "type": "task_completed"
            },
            {
                "id": "act-2",
                "user": "Sarah Smith",
                "action": "shared document",
                "item": "Project Requirements.pdf",
                "timestamp": "2024-12-04T09:15:00Z",
                "type": "document_shared"
            },
            {
                "id": "act-3",
                "user": current_user.name,
                "action": "uploaded document",
                "item": "Architecture Diagram.png",
                "timestamp": "2024-12-04T08:45:00Z",
                "type": "document_uploaded"
            }
        ],
        "total": 3
    }

@router.post("/real-time-session")
async def create_collaboration_session(
    session_name: str,
    participants: List[str],
    current_user: User = Depends(get_current_active_user)
):
    """Create real-time collaboration session"""
    
    return {
        "session_id": f"session-{datetime.now().timestamp()}",
        "session_name": session_name,
        "host": current_user.email,
        "participants": participants,
        "join_url": f"https://synapse-ai.app/collaborate/session-{datetime.now().timestamp()}",
        "created_at": datetime.now().isoformat(),
        "status": "active"
    }
