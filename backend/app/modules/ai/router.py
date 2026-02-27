"""
AI Router  –  POST /ai/chat
"""
from fastapi import APIRouter, Depends
from app.core.security import get_current_user
from app.models import User
from app.modules.ai.schemas import ChatRequest, ChatResponse
from app.integrations.ai_adapter import ai_chat

router = APIRouter(prefix="/ai", tags=["AI Assistant"])


@router.post("/chat", response_model=ChatResponse)
async def chat(body: ChatRequest, current_user: User = Depends(get_current_user)):
    reply = await ai_chat(body.message, body.history)
    return ChatResponse(reply=reply)
