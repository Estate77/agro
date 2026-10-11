"""地块路由。"""

from fastapi import APIRouter, Query, Request

from app.core.audit import write_audit
from app.core.deps import CurrentUser, DbDep, require_permission, TenantId
from app.schemas.block import BlockCreate, BlockOut, BlockUpdate
from app.schemas.common import IdOut, PageOut, Resp

router = APIRouter()


@router.get("", response_model=Resp[PageOut[BlockOut]], summary="地块列表")
def list_blocks(
    db: DbDep,
    tenant_id: TenantId,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=200),
    keyword: str | None = None,
):
    from app.models.block import Block

    q = db.query(Block).filter(Block.tenant_id == tenant_id)
    if keyword:
        kw = f"%{keyword.strip()}%"
        q = q.filter((Block.name.like(kw)) | (Block.code.like(kw)) | (Block.crop.like(kw)))
    total = q.count()
    items = q.order_by(Block.id.desc()).offset((page - 1) * page_size).limit(page_size).all()
    return Resp(
        data=PageOut[BlockOut](
            items=[BlockOut.model_validate(b) for b in items],
            total=total,
            page=page,
            page_size=page_size,
        )
    )


@router.get("/{block_id}", response_model=Resp[BlockOut], summary="地块详情")
def get_block(block_id: int, db: DbDep, tenant_id: TenantId) -> Resp[BlockOut]:
    from app.models.block import Block

    b = db.get(Block, block_id)
    if b is None or b.tenant_id != tenant_id:
        from app.core.exceptions import NotFoundError

        raise NotFoundError("地块不存在")
    return Resp(data=BlockOut.model_validate(b))


@router.post(
    "",
    response_model=Resp[IdOut],
    summary="新建地块",
    dependencies=[require_permission("block:write")],
)
def create_block(
    payload: BlockCreate,
    db: DbDep,
    tenant_id: TenantId,
    current_user: CurrentUser,
    request: Request,
) -> Resp[IdOut]:
    from app.core.exceptions import ConflictError
    from app.models.block import Block

    if (
        db.query(Block)
        .filter(Block.tenant_id == tenant_id, Block.code == payload.code)
        .first()
    ):
        raise ConflictError("地块编码已存在")
    b = Block(
        tenant_id=tenant_id,
        code=payload.code,
        name=payload.name,
        geometry_wkt=payload.geometry_wkt,
        crop=payload.crop,
        variety=payload.variety,
        area_mu=payload.area_mu,
        owner_org=payload.owner_org,
    )
    db.add(b)
    db.flush()
    write_audit(
        db,
        action="CREATE",
        resource="block",
        user_id=current_user.id,
        tenant_id=tenant_id,
        resource_id=str(b.id),
        payload={"code": b.code},
        request=request,
    )
    db.commit()
    return Resp(data=IdOut(id=b.id))


@router.put(
    "/{block_id}",
    response_model=Resp[IdOut],
    summary="更新地块",
    dependencies=[require_permission("block:write")],
)
def update_block(
    block_id: int,
    payload: BlockUpdate,
    db: DbDep,
    tenant_id: TenantId,
    current_user: CurrentUser,
    request: Request,
) -> Resp[IdOut]:
    from app.core.exceptions import NotFoundError
    from app.models.block import Block

    b = db.get(Block, block_id)
    if b is None or b.tenant_id != tenant_id:
        raise NotFoundError("地块不存在")
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(b, k, v)
    db.flush()
    write_audit(
        db,
        action="UPDATE",
        resource="block",
        user_id=current_user.id,
        tenant_id=tenant_id,
        resource_id=str(b.id),
        request=request,
    )
    db.commit()
    return Resp(data=IdOut(id=b.id))