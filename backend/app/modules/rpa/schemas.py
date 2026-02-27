from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from datetime import datetime


class AutomationCreate(BaseModel):
    name: str
    type: str
    config: Dict[str, Any] = {}
    schedule_enabled: bool = False
    schedule_cron: Optional[str] = None


class AutomationOut(BaseModel):
    id: str
    user_id: str
    name: str
    type: str
    config: Dict[str, Any]
    schedule_enabled: bool
    schedule_cron: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class RunOut(BaseModel):
    id: str
    automation_id: str
    status: str
    log: str
    result_payload: Optional[Dict[str, Any]]
    started_at: Optional[datetime]
    finished_at: Optional[datetime]

    class Config:
        from_attributes = True
