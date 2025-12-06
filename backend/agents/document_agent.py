from .base_agent import BaseAgent
from typing import Dict, Any

class DocumentAgent(BaseAgent):
    """Specialized agent for document processing and analysis"""
    
    def __init__(self):
        system_prompt = """You are an expert Document Agent specialized in document analysis and processing.

Your capabilities include:
1. Summarization: Create concise summaries of long documents
2. Information Extraction: Extract key information, facts, and data
3. Question Answering: Answer questions based on document content
4. Translation: Translate content between languages
5. Comparison: Compare multiple documents and highlight differences
6. Classification: Categorize and tag documents

When processing documents:
- Provide accurate, cited information from the source
- Maintain context and nuance from the original
- Highlight important points and key takeaways
- Structure your responses clearly
- Include relevant quotes when helpful

Be thorough but concise. Focus on extracting maximum value from documents."""

        super().__init__(
            name="Document Agent",
            role="Document Processing Expert",
            system_prompt=system_prompt
        )
    
    async def summarize(self, content: str, max_length: int = 200) -> str:
        """Summarize document content"""
        
        prompt = f"""Summarize the following document in approximately {max_length} words:

{content}

Provide a clear, concise summary that captures the main points and key information."""

        response = await self.process(prompt)
        return response["content"]
    
    async def extract_key_points(self, content: str) -> Dict[str, Any]:
        """Extract key points from document"""
        
        prompt = f"""Extract and list the key points from this document:

{content}

Format as:
- Main topic/theme
- Key points (bullet list)
- Important facts or data
- Conclusions or recommendations"""

        response = await self.process(prompt)
        
        return {
            **response,
            "extraction_type": "key_points"
        }
    
    async def answer_question(self, question: str, context: str) -> Dict[str, Any]:
        """Answer a question based on document context"""
        
        prompt = f"""Based on the following document, answer this question:

Question: {question}

Document:
{context}

Provide a clear, accurate answer with specific references to the document."""

        response = await self.process(prompt)
        return response
    
    async def extract_entities(self, content: str) -> Dict[str, Any]:
        """Extract named entities from document"""
        
        prompt = f"""Extract named entities from this text:

{content}

Categories:
- People
- Organizations
- Locations
- Dates
- Monetary values
- Other important entities

List them by category."""

        response = await self.process(prompt)
        return response
    
    async def generate_report(self, data: Dict[str, Any]) -> str:
        """Generate a professional report from data"""
        
        prompt = f"""Generate a professional report from this data:

{data}

The report should include:
- Executive Summary
- Main Findings
- Detailed Analysis
- Recommendations
- Conclusion

Use professional formatting and clear structure."""

        response = await self.process(prompt)
        return response["content"]

class GeneralAgent(BaseAgent):
    """General-purpose conversational agent"""
    
    def __init__(self):
        system_prompt = """You are a helpful, knowledgeable AI assistant for the Universal AI Workspace.

Your role is to:
- Engage in natural, helpful conversation
- Answer general questions accurately
- Provide explanations and guidance
- Help users navigate the workspace
- Route complex requests to specialized agents when appropriate

Be friendly, professional, and informative. When you're not sure about something, admit it honestly.
If a query would be better handled by a specialized agent (Code, Document, Task, Research), suggest that to the user."""

        super().__init__(
            name="General Agent",
            role="Conversational AI Assistant",
            system_prompt=system_prompt
        )

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

class ResearchAgent(BaseAgent):
    """Agent for research and information gathering"""
    
    def __init__(self):
        system_prompt = """You are a Research Agent specialized in information gathering and synthesis.

Your capabilities:
- Comprehensive research on topics
- Fact-checking and verification
- Synthesizing information from multiple sources
- Providing citations and references
- Explaining complex concepts

Provide well-researched, accurate, and balanced information."""

        super().__init__(
            name="Research Agent",
            role="Research Specialist",
            system_prompt=system_prompt
        )
