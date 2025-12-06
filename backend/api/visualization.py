from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from .auth import get_current_active_user
import random

router = APIRouter(prefix="/api/visualization", tags=["visualization"])

class ChartData(BaseModel):
    labels: List[str]
    datasets: List[Dict[str, Any]]

class DashboardWidget(BaseModel):
    id: str
    type: str
    title: str
    data: Any
    config: Dict[str, Any]

@router.get("/dashboard/overview")
async def get_dashboard_overview(current_user: dict = Depends(get_current_active_user)):
    """
    Get comprehensive dashboard data with multiple visualizations.
    """
    return {
        "widgets": [
            {
                "id": "tasks_timeline",
                "type": "line",
                "title": "Tasks Completion Trend",
                "data": {
                    "labels": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
                    "datasets": [
                        {
                            "label": "Completed",
                            "data": [12, 19, 15, 25, 22, 18, 14],
                            "borderColor": "rgb(75, 192, 192)",
                            "backgroundColor": "rgba(75, 192, 192, 0.2)"
                        },
                        {
                            "label": "Created",
                            "data": [15, 22, 18, 28, 25, 20, 16],
                            "borderColor": "rgb(255, 99, 132)",
                            "backgroundColor": "rgba(255, 99, 132, 0.2)"
                        }
                    ]
                },
                "config": {"responsive": True, "maintainAspectRatio": False}
            },
            {
                "id": "productivity_score",
                "type": "gauge",
                "title": "Weekly Productivity Score",
                "data": {
                    "value": 87,
                    "max": 100,
                    "color": "green",
                    "segments": [
                        {"threshold": 33, "color": "red"},
                        {"threshold": 66, "color": "yellow"},
                        {"threshold": 100, "color": "green"}
                    ]
                },
                "config": {}
            },
            {
                "id": "task_distribution",
                "type": "doughnut",
                "title": "Tasks by Category",
                "data": {
                    "labels": ["Development", "Design", "Marketing", "Research", "Admin"],
                    "datasets": [{
                        "data": [35, 25, 20, 12, 8],
                        "backgroundColor": [
                            "rgba(255, 99, 132, 0.8)",
                            "rgba(54, 162, 235, 0.8)",
                            "rgba(255, 206, 86, 0.8)",
                            "rgba(75, 192, 192, 0.8)",
                            "rgba(153, 102, 255, 0.8)"
                        ]
                    }]
                },
                "config": {"responsive": True}
            },
            {
                "id": "time_tracking",
                "type": "bar",
                "title": "Time Spent by Project",
                "data": {
                    "labels": ["Project A", "Project B", "Project C", "Project D"],
                    "datasets": [{
                        "label": "Hours",
                        "data": [24, 18, 32, 15],
                        "backgroundColor": "rgba(54, 162, 235, 0.6)"
                    }]
                },
                "config": {"indexAxis": "y"}
            },
            {
                "id": "ai_usage",
                "type": "area",
                "title": "AI Interactions",
                "data": {
                    "labels": ["Week 1", "Week 2", "Week 3", "Week 4"],
                    "datasets": [{
                        "label": "Queries",
                        "data": [145, 189, 212, 267],
                        "fill": True,
                        "borderColor": "rgb(153, 102, 255)",
                        "backgroundColor": "rgba(153, 102, 255, 0.2)"
                    }]
                },
                "config": {}
            },
            {
                "id": "collaboration_heatmap",
                "type": "heatmap",
                "title": "Team Collaboration Activity",
                "data": {
                    "xLabels": ["Mon", "Tue", "Wed", "Thu", "Fri"],
                    "yLabels": ["8am", "10am", "12pm", "2pm", "4pm", "6pm"],
                    "values": [
                        [5, 8, 12, 15, 18],
                        [7, 10, 14, 16, 12],
                        [9, 13, 17, 20, 15],
                        [6, 11, 15, 18, 14],
                        [8, 12, 16, 19, 16],
                        [4, 7, 10, 12, 9]
                    ]
                },
                "config": {"colorScale": ["#e0f7fa", "#00838f"]}
            }
        ]
    }

@router.get("/chart/productivity")
async def get_productivity_chart(
    period: str = Query("week", regex="^(day|week|month)$"),
    current_user: dict = Depends(get_current_active_user)
):
    """
    Get detailed productivity metrics with trend analysis.
    """
    if period == "week":
        labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    elif period == "month":
        labels = [f"Week {i}" for i in range(1, 5)]
    else:
        labels = [f"{i}:00" for i in range(9, 18)]
    
    return {
        "chart": {
            "type": "line",
            "data": {
                "labels": labels,
                "datasets": [
                    {
                        "label": "Focus Time (hours)",
                        "data": [random.randint(3, 8) for _ in labels],
                        "borderColor": "rgb(75, 192, 192)",
                        "tension": 0.4
                    },
                    {
                        "label": "Meeting Time (hours)",
                        "data": [random.randint(1, 4) for _ in labels],
                        "borderColor": "rgb(255, 159, 64)",
                        "tension": 0.4
                    }
                ]
            }
        },
        "insights": [
            "Peak productivity on Wednesday",
            "Meeting time increased by 15% this week",
            "Average focus time: 5.2 hours per day"
        ]
    }

