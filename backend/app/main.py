"""
BAIKAL RPA AI  –  FastAPI Application Entry Point
"""
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.db import engine, Base

# Import ALL models so they are registered with Base.metadata
from app.models import User, Document, Automation, AutomationRun, File  # noqa: F401


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create tables on startup (dev convenience; prod should use migrations)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield


app = FastAPI(title=settings.APP_TITLE, version=settings.APP_VERSION, lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---- Routers ----
from app.modules.auth.router import router as auth_router
from app.modules.ai.router import router as ai_router
from app.modules.docs.router import router as docs_router
from app.modules.rpa.router import router as rpa_router

app.include_router(auth_router)
app.include_router(ai_router)
app.include_router(docs_router)
app.include_router(rpa_router)


@app.get("/health")
async def health():
    return {"status": "ok", "app": settings.APP_TITLE}
