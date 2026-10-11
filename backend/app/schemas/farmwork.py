"""农事任务 schemas。"""

from datetime import date, datetime
from typing import Any

from pydantic import BaseModel, Field

from app.schemas.common import ORMBase


class CheckInEvidence(BaseModel):
    """打卡留痕证据（照片/视频元数据）。"""

    type: str = "photo"  # photo / video / note
    name: str | None = None
    data_url: str | None = None  # 演示：小图 base64（压缩后）
    ts: str | None = None


class CheckInIn(BaseModel):
    """APP 扫码/任务打卡请求。"""

    phase: str = Field(..., pattern="^(before|after)$", description="任务前/任务后")
    evidences: list[CheckInEvidence] = Field(default_factory=list)
    note: str | None = None
    geo: str | None = None
    assignee: str | None = None


class FarmworkTaskCreate(BaseModel):
    planting_id: int
    type: str
    plan_date: date
    assignee: str | None = None
    geo: str | None = None
    note: str | None = None


class FarmworkTaskUpdate(BaseModel):
    type: str | None = None
    plan_date: date | None = None
    status: str | None = None
    assignee: str | None = None
    geo: str | None = None
    evidences: list[dict[str, Any]] | None = None
    note: str | None = None


class FarmworkTaskOut(ORMBase):
    id: int
    tenant_id: int
    planting_id: int
    type: str
    plan_date: date
    status: str
    assignee: str | None
    geo: str | None
    evidences: list[Any]
    note: str | None
    completed_at: datetime | None
    created_at: datetime
    updated_at: datetime