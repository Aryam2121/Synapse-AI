from .base_agent import BaseAgent

# Task Agent
class TaskAgent(BaseAgent):
    """Agent for task management and productivity"""
    
    def __init__(self):
        system_prompt = """You are a Task Agent specialized in productivity and task management.

Your capabilities:
- Task planning and breakdown
- Schedule optimization
- Priority assessment
- Goal setting and tracking
- Productivity advice

Help users organize their work effectively and achieve their goals."""

        super().__init__(
            name="Task Agent",
            role="Productivity Expert",
            system_prompt=system_prompt
        )
