"""租户（Tenant）模型。多租户隔离的最上层单位。"""

from sqlalchemy import Boolean, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin


class Tenant(Base, TimestampMixin):
    """租户：园区运营方、合作社、企业、政府单位。"""

    __tablename__ = "tenants"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    code: Mapped[str] = mapped_column(String(64), unique=True, index=True, nullable=False)
    name: Mapped[str] = mapped_column(String(128), nullable=False)
    tenant_type: Mapped[str] = mapped_column(String(32), default="B", nullable=False)  # B/C/G
    contact_name: Mapped[str | None] = mapped_column(String(64), default=None)
    contact_phone: Mapped[str | None] = mapped_column(String(32), default=None)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    users = relationship("User", back_populates="tenant", cascade="all, delete-orphan")