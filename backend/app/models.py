"""
BAIKAL RPA AI – SQLAlchemy Models
"""
import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, Text, ForeignKey, DateTime, JSON
from app.core.db import Base


def utcnow():
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(255), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    name = Column(String(100), nullable=False)
    role = Column(String(20), nullable=False, default="user")
    created_at = Column(DateTime, default=utcnow)


class Document(Base):
    __tablename__ = "documents"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    doc_type = Column(String(50), nullable=False)
    title = Column(String(500), nullable=False)
    input_payload = Column(JSON, nullable=False, default={})
    output_content = Column(Text, nullable=False, default="")
    created_at = Column(DateTime, default=utcnow)


class Automation(Base):
    __tablename__ = "automations"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    name = Column(String(255), nullable=False)
    type = Column(String(50), nullable=False)
    config = Column(JSON, nullable=False, default={})
    schedule_enabled = Column(Boolean, nullable=False, default=False)
    schedule_cron = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=utcnow)


class AutomationRun(Base):
    __tablename__ = "automation_runs"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    automation_id = Column(String(36), ForeignKey("automations.id"), nullable=False)
    status = Column(String(20), nullable=False, default="queued")
    log = Column(Text, nullable=False, default="")
    result_payload = Column(JSON, nullable=True)
    started_at = Column(DateTime, nullable=True)
    finished_at = Column(DateTime, nullable=True)


class File(Base):
    __tablename__ = "files"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    file_type = Column(String(50), nullable=False)
    storage_path = Column(String(1000), nullable=False)
    created_at = Column(DateTime, default=utcnow)
