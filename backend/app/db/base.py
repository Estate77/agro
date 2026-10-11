"""SQLAlchemy 声明基类 + 时间戳混入。

不要在这里 import 具体模型，避免循环导入。
"""

from datetime import datetime as _dt
from datetime import timezone

from sqlalchemy import DateTime
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    """统一基类。"""

    pass


class TimestampMixin:
    """通用时间戳字段。"""

    created_at: Mapped[_dt] = mapped_column(
        DateTime(timezone=True),
        default=lambda: _dt.now(timezone.utc),
        nullable=False,
    )
    updated_at: Mapped[_dt] = mapped_column(
        DateTime(timezone=True),
        default=lambda: _dt.now(timezone.utc),
        onupdate=lambda: _dt.now(timezone.utc),
        nullable=False,
    )


__all__ = ["Base", "TimestampMixin"]