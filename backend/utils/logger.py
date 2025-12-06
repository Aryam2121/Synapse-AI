import logging
import sys
from datetime import datetime

# Configure logger
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler('app.log')
    ]
)

logger = logging.getLogger("UniversalAI")

def log_request(endpoint: str, method: str, user_id: str = None):
    """Log API request"""
    logger.info(f"[{method}] {endpoint} - User: {user_id or 'Anonymous'}")

def log_agent_action(agent_name: str, action: str, details: str = None):
    """Log agent action"""
    msg = f"Agent [{agent_name}] - Action: {action}"
    if details:
        msg += f" - {details}"
    logger.info(msg)

def log_error(error: Exception, context: str = None):
    """Log error with context"""
    msg = f"Error: {str(error)}"
    if context:
        msg = f"{context} - {msg}"
    logger.error(msg, exc_info=True)
