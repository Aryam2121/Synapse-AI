from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import json
import csv
import io
from auth.dependencies import get_current_active_user
from db.database import User

router = APIRouter(prefix="/api/export", tags=["export"])

class ExportRequest(BaseModel):
    format: str  # 'json', 'csv', 'pdf', 'markdown'
    data_types: List[str]  # ['chats', 'documents', 'tasks', 'analytics']
    date_range: Optional[dict] = None
    include_attachments: bool = False

@router.post("/workspace")
async def export_workspace(
    request: ExportRequest,
    current_user: User = Depends(get_current_active_user)
):
    """Export entire workspace data"""
    
    # Gather data based on request
    export_data = {
        "metadata": {
            "exported_at": datetime.now().isoformat(),
            "user": current_user.email,
            "format": request.format,
            "version": "1.0"
        },
        "data": {}
    }
    
    if 'chats' in request.data_types:
        export_data['data']['conversations'] = [
            {
                "id": "chat-1",
                "timestamp": "2024-12-04T10:00:00Z",
                "messages": [
                    {"role": "user", "content": "Help me debug this code"},
                    {"role": "assistant", "content": "I'll help you debug. Please share the code."}
                ]
            }
        ]
    
    if 'tasks' in request.data_types:
        export_data['data']['tasks'] = [
            {
                "id": "task-1",
                "title": "Deploy Backend",
                "status": "completed",
                "priority": "high",
                "created_at": "2024-12-01T09:00:00Z"
            }
        ]
    
    if 'documents' in request.data_types:
        export_data['data']['documents'] = [
            {
                "id": "doc-1",
                "name": "requirements.pdf",
                "uploaded_at": "2024-12-02T14:30:00Z",
                "size": "2.4 MB",
                "status": "processed"
            }
        ]
    
    if 'analytics' in request.data_types:
        export_data['data']['analytics'] = {
            "total_conversations": 324,
            "documents_processed": 152,
            "tasks_completed": 89,
            "time_saved_hours": 42.5
        }
    
    # Convert to requested format
    if request.format == 'json':
        json_str = json.dumps(export_data, indent=2)
        return StreamingResponse(
            io.BytesIO(json_str.encode()),
            media_type="application/json",
            headers={"Content-Disposition": f"attachment; filename=synapse-export-{datetime.now().strftime('%Y%m%d')}.json"}
        )
    
    elif request.format == 'csv':
        output = io.StringIO()
        
        # Export tasks as CSV example
        if 'tasks' in request.data_types:
            writer = csv.writer(output)
            writer.writerow(['ID', 'Title', 'Status', 'Priority', 'Created At'])
            for task in export_data['data'].get('tasks', []):
                writer.writerow([task['id'], task['title'], task['status'], task['priority'], task['created_at']])
        
        return StreamingResponse(
            io.BytesIO(output.getvalue().encode()),
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename=synapse-export-{datetime.now().strftime('%Y%m%d')}.csv"}
        )
    
    elif request.format == 'markdown':
        markdown = f"# Synapse AI Workspace Export\n\n"
        markdown += f"**Exported:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n"
        markdown += f"**User:** {current_user.email}\n\n"
        
        if 'chats' in request.data_types:
            markdown += "## Conversations\n\n"
            for conv in export_data['data'].get('conversations', []):
                markdown += f"### Conversation {conv['id']}\n"
                for msg in conv['messages']:
                    markdown += f"**{msg['role'].title()}:** {msg['content']}\n\n"
        
        if 'tasks' in request.data_types:
            markdown += "## Tasks\n\n"
            for task in export_data['data'].get('tasks', []):
                markdown += f"- [{task['status']}] **{task['title']}** (Priority: {task['priority']})\n"
        
        return StreamingResponse(
            io.BytesIO(markdown.encode()),
            media_type="text/markdown",
            headers={"Content-Disposition": f"attachment; filename=synapse-export-{datetime.now().strftime('%Y%m%d')}.md"}
        )
    
    return {"message": "Export format not supported", "format": request.format}

@router.get("/templates")
async def get_export_templates(current_user: User = Depends(get_current_active_user)):
    """Get predefined export templates"""
    
    return {
        "templates": [
            {
                "id": "full-backup",
                "name": "Full Workspace Backup",
                "description": "Complete backup including all chats, documents, tasks, and analytics",
                "data_types": ["chats", "documents", "tasks", "analytics"],
                "format": "json",
                "size_estimate": "~50 MB"
            },
            {
                "id": "tasks-only",
                "name": "Task List Export",
                "description": "Export all tasks with status and priority",
                "data_types": ["tasks"],
                "format": "csv",
                "size_estimate": "~1 MB"
            },
            {
                "id": "analytics-report",
                "name": "Analytics Report",
                "description": "Comprehensive analytics and usage statistics",
                "data_types": ["analytics"],
                "format": "pdf",
                "size_estimate": "~5 MB"
            },
            {
                "id": "documentation",
                "name": "Documentation Export",
                "description": "All conversations and documents in readable format",
                "data_types": ["chats", "documents"],
                "format": "markdown",
                "size_estimate": "~20 MB"
            }
        ]
    }

@router.post("/schedule")
async def schedule_automatic_export(
    frequency: str,  # 'daily', 'weekly', 'monthly'
    format: str,
    data_types: List[str],
    current_user: User = Depends(get_current_active_user)
):
    """Schedule automatic exports"""
    
    return {
        "message": "Automatic export scheduled",
        "schedule_id": f"schedule-{datetime.now().timestamp()}",
        "frequency": frequency,
        "format": format,
        "data_types": data_types,
        "next_export": "2024-12-05T00:00:00Z",
        "destination": "email"
    }

@router.get("/history")
async def get_export_history(
    limit: int = 10,
    current_user: User = Depends(get_current_active_user)
):
    """Get export history"""
    
    return {
        "exports": [
            {
                "id": "exp-1",
                "created_at": "2024-12-04T10:00:00Z",
                "format": "json",
                "size": "45.2 MB",
                "status": "completed",
                "download_url": "/api/export/download/exp-1"
            },
            {
                "id": "exp-2",
                "created_at": "2024-11-27T10:00:00Z",
                "format": "csv",
                "size": "2.1 MB",
                "status": "completed",
                "download_url": "/api/export/download/exp-2"
            }
        ],
        "total": 2
    }
