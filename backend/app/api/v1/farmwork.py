"""农事任务路由。"""

from datetime import datetime
from datetime import timezone as _tz

from fastapi import APIRouter, Query, Request

from app.core.audit import write_audit
from app.core.deps import CurrentUser, DbDep, require_permission, TenantId
from app.core.exceptions import ConflictError, NotFoundError
from app.models.farmwork import FarmworkTask
from app.schemas.common import IdOut, PageOut, Resp
from app.schemas.farmwork import (
    CheckInIn,
    FarmworkTaskCreate,
    FarmworkTaskOut,
    FarmworkTaskUpdate,
)

router = APIRouter()


@router.get("", response_model=Resp[PageOut[FarmworkTaskOut]], summary="农事任务列表")
def list_tasks(
    db: DbDep,
    tenant_id: TenantId,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=200),
    status: str | None = None,
    planting_id: int | None = None,
):
    q = db.query(FarmworkTask).filter(FarmworkTask.tenant_id == tenant_id)
    if status:
        q = q.filter(FarmworkTask.status == status)
    if planting_id:
        q = q.filter(FarmworkTask.planting_id == planting_id)
    total = q.count()
    items = q.order_by(FarmworkTask.plan_date.desc(), FarmworkTask.id.desc()).offset(
        (page - 1) * page_size
    ).limit(page_size).all()
    return Resp(
        data=PageOut[FarmworkTaskOut](
            items=[FarmworkTaskOut.model_validate(t) for t in items],
            total=total,
            page=page,
            page_size=page_size,
        )
    )


@router.post(
    "",
    response_model=Resp[IdOut],
    summary="创建农事任务",
    dependencies=[require_permission("farmwork:write")],
)
def create_task(
    payload: FarmworkTaskCreate,
    db: DbDep,
    tenant_id: TenantId,
    current_user: CurrentUser,
    request: Request,
) -> Resp[IdOut]:
    from app.models.planting import Planting

    p = db.get(Planting, payload.planting_id)
    if p is None or p.tenant_id != tenant_id:
        raise NotFoundError("种植季不存在")
    t = FarmworkTask(
        tenant_id=tenant_id,
        planting_id=payload.planting_id,
        type=payload.type,
        plan_date=payload.plan_date,
        assignee=payload.assignee,
        geo=payload.geo,
        note=payload.note,
        status="待办",
    )
    db.add(t)
    db.flush()
    write_audit(
        db,
        action="CREATE",
        resource="farmwork_task",
        user_id=current_user.id,
        tenant_id=tenant_id,
        resource_id=str(t.id),
        payload={"type": t.type},
        request=request,
    )
    db.commit()
    return Resp(data=IdOut(id=t.id))


@router.put(
    "/{task_id}",
    response_model=Resp[IdOut],
    summary="更新任务（打卡/留痕/完结）",
    dependencies=[require_permission("farmwork:write")],
)
def update_task(
    task_id: int,
    payload: FarmworkTaskUpdate,
    db: DbDep,
    tenant_id: TenantId,
    current_user: CurrentUser,
    request: Request,
) -> Resp[IdOut]:
    t = db.get(FarmworkTask, task_id)
    if t is None or t.tenant_id != tenant_id:
        raise NotFoundError("任务不存在")
    data = payload.model_dump(exclude_unset=True)
    for k, v in data.items():
        setattr(t, k, v)
    if data.get("status") == "已完成" and t.completed_at is None:
        t.completed_at = datetime.now(_tz.utc)
    db.flush()
    write_audit(
        db,
        action="UPDATE",
        resource="farmwork_task",
        user_id=current_user.id,
        tenant_id=tenant_id,
        resource_id=str(t.id),
        payload={"status": t.status},
        request=request,
    )
    db.commit()
    return Resp(data=IdOut(id=t.id))


@router.post(
    "/{task_id}/check",
    response_model=Resp[FarmworkTaskOut],
    summary="APP 打卡接口（任务前留痕 / 任务后完结）",
    dependencies=[require_permission("farmwork:write")],
)
def check_in(
    task_id: int,
    payload: CheckInIn,
    db: DbDep,
    tenant_id: TenantId,
    current_user: CurrentUser,
    request: Request,
) -> Resp[FarmworkTaskOut]:
    """对应《产品提示词-APP端》§15 的 /farmwork/tasks/{id}/check 契约。

    - phase=before：任务前打卡，任务转"进行中"，追加留痕
    - phase=after：任务后打卡，任务转"已完成"，追加留痕并记录完成时间
    """
    t = db.get(FarmworkTask, task_id)
    if t is None or t.tenant_id != tenant_id:
        raise NotFoundError("任务不存在")
    if t.status == "已取消":
        raise ConflictError("任务已取消，无法打卡")

    now = datetime.now(_tz.utc).isoformat()
    ev_list = [e.model_dump(exclude_none=True) for e in payload.evidences]
    for e in ev_list:
        if not e.get("ts"):
            e["ts"] = now
    t.evidences = (t.evidences or []) + ev_list
    if payload.geo:
        t.geo = payload.geo
    if payload.assignee:
        t.assignee = payload.assignee
    if payload.note:
        t.note = f"{t.note or ''}\n[打卡] {payload.note}".strip()

    if payload.phase == "before":
        t.status = "进行中"
    else:
        t.status = "已完成"
        t.completed_at = datetime.now(_tz.utc)

    db.flush()
    write_audit(
        db,
        action="CHECK_IN",
        resource="farmwork_task",
        user_id=current_user.id,
        tenant_id=tenant_id,
        resource_id=str(t.id),
        payload={"phase": payload.phase, "evidences": len(ev_list)},
        request=request,
    )
    db.commit()
    return Resp(data=FarmworkTaskOut.model_validate(t))