"""农事任务（FarmworkTask）与投入品使用（InputUsage）模型。"""

from datetime import date, datetime
from datetime import timezone as _tz

from sqlalchemy import Date, DateTime, Float, ForeignKey, Integer, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin


class FarmworkTask(Base, TimestampMixin):
    """农事任务：耕/播种/施肥/打药/灌溉/修剪/采收。"""

    __tablename__ = "farmwork_tasks"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    tenant_id: Mapped[int] = mapped_column(ForeignKey("tenants.id"), index=True, nullable=False)
    planting_id: Mapped[int] = mapped_column(ForeignKey("plantings.id"), index=True, nullable=False)

    type: Mapped[str] = mapped_column(String(32), nullable=False)  # 任务类型
    plan_date: Mapped[date] = mapped_column(Date, nullable=False)
    status: Mapped[str] = mapped_column(String(16), default="待办", nullable=False)
    # 待办 / 进行中 / 已完成 / 已取消
    assignee: Mapped[str | None] = mapped_column(String(64), default=None)
    geo: Mapped[str | None] = mapped_column(String(128), default=None)  # 简化：经纬度逗号拼接
    evidences: Mapped[list] = mapped_column(JSON, default=list, nullable=False)  # 照片/视频URL列表
    note: Mapped[str | None] = mapped_column(Text, default=None)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), default=None)

    planting = relationship("Planting", back_populates="tasks")
    input_usages = relationship("InputUsage", back_populates="task", cascade="all, delete-orphan")


class InputUsage(Base):
    """投入品使用：化肥/农药/种子/饲料。"""

    __tablename__ = "input_usages"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    tenant_id: Mapped[int] = mapped_column(ForeignKey("tenants.id"), index=True, nullable=False)
    task_id: Mapped[int] = mapped_column(ForeignKey("farmwork_tasks.id"), index=True, nullable=False)

    name: Mapped[str] = mapped_column(String(64), nullable=False)
    batch_no: Mapped[str | None] = mapped_column(String(64), default=None)
    dosage: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    unit: Mapped[str] = mapped_column(String(16), default="kg", nullable=False)
    withdraw_period_days: Mapped[int] = mapped_column(Integer, default=0, nullable=False)  # 休药期
    used_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(_tz.utc), nullable=False
    )

    task = relationship("FarmworkTask", back_populates="input_usages")