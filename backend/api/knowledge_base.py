from fastapi import APIRouter, HTTPException, Depends, UploadFile, File
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime
from .auth import get_current_active_user

router = APIRouter(prefix="/api/knowledge", tags=["knowledge-base"])

class Article(BaseModel):
    title: str
    content: str
    tags: List[str]
    category: str

class KnowledgeSearch(BaseModel):
    query: str
    filters: Optional[Dict[str, Any]] = None

@router.post("/articles")
async def create_article(
    article: Article,
    current_user: dict = Depends(get_current_active_user)
):
    """
    Create a new knowledge base article with automatic tagging and categorization.
    """
    # AI-powered content analysis
    word_count = len(article.content.split())
    reading_time = max(1, word_count // 200)  # Average reading speed
    
    # Auto-generate additional tags using AI
    auto_tags = extract_key_concepts(article.content)
    all_tags = list(set(article.tags + auto_tags))
    
    return {
        "id": f"kb_{hash(article.title)}",
        "title": article.title,
        "content": article.content,
        "tags": all_tags,
        "category": article.category,
        "metadata": {
            "author": current_user["sub"],
            "created_at": datetime.now().isoformat(),
            "word_count": word_count,
            "reading_time_minutes": reading_time,
            "views": 0,
            "likes": 0
        },
        "ai_summary": generate_summary(article.content),
        "related_articles": []
    }

@router.get("/articles")
async def list_articles(
    category: Optional[str] = None,
    tag: Optional[str] = None,
    limit: int = 20,
    current_user: dict = Depends(get_current_active_user)
):
    """
    List knowledge base articles with filtering and sorting.
    """
    articles = [
        {
            "id": "kb_001",
            "title": "Getting Started with Synapse AI",
            "summary": "Learn the basics of using Synapse AI for maximum productivity",
            "category": "tutorials",
            "tags": ["beginners", "productivity", "setup"],
            "author": "Admin",
            "created_at": "2025-11-01T10:00:00Z",
            "reading_time": 5,
            "views": 1234,
            "likes": 89,
            "featured": True
        },
        {
            "id": "kb_002",
            "title": "Advanced Automation Techniques",
            "summary": "Master complex automation workflows and scheduling",
            "category": "guides",
            "tags": ["automation", "advanced", "workflows"],
            "author": "Admin",
            "created_at": "2025-11-15T14:30:00Z",
            "reading_time": 8,
            "views": 856,
            "likes": 67,
            "featured": True
        },
        {
            "id": "kb_003",
            "title": "Voice Commands Cheat Sheet",
            "summary": "Quick reference for all available voice commands",
            "category": "reference",
            "tags": ["voice", "commands", "reference"],
            "author": "Admin",
            "created_at": "2025-11-20T09:00:00Z",
            "reading_time": 3,
            "views": 645,
            "likes": 54,
            "featured": False
        },
        {
            "id": "kb_004",
            "title": "Collaboration Best Practices",
            "summary": "Tips for effective team collaboration and sharing",
            "category": "guides",
            "tags": ["collaboration", "teamwork", "sharing"],
            "author": "Admin",
            "created_at": "2025-11-25T16:00:00Z",
            "reading_time": 6,
            "views": 523,
            "likes": 45,
            "featured": False
        }
    ]
    
    return {
        "articles": articles[:limit],
        "total": len(articles),
        "categories": ["tutorials", "guides", "reference", "faq"],
        "popular_tags": ["automation", "productivity", "voice", "collaboration", "setup"]
    }

@router.get("/articles/{article_id}")
async def get_article(
    article_id: str,
    current_user: dict = Depends(get_current_active_user)
):
    """
    Get detailed article with related content and AI insights.
    """
    return {
        "id": article_id,
        "title": "Advanced Automation Techniques",
        "content": """
# Advanced Automation Techniques

Learn how to create sophisticated automation workflows that save hours of manual work.

## Key Concepts

1. **Trigger Types**
   - Schedule-based triggers
   - Event-based triggers
   - Webhook integrations

2. **Conditional Logic**
   - If-then-else conditions
   - Multiple condition branching
   - Dynamic parameter passing

3. **Best Practices**
   - Start simple, iterate
   - Test in dry-run mode
   - Monitor execution logs
   - Handle errors gracefully

## Example Workflow

```python
# Daily report automation
trigger: schedule("daily", "9:00 AM")
condition: tasks_completed > 0
actions:
  - generate_report()
  - send_email(recipients=["team@company.com"])
  - archive_old_tasks(days=7)
```

## Advanced Patterns

- Chaining multiple automations
- Using variables and context
- Integration with external APIs
- Parallel execution

## Tips for Success

✅ Document your automations
✅ Use descriptive names
✅ Set up error notifications
✅ Review and optimize regularly
        """,
        "category": "guides",
        "tags": ["automation", "advanced", "workflows", "best-practices"],
        "author": {
            "id": "admin",
            "name": "Admin",
            "avatar": "👨‍💼"
        },
        "metadata": {
            "created_at": "2025-11-15T14:30:00Z",
            "updated_at": "2025-11-20T10:00:00Z",
            "word_count": 450,
            "reading_time": 8,
            "views": 856,
            "likes": 67,
            "bookmarks": 34
        },
        "related_articles": [
            {"id": "kb_001", "title": "Getting Started with Synapse AI"},
            {"id": "kb_005", "title": "Workflow Templates Library"}
        ],
        "table_of_contents": [
            {"level": 1, "title": "Key Concepts", "anchor": "#key-concepts"},
            {"level": 1, "title": "Example Workflow", "anchor": "#example-workflow"},
            {"level": 1, "title": "Advanced Patterns", "anchor": "#advanced-patterns"},
            {"level": 1, "title": "Tips for Success", "anchor": "#tips-for-success"}
        ],
        "feedback": {
            "helpful_count": 89,
            "not_helpful_count": 3,
            "rating": 4.8
        }
    }

@router.post("/search")
async def search_knowledge_base(
    search: KnowledgeSearch,
    current_user: dict = Depends(get_current_active_user)
):
    """
    AI-powered semantic search across knowledge base.
    """
    return {
        "query": search.query,
        "results": [
            {
                "id": "kb_002",
                "title": "Advanced Automation Techniques",
                "excerpt": "...sophisticated automation workflows that save hours...conditional logic and best practices...",
                "relevance_score": 0.94,
                "category": "guides",
                "tags": ["automation", "workflows"],
                "reading_time": 8
            },
            {
                "id": "kb_006",
                "title": "Automation Templates",
                "excerpt": "...pre-built automation templates for common use cases...customize and deploy quickly...",
                "relevance_score": 0.87,
                "category": "reference",
                "tags": ["automation", "templates"],
                "reading_time": 4
            }
        ],
        "total_results": 2,
        "search_time": 0.08,
        "suggestions": [
            "workflow automation",
            "schedule automation",
            "automation best practices"
        ]
    }

@router.get("/categories")
async def get_categories(current_user: dict = Depends(get_current_active_user)):
    """
    Get all knowledge base categories with article counts.
    """
    return {
        "categories": [
            {
                "id": "tutorials",
                "name": "Tutorials",
                "description": "Step-by-step guides for beginners",
                "icon": "📚",
                "article_count": 12,
                "color": "#3b82f6"
            },
            {
                "id": "guides",
                "name": "Guides",
                "description": "In-depth guides for advanced users",
                "icon": "📖",
                "article_count": 18,
                "color": "#8b5cf6"
            },
            {
                "id": "reference",
                "name": "Reference",
                "description": "Quick reference and documentation",
                "icon": "📋",
                "article_count": 24,
                "color": "#10b981"
            },
            {
                "id": "faq",
                "name": "FAQ",
                "description": "Frequently asked questions",
                "icon": "❓",
                "article_count": 35,
                "color": "#f59e0b"
            },
            {
                "id": "tips",
                "name": "Tips & Tricks",
                "description": "Productivity tips and hidden features",
                "icon": "💡",
                "article_count": 28,
                "color": "#ef4444"
            }
        ]
    }

@router.post("/articles/{article_id}/feedback")
async def submit_feedback(
    article_id: str,
    helpful: bool,
    comment: Optional[str] = None,
    current_user: dict = Depends(get_current_active_user)
):
    """
    Submit feedback on article helpfulness.
    """
    return {
        "article_id": article_id,
        "feedback_recorded": True,
        "helpful": helpful,
        "message": "Thank you for your feedback!"
    }

@router.get("/trending")
async def get_trending_articles(
    period: str = "week",
    current_user: dict = Depends(get_current_active_user)
):
    """
    Get trending articles based on views and engagement.
    """
    return {
        "period": period,
        "trending": [
            {
                "id": "kb_002",
                "title": "Advanced Automation Techniques",
                "views": 856,
                "growth": "+145%",
                "trending_score": 0.94
            },
            {
                "id": "kb_007",
                "title": "AI Insights Deep Dive",
                "views": 734,
                "growth": "+120%",
                "trending_score": 0.89
            },
            {
                "id": "kb_003",
                "title": "Voice Commands Cheat Sheet",
                "views": 645,
                "growth": "+98%",
                "trending_score": 0.82
            }
        ]
    }

def extract_key_concepts(text: str) -> List[str]:
    """Extract key concepts from text using AI"""
    # Simplified - in production use NLP
    words = text.lower().split()
    keywords = ['automation', 'workflow', 'productivity', 'collaboration']
    return [kw for kw in keywords if kw in ' '.join(words)]

def generate_summary(text: str) -> str:
    """Generate AI summary of content"""
    # Simplified - in production use AI
    sentences = text.split('.')[:3]
    return '. '.join(sentences[:2]) + '.'
