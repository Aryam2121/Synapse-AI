"""
Task management routes
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
import uuid

from auth.dependencies import get_current_active_user
from db.database import get_db, User, Task as TaskModel
from pydantic import BaseModel
from datetime import datetime

router = APIRouter(prefix="/api/tasks", tags=["tasks"])


class TaskCreate(BaseModel):
    title: str
    description: str = ""
    priority: str = "medium"
    due_date: str | None = None


class TaskUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    completed: bool | None = None
    priority: str | None = None


class TaskResponse(BaseModel):
    id: str
    title: str
    description: str
    completed: bool
    priority: str
    due_date: datetime | None
    created_at: datetime
    
    class Config:
        from_attributes = True


@router.post("", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
async def create_task(
    task_data: TaskCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new task"""
    
    task = TaskModel(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        title=task_data.title,
        description=task_data.description,
        priority=task_data.priority,
        completed=False,
        due_date=datetime.fromisoformat(task_data.due_date) if task_data.due_date else None,
    )
    
    db.add(task)
    await db.commit()
    await db.refresh(task)
    
    return TaskResponse.model_validate(task)


@router.get("", response_model=List[TaskResponse])
async def get_tasks(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Get all tasks for current user"""
    
    result = await db.execute(
        select(TaskModel).where(TaskModel.user_id == current_user.id)
    )
    tasks = result.scalars().all()
    
    return [TaskResponse.model_validate(task) for task in tasks]


@router.patch("/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: str,
    task_data: TaskUpdate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Update a task"""
    
    result = await db.execute(
        select(TaskModel).where(
            TaskModel.id == task_id,
            TaskModel.user_id == current_user.id
        )
    )
    task = result.scalar_one_or_none()
    
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    if task_data.title is not None:
        task.title = task_data.title
    if task_data.description is not None:
        task.description = task_data.description
    if task_data.completed is not None:
        task.completed = task_data.completed
    if task_data.priority is not None:
        task.priority = task_data.priority
    
    await db.commit()
    await db.refresh(task)
    
    return TaskResponse.model_validate(task)


@router.delete("/{task_id}")
async def delete_task(
    task_id: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete a task"""
    
    result = await db.execute(
        select(TaskModel).where(
            TaskModel.id == task_id,
            TaskModel.user_id == current_user.id
        )
    )
    task = result.scalar_one_or_none()
    
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    await db.delete(task)
    await db.commit()
    
    return {"message": "Task deleted successfully"}
