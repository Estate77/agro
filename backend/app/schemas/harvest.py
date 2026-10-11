"""采收 schemas。"""

from datetime import datetime

from pydantic import BaseModel, Field

from app.schemas.common import ORMBase


class HarvestCreate(BaseModel):
    planting_id: int
    batch_code: str | None = None  # 不传则自动生成
    weight_kg: float = Field(..., gt=0)
    quality_grade: str = "A"
    geo: str | None = None
    operator: str | None = None


class HarvestOut(ORMBase):
    id: int
    tenant_id: int
    planting_id: int
    batch_code: str
    weight_kg: float
    quality_grade: str
    geo: str | None
    operator: str | None
    harvested_at: datetime
    created_at: datetime