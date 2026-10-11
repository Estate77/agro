"""采收（HarvestRecord）模型。"""

from datetime import datetime
from datetime import timezone as _tz

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin


class HarvestRecord(Base, TimestampMixin):
    """采收记录。"""

    __tablename__ = "harvest_records"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    tenant_id: Mapped[int] = mapped_column(ForeignKey("tenants.id"), index=True, nullable=False)
    planting_id: Mapped[int] = mapped_column(ForeignKey("plantings.id"), index=True, nullable=False)

    batch_code: Mapped[str] = mapped_column(String(64), index=True, nullable=False)
    weight_kg: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    quality_grade: Mapped[str] = mapped_column(String(16), default="A", nullable=False)
    # A/B/C 或 优/良/合格
    geo: Mapped[str | None] = mapped_column(String(128), default=None)
    operator: Mapped[str | None] = mapped_column(String(64), default=None)
    harvested_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(_tz.utc), nullable=False
    )

    planting = relationship("Planting", back_populates="harvests")
    batch = relationship("Batch", back_populates="harvest", uselist=False)