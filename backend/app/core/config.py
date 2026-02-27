"""
BAIKAL RPA AI – Core Configuration
"""
from pydantic_settings import BaseSettings
from typing import List
import json, os


class Settings(BaseSettings):
    # Database (SQLite for local dev, PostgreSQL for Docker)
    DATABASE_URL: str = "sqlite+aiosqlite:///./baikal_rpa.db"

    # Redis
    REDIS_URL: str = "redis://redis:6379/0"

    # JWT
    JWT_SECRET: str = "change-me"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 480

    # AI
    AI_PROVIDER: str = "openai"  # "openai" | "ollama"
    OPENAI_API_KEY: str = ""
    OPENAI_MODEL: str = "gpt-3.5-turbo"
    OLLAMA_BASE_URL: str = "http://host.docker.internal:11434"
    OLLAMA_MODEL: str = "llama3"

    # App
    APP_TITLE: str = "BAIKAL RPA AI"
    APP_VERSION: str = "0.1.0"
    CORS_ORIGINS: str = '["http://localhost:3000","http://localhost:5173"]'

    @property
    def cors_origin_list(self) -> List[str]:
        return json.loads(self.CORS_ORIGINS)

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"


settings = Settings()
