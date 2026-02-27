from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime


class DocGenerateRequest(BaseModel):
    doc_type: str
    title: str
    content_prompt: str


class DocOut(BaseModel):
    id: str
    user_id: str
    doc_type: str
    title: str
    input_payload: Dict[str, Any]
    output_content: str
    created_at: datetime

    class Config:
        from_attributes = True
