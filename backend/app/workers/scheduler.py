"""
Celery Beat Scheduler – 정기 실행 자동화 스케줄링
Reads automations with schedule_enabled=True from DB and registers them.
Runs every 60 seconds to pick up changes.
"""
from celery import Celery
from celery.schedules import crontab
from app.workers.celery_app import celery_app
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
import os, re

DATABASE_URL_SYNC = os.getenv(
    "DATABASE_URL", "postgresql+asyncpg://baikal:baikal1234@postgres:5432/baikal_rpa"
).replace("asyncpg", "psycopg2")

sync_engine = create_engine(DATABASE_URL_SYNC)
SyncSession = sessionmaker(bind=sync_engine)


def parse_cron(expr: str):
    """Parse '분 시 일 월 요일' into celery crontab kwargs."""
    parts = expr.strip().split()
    if len(parts) != 5:
        return None
    return crontab(
        minute=parts[0],
        hour=parts[1],
        day_of_month=parts[2],
        month_of_year=parts[3],
        day_of_week=parts[4],
    )


def load_schedules():
    """Load scheduled automations from DB and register with beat."""
    session = SyncSession()
    try:
        rows = session.execute(
            text("SELECT id, type, config, schedule_cron FROM automations WHERE schedule_enabled = true AND schedule_cron IS NOT NULL")
        ).fetchall()
        beat_schedule = {}
        for row in rows:
            auto_id, auto_type, config, cron_expr = str(row[0]), row[1], row[2], row[3]
            schedule = parse_cron(cron_expr)
            if schedule:
                # We create a new run record inline so the task has a run_id
                run_id_row = session.execute(
                    text(
                        "INSERT INTO automation_runs (automation_id, status) VALUES (:aid, 'queued') RETURNING id"
                    ),
                    {"aid": auto_id},
                ).fetchone()
                session.commit()
                beat_schedule[f"scheduled-{auto_id}"] = {
                    "task": "execute_automation",
                    "schedule": schedule,
                    "args": [str(run_id_row[0]), auto_id, auto_type, config or {}],
                }
        celery_app.conf.beat_schedule = beat_schedule
    finally:
        session.close()


# Run on import so beat picks up schedules; re-run periodically
load_schedules()
