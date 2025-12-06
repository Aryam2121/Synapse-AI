from fastapi import APIRouter, Depends, HTTPException, Response
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from auth.dependencies import get_current_active_user
from db.database import User
import json
import io

router = APIRouter(prefix="/api/export", tags=["export"])

class ExportRequest(BaseModel):
    format: str  # json, csv, pdf, markdown
    data_types: List[str]  # conversations, documents, tasks, code_analyses
    date_from: Optional[str] = None
    date_to: Optional[str] = None
    include_metadata: bool = True

@router.post("/full-export")
async def create_full_export(
    export_request: ExportRequest,
    current_user: User = Depends(get_current_active_user)
):
    """Create a comprehensive export of user data"""
    
    export_data = {
        "export_metadata": {
            "user_id": current_user.id,
            "user_name": current_user.name,
            "export_date": datetime.now().isoformat(),
            "format": export_request.format,
            "data_types": export_request.data_types,
            "version": "1.0"
        },
        "data": {}
    }
    
    if "conversations" in export_request.data_types:
        export_data["data"]["conversations"] = [
            {
                "id": "conv-1",
                "title": "Authentication Implementation",
                "messages": 45,
                "agent_used": "code_agent",
                "created_at": "2024-12-01T10:00:00Z",
                "summary": "Discussed JWT authentication implementation with refresh tokens"
            },
            {
                "id": "conv-2",
                "title": "Database Optimization",
                "messages": 32,
                "agent_used": "research_agent",
                "created_at": "2024-12-02T14:30:00Z",
                "summary": "Analyzed database query performance and optimization strategies"
            }
        ]
    
    if "documents" in export_request.data_types:
        export_data["data"]["documents"] = [
            {
                "id": "doc-1",
                "name": "requirements.pdf",
                "size_mb": 2.3,
                "uploaded_at": "2024-12-01T09:00:00Z",
                "processed": True,
                "summary": "Project requirements and specifications"
            }
        ]
    
    if "tasks" in export_request.data_types:
        export_data["data"]["tasks"] = [
            {
                "id": "task-1",
                "title": "Implement OAuth2",
                "description": "Add OAuth2 authentication for Google and GitHub",
                "status": "completed",
                "priority": "high",
                "completed_at": "2024-12-03T16:00:00Z"
            }
        ]
    
    if "code_analyses" in export_request.data_types:
        export_data["data"]["code_analyses"] = [
            {
                "id": "code-1",
                "project": "backend-api",
                "files_analyzed": 45,
                "issues_found": 12,
                "quality_score": 8.4,
                "analyzed_at": "2024-12-03T11:00:00Z"
            }
        ]
    
    # Generate download URL
    export_id = f"export-{datetime.now().timestamp()}"
    download_url = f"http://localhost:8000/api/export/download/{export_id}"
    
    return {
        "export_id": export_id,
        "status": "ready",
        "download_url": download_url,
        "file_size_mb": 1.5,
        "expires_at": (datetime.now() + timedelta(days=7)).isoformat()
    }

@router.get("/download/{export_id}")
async def download_export(
    export_id: str,
    current_user: User = Depends(get_current_active_user)
):
    """Download the exported data"""
    
    # In production, retrieve actual data from storage
    export_data = {
        "export_metadata": {
            "user_id": current_user.id,
            "export_id": export_id,
            "export_date": datetime.now().isoformat()
        },
        "data": {
            "conversations": [],
            "documents": [],
            "tasks": []
        }
    }
    
    json_str = json.dumps(export_data, indent=2)
    
    return Response(
        content=json_str,
        media_type="application/json",
        headers={
            "Content-Disposition": f"attachment; filename=synapse-ai-export-{export_id}.json"
        }
    )

@router.get("/templates")
async def get_export_templates(current_user: User = Depends(get_current_active_user)):
    """Get pre-configured export templates"""
    
    templates = [
        {
            "id": "weekly-report",
            "name": "Weekly Activity Report",
            "description": "Export last week's activities in markdown format",
            "format": "markdown",
            "data_types": ["conversations", "tasks", "code_analyses"],
            "popular": True
        },
        {
            "id": "backup-all",
            "name": "Complete Backup",
            "description": "Full backup of all data in JSON format",
            "format": "json",
            "data_types": ["conversations", "documents", "tasks", "code_analyses"],
            "popular": True
        },
        {
            "id": "project-summary",
            "name": "Project Summary",
            "description": "Generate project summary document in PDF",
            "format": "pdf",
            "data_types": ["conversations", "tasks"],
            "popular": False
        }
    ]
    
    return {"templates": templates}

@router.post("/schedule")
async def schedule_automatic_export(
    frequency: str,  # daily, weekly, monthly
    export_request: ExportRequest,
    current_user: User = Depends(get_current_active_user)
):
    """Schedule automatic exports"""
    
    schedule = {
        "schedule_id": f"schedule-{datetime.now().timestamp()}",
        "frequency": frequency,
        "export_config": export_request.dict(),
        "next_export": (datetime.now() + timedelta(days=7)).isoformat(),
        "status": "active"
    }
    
    return {
        "message": "Export schedule created successfully",
        "schedule": schedule
    }

@router.get("/history")
async def get_export_history(
    limit: int = 20,
    current_user: User = Depends(get_current_active_user)
):
    """Get export history"""
    
    history = [
        {
            "export_id": "export-1",
            "format": "json",
            "data_types": ["conversations", "tasks"],
            "created_at": "2024-12-03T10:00:00Z",
            "file_size_mb": 1.5,
            "status": "completed",
            "download_url": "http://localhost:8000/api/export/download/export-1"
        },
        {
            "export_id": "export-2",
            "format": "markdown",
            "data_types": ["conversations"],
            "created_at": "2024-12-02T15:30:00Z",
            "file_size_mb": 0.8,
            "status": "completed",
            "download_url": "http://localhost:8000/api/export/download/export-2"
        }
    ]
    
    return {"exports": history, "count": len(history)}