@router.get("/chart/burndown")
async def get_burndown_chart(
    project_id: Optional[str] = None,
    current_user: dict = Depends(get_current_active_user)
):
    """
    Get project burndown chart showing progress vs ideal trajectory.
    """
    days = 14
    total_tasks = 50
    
    return {
        "chart": {
            "type": "line",
            "data": {
                "labels": [f"Day {i}" for i in range(1, days + 1)],
                "datasets": [
                    {
                        "label": "Ideal",
                        "data": [total_tasks - (total_tasks / days) * i for i in range(days + 1)],
                        "borderColor": "rgba(200, 200, 200, 0.5)",
                        "borderDash": [5, 5]
                    },
                    {
                        "label": "Actual",
                        "data": [total_tasks - random.randint(i * 2, i * 4) for i in range(days + 1)],
                        "borderColor": "rgb(54, 162, 235)",
                        "fill": False
                    }
                ]
            }
        },
        "status": "on_track",
        "remaining_tasks": 18,
        "days_left": 7,
        "projected_completion": "2025-12-11"
    }

@router.get("/chart/velocity")
async def get_velocity_chart(
    sprints: int = Query(6, ge=3, le=12),
    current_user: dict = Depends(get_current_active_user)
):
    """
    Get team velocity chart showing completed story points per sprint.
    """
    return {
        "chart": {
            "type": "bar",
            "data": {
                "labels": [f"Sprint {i}" for i in range(1, sprints + 1)],
                "datasets": [
                    {
                        "label": "Completed",
                        "data": [random.randint(20, 40) for _ in range(sprints)],
                        "backgroundColor": "rgba(75, 192, 192, 0.6)"
                    },
                    {
                        "label": "Committed",
                        "data": [random.randint(30, 45) for _ in range(sprints)],
                        "backgroundColor": "rgba(255, 159, 64, 0.6)"
                    }
                ]
            }
        },
        "average_velocity": 32,
        "trend": "increasing",
        "recommendation": "Team velocity is improving. Consider increasing sprint capacity."
    }

@router.get("/chart/cumulative-flow")
async def get_cumulative_flow_chart(
    days: int = Query(30, ge=7, le=90),
    current_user: dict = Depends(get_current_active_user)
):
    """
    Get cumulative flow diagram showing work in progress across stages.
    """
    labels = [(datetime.now() - timedelta(days=i)).strftime("%b %d") for i in range(days, 0, -1)]
    
    return {
        "chart": {
            "type": "area",
            "data": {
                "labels": labels,
                "datasets": [
                    {
                        "label": "Done",
                        "data": [i * 2 for i in range(1, days + 1)],
                        "backgroundColor": "rgba(75, 192, 192, 0.6)"
                    },
                    {
                        "label": "In Review",
                        "data": [random.randint(5, 15) for _ in range(days)],
                        "backgroundColor": "rgba(255, 206, 86, 0.6)"
                    },
                    {
                        "label": "In Progress",
                        "data": [random.randint(10, 25) for _ in range(days)],
                        "backgroundColor": "rgba(54, 162, 235, 0.6)"
                    },
                    {
                        "label": "To Do",
                        "data": [random.randint(15, 30) for _ in range(days)],
                        "backgroundColor": "rgba(201, 203, 207, 0.6)"
                    }
                ]
            }
        },
        "wip_limit": 25,
        "current_wip": 18,
        "bottleneck": "In Review stage"
    }

@router.post("/dashboard/custom")
async def create_custom_dashboard(
    name: str,
    widgets: List[str],
    current_user: dict = Depends(get_current_active_user)
):
    """
    Create a custom dashboard with selected widgets.
    """
    return {
        "id": f"dash_{hash(name)}",
        "name": name,
        "widgets": widgets,
        "created_at": datetime.now().isoformat(),
        "shareable_link": f"/dashboards/{hash(name)}"
    }

@router.get("/metrics/summary")
async def get_metrics_summary(current_user: dict = Depends(get_current_active_user)):
    """
    Get key performance metrics summary.
    """
    return {
        "kpis": [
            {
                "name": "Tasks Completed",
                "value": 147,
                "change": +12,
                "trend": "up",
                "period": "This Month"
            },
            {
                "name": "Productivity Score",
                "value": 87,
                "change": +5,
                "trend": "up",
                "period": "This Week"
            },
            {
                "name": "Collaboration Index",
                "value": 72,
                "change": -3,
                "trend": "down",
                "period": "This Week"
            },
            {
                "name": "AI Queries",
                "value": 267,
                "change": +23,
                "trend": "up",
                "period": "This Month"
            }
        ]
    }
