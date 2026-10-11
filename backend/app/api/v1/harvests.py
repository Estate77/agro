"""采收路由（采收后自动生成溯源批次）。"""

from datetime import datetime

from fastapi import APIRouter, Query, Request

from app.core.audit import write_audit
from app.core.deps import CurrentUser, DbDep, require_permission, TenantId
from app.core.exceptions import NotFoundError
from app.models.harvest import HarvestRecord
from app.models.planting import Planting
from app.schemas.common import IdOut, PageOut, Resp
from app.schemas.harvest import HarvestCreate, HarvestOut
from app.services import batch_service

router = APIRouter()


def _gen_batch_code(planting_id: int) -> str:
    ts = datetime.utcnow().strftime("%Y%m%d%H%M%S")
    return f"HR-{planting_id:05d}-{ts}"


@router.get("", response_model=Resp[PageOut[HarvestOut]], summary="采收列表")
def list_harvests(
    db: DbDep,
    tenant_id: TenantId,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=200),
):
    q = db.query(HarvestRecord).filter(HarvestRecord.tenant_id == tenant_id)
    total = q.count()
    items = q.order_by(HarvestRecord.id.desc()).offset((page - 1) * page_size).limit(page_size).all()
    return Resp(
        data=PageOut[HarvestOut](
            items=[HarvestOut.model_validate(h) for h in items],
            total=total,
            page=page,
            page_size=page_size,
        )
    )


@router.post(
    "",
    response_model=Resp[IdOut],
    summary="新建采收（自动生成溯源批次）",
    dependencies=[require_permission("harvest:write")],
)
def create_harvest(
    payload: HarvestCreate,
    db: DbDep,
    tenant_id: TenantId,
    current_user: CurrentUser,
    request: Request,
) -> Resp[IdOut]:
    p = db.get(Planting, payload.planting_id)
    if p is None or p.tenant_id != tenant_id:
        raise NotFoundError("种植季不存在")
    code = payload.batch_code or _gen_batch_code(p.id)
    h = HarvestRecord(
        tenant_id=tenant_id,
        planting_id=payload.planting_id,
        batch_code=code,
        weight_kg=payload.weight_kg,
        quality_grade=payload.quality_grade,
        geo=payload.geo,
        operator=payload.operator,
    )
    db.add(h)
    db.flush()
    # 自动生成溯源批次（关键闭环）
    batch = batch_service.create_batch_from_harvest(db, tenant_id, h.id)
    write_audit(
        db,
        action="CREATE",
        resource="harvest",
        user_id=current_user.id,
        tenant_id=tenant_id,
        resource_id=str(h.id),
        payload={"batch_code": h.batch_code, "batch_id": batch.id},
        request=request,
    )
    db.commit()
    return Resp(data=IdOut(id=h.id))