from typing import Dict, Tuple, Any
from .code_agent import CodeAgent
from .document_agent import DocumentAgent
from .task_agent import TaskAgent
from .research_agent import ResearchAgent
from .general_agent import GeneralAgent
import re

class AgentRouter:
    """
    Routes user queries to the most appropriate specialized agent.
    Uses pattern matching and keyword analysis to determine intent.
    """
    
    def __init__(self):
        self.agents = {
            "code": CodeAgent(),
            "document": DocumentAgent(),
            "task": TaskAgent(),
            "research": ResearchAgent(),
            "general": GeneralAgent(),
        }
        
        # Keywords for each agent type
        self.keywords = {
            "code": [
                "code", "function", "class", "bug", "error", "debug", "refactor",
                "python", "javascript", "java", "typescript", "api", "programming",
                "syntax", "compile", "runtime", "algorithm", "variable", "import"
            ],
            "document": [
                "document", "pdf", "file", "text", "summarize", "summary",
                "content", "extract", "read", "analyze document", "report",
                "word", "docx", "markdown", "article"
            ],
            "task": [
                "task", "todo", "schedule", "reminder", "plan", "organize",
                "priority", "deadline", "meeting", "calendar", "appointment",
                "create task", "add task", "complete", "finish"
            ],
            "research": [
                "research", "find", "search", "look up", "information", "data",
                "learn", "explain", "what is", "how does", "why", "tell me about",
                "gather", "investigate", "study"
            ],
        }
    
    def route(self, message: str) -> Tuple[str, float]:
        """
        Route the message to the most appropriate agent.
        Returns (agent_type, confidence_score)
        """
        message_lower = message.lower()
        scores = {agent_type: 0 for agent_type in self.keywords.keys()}
        
        # Calculate scores based on keyword matches
        for agent_type, keywords in self.keywords.items():
            for keyword in keywords:
                if keyword in message_lower:
                    scores[agent_type] += 1
        
        # Check for specific patterns
        if re.search(r'```[\w]*\n', message):  # Code blocks
            scores["code"] += 5
        
        if re.search(r'\b(create|add|new)\s+(task|todo)', message_lower):
            scores["task"] += 5
        
        if re.search(r'\b(summarize|summary)\b', message_lower):
            scores["document"] += 3
        
        # Determine best agent
        max_score = max(scores.values())
        
        if max_score == 0:
            return "general", 0.5
        
        best_agent = max(scores, key=scores.get)
        confidence = min(max_score / 10.0, 1.0)  # Normalize to 0-1
        
        return best_agent, confidence
    
    def get_agent(self, agent_type: str):
        """Get agent instance by type"""
        return self.agents.get(agent_type, self.agents["general"])
    
    def list_agents(self) -> Dict[str, Any]:
        """List all available agents with their capabilities"""
        return {
            "code": {
                "name": "Code Agent",
                "description": "Analyzes code, finds bugs, suggests improvements",
                "capabilities": ["code_review", "bug_detection", "refactoring", "documentation"]
            },
            "document": {
                "name": "Document Agent",
                "description": "Processes and analyzes documents",
                "capabilities": ["summarization", "extraction", "qa", "translation"]
            },
            "task": {
                "name": "Task Agent",
                "description": "Manages tasks and productivity",
                "capabilities": ["task_creation", "scheduling", "reminders", "planning"]
            },
            "research": {
                "name": "Research Agent",
                "description": "Gathers and synthesizes information",
                "capabilities": ["web_search", "data_gathering", "synthesis", "explanation"]
            },
            "general": {
                "name": "General Agent",
                "description": "Handles general queries and conversation",
                "capabilities": ["conversation", "general_qa", "routing"]
            }
        }
