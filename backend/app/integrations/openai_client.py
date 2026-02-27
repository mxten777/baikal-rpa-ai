"""
OpenAI Client – chat completion wrapper
"""
from openai import AsyncOpenAI
from app.core.config import settings
from typing import List, Dict

_client = None


def _get_client() -> AsyncOpenAI:
    global _client
    if _client is None:
        _client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
    return _client


async def openai_chat(messages: List[Dict[str, str]], model: str | None = None) -> str:
    client = _get_client()
    resp = await client.chat.completions.create(
        model=model or settings.OPENAI_MODEL,
        messages=messages,
        temperature=0.7,
        max_tokens=2048,
    )
    return resp.choices[0].message.content or ""
