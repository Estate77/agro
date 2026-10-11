"""应用配置。全部从环境变量加载，提供类型安全的访问入口。"""

from functools import lru_cache
from typing import List

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """应用设置。"""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
    )

    # 基础
    ENVIRONMENT: str = "dev"
    APP_NAME: str = "智耘云 PC 端"

    # 数据库
    DATABASE_URL: str = "sqlite:///./app.db"

    # JWT
    JWT_SECRET: str = "dev-secret-change-me-in-prod"
    JWT_ALG: str = "HS256"
    ACCESS_TOKEN_TTL_MIN: int = 60
    REFRESH_TOKEN_TTL_DAY: int = 7

    # CORS
    CORS_ORIGINS: str = "http://localhost:8080,http://localhost:5173"

    # 审计
    AUDIT_ENABLED: bool = True

    @field_validator("CORS_ORIGINS")
    @classmethod
    def _strip_origins(cls, v: str) -> str:
        return v.strip()

    @property
    def cors_origins_list(self) -> List[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()


# 全局访问点
settings = get_settings()