"""数据库引擎、会话工厂、FastAPI 依赖。"""

from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import settings


def _make_engine(url: str):
    """根据 url 选择 sqlite 或其它方言的引擎参数。"""
    if url.startswith("sqlite"):
        return create_engine(
            url,
            connect_args={"check_same_thread": False},
            future=True,
            echo=False,
        )
    return create_engine(url, pool_pre_ping=True, future=True, echo=False)


engine = _make_engine(settings.DATABASE_URL)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)


def get_db() -> Generator[Session, None, None]:
    """FastAPI 依赖：每次请求一个 Session。"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()