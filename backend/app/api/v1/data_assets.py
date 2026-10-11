"""数据资产管理路由。"""

from fastapi import APIRouter, Query, Request

from app.core.audit import write_audit
from app.core.deps import CurrentUser, DbDep, require_permission, TenantId
from app.schemas.common import IdOut, PageOut, Resp
from app.schemas.data_asset import (
    DataAssetCreate,
    DataAssetDetail,
    DataAssetQualityCreate,
    DataAssetQualityOut,
    DataAssetUpdate,
)
from app.services import data_asset_service

router = APIRouter()


@router.get("", response_model=Resp[PageOut[DataAssetDetail]], summary="数据资产目录")
def list_assets(
    current_user: CurrentUser,
    db: DbDep,
    tenant_id: TenantId,
    keyword: str | None = None,
    domain: str | None = None,
    page: int = Query(1, ge=1, le=10_000),
    page_size: int = Query(20, ge=1, le=200),
) -> Resp[PageOut[DataAssetDetail]]:
    items, total = data_asset_service.list_assets(
        db, tenant_id, keyword=keyword, domain=domain, page=page, page_size=page_size
    )
    return Resp(
        data=PageOut[DataAssetDetail](
            items=[DataAssetDetail.model_validate(i) for i in items],
            total=total,
            page=page,
            page_size=page_size,
        )
    )


@router.get(
    "/{asset_id}",
    response_model=Resp[DataAssetDetail],
    summary="数据资产详情",
)
def get_asset(
    asset_id: int, current_user: CurrentUser, db: DbDep, tenant_id: TenantId
) -> Resp[DataAssetDetail]:
    asset = data_asset_service.get_asset(db, asset_id, tenant_id)
    return Resp(data=DataAssetDetail.model_validate(asset))


@router.post(
    "",
    response_model=Resp[IdOut],
    summary="登记数据资产",
    dependencies=[require_permission("asset:write")],
)
def create_asset(
    payload: DataAssetCreate,
    db: DbDep,
    tenant_id: TenantId,
    current_user: CurrentUser,
    request: Request,
) -> Resp[IdOut]:
    asset = data_asset_service.create_asset(db, tenant_id, payload)
    write_audit(
        db,
        action="CREATE",
        resource="data_asset",
        user_id=current_user.id,
        tenant_id=tenant_id,
        resource_id=str(asset.id),
        payload={"code": asset.code},
        request=request,
    )
    db.commit()
    return Resp(data=IdOut(id=asset.id))


@router.put(
    "/{asset_id}",
    response_model=Resp[IdOut],
    summary="更新数据资产",
    dependencies=[require_permission("asset:write")],
)
def update_asset(
    asset_id: int,
    payload: DataAssetUpdate,
    db: DbDep,
    tenant_id: TenantId,
    current_user: CurrentUser,
    request: Request,
) -> Resp[IdOut]:
    asset = data_asset_service.update_asset(db, asset_id, tenant_id, payload)
    write_audit(
        db,
        action="UPDATE",
        resource="data_asset",
        user_id=current_user.id,
        tenant_id=tenant_id,
        resource_id=str(asset.id),
        request=request,
    )
    db.commit()
    return Resp(data=IdOut(id=asset.id))


@router.delete(
    "/{asset_id}",
    response_model=Resp[IdOut],
    summary="删除数据资产",
    dependencies=[require_permission("asset:write")],
)
def delete_asset(
    asset_id: int,
    db: DbDep,
    tenant_id: TenantId,
    current_user: CurrentUser,
    request: Request,
) -> Resp[IdOut]:
    data_asset_service.delete_asset(db, asset_id, tenant_id)
    write_audit(
        db,
        action="DELETE",
        resource="data_asset",
        user_id=current_user.id,
        tenant_id=tenant_id,
        resource_id=str(asset_id),
        request=request,
    )
    db.commit()
    return Resp(data=IdOut(id=asset_id))


@router.post(
    "/{asset_id}/certify",
    response_model=Resp[IdOut],
    summary="入库存证（生成 cert_hash）",
    dependencies=[require_permission("asset:write")],
)
def certify_asset(
    asset_id: int,
    db: DbDep,
    tenant_id: TenantId,
    current_user: CurrentUser,
    request: Request,
) -> Resp[IdOut]:
    asset = data_asset_service.certify_asset(db, asset_id, tenant_id)
    write_audit(
        db,
        action="CERTIFY",
        resource="data_asset",
        user_id=current_user.id,
        tenant_id=tenant_id,
        resource_id=str(asset.id),
        payload={"cert_hash": asset.cert_hash},
        request=request,
    )
    db.commit()
    return Resp(data=IdOut(id=asset.id))


@router.post(
    "/{asset_id}/qualities",
    response_model=Resp[DataAssetQualityOut],
    summary="新增质量稽核记录",
    dependencies=[require_permission("asset:write")],
)
def add_quality(
    asset_id: int,
    payload: DataAssetQualityCreate,
    db: DbDep,
    tenant_id: TenantId,
) -> Resp[DataAssetQualityOut]:
    q = data_asset_service.add_quality(db, asset_id, tenant_id, payload)
    db.commit()
    return Resp(data=DataAssetQualityOut.model_validate(q))