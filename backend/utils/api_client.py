"""
API client for making authenticated requests to the backend
"""
import os
from typing import Optional, Dict, Any
import httpx
from fastapi import HTTPException, status

API_BASE_URL = os.getenv("API_BASE_URL", "http://localhost:8000")


async def make_authenticated_request(
    method: str,
    endpoint: str,
    token: str,
    data: Optional[Dict[str, Any]] = None,
    files: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Make an authenticated request to the API
    
    Args:
        method: HTTP method (GET, POST, PUT, DELETE)
        endpoint: API endpoint (e.g., "/api/chat")
        token: JWT authentication token
        data: Request body data
        files: Files to upload
        
    Returns:
        Response data as dictionary
        
    Raises:
        HTTPException: If request fails
    """
    
    headers = {
        "Authorization": f"Bearer {token}"
    }
    
    url = f"{API_BASE_URL}{endpoint}"
    
    async with httpx.AsyncClient() as client:
        try:
            if method.upper() == "GET":
                response = await client.get(url, headers=headers)
            elif method.upper() == "POST":
                if files:
                    response = await client.post(url, headers=headers, files=files)
                else:
                    response = await client.post(url, headers=headers, json=data)
            elif method.upper() == "PUT":
                response = await client.put(url, headers=headers, json=data)
            elif method.upper() == "DELETE":
                response = await client.delete(url, headers=headers)
            else:
                raise ValueError(f"Unsupported HTTP method: {method}")
            
            response.raise_for_status()
            return response.json()
            
        except httpx.HTTPStatusError as e:
            if e.response.status_code == 401:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Authentication failed. Please login again."
                )
            raise HTTPException(
                status_code=e.response.status_code,
                detail=str(e)
            )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=str(e)
            )
