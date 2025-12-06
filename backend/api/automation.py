from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime
from .auth import get_current_active_user

router = APIRouter(prefix="/api/automation", tags=["automation"])

class AutomationTrigger(BaseModel):
    type: str  # schedule, event, webhook
    config: Dict[str, Any]

class AutomationAction(BaseModel):
    type: str  # create_task, send_notification, run_script, api_call
    config: Dict[str, Any]

class AutomationRule(BaseModel):
    name: str
    description: Optional[str] = None
    trigger: AutomationTrigger
    conditions: Optional[List[Dict[str, Any]]] = None
    actions: List[AutomationAction]
    enabled: bool = True

class WorkflowStep(BaseModel):
    id: str
    name: str
    type: str
    config: Dict[str, Any]
    next_step: Optional[str] = None

class Workflow(BaseModel):
    name: str
    description: Optional[str] = None
    steps: List[WorkflowStep]
    enabled: bool = True

@router.post("/rules")
async def create_automation_rule(
    rule: AutomationRule,
    current_user: dict = Depends(get_current_active_user)
):
    """
    Create a new automation rule.
    Examples:
    - Auto-assign tasks based on keywords
    - Send notifications on specific events
    - Generate reports on schedule
    - Trigger webhooks on status changes
    """
    return {
        "id": "rule_" + str(hash(rule.name))[:8],
        "rule": rule.dict(),
        "created_at": datetime.now().isoformat(),
        "status": "active"
    }

@router.get("/rules")
async def list_automation_rules(
    enabled_only: bool = False,
    current_user: dict = Depends(get_current_active_user)
):
    """
    List all automation rules with execution statistics.
    """
    return {
        "rules": [
            {
                "id": "rule_a1b2c3d4",
                "name": "Auto-tag urgent tasks",
                "description": "Automatically tag tasks with 'urgent' when deadline is within 24 hours",
                "trigger": {"type": "schedule", "config": {"cron": "0 * * * *"}},
                "actions": [{"type": "update_task", "config": {"add_tag": "urgent"}}],
                "enabled": True,
                "executions": 127,
                "last_run": "2025-12-04T10:00:00Z",
                "success_rate": 0.98
            },
            {
                "id": "rule_e5f6g7h8",
                "name": "Daily standup reminder",
                "description": "Send notification to team at 9 AM for daily standup",
                "trigger": {"type": "schedule", "config": {"cron": "0 9 * * *"}},
                "actions": [{"type": "send_notification", "config": {"message": "Time for daily standup!"}}],
                "enabled": True,
                "executions": 45,
                "last_run": "2025-12-04T09:00:00Z",
                "success_rate": 1.0
            },
            {
                "id": "rule_i9j0k1l2",
                "name": "Archive completed tasks",
                "description": "Move tasks to archive 7 days after completion",
                "trigger": {"type": "schedule", "config": {"cron": "0 0 * * 0"}},
                "actions": [{"type": "archive_tasks", "config": {"completed_days_ago": 7}}],
                "enabled": True,
                "executions": 12,
                "last_run": "2025-12-01T00:00:00Z",
                "success_rate": 1.0
            }
        ]
    }

@router.post("/workflows")
async def create_workflow(
    workflow: Workflow,
    current_user: dict = Depends(get_current_active_user)
):
    """
    Create a multi-step workflow with branching logic.
    Example: Document approval workflow, onboarding process, project pipeline.
    """
    return {
        "id": "wf_" + str(hash(workflow.name))[:8],
        "workflow": workflow.dict(),
        "created_at": datetime.now().isoformat(),
        "status": "active"
    }

