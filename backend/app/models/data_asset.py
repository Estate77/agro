"""数据资产（DataAsset）模型。

对应《产品提示词-PC端》§5.9 数据资产管理模块。每个数据集（地块、种植季、批次等）都要登记一条 DataAsset。
"""

from datetime import datetime
from datetime import timezone as _tz

from sqlalchemy import JSON, Boolean, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin


class DataAsset(Base, TimestampMixin):
    """数据资产。

    字段定义（v0.1 简化版）：
    - dataset: 业务域/数据集名，如 "block_basic"
    - domain: 业务域（地块/作物/设备/农事/溯源/碳/财务）
    - schema_json: 字段定义列表（JSON 数组）
    - refresh_freq: 实时 / 日 / 周 / 月
    - quality_rules: 质量规则描述
    - share_scope: 公开 / 授权 / 内部
    - value_score: 0–100
    """

    __tablename__ = "data_assets"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    tenant_id: Mapped[int] = mapped_column(ForeignKey("tenants.id"), index=True, nullable=False)

    code: Mapped[str] = mapped_column(String(64), index=True, nullable=False)
    name: Mapped[str] = mapped_column(String(128), nullable=False)
    domain: Mapped[str] = mapped_column(String(32), index=True, nullable=False)
    dataset: Mapped[str] = mapped_column(String(64), index=True, nullable=False)

    description: Mapped[str | None] = mapped_column(Text, default=None)
    schema_json: Mapped[list] = mapped_column(JSON, default=list, nullable=False)
    refresh_freq: Mapped[str] = mapped_column(String(16), default="日", nullable=False)

    # 口径与责任人
    source_system: Mapped[str | None] = mapped_column(String(64), default=None)
    owner: Mapped[str | None] = mapped_column(String(64), default=None)
    sla: Mapped[str | None] = mapped_column(String(255), default=None)

    # 共享策略
    share_scope: Mapped[str] = mapped_column(String(16), default="内部", nullable=False)
    pricing: Mapped[str | None] = mapped_column(String(255), default=None)

    # 评估
    value_score: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    quality_score: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    cert_hash: Mapped[str | None] = mapped_column(String(128), default=None)  # 入库存证哈希
    is_certified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    qualities = relationship("DataAssetQuality", back_populates="asset", cascade="all, delete-orphan")


class DataAssetQuality(Base):
    """数据资产质量稽核记录。"""

    __tablename__ = "data_asset_qualities"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    asset_id: Mapped[int] = mapped_column(
        ForeignKey("data_assets.id", ondelete="CASCADE"), index=True, nullable=False
    )
    check_date: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(_tz.utc), nullable=False
    )
    completeness: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)  # 完整率
    accuracy: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)  # 准确率
    timeliness: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)  # 及时率
    consistency: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)  # 一致性
    notes: Mapped[str | None] = mapped_column(Text, default=None)

    asset = relationship("DataAsset", back_populates="qualities")