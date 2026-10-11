"""地块 schemas。"""

from datetime import datetime

from pydantic import BaseModel, Field

from app.schemas.common import ORMBase


class BlockBase(BaseModel):
    code: str = Field(..., min_length=1, max_length=64)
    name: str = Field(..., min_length=1, max_length=128)
    geometry_wkt: str | None = None
    crop: str | None = None
    variety: str | None = None
    area_mu: float = Field(0.0, ge=0)
    owner_org: str | None = None


class BlockCreate(BlockBase):
    pass


class BlockUpdate(BaseModel):
    name: str | None = None
    geometry_wkt: str | None = None
    crop: str | None = None
    variety: str | None = None
    area_mu: float | None = Field(default=None, ge=0)
    owner_org: str | None = None


class BlockOut(ORMBase):
    id: int
    tenant_id: int
    code: str
    name: str
    geometry_wkt: str | None
    crop: str | None
    variety: str | None
    area_mu: float
    owner_org: str | None
    current_planting_id: int | None
    created_at: datetime
    updated_at: datetime