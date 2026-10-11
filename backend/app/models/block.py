"""地块（Block）模型。业务中枢，向下连接设备/农事/批次。"""

from sqlalchemy import Float, ForeignKey, Index, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin


class Block(Base, TimestampMixin):
    """地块：业务中枢。"""

    __tablename__ = "blocks"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    tenant_id: Mapped[int] = mapped_column(ForeignKey("tenants.id"), index=True, nullable=False)
    code: Mapped[str] = mapped_column(String(64), index=True, nullable=False)
    name: Mapped[str] = mapped_column(String(128), nullable=False)

    # 简化：用 4 边形顶点字符串代替 geometry（WKT）。
    geometry_wkt: Mapped[str | None] = mapped_column(Text, default=None)

    # 业务字段
    crop: Mapped[str | None] = mapped_column(String(64), default=None)  # 作物
    variety: Mapped[str | None] = mapped_column(String(64), default=None)  # 品种
    area_mu: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)  # 亩
    owner_org: Mapped[str | None] = mapped_column(String(128), default=None)
    current_planting_id: Mapped[int | None] = mapped_column(Integer, default=None)

    plantings = relationship("Planting", back_populates="block", lazy="selectin")

    __table_args__ = (
        Index("ix_blocks_tenant_code", "tenant_id", "code", unique=True),
    )