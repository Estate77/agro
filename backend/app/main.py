"""FastAPI 应用入口。

启动：
    uvicorn app.main:app --reload --port 8000
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1 import api_router
from app.core.config import settings
from app.core.exceptions import register_exception_handlers
from app.db.init_db import init_database


@asynccontextmanager
async def lifespan(app: FastAPI):
    """应用启动时初始化数据库；关闭时无需特殊处理。"""
    init_database()
    yield


def create_app() -> FastAPI:
    """工厂方法，便于测试与多进程启动。"""
    app = FastAPI(
        title="智耘云 PC 端 API",
        version="0.1.0",
        description="智慧农业 PC 端 v0.1 底座（RBAC + 数据资产 + 端到端示例）",
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url="/openapi.json",
        lifespan=lifespan,
    )

    # CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # 全局异常处理
    register_exception_handlers(app)

    # 路由
    app.include_router(api_router, prefix="/api/v1")

    @app.get("/health", tags=["meta"])
    def health() -> dict[str, str]:
        return {"status": "ok", "env": settings.ENVIRONMENT}

    return app


app = create_app()