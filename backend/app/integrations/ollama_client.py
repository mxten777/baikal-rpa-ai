"""
Ollama Client – local LLM via Ollama REST API
"""
import httpx
from app.core.config import settings
from typing import List, Dict


async def ollama_chat(messages: List[Dict[str, str]], model: str | None = None) -> str:
    url = f"{settings.OLLAMA_BASE_URL}/api/chat"
    payload = {
        "model": model or settings.OLLAMA_MODEL,
        "messages": messages,
        "stream": False,
    }
    async with httpx.AsyncClient(timeout=120.0) as client:
        resp = await client.post(url, json=payload)
        resp.raise_for_status()
        data = resp.json()
        return data.get("message", {}).get("content", "")
