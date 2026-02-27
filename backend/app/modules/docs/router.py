"""
Docs Router  –  POST /docs/generate, GET /docs, GET /docs/{id}, DELETE /docs/{id}
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.db import get_db
from app.core.security import get_current_user
from app.models import User, Document
from app.modules.docs.schemas import DocGenerateRequest, DocOut
from app.integrations.ai_adapter import ai_generate_document

router = APIRouter(prefix="/docs", tags=["Documents"])


@router.post("/generate", response_model=DocOut, status_code=201)
async def generate_document(
    body: DocGenerateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Call AI to generate document content
    generated = await ai_generate_document(body.doc_type, body.title, body.content_prompt)

    doc = Document(
        user_id=current_user.id,
        doc_type=body.doc_type,
        title=body.title,
        input_payload={"content_prompt": body.content_prompt},
        output_content=generated,
    )
    db.add(doc)
    await db.flush()
    await db.refresh(doc)
    return doc


@router.get("/", response_model=List[DocOut])
async def list_documents(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Document).where(Document.user_id == current_user.id).order_by(Document.created_at.desc())
    )
    return result.scalars().all()


@router.get("/{doc_id}", response_model=DocOut)
async def get_document(
    doc_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Document).where(Document.id == doc_id, Document.user_id == current_user.id)
    )
    doc = result.scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return doc


@router.delete("/{doc_id}", status_code=204)
async def delete_document(
    doc_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Document).where(Document.id == doc_id, Document.user_id == current_user.id)
    )
    doc = result.scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    await db.delete(doc)
