"""种植季路由。"""

from fastapi import APIRouter, Query, Request

from app.core.audit import write_audit
from app.core.deps import CurrentUser, DbDep, require_permission, TenantId
from app.core.exceptions import NotFoundError
from app.models.planting import Planting
from app.schemas.common import IdOut, PageOut, Resp
from app.schemas.planting import PlantingCreate, PlantingOut

router = APIRouter()


@router.get("", response_model=Resp[PageOut[PlantingOut]], summary="种植季列表")
def list_plantings(
    db: DbDep,
    tenant_id: TenantId,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=200),
    block_id: int | None = None,
):
    q = db.query(Planting).filter(Planting.tenant_id == tenant_id)
    if block_id:
        q = q.filter(Planting.block_id == block_id)
    total = q.count()
    items = q.order_by(Planting.id.desc()).offset((page - 1) * page_size).limit(page_size).all()
    return Resp(
        data=PageOut[PlantingOut](
            items=[PlantingOut.model_validate(i) for i in items],
            total=total,
            page=page,
            page_size=page_size,
        )
    )


@router.post(
    "",
    response_model=Resp[IdOut],
    summary="创建种植季",
    dependencies=[require_permission("planting:write")],
)
def create_planting(
    payload: PlantingCreate,
    db: DbDep,
    tenant_id: TenantId,
    current_user: CurrentUser,
    request: Request,
) -> Resp[IdOut]:
    from app.models.block import Block

    block = db.get(Block, payload.block_id)
    if block is None or block.tenant_id != tenant_id:
        raise NotFoundError("地块不存在")
    p = Planting(
        tenant_id=tenant_id,
        block_id=payload.block_id,
        season=payload.season,
        crop=payload.crop,
        variety=payload.variety,
        start_date=payload.start_date,
        end_date=payload.end_date,
        expected_yield_kg=payload.expected_yield_kg,
    )
    db.add(p)
    db.flush()
    block.current_planting_id = p.id
    db.flush()
    write_audit(
        db,
        action="CREATE",
        resource="planting",
        user_id=current_user.id,
        tenant_id=tenant_id,
        resource_id=str(p.id),
        payload={"block_id": p.block_id, "season": p.season},
        request=request,
    )
    db.commit()
    return Resp(data=IdOut(id=p.id))