"""认证：登录、刷新、当前用户。"""

from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session

from app.core.audit import write_audit
from app.core.deps import CurrentUser, DbDep
from app.core.exceptions import UnauthorizedError
from app.schemas.auth import LoginIn, RefreshIn, TokenOut
from app.schemas.common import Resp
from app.schemas.rbac import CurrentUserOut
from app.services.auth_service import authenticate, issue_tokens, refresh

router = APIRouter()


@router.post("/login", response_model=Resp[TokenOut], summary="登录")
def login(payload: LoginIn, db: DbDep, request: Request) -> Resp[TokenOut]:
    user = authenticate(db, payload.username, payload.password)
    tokens = issue_tokens(user)
    write_audit(
        db,
        action="LOGIN",
        resource="user",
        user_id=user.id,
        tenant_id=user.tenant_id,
        resource_id=str(user.id),
        request=request,
    )
    db.commit()
    return Resp(data=TokenOut(**tokens))


@router.post("/refresh", response_model=Resp[TokenOut], summary="刷新令牌")
def refresh_token(payload: RefreshIn, db: DbDep) -> Resp[TokenOut]:
    if not payload.refresh_token:
        raise UnauthorizedError("缺少刷新令牌")
    return Resp(data=TokenOut(**refresh(db, payload.refresh_token)))


@router.get("/me", response_model=Resp[CurrentUserOut], summary="当前用户")
def me(current_user: CurrentUser) -> Resp[CurrentUserOut]:
    return Resp(
        data=CurrentUserOut(
            id=current_user.id,
            username=current_user.username,
            display_name=current_user.display_name,
            tenant_id=current_user.tenant_id,
            tenant_name=current_user.tenant.name if current_user.tenant else None,
            is_platform_admin=current_user.is_platform_admin,
            role_codes=sorted(current_user.role_codes),
            permission_codes=sorted(current_user.permission_codes()),
        )
    )