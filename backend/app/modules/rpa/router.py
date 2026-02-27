"""
RPA Router  –  /automations CRUD + execute + runs
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File as FastFile
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.db import get_db
from app.core.security import get_current_user
from app.models import User, Automation, AutomationRun, File
from app.modules.rpa.schemas import AutomationCreate, AutomationOut, RunOut
import os, uuid as _uuid, threading

router = APIRouter(prefix="/automations", tags=["RPA / Automations"])

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "..", "uploads")


# ---------- CRUD ----------
@router.post("/", response_model=AutomationOut, status_code=201)
async def create_automation(
    body: AutomationCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    auto = Automation(
        user_id=current_user.id,
        name=body.name,
        type=body.type,
        config=body.config,
        schedule_enabled=body.schedule_enabled,
        schedule_cron=body.schedule_cron,
    )
    db.add(auto)
    await db.flush()
    await db.refresh(auto)
    return auto


@router.get("/", response_model=List[AutomationOut])
async def list_automations(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Automation).where(Automation.user_id == current_user.id).order_by(Automation.created_at.desc())
    )
    return result.scalars().all()


@router.get("/{auto_id}", response_model=AutomationOut)
async def get_automation(
    auto_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Automation).where(Automation.id == auto_id, Automation.user_id == current_user.id)
    )
    auto = result.scalar_one_or_none()
    if not auto:
        raise HTTPException(404, "Automation not found")
    return auto


@router.delete("/{auto_id}", status_code=204)
async def delete_automation(
    auto_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Automation).where(Automation.id == auto_id, Automation.user_id == current_user.id)
    )
    auto = result.scalar_one_or_none()
    if not auto:
        raise HTTPException(404, "Automation not found")
    await db.delete(auto)


# ---------- Execute ----------
@router.post("/{auto_id}/run", response_model=RunOut, status_code=202)
async def run_automation(
    auto_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Automation).where(Automation.id == auto_id, Automation.user_id == current_user.id)
    )
    auto = result.scalar_one_or_none()
    if not auto:
        raise HTTPException(404, "Automation not found")

    run = AutomationRun(automation_id=auto.id, status="queued")
    db.add(run)
    await db.flush()
    await db.refresh(run)

    # Dispatch in background thread (no Celery/Redis needed for local dev)
    from app.workers.local_runner import run_automation_sync
    t = threading.Thread(target=run_automation_sync, args=(str(run.id), str(auto.id), auto.type, auto.config), daemon=True)
    t.start()

    return run


# ---------- Runs ----------
@router.get("/{auto_id}/runs", response_model=List[RunOut])
async def list_runs(
    auto_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(AutomationRun).where(AutomationRun.automation_id == auto_id).order_by(AutomationRun.started_at.desc())
    )
    return result.scalars().all()


@router.get("/{auto_id}/runs/{run_id}", response_model=RunOut)
async def get_run(
    auto_id: str,
    run_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(AutomationRun).where(AutomationRun.id == run_id, AutomationRun.automation_id == auto_id)
    )
    run = result.scalar_one_or_none()
    if not run:
        raise HTTPException(404, "Run not found")
    return run


# ---------- File upload (for excel_process) ----------
@router.post("/upload", status_code=201)
async def upload_file(
    file: UploadFile = FastFile(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    ext = os.path.splitext(file.filename)[1]
    filename = f"{_uuid.uuid4()}{ext}"
    path = os.path.join(UPLOAD_DIR, filename)
    content = await file.read()
    with open(path, "wb") as f:
        f.write(content)

    db_file = File(
        user_id=current_user.id,
        file_type=ext.lstrip("."),
        storage_path=path,
    )
    db.add(db_file)
    await db.flush()
    await db.refresh(db_file)
    return {"file_id": str(db_file.id), "storage_path": path, "filename": file.filename}
