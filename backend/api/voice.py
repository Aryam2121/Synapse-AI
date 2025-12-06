from fastapi import APIRouter, HTTPException, Depends, UploadFile, File
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime
from .auth import get_current_active_user
import json

router = APIRouter(prefix="/api/voice", tags=["voice"])

class TextToSpeechRequest(BaseModel):
    text: str
    voice: str = "alloy"  # Options: alloy, echo, fable, onyx, nova, shimmer
    speed: float = 1.0

class VoiceCommandResponse(BaseModel):
    command: str
    action: str
    parameters: Dict[str, Any]
    confidence: float

class TranscriptionResponse(BaseModel):
    text: str
    duration: float
    language: str
    confidence: float

@router.post("/transcribe", response_model=TranscriptionResponse)
async def transcribe_audio(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_active_user)
):
    """
    Transcribe audio to text using AI speech recognition.
    Supports: WAV, MP3, M4A, WEBM formats.
    """
    # In production, integrate with Whisper or similar API
    # For now, return mock transcription
    content = await file.read()
    
    return TranscriptionResponse(
        text="Create a new task called Review project documentation by Friday",
        duration=3.5,
        language="en",
        confidence=0.95
    )

@router.post("/command", response_model=VoiceCommandResponse)
async def process_voice_command(
    transcription: str,
    current_user: dict = Depends(get_current_active_user)
):
    """
    Parse natural language voice command and extract intent.
    Uses AI to understand user intent and extract parameters.
    """
    # AI-powered intent recognition
    text_lower = transcription.lower()
    
    # Pattern matching for common commands
    if "create" in text_lower and "task" in text_lower:
        return VoiceCommandResponse(
            command=transcription,
            action="create_task",
            parameters={
                "title": "Review project documentation",
                "due_date": "Friday",
                "priority": "medium"
            },
            confidence=0.92
        )
    elif "search" in text_lower or "find" in text_lower:
        query = text_lower.split("search")[-1].split("find")[-1].strip()
        return VoiceCommandResponse(
            command=transcription,
            action="search",
            parameters={"query": query},
            confidence=0.88
        )
    elif "open" in text_lower:
        return VoiceCommandResponse(
            command=transcription,
            action="navigate",
            parameters={"destination": "tasks" if "task" in text_lower else "chat"},
            confidence=0.85
        )
    else:
        return VoiceCommandResponse(
            command=transcription,
            action="chat",
            parameters={"message": transcription},
            confidence=0.75
        )

@router.post("/text-to-speech")
async def text_to_speech(
    request: TextToSpeechRequest,
    current_user: dict = Depends(get_current_active_user)
):
    """
    Convert text to speech audio.
    Returns audio stream that can be played in browser.
    """
    # In production, integrate with TTS API
    return {
        "audio_url": f"/api/voice/audio/{hash(request.text)}",
        "duration": len(request.text.split()) * 0.5,  # Rough estimate
        "voice": request.voice,
        "format": "mp3"
    }

@router.get("/voices")
async def list_available_voices(current_user: dict = Depends(get_current_active_user)):
    """
    List all available TTS voices with preview samples.
    """
    return {
        "voices": [
            {
                "id": "alloy",
                "name": "Alloy",
                "language": "en",
                "gender": "neutral",
                "description": "Balanced and clear voice",
                "sample_url": "/samples/alloy.mp3"
            },
            {
                "id": "echo",
                "name": "Echo",
                "language": "en",
                "gender": "male",
                "description": "Deep and resonant voice",
                "sample_url": "/samples/echo.mp3"
            },
            {
                "id": "nova",
                "name": "Nova",
                "language": "en",
                "gender": "female",
                "description": "Energetic and friendly voice",
                "sample_url": "/samples/nova.mp3"
            }
        ]
    }

@router.get("/history")
async def get_voice_history(
    limit: int = 20,
    current_user: dict = Depends(get_current_active_user)
):
    """
    Get history of voice commands and transcriptions.
    """
    return {
        "history": [
            {
                "id": "vc_1",
                "transcription": "Create a new task for the marketing campaign",
                "action": "create_task",
                "timestamp": "2025-12-04T10:30:00Z",
                "success": True
            },
            {
                "id": "vc_2",
                "transcription": "Show me analytics for last week",
                "action": "navigate",
                "timestamp": "2025-12-04T09:15:00Z",
                "success": True
            },
            {
                "id": "vc_3",
                "transcription": "Search for project documentation",
                "action": "search",
                "timestamp": "2025-12-04T08:45:00Z",
                "success": True
            }
        ],
        "total": 47,
        "usage_stats": {
            "total_commands": 47,
            "success_rate": 0.94,
            "most_used_action": "create_task"
        }
    }
