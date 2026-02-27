"""
AI Adapter – .env 의 AI_PROVIDER 값에 따라 OpenAI / Ollama 자동 전환
"""
from typing import List
from app.core.config import settings

SYSTEM_PROMPT = (
    "당신은 BAIKAL RPA AI 업무 도우미입니다. "
    "한국어로 친절하고 정확하게 답변하세요. "
    "업무 문서 작성, 이메일 작성, 보고서 작성, 공문 작성 등을 도울 수 있습니다."
)

DOC_SYSTEM_PROMPTS = {
    "report": "당신은 전문 보고서 작성 AI입니다. 한국어로 격식 있는 보고서를 작성하세요.",
    "official": "당신은 공문 작성 AI입니다. 공식 문서 형식에 맞게 한국어 공문을 작성하세요.",
    "email": "당신은 비즈니스 이메일 작성 AI입니다. 한국어로 정중한 이메일을 작성하세요.",
}


async def _call(messages: list[dict]) -> str:
    provider = settings.AI_PROVIDER.lower()
    if provider == "ollama":
        from app.integrations.ollama_client import ollama_chat
        return await ollama_chat(messages)
    else:
        from app.integrations.openai_client import openai_chat
        return await openai_chat(messages)


async def ai_chat(message: str, history: list | None = None) -> str:
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    if history:
        for h in history:
            messages.append({"role": h.role, "content": h.content})
    messages.append({"role": "user", "content": message})
    return await _call(messages)


async def ai_generate_document(doc_type: str, title: str, content_prompt: str) -> str:
    system = DOC_SYSTEM_PROMPTS.get(doc_type, SYSTEM_PROMPT)
    messages = [
        {"role": "system", "content": system},
        {
            "role": "user",
            "content": f"제목: {title}\n\n다음 내용을 바탕으로 {doc_type} 문서를 작성해주세요:\n{content_prompt}",
        },
    ]
    return await _call(messages)
