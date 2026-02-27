"""
Local Runner – Celery/Redis 없이 스레드에서 RPA 작업 실행 (개발용)
"""
import traceback
from datetime import datetime, timezone
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# SQLite sync URL
_sync_url = settings.DATABASE_URL.replace("sqlite+aiosqlite", "sqlite").replace("postgresql+asyncpg", "postgresql+psycopg2")
sync_engine = create_engine(_sync_url, connect_args={"check_same_thread": False} if "sqlite" in _sync_url else {})
SyncSession = sessionmaker(bind=sync_engine)


def run_automation_sync(run_id: str, automation_id: str, auto_type: str, config: dict):
    from app.models import AutomationRun
    session = SyncSession()
    try:
        run = session.query(AutomationRun).filter_by(id=run_id).first()
        if not run:
            return

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

    except Exception:
        run = session.query(AutomationRun).filter_by(id=run_id).first()
        if run:
            run.status = "failed"
            run.log = traceback.format_exc()
            run.finished_at = datetime.now(timezone.utc)
            session.commit()
    finally:
        session.close()
