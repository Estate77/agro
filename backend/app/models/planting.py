"""种植季（Planting）模型。"""

from datetime import date

from sqlalchemy import Date, Float, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin


class Planting(Base, TimestampMixin):
    """种植季：地块在某时间段内的种植活动。"""

    __tablename__ = "plantings"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    tenant_id: Mapped[int] = mapped_column(ForeignKey("tenants.id"), index=True, nullable=False)
    block_id: Mapped[int] = mapped_column(ForeignKey("blocks.id"), index=True, nullable=False)

    season: Mapped[str] = mapped_column(String(32), nullable=False)  # 如 "2026 春"
    crop: Mapped[str] = mapped_column(String(64), nullable=False)
    variety: Mapped[str | None] = mapped_column(String(64), default=None)
    start_date: Mapped[date] = mapped_column(Date, nullable=False)
    end_date: Mapped[date | None] = mapped_column(Date, default=None)
    expected_yield_kg: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    status: Mapped[str] = mapped_column(String(16), default="种植中", nullable=False)
    # 种植中 / 已收获 / 已归档

    block = relationship("Block", back_populates="plantings")
    tasks = relationship("FarmworkTask", back_populates="planting", cascade="all, delete-orphan")
    harvests = relationship("HarvestRecord", back_populates="planting", cascade="all, delete-orphan")
    batches = relationship("Batch", back_populates="planting")