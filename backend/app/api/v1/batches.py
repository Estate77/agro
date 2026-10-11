"""溯源批次路由（包含 C 端扫码公共接口）。"""

from fastapi import APIRouter, Query, Request

from app.core.audit import write_audit
from app.core.deps import CurrentUser, DbDep, TenantId
from app.core.exceptions import NotFoundError
from app.models.batch import Batch
from app.schemas.batch import BatchOut, BatchPublic
from app.schemas.common import IdOut, PageOut, Resp

router = APIRouter()


@router.get("", response_model=Resp[PageOut[BatchOut]], summary="批次列表（管理端）")
def list_batches(
    db: DbDep,
    tenant_id: TenantId,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=200),
):
    q = db.query(Batch).filter(Batch.tenant_id == tenant_id)
    total = q.count()
    items = q.order_by(Batch.id.desc()).offset((page - 1) * page_size).limit(page_size).all()
    return Resp(
        data=PageOut[BatchOut](
            items=[BatchOut.model_validate(b) for b in items],
            total=total,
            page=page,
            page_size=page_size,
        )
    )


@router.get(
    "/public/{code}",
    response_model=Resp[BatchPublic],
    summary="C 端扫码公共接口（无需登录）",
)
def public_batch(code: str, db: DbDep) -> Resp[BatchPublic]:
    b = db.query(Batch).filter(Batch.code == code).first()
    if b is None:
        raise NotFoundError("批次不存在")
    planting = b.planting
    block = planting.block if planting else None
    public = BatchPublic(
        code=b.code,
        product_name=b.product_name,
        variety=b.variety,
        origin=b.origin,
        status=b.status,
        harvested_at=b.harvest.harvested_at if b.harvest else None,
        block_name=block.name if block else None,
        block_code=block.code if block else None,
        crop=planting.crop if planting else None,
        planting_start=planting.start_date if planting else None,
        season=planting.season if planting else None,
        operator=b.harvest.operator if b.harvest else None,
        weight_kg=b.harvest.weight_kg if b.harvest else None,
        quality_grade=b.harvest.quality_grade if b.harvest else None,
        cert_chain=b.chain_tx,
    )
    return Resp(data=public)


@router.get(
    "/{batch_id}",
    response_model=Resp[BatchOut],
    summary="批次详情",
)
def get_batch(batch_id: int, db: DbDep, tenant_id: TenantId) -> Resp[BatchOut]:
    b = db.get(Batch, batch_id)
    if b is None or b.tenant_id != tenant_id:
        raise NotFoundError("批次不存在")
    return Resp(data=BatchOut.model_validate(b))