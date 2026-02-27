"""
Celery Tasks – RPA 실행 Worker
"""
import traceback
from datetime import datetime, timezone
from app.workers.celery_app import celery_app

# Sync DB session for Celery workers (not async)
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
import os

DATABASE_URL_SYNC = os.getenv(
    "DATABASE_URL", "postgresql+asyncpg://baikal:baikal1234@postgres:5432/baikal_rpa"
).replace("asyncpg", "psycopg2")

sync_engine = create_engine(DATABASE_URL_SYNC)
SyncSession = sessionmaker(bind=sync_engine)


def _get_run(session: Session, run_id: str):
    from app.models import AutomationRun
    return session.query(AutomationRun).filter_by(id=run_id).first()


@celery_app.task(bind=True, name="execute_automation")
def execute_automation(self, run_id: str, automation_id: str, auto_type: str, config: dict):
    session = SyncSession()
    try:
        run = _get_run(session, run_id)
        if not run:
            return {"error": "Run not found"}

        run.status = "running"
        run.started_at = datetime.now(timezone.utc)
        session.commit()

        result = {}
        log_lines = []

        if auto_type == "web_scrape":
            from app.integrations.playwright_runner import run_web_scrape
            result = run_web_scrape(config, log_lines)

        elif auto_type == "excel_process":
            from app.integrations.excel_processor import run_excel_process
            result = run_excel_process(config, log_lines)

        else:
            raise ValueError(f"Unknown automation type: {auto_type}")

        run.status = "success"
        run.result_payload = result
        run.log = "\n".join(log_lines)
        run.finished_at = datetime.now(timezone.utc)
        session.commit()
        return result

    except Exception as e:
        run = _get_run(session, run_id)
        if run:
            run.status = "failed"
            run.log = traceback.format_exc()
            run.finished_at = datetime.now(timezone.utc)
            session.commit()
        raise

    finally:
        session.close()
