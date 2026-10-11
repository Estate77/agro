"""FastAPI 依赖注入：当前用户、当前租户、权限校验。"""

from typing import Annotated

from fastapi import Depends, Header
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.exceptions import ForbiddenError, UnauthorizedError
from app.core.security import decode_token
from app.db.session import get_db
from app.models.rbac import User


def _extract_token(authorization: str | None) -> str | None:
    if not authorization:
        return None
    parts = authorization.split()
    if len(parts) == 2 and parts[0].lower() == "bearer":
        return parts[1]
    return None


def get_current_user(
    db: Annotated[Session, Depends(get_db)],
    authorization: Annotated[str | None, Header()] = None,
) -> User:
    """从 Authorization: Bearer <token> 解析当前用户。"""
    token = _extract_token(authorization)
    if not token:
        raise UnauthorizedError("缺少访问令牌")
    try:
        payload = decode_token(token)
    except ValueError as e:
        raise UnauthorizedError(str(e)) from e
    if payload.get("type") != "access":
        raise UnauthorizedError("令牌类型错误")

    user_id = payload.get("sub")
    if not user_id:
        raise UnauthorizedError("令牌载荷无效")

    user = db.get(User, int(user_id))
    if user is None or not user.is_active:
        raise UnauthorizedError("用户不存在或已停用")
    return user


def require_roles(*role_codes: str):
    """依赖工厂：要求当前用户拥有任一指定角色编码。返回 Depends 实例，可直接用于 dependencies 列表。"""

    def _checker(
        current_user: Annotated[User, Depends(get_current_user)],
    ) -> User:
        user_role_codes = {r.code for r in current_user.roles}
        if not user_role_codes.intersection(set(role_codes)):
            raise ForbiddenError(f"需要角色之一: {', '.join(role_codes)}")
        return current_user

    return Depends(_checker)


def require_permission(perm_code: str):
    """依赖工厂：要求当前用户拥有指定权限点。返回 Depends 实例，可直接用于 dependencies 列表。"""

    def _checker(
        current_user: Annotated[User, Depends(get_current_user)],
    ) -> User:
        codes = current_user.permission_codes()
        if perm_code not in codes:
            raise ForbiddenError(f"缺少权限: {perm_code}")
        return current_user

    return Depends(_checker)


def get_tenant_id(
    current_user: Annotated[User, Depends(get_current_user)],
    x_tenant_id: Annotated[int | None, Header(alias="X-Tenant-Id")] = None,
) -> int:
    """获取当前请求的租户。优先 Header，未传则取用户所属租户。"""
    if x_tenant_id is not None:
        # 超管可切换租户
        if "platform_admin" in {r.code for r in current_user.roles}:
            return x_tenant_id
    return current_user.tenant_id


CurrentUser = Annotated[User, Depends(get_current_user)]
DbDep = Annotated[Session, Depends(get_db)]
TenantId = Annotated[int, Depends(get_tenant_id)]

__all__ = [
    "settings",
    "get_current_user",
    "require_roles",
    "require_permission",
    "get_tenant_id",
    "CurrentUser",
    "DbDep",
    "TenantId",
]