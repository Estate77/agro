"""用户/角色/权限路由。"""

from fastapi import APIRouter, Query, Request

from app.core.audit import write_audit
from app.core.deps import CurrentUser, DbDep, require_permission
from app.schemas.common import IdOut, PageOut, Resp
from app.schemas.rbac import (
    PermissionOut,
    RoleCreate,
    RoleOut,
    RoleUpdate,
    UserCreate,
    UserOut,
    UserUpdate,
)
from app.services import rbac_service

router = APIRouter()


# ---------- 角色 ----------
@router.get("/roles", response_model=Resp[list[RoleOut]], summary="角色列表")
def list_roles(current_user: CurrentUser, db: DbDep) -> Resp[list[RoleOut]]:
    items = rbac_service.list_roles(db)
    out = [
        RoleOut(
            id=r.id,
            code=r.code,
            name=r.name,
            description=r.description,
            permission_codes=sorted({p.code for p in r.permissions}),
            created_at=r.created_at,
        )
        for r in items
    ]
    return Resp(data=out)


@router.post(
    "/roles",
    response_model=Resp[RoleOut],
    summary="创建角色",
    dependencies=[require_permission("rbac:write")],
)
def create_role(payload: RoleCreate, db: DbDep, current_user: CurrentUser) -> Resp[RoleOut]:
    role = rbac_service.create_role(
        db,
        code=payload.code,
        name=payload.name,
        description=payload.description,
        permission_ids=payload.permission_ids,
    )
    db.commit()
    return Resp(data=RoleOut.model_validate(role))


@router.put(
    "/roles/{role_id}",
    response_model=Resp[RoleOut],
    summary="更新角色",
    dependencies=[require_permission("rbac:write")],
)
def update_role(role_id: int, payload: RoleUpdate, db: DbDep) -> Resp[RoleOut]:
    role = rbac_service.update_role(
        db,
        role_id,
        name=payload.name,
        description=payload.description,
        permission_ids=payload.permission_ids,
    )
    db.commit()
    return Resp(data=RoleOut.model_validate(role))


# ---------- 权限 ----------
@router.get("/permissions", response_model=Resp[list[PermissionOut]], summary="权限点列表")
def list_perms(current_user: CurrentUser, db: DbDep) -> Resp[list[PermissionOut]]:
    items = rbac_service.list_permissions(db)
    return Resp(data=[PermissionOut.model_validate(p) for p in items])


# ---------- 用户 ----------
@router.get("/users", response_model=Resp[list[UserOut]], summary="用户列表")
def list_users(
    current_user: CurrentUser,
    db: DbDep,
    tenant_id: int | None = Query(default=None),
) -> Resp[list[UserOut]]:
    # 非平台超管只能看自己租户
    scope_tenant = tenant_id if current_user.is_platform_admin else current_user.tenant_id
    items = rbac_service.list_users(db, scope_tenant)
    out = [
        UserOut(
            id=u.id,
            username=u.username,
            display_name=u.display_name,
            email=u.email,
            phone=u.phone,
            is_active=u.is_active,
            is_platform_admin=u.is_platform_admin,
            tenant_id=u.tenant_id,
            tenant_name=u.tenant.name if u.tenant else None,
            role_codes=sorted({r.code for r in u.roles}),
            permission_codes=sorted(u.permission_codes()),
            created_at=u.created_at,
        )
        for u in items
    ]
    return Resp(data=out)


@router.post(
    "/users",
    response_model=Resp[UserOut],
    summary="创建用户",
    dependencies=[require_permission("user:write")],
)
def create_user(
    payload: UserCreate,
    db: DbDep,
    current_user: CurrentUser,
    request: Request,
) -> Resp[UserOut]:
    target_tenant = payload.tenant_id or current_user.tenant_id
    if payload.tenant_id and not current_user.is_platform_admin:
        # 非平台超管不能跨租户建用户
        from app.core.exceptions import ForbiddenError

        raise ForbiddenError("仅平台超管可跨租户建用户")
    user = rbac_service.create_user(
        db,
        tenant_id=target_tenant,
        username=payload.username,
        password=payload.password,
        display_name=payload.display_name,
        email=payload.email,
        phone=payload.phone,
        role_ids=payload.role_ids,
        is_platform_admin=payload.is_platform_admin,
    )
    write_audit(
        db,
        action="CREATE",
        resource="user",
        user_id=current_user.id,
        tenant_id=target_tenant,
        resource_id=str(user.id),
        payload={"username": user.username},
        request=request,
    )
    db.commit()
    return Resp(
        data=UserOut(
            id=user.id,
            username=user.username,
            display_name=user.display_name,
            email=user.email,
            phone=user.phone,
            is_active=user.is_active,
            is_platform_admin=user.is_platform_admin,
            tenant_id=user.tenant_id,
            tenant_name=user.tenant.name if user.tenant else None,
            role_codes=sorted({r.code for r in user.roles}),
            permission_codes=sorted(user.permission_codes()),
            created_at=user.created_at,
        )
    )


@router.put(
    "/users/{user_id}",
    response_model=Resp[UserOut],
    summary="更新用户",
    dependencies=[require_permission("user:write")],
)
def update_user(user_id: int, payload: UserUpdate, db: DbDep) -> Resp[UserOut]:
    user = rbac_service.update_user(
        db,
        user_id,
        display_name=payload.display_name,
        email=payload.email,
        phone=payload.phone,
        is_active=payload.is_active,
        role_ids=payload.role_ids,
        password=payload.password,
    )
    db.commit()
    return Resp(
        data=UserOut(
            id=user.id,
            username=user.username,
            display_name=user.display_name,
            email=user.email,
            phone=user.phone,
            is_active=user.is_active,
            is_platform_admin=user.is_platform_admin,
            tenant_id=user.tenant_id,
            tenant_name=user.tenant.name if user.tenant else None,
            role_codes=sorted({r.code for r in user.roles}),
            permission_codes=sorted(user.permission_codes()),
            created_at=user.created_at,
        )
    )