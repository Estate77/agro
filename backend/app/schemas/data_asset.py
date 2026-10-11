"""数据资产 schemas。"""

from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.common import ORMBase


class SchemaField(BaseModel):
    """字段定义。"""

    name: str
    type: str  # int / string / float / bool / datetime / json
    primary: bool = False
    sensitive: bool = False
    on_chain: bool = False
    description: str | None = None


class DataAssetBase(BaseModel):
    code: str = Field(..., min_length=2, max_length=64)
    name: str
    domain: str
    dataset: str
    description: str | None = None
    schema_json: list[SchemaField] = Field(default_factory=list)
    refresh_freq: str = "日"
    source_system: str | None = None
    owner: str | None = None
    sla: str | None = None
    share_scope: str = "内部"
    pricing: str | None = None
    value_score: float = Field(0.0, ge=0, le=100)


class DataAssetCreate(DataAssetBase):
    pass


class DataAssetUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    schema_json: list[SchemaField] | None = None
    refresh_freq: str | None = None
    source_system: str | None = None
    owner: str | None = None
    sla: str | None = None
    share_scope: str | None = None
    pricing: str | None = None
    value_score: float | None = Field(default=None, ge=0, le=100)


class DataAssetOut(ORMBase):
    id: int
    tenant_id: int
    code: str
    name: str
    domain: str
    dataset: str
    description: str | None
    schema_json: list[dict[str, Any]]
    refresh_freq: str
    source_system: str | None
    owner: str | None
    sla: str | None
    share_scope: str
    pricing: str | None
    value_score: float
    quality_score: float
    is_certified: bool
    cert_hash: str | None
    created_at: datetime
    updated_at: datetime


class DataAssetDetail(DataAssetOut):
    qualities: list["DataAssetQualityOut"] = []


class DataAssetQualityCreate(BaseModel):
    completeness: float = Field(..., ge=0, le=100)
    accuracy: float = Field(..., ge=0, le=100)
    timeliness: float = Field(..., ge=0, le=100)
    consistency: float = Field(..., ge=0, le=100)
    notes: str | None = None


class DataAssetQualityOut(ORMBase):
    id: int
    asset_id: int
    check_date: datetime
    completeness: float
    accuracy: float
    timeliness: float
    consistency: float
    notes: str | None


# 解决前向引用
DataAssetDetail.model_rebuild()