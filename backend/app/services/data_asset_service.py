"""数据资产服务：登记、查询、入库（生成存证哈希）、质量稽核。"""

import hashlib
import json
from datetime import datetime
from datetime import timezone as _tz
from typing import Any

from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session, selectinload

from app.core.exceptions import ConflictError, NotFoundError
from app.models.data_asset import DataAsset, DataAssetQuality
from app.schemas.data_asset import DataAssetCreate, DataAssetQualityCreate, DataAssetUpdate


def _avg_quality(quality: DataAssetQuality | None) -> float:
    if quality is None:
        return 0.0
    return round(
        (quality.completeness + quality.accuracy + quality.timeliness + quality.consistency) / 4.0, 2
    )


def list_assets(
    db: Session,
    tenant_id: int,
    *,
    keyword: str | None = None,
    domain: str | None = None,
    page: int = 1,
    page_size: int = 20,
) -> tuple[list[DataAsset], int]:
    stmt = select(DataAsset).where(DataAsset.tenant_id == tenant_id)
    if keyword:
        kw = f"%{keyword.strip()}%"
        stmt = stmt.where(
            or_(DataAsset.name.like(kw), DataAsset.code.like(kw), DataAsset.dataset.like(kw))
        )
    if domain:
        stmt = stmt.where(DataAsset.domain == domain)
    total = db.scalar(
        select(func.count()).select_from(stmt.subquery())
    ) or 0
    stmt = (
        stmt.options(selectinload(DataAsset.qualities))
        .order_by(DataAsset.id.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
    )
    items = list(db.execute(stmt).scalars().unique().all())
    return items, int(total)


def get_asset(db: Session, asset_id: int, tenant_id: int) -> DataAsset:
    stmt = (
        select(DataAsset)
        .where(DataAsset.id == asset_id, DataAsset.tenant_id == tenant_id)
        .options(selectinload(DataAsset.qualities))
    )
    asset = db.execute(stmt).scalar_one_or_none()
    if asset is None:
        raise NotFoundError("数据资产不存在")
    return asset


def create_asset(db: Session, tenant_id: int, payload: DataAssetCreate) -> DataAsset:
    if (
        db.query(DataAsset)
        .filter(DataAsset.tenant_id == tenant_id, DataAsset.code == payload.code)
        .first()
    ):
        raise ConflictError("数据资产编码已存在")
    asset = DataAsset(
        tenant_id=tenant_id,
        code=payload.code,
        name=payload.name,
        domain=payload.domain,
        dataset=payload.dataset,
        description=payload.description,
        schema_json=[f.model_dump() for f in payload.schema_json],
        refresh_freq=payload.refresh_freq,
        source_system=payload.source_system,
        owner=payload.owner,
        sla=payload.sla,
        share_scope=payload.share_scope,
        pricing=payload.pricing,
        value_score=payload.value_score,
    )
    db.add(asset)
    db.flush()
    return asset


def update_asset(
    db: Session, asset_id: int, tenant_id: int, payload: DataAssetUpdate
) -> DataAsset:
    asset = get_asset(db, asset_id, tenant_id)
    data = payload.model_dump(exclude_unset=True)
    # 仅对非 None 值写回，避免显式 None 误清字段
    for k, v in data.items():
        if v is None and k not in {"description", "source_system", "owner", "sla", "pricing"}:
            continue
        setattr(asset, k, v)
    db.flush()
    return asset


def delete_asset(db: Session, asset_id: int, tenant_id: int) -> None:
    asset = get_asset(db, asset_id, tenant_id)
    db.delete(asset)
    db.flush()


def certify_asset(db: Session, asset_id: int, tenant_id: int) -> DataAsset:
    """入库：计算存证哈希，标记已认证。"""
    asset = get_asset(db, asset_id, tenant_id)
    payload: dict[str, Any] = {
        "id": asset.id,
        "code": asset.code,
        "schema": asset.schema_json,
        "value_score": asset.value_score,
        "ts": datetime.now(_tz.utc).isoformat(),
    }
    digest = hashlib.sha256(json.dumps(payload, ensure_ascii=False, sort_keys=True).encode()).hexdigest()
    asset.cert_hash = digest
    asset.is_certified = True
    db.flush()
    return asset


def add_quality(
    db: Session, asset_id: int, tenant_id: int, payload: DataAssetQualityCreate
) -> DataAssetQuality:
    asset = get_asset(db, asset_id, tenant_id)
    q = DataAssetQuality(
        asset_id=asset.id,
        completeness=payload.completeness,
        accuracy=payload.accuracy,
        timeliness=payload.timeliness,
        consistency=payload.consistency,
        notes=payload.notes,
    )
    db.add(q)
    db.flush()
    asset.quality_score = _avg_quality(q)
    db.flush()
    return q