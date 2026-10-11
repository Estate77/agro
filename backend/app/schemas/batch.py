"""批次 schemas。"""

from datetime import date, datetime

from pydantic import BaseModel, ConfigDict

from app.schemas.common import ORMBase


class BatchCreate(BaseModel):
    """手动创建批次（通常由采收触发，无需前端调用）。"""

    harvest_id: int


class BatchOut(ORMBase):
    id: int
    tenant_id: int
    planting_id: int
    harvest_id: int
    code: str
    product_name: str
    variety: str | None
    origin: str | None
    status: str
    chain_tx: str | None
    created_at: datetime


class BatchPublic(BaseModel):
    """C 端扫码公共页面用（不含租户内部字段）。"""

    model_config = ConfigDict(from_attributes=True)

    code: str
    product_name: str
    variety: str | None
    origin: str | None
    status: str
    harvested_at: datetime | None
    # 溯源故事页扩展字段
    block_name: str | None = None
    block_code: str | None = None
    crop: str | None = None
    planting_start: date | None = None
    season: str | None = None
    operator: str | None = None
    weight_kg: float | None = None
    quality_grade: str | None = None
    cert_chain: str | None = None