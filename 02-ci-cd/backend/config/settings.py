"""
Application Configuration
Centralized configuration management for all environments
"""
import os
from typing import Optional
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings with environment variable support"""

    # Application
    APP_NAME: str = "TechStore"
    APP_VERSION: str = "3.0.0"
    DEBUG: bool = False

    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 5000
    WORKERS: int = 4

    # CORS
    CORS_ORIGINS: list = ["*"]

    # Monitoring
    ENABLE_METRICS: bool = True
    METRICS_PORT: int = 5000

    # Logging
    LOG_LEVEL: str = "INFO"
    LOG_FILE: Optional[str] = "logs/app.log"

    # Database (for future expansion)
    DATABASE_URL: Optional[str] = None

    # Cache
    CACHE_TTL: int = 300  # 5 minutes

    # Security
    SECRET_KEY: str = "your-secret-key-change-in-production"

    # External Services
    PROMETHEUS_URL: str = "http://localhost:19090"
    GRAFANA_URL: str = "http://localhost:3000"

    class Config:
        env_file = ".env"
        case_sensitive = True


# Global settings instance
settings = Settings()
