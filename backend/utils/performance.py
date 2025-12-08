"""Performance monitoring middleware for FastAPI"""
import time
import psutil
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from utils.logger import logger

class PerformanceMiddleware(BaseHTTPMiddleware):
    """Monitor and log API performance metrics"""
    
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        
        # Get initial memory usage
        process = psutil.Process()
        start_memory = process.memory_info().rss / 1024 / 1024  # MB
        
        # Process request
        response = await call_next(request)
        
        # Calculate metrics
        duration = time.time() - start_time
        end_memory = process.memory_info().rss / 1024 / 1024  # MB
        memory_diff = end_memory - start_memory
        
        # Log slow requests
        if duration > 1.0:
            logger.warning(
                f"SLOW REQUEST: {request.method} {request.url.path} "
                f"took {duration:.2f}s, memory: {memory_diff:+.2f}MB"
            )
        
        # Add performance headers
        response.headers["X-Process-Time"] = str(round(duration * 1000, 2))
        response.headers["X-Memory-Delta"] = str(round(memory_diff, 2))
        
        return response
