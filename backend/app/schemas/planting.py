"""种植季 schemas。"""

from datetime import date, datetime

from pydantic import BaseModel, Field

from app.schemas.common import ORMBase


class PlantingCreate(BaseModel):
    block_id: int
    season: str
    crop: str
    variety: str | None = None
    start_date: date
    end_date: date | None = None
    expected_yield_kg: float = Field(0.0, ge=0)


class PlantingOut(ORMBase):
    id: int
    tenant_id: int
    block_id: int
    season: str
    crop: str
    variety: str | None
    start_date: date
    end_date: date | None
    expected_yield_kg: float
    status: str
    created_at: datetime
    updated_at: datetime