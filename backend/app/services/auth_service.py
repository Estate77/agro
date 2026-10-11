"""认证服务：登录、刷新令牌。"""

from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.exceptions import UnauthorizedError
from app.core.security import create_access_token, create_refresh_token, decode_token, verify_password
from app.models.rbac import User


def authenticate(db: Session, username: str, password: str) -> User:
    user = db.query(User).filter(User.username == username).first()
    if user is None or not user.is_active:
        raise UnauthorizedError("账号或密码错误")
    if not verify_password(password, user.password_hash):
        raise UnauthorizedError("账号或密码错误")
    return user


def issue_tokens(user: User) -> dict[str, str | int]:
    return {
        "access_token": create_access_token(
            subject=str(user.id),
            extra_claims={"tenant_id": user.tenant_id, "is_admin": user.is_platform_admin},
        ),
        "refresh_token": create_refresh_token(subject=str(user.id)),
        "token_type": "Bearer",
        "expires_in": settings.ACCESS_TOKEN_TTL_MIN * 60,
    }


def refresh(db: Session, refresh_token: str) -> dict[str, str | int]:
    try:
        payload = decode_token(refresh_token)
    except ValueError as e:
        raise UnauthorizedError(str(e)) from e
    if payload.get("type") != "refresh":
        raise UnauthorizedError("非刷新令牌")
    user_id = int(payload.get("sub"))
    user = db.get(User, user_id)
    if user is None or not user.is_active:
        raise UnauthorizedError("用户不存在或已停用")
    return issue_tokens(user)