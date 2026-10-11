"""租户管理（基础版，v0.1 用于演示多租户隔离）。"""

from fastapi import APIRouter

from app.core.deps import CurrentUser, DbDep
from app.models.tenant import Tenant
from app.schemas.common import ORMBase, Resp

router = APIRouter()


class TenantOut(ORMBase):
    id: int
    code: str
    name: str
    tenant_type: str
    contact_name: str | None
    contact_phone: str | None
    is_active: bool


@router.get("", response_model=Resp[list[TenantOut]], summary="租户列表（仅平台超管可见全部）")
def list_tenants(current_user: CurrentUser, db: DbDep) -> Resp[list[TenantOut]]:
    q = db.query(Tenant)
    if not current_user.is_platform_admin:
        q = q.filter(Tenant.id == current_user.tenant_id)
    items = q.order_by(Tenant.id).all()
    return Resp(data=[TenantOut.model_validate(t) for t in items])