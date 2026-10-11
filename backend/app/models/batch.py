"""溯源批次（Batch）模型。"""

from sqlalchemy import ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin


class Batch(Base, TimestampMixin):
    """溯源批次。

    最小批次 = 地块 + 采收日期 + 品种。
    """

    __tablename__ = "batches"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    tenant_id: Mapped[int] = mapped_column(ForeignKey("tenants.id"), index=True, nullable=False)
    planting_id: Mapped[int] = mapped_column(ForeignKey("plantings.id"), index=True, nullable=False)
    harvest_id: Mapped[int] = mapped_column(
        ForeignKey("harvest_records.id"), unique=True, index=True, nullable=False
    )

    code: Mapped[str] = mapped_column(String(64), unique=True, index=True, nullable=False)
    product_name: Mapped[str] = mapped_column(String(128), nullable=False)
    variety: Mapped[str | None] = mapped_column(String(64), default=None)
    origin: Mapped[str | None] = mapped_column(String(255), default=None)
    status: Mapped[str] = mapped_column(String(16), default="已建批次", nullable=False)
    # 已建批次 / 已加工 / 在途 / 已上架 / 已下架

    # 预留：未来对接区块链
    chain_tx: Mapped[str | None] = mapped_column(String(128), default=None)
    evidence_hashes: Mapped[str | None] = mapped_column(Text, default=None)  # JSON 字符串

    harvest = relationship("HarvestRecord", back_populates="batch")
    planting = relationship("Planting", back_populates="batches")