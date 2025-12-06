from fastapi import APIRouter, Depends
from datetime import datetime, timedelta
from typing import Dict, List
from auth.dependencies import get_current_active_user
from db.database import User

router = APIRouter(prefix="/api/analytics", tags=["analytics"])

@router.get("/overview")
async def get_analytics_overview(current_user: User = Depends(get_current_active_user)):
    """Get analytics overview with key metrics"""
    # In production, these would be calculated from database queries
    # For now, returning realistic demo data
    
    return {
        "metrics": {
            "total_conversations": 324,
            "conversations_growth": 12,  # percentage
            "documents_processed": 152,
            "documents_growth": 8,
            "tasks_completed": 89,
            "tasks_growth": -3,
            "code_analyses": 45,
            "code_growth": 15
        },
        "activity_data": [
            {"name": "Mon", "chats": 12, "documents": 4, "tasks": 8},
            {"name": "Tue", "chats": 18, "documents": 6, "tasks": 12},
            {"name": "Wed", "chats": 22, "documents": 8, "tasks": 10},
            {"name": "Thu", "chats": 15, "documents": 5, "tasks": 14},
            {"name": "Fri", "chats": 25, "documents": 10, "tasks": 16},
            {"name": "Sat", "chats": 8, "documents": 3, "tasks": 5},
            {"name": "Sun", "chats": 6, "documents": 2, "tasks": 4}
        ],
        "agent_usage": [
            {"name": "Code Agent", "value": 35, "color": "#3b82f6"},
            {"name": "Document Agent", "value": 28, "color": "#8b5cf6"},
            {"name": "Task Agent", "value": 20, "color": "#10b981"},
            {"name": "Research Agent", "value": 17, "color": "#f59e0b"}
        ],
        "productivity": [
            {"week": "Week 1", "tasksCompleted": 24, "documentsProcessed": 18},
            {"week": "Week 2", "tasksCompleted": 32, "documentsProcessed": 25},
            {"week": "Week 3", "tasksCompleted": 28, "documentsProcessed": 22},
            {"week": "Week 4", "tasksCompleted": 38, "documentsProcessed": 30}
        ]
    }

@router.get("/time-saved")
async def get_time_saved(current_user: User = Depends(get_current_active_user)):
    """Calculate estimated time saved using AI"""
    
    # Average time saved per activity (in minutes)
    time_multipliers = {
        "chat": 15,  # 15 min per conversation
        "document": 30,  # 30 min per document processed
        "task": 10,  # 10 min per task
        "code": 45  # 45 min per code analysis
    }
    
    # Get metrics (would be from DB in production)
    total_chats = 324
    total_docs = 152
    total_tasks = 89
    total_code = 45
    
    total_minutes = (
        total_chats * time_multipliers["chat"] +
        total_docs * time_multipliers["document"] +
        total_tasks * time_multipliers["task"] +
        total_code * time_multipliers["code"]
    )
    
    hours = total_minutes / 60
    days = hours / 8  # 8 hour work day
    
    return {
        "total_minutes": total_minutes,
        "total_hours": round(hours, 1),
        "total_days": round(days, 1),
        "breakdown": {
            "conversations": total_chats * time_multipliers["chat"],
            "documents": total_docs * time_multipliers["document"],
            "tasks": total_tasks * time_multipliers["task"],
            "code_analysis": total_code * time_multipliers["code"]
        }
    }

@router.get("/trends")
async def get_trends(
    period: str = "week",
    current_user: User = Depends(get_current_active_user)
):
    """Get trend data for specified period (week/month/year)"""
    
    if period == "week":
        return {
            "period": "week",
            "data": [
                {"date": "2024-12-01", "value": 45},
                {"date": "2024-12-02", "value": 52},
                {"date": "2024-12-03", "value": 48},
                {"date": "2024-12-04", "value": 61},
                {"date": "2024-12-05", "value": 58},
                {"date": "2024-12-06", "value": 42},
                {"date": "2024-12-07", "value": 38}
            ]
        }
    elif period == "month":
        return {
            "period": "month",
            "data": [
                {"date": "Week 1", "value": 180},
                {"date": "Week 2", "value": 210},
                {"date": "Week 3", "value": 195},
                {"date": "Week 4", "value": 245}
            ]
        }
    else:  # year
        return {
            "period": "year",
            "data": [
                {"date": "Jan", "value": 520},
                {"date": "Feb", "value": 580},
                {"date": "Mar", "value": 640},
                {"date": "Apr", "value": 610},
                {"date": "May", "value": 720},
                {"date": "Jun", "value": 680},
                {"date": "Jul", "value": 750},
                {"date": "Aug", "value": 820},
                {"date": "Sep", "value": 780},
                {"date": "Oct", "value": 890},
                {"date": "Nov", "value": 920},
                {"date": "Dec", "value": 850}
            ]
        }
