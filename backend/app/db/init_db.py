"""数据库初始化：触发模型注册后建表。"""

from app.db.base import Base
from app.db.session import engine


def init_database() -> None:
    """根据 metadata 创建所有表。

    生产建议改用 Alembic。
    """
    # 触发所有模型注册到 Base.metadata
    from app import models  # noqa: F401  pylint: disable=import-outside-toplevel

    Base.metadata.create_all(bind=engine)