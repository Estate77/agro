"""审计日志模型。"""

from datetime import datetime
from datetime import timezone as _tz

from sqlalchemy import JSON, DateTime, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class AuditLog(Base):
    """审计日志：写操作留痕。"""

    __tablename__ = "audit_logs"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    tenant_id: Mapped[int | None] = mapped_column(Integer, index=True, default=None)
    user_id: Mapped[int | None] = mapped_column(Integer, index=True, default=None)
    action: Mapped[str] = mapped_column(String(32), index=True, nullable=False)  # CREATE/UPDATE/DELETE/LOGIN
    resource: Mapped[str] = mapped_column(String(64), index=True, nullable=False)  # 资源名，如 user/block
    resource_id: Mapped[str | None] = mapped_column(String(64), default=None)
    payload: Mapped[dict] = mapped_column(JSON, default=dict, nullable=False)
    ip: Mapped[str | None] = mapped_column(String(64), default=None)
    user_agent: Mapped[str | None] = mapped_column(String(255), default=None)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(_tz.utc), nullable=False
    )