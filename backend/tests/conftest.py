"""共享 pytest fixtures。"""

import os
import tempfile

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# 测试用临时数据库
_test_db = tempfile.NamedTemporaryFile(suffix=".db", delete=False)
_test_db.close()
os.environ["DATABASE_URL"] = f"sqlite:///{_test_db.name}"
os.environ["JWT_SECRET"] = "test-secret"

from app.core.config import settings  # noqa: E402
from app.db.base import Base  # noqa: E402
from app.db.session import get_db  # noqa: E402
from app.main import create_app  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402

engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False},
    future=True,
)
TestingSession = sessionmaker(bind=engine, autoflush=False, autocommit=False)


@pytest.fixture(scope="session")
def app():
    Base.metadata.create_all(bind=engine)
    return create_app()


@pytest.fixture()
def client(app):
    return TestClient(app)


@pytest.fixture()
def db():
    session = TestingSession()
    try:
        yield session
    finally:
        session.close()