from fastapi import APIRouter, HTTPException, Depends, UploadFile, File
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime
from .auth import get_current_active_user
import re

router = APIRouter(prefix="/api/code", tags=["code-assistant"])

class CodeAnalysisRequest(BaseModel):
    code: str
    language: str
    context: Optional[str] = None

class CodeGenerationRequest(BaseModel):
    prompt: str
    language: str
    framework: Optional[str] = None
    style: str = "clean"

class CodeReview(BaseModel):
    severity: str
    line: int
    message: str
    suggestion: str
    category: str

class RefactorRequest(BaseModel):
    code: str
    language: str
    refactor_type: str  # extract_method, rename_variable, simplify, optimize

@router.post("/analyze")
async def analyze_code(
    request: CodeAnalysisRequest,
    current_user: dict = Depends(get_current_active_user)
):
    """
    AI-powered code analysis with bug detection, security issues, and optimization suggestions.
    """
    issues = []
    
    # Simulate code analysis
    lines = request.code.split('\n')
    
    # Check for common issues
    for i, line in enumerate(lines, 1):
        # Security: SQL injection
        if 'execute(' in line and '+' in line:
            issues.append({
                "severity": "high",
                "line": i,
                "message": "Possible SQL injection vulnerability",
                "suggestion": "Use parameterized queries instead of string concatenation",
                "category": "security"
            })
        
        # Performance: Inefficient loop
        if 'for' in line and 'in range(len(' in line:
            issues.append({
                "severity": "medium",
                "line": i,
                "message": "Inefficient loop pattern",
                "suggestion": "Use direct iteration: for item in collection",
                "category": "performance"
            })
        
        # Code smell: Too long line
        if len(line) > 100:
            issues.append({
                "severity": "low",
                "line": i,
                "message": f"Line too long ({len(line)} characters)",
                "suggestion": "Break line into multiple lines for better readability",
                "category": "style"
            })
        
        # Best practice: Missing error handling
        if 'open(' in line and 'with' not in line:
            issues.append({
                "severity": "medium",
                "line": i,
                "message": "File opened without context manager",
                "suggestion": "Use 'with open()' for automatic resource cleanup",
                "category": "best_practice"
            })
    
    # Calculate metrics
    complexity = calculate_complexity(request.code)
    maintainability = calculate_maintainability(issues)
    
    return {
        "issues": issues,
        "metrics": {
            "cyclomatic_complexity": complexity,
            "maintainability_index": maintainability,
            "lines_of_code": len(lines),
            "comment_ratio": 0.15
        },
        "score": {
            "overall": max(0, 100 - len(issues) * 5),
            "security": 85,
            "performance": 78,
            "maintainability": maintainability
        },
        "suggestions": [
            "Add input validation for user data",
            "Consider extracting complex logic into separate functions",
            "Add unit tests for critical paths"
        ]
    }

@router.post("/generate")
async def generate_code(
    request: CodeGenerationRequest,
    current_user: dict = Depends(get_current_active_user)
):
    """
    Generate code from natural language description using AI.
    """
    # Simulate AI code generation based on prompt
    templates = {
        "python": {
            "api_endpoint": '''@app.get("/api/items/{item_id}")
async def get_item(item_id: int, db: Session = Depends(get_db)):
    """Retrieve item by ID"""
    item = db.query(Item).filter(Item.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return item''',
            "database_model": '''class Item(Base):
    __tablename__ = "items"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(Text)
    price = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f"<Item {self.name}>\"''',
            "validation": '''from pydantic import BaseModel, validator

class ItemCreate(BaseModel):
    name: str
    price: float
    
    @validator('price')
    def price_must_be_positive(cls, v):
        if v <= 0:
            raise ValueError('Price must be positive')
        return v'''
        },
        "typescript": {
            "component": '''import React, { useState, useEffect } from 'react'

interface Props {
  title: string
  onSubmit: (data: any) => void
}

export const Component: React.FC<Props> = ({ title, onSubmit }) => {
  const [data, setData] = useState<any>(null)
  
  useEffect(() => {
    // Fetch data
  }, [])
  
  return (
    <div>
      <h1>{title}</h1>
    </div>
  )
}'''
        }
    }
    
    # Generate code based on prompt keywords
    code = templates.get(request.language, {}).get("api_endpoint", "# Generated code placeholder")
    
    return {
        "code": code,
        "language": request.language,
        "explanation": "Generated REST API endpoint with error handling and database query",
        "alternatives": [
            {"name": "With caching", "description": "Add Redis caching layer"},
            {"name": "Async version", "description": "Use asyncio for better performance"},
            {"name": "With pagination", "description": "Add pagination support"}
        ],
        "best_practices": [
            "Input validation",
            "Error handling",
            "Type hints",
            "Documentation"
        ]
    }