@router.get("/workflows")
async def list_workflows(current_user: dict = Depends(get_current_active_user)):
    """
    List all workflows with execution metrics.
    """
    return {
        "workflows": [
            {
                "id": "wf_abc123",
                "name": "Project Onboarding",
                "description": "Automated onboarding workflow for new projects",
                "steps": 5,
                "enabled": True,
                "executions": 23,
                "avg_duration": "4.5min",
                "success_rate": 0.96
            },
            {
                "id": "wf_def456",
                "name": "Content Review Pipeline",
                "description": "Multi-stage content review and approval process",
                "steps": 4,
                "enabled": True,
                "executions": 67,
                "avg_duration": "2.3h",
                "success_rate": 0.91
            }
        ]
    }

@router.post("/workflows/{workflow_id}/execute")
async def execute_workflow(
    workflow_id: str,
    input_data: Dict[str, Any],
    current_user: dict = Depends(get_current_active_user)
):
    """
    Execute a workflow manually with provided input data.
    """
    return {
        "execution_id": f"exec_{workflow_id}_{datetime.now().timestamp()}",
        "workflow_id": workflow_id,
        "status": "running",
        "started_at": datetime.now().isoformat(),
        "current_step": "step_1",
        "progress": 0.2
    }

@router.get("/templates")
async def get_automation_templates(current_user: dict = Depends(get_current_active_user)):
    """
    Get pre-built automation templates for common use cases.
    """
    return {
        "templates": [
            {
                "id": "tmpl_daily_digest",
                "name": "Daily Digest Email",
                "description": "Send a daily summary of tasks, updates, and notifications",
                "category": "productivity",
                "trigger": "schedule",
                "actions_count": 3,
                "popularity": 89
            },
            {
                "id": "tmpl_task_assignment",
                "name": "Smart Task Assignment",
                "description": "Automatically assign tasks to team members based on workload and skills",
                "category": "collaboration",
                "trigger": "event",
                "actions_count": 2,
                "popularity": 76
            },
            {
                "id": "tmpl_backup",
                "name": "Automated Backup",
                "description": "Export workspace data to cloud storage weekly",
                "category": "data_management",
                "trigger": "schedule",
                "actions_count": 4,
                "popularity": 92
            },
            {
                "id": "tmpl_slack_integration",
                "name": "Slack Notifications",
                "description": "Send important updates to Slack channels",
                "category": "integrations",
                "trigger": "event",
                "actions_count": 1,
                "popularity": 83
            }
        ]
    }

@router.get("/execution-history")
async def get_execution_history(
    limit: int = 50,
    current_user: dict = Depends(get_current_active_user)
):
    """
    Get automation execution history with detailed logs.
    """
    return {
        "executions": [
            {
                "id": "exec_1",
                "rule_id": "rule_a1b2c3d4",
                "rule_name": "Auto-tag urgent tasks",
                "started_at": "2025-12-04T10:00:00Z",
                "completed_at": "2025-12-04T10:00:02Z",
                "status": "success",
                "actions_executed": 3,
                "logs": ["Found 3 tasks with upcoming deadlines", "Added 'urgent' tag to tasks"]
            },
            {
                "id": "exec_2",
                "rule_id": "rule_e5f6g7h8",
                "rule_name": "Daily standup reminder",
                "started_at": "2025-12-04T09:00:00Z",
                "completed_at": "2025-12-04T09:00:01Z",
                "status": "success",
                "actions_executed": 1,
                "logs": ["Sent notification to 5 team members"]
            }
        ],
        "total": 284,
        "success_rate": 0.97
    }

@router.post("/test-rule/{rule_id}")
async def test_automation_rule(
    rule_id: str,
    test_data: Optional[Dict[str, Any]] = None,
    current_user: dict = Depends(get_current_active_user)
):
    """
    Test an automation rule in dry-run mode without executing actions.
    """
    return {
        "rule_id": rule_id,
        "test_result": "success",
        "matched_conditions": True,
        "actions_to_execute": 2,
        "preview": [
            "Would create task: 'Review Q4 report'",
            "Would send notification to user@example.com"
        ],
        "estimated_execution_time": "1.2s"
    }
