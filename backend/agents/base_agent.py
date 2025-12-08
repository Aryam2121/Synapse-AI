from typing import Dict, Any, List, Optional, AsyncIterator
from langchain_ollama import ChatOllama
from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage, SystemMessage, AIMessage
import os
import uuid
import hashlib
from datetime import datetime, timedelta
from functools import lru_cache

class BaseAgent:
    """Base class for all specialized agents"""
    
    def __init__(self, name: str, role: str, system_prompt: str):
        self.name = name
        self.role = role
        self.system_prompt = system_prompt
        
        # Initialize LLM - Priority: Groq (free) > OpenAI > Ollama (local dev)
        groq_api_key = os.getenv("GROQ_API_KEY")
        openai_api_key = os.getenv("OPENAI_API_KEY")
        use_ollama = os.getenv("USE_OLLAMA", "true").lower() == "true"
        
        if groq_api_key:
            # FREE Cloud: Use Groq (recommended for production)
            model = os.getenv("GROQ_MODEL", "llama-3.1-8b-instant")  # Fastest model
            self.llm = ChatGroq(
                model=model,
                temperature=0.5,  # Lower for faster, more focused responses
                api_key=groq_api_key,
                streaming=True,
                max_tokens=1500,  # Reduced for faster responses
                timeout=20,  # Shorter timeout
                max_retries=2  # Faster failure recovery
            )
            print(f"✓ Using FASTEST Groq model: {model}")
        elif openai_api_key:
            # Paid: Use OpenAI if key provided
            from langchain_openai import ChatOpenAI
            self.llm = ChatOpenAI(
                model="gpt-4-turbo-preview",
                temperature=0.7,
                api_key=openai_api_key
            )
            print("✓ Using OpenAI")
        elif use_ollama:
            # Local Dev: Use Ollama (local, no API key needed)
            model = os.getenv("OLLAMA_MODEL", "llama3.1")
            self.llm = ChatOllama(
                model=model,
                temperature=0.7,
                base_url=os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
            )
            print(f"✓ Using LOCAL Ollama model: {model}")
        else:
            # Fallback error
            raise ValueError(
                "No AI provider configured! Set GROQ_API_KEY (free) or OPENAI_API_KEY, "
                "or set USE_OLLAMA=true for local development"
            )
        
        self.conversation_history: Dict[str, List[Any]] = {}
        self.response_cache: Dict[str, tuple] = {}  # Cache for responses (hash: (response, timestamp))
    
    def _get_cache_key(self, message: str, context: List[Dict[str, Any]] = None) -> str:
        """Generate cache key for a message"""
        context_str = str(context) if context else ""
        cache_input = f"{self.name}:{message}:{context_str}"
        return hashlib.md5(cache_input.encode()).hexdigest()
    
    def _get_cached_response(self, cache_key: str, max_age_minutes: int = 10) -> Optional[str]:
        """Get cached response if available and not expired"""
        if cache_key in self.response_cache:
            response, timestamp = self.response_cache[cache_key]
            age = datetime.now() - timestamp
            if age < timedelta(minutes=max_age_minutes):
                return response
        return None
    
    async def process(
        self,
        message: str,
        context: List[Dict[str, Any]] = None,
        conversation_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """Process a message and return a response"""
        
        if conversation_id is None:
            conversation_id = str(uuid.uuid4())
        
        # Check cache for non-conversational queries
        cache_key = self._get_cache_key(message, context)
        cached_response = self._get_cached_response(cache_key)
        if cached_response and not conversation_id:
            return {
                "content": cached_response,
                "conversation_id": conversation_id,
                "agent": self.name,
                "timestamp": datetime.now().isoformat(),
                "cached": True
            }
        
        # Get conversation history
        if conversation_id not in self.conversation_history:
            self.conversation_history[conversation_id] = []
        
        history = self.conversation_history[conversation_id]
        
        # Build messages
        messages = [SystemMessage(content=self.system_prompt)]
        
        # Add context if available
        if context:
            context_text = self._format_context(context)
            messages.append(SystemMessage(content=f"Relevant context:\n{context_text}"))
        
        # Add conversation history (reduced for speed)
        for msg in history[-5:]:  # Last 5 messages only
            messages.append(msg)
        
        # Add current message
        messages.append(HumanMessage(content=message))
        
        # Get response
        response = await self.llm.agenerate([messages])
        ai_message = response.generations[0][0].text
        
        # Cache the response for future similar queries
        self.response_cache[cache_key] = (ai_message, datetime.now())
        
        # Clean old cache entries (keep last 100)
        if len(self.response_cache) > 100:
            oldest_keys = sorted(self.response_cache.keys(), 
                               key=lambda k: self.response_cache[k][1])[:50]
            for old_key in oldest_keys:
                del self.response_cache[old_key]
        
        # Update history
        history.append(HumanMessage(content=message))
        history.append(AIMessage(content=ai_message))
        
        return {
            "content": ai_message,
            "conversation_id": conversation_id,
            "agent": self.name,
            "timestamp": datetime.utcnow().isoformat(),
            "sources": context if context else []
        }
    
    async def stream_process(
        self,
        message: str,
        context: List[Dict[str, Any]] = None
    ) -> AsyncIterator[str]:
        """Stream the response token by token"""
        
        callback = AsyncIteratorCallbackHandler()
        
        messages = [
            SystemMessage(content=self.system_prompt),
            HumanMessage(content=message)
        ]
        
        if context:
            context_text = self._format_context(context)
            messages.insert(1, SystemMessage(content=f"Context:\n{context_text}"))
        
        # Stream response
        async for token in self.llm.astream(messages, callbacks=[callback]):
            yield token.content
    
    def _format_context(self, context: List[Dict[str, Any]]) -> str:
        """Format context documents for inclusion in prompt"""
        formatted = []
        for i, doc in enumerate(context, 1):
            source = doc.get("metadata", {}).get("source", "Unknown")
            content = doc.get("content", "")
            formatted.append(f"[Source {i}: {source}]\n{content}")
        return "\n\n".join(formatted)
    
    def clear_history(self, conversation_id: str):
        """Clear conversation history for a given ID"""
        if conversation_id in self.conversation_history:
            del self.conversation_history[conversation_id]