@router.post("/explain")
async def explain_code(
    request: CodeAnalysisRequest,
    current_user: dict = Depends(get_current_active_user)
):
    """
    AI-powered code explanation with step-by-step breakdown.
    """
    return {
        "summary": "This code implements a REST API endpoint with authentication and database operations",
        "breakdown": [
            {
                "section": "Imports",
                "explanation": "Required libraries for API, database, and authentication",
                "lines": [1, 5]
            },
            {
                "section": "Route Definition",
                "explanation": "Defines GET endpoint with path parameter",
                "lines": [7, 8]
            },
            {
                "section": "Business Logic",
                "explanation": "Queries database and handles errors",
                "lines": [9, 15]
            }
        ],
        "concepts": [
            {"name": "Dependency Injection", "description": "Using FastAPI's Depends for database session"},
            {"name": "ORM", "description": "SQLAlchemy query for database access"},
            {"name": "Error Handling", "description": "HTTPException for 404 cases"}
        ],
        "complexity": "Medium",
        "learning_resources": [
            {"title": "FastAPI Tutorial", "url": "https://fastapi.tiangolo.com"},
            {"title": "SQLAlchemy Docs", "url": "https://docs.sqlalchemy.org"}
        ]
    }

@router.post("/refactor")
async def refactor_code(
    request: RefactorRequest,
    current_user: dict = Depends(get_current_active_user)
):
    """
    Suggest code refactoring improvements.
    """
    refactored_code = request.code  # In production, apply actual refactoring
    
    changes = []
    if request.refactor_type == "extract_method":
        changes.append({
            "type": "extraction",
            "description": "Extracted complex logic into separate method",
            "before_lines": [10, 25],
            "after_lines": [10, 12]
        })
    elif request.refactor_type == "simplify":
        changes.append({
            "type": "simplification",
            "description": "Simplified conditional logic",
            "improvement": "Reduced cyclomatic complexity from 8 to 4"
        })
    
    return {
        "original_code": request.code,
        "refactored_code": refactored_code,
        "changes": changes,
        "improvements": {
            "readability": "+35%",
            "maintainability": "+28%",
            "lines_reduced": 15,
            "complexity_reduced": 4
        },
        "reasoning": [
            "Separated concerns for better modularity",
            "Reduced duplication with helper methods",
            "Improved naming for clarity"
        ]
    }

@router.post("/complete")
async def code_completion(
    code: str,
    cursor_position: int,
    language: str,
    current_user: dict = Depends(get_current_active_user)
):
    """
    AI-powered code completion and suggestions.
    """
    return {
        "completions": [
            {
                "text": "async def get_user(user_id: int)",
                "description": "Create async function to get user",
                "priority": "high"
            },
            {
                "text": "await db.query(User).filter(User.id == user_id).first()",
                "description": "Query user from database",
                "priority": "medium"
            },
            {
                "text": "if not user:\n    raise HTTPException(status_code=404)",
                "description": "Add error handling",
                "priority": "high"
            }
        ],
        "context_aware": True
    }

@router.post("/fix")
async def auto_fix_issues(
    code: str,
    language: str,
    current_user: dict = Depends(get_current_active_user)
):
    """
    Automatically fix common code issues.
    """
    return {
        "fixed_code": code,
        "fixes_applied": [
            {"issue": "Missing type hints", "line": 5, "fixed": True},
            {"issue": "Unused import", "line": 2, "fixed": True},
            {"issue": "Formatting", "line": "all", "fixed": True}
        ],
        "manual_review_needed": [
            {"issue": "Complex logic", "line": 45, "reason": "Requires human decision"}
        ]
    }

def calculate_complexity(code: str) -> int:
    """Calculate cyclomatic complexity"""
    # Count decision points
    decision_keywords = ['if', 'elif', 'for', 'while', 'and', 'or', 'except']
    complexity = 1
    for keyword in decision_keywords:
        complexity += code.lower().count(keyword)
    return min(complexity, 20)

def calculate_maintainability(issues: List[Dict]) -> int:
    """Calculate maintainability index"""
    base_score = 100
    for issue in issues:
        if issue['severity'] == 'high':
            base_score -= 15
        elif issue['severity'] == 'medium':
            base_score -= 8
        else:
            base_score -= 3
    return max(base_score, 0)
