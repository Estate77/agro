"""安全相关：密码哈希、JWT 编解码。"""

from datetime import datetime, timedelta, timezone
from typing import Any

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import settings

# bcrypt 限制 72 字节，passlib 会自动截断；为兼容性，截断长度设为 72
_pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto", bcrypt__truncate_error=False)


def hash_password(password: str) -> str:
    """对明文密码做 bcrypt 哈希。"""
    return _pwd_ctx.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    """校验明文密码与哈希。"""
    try:
        return _pwd_ctx.verify(plain, hashed)
    except Exception:
        return False


def _now() -> datetime:
    return datetime.now(tz=timezone.utc)


def create_access_token(
    subject: str,
    extra_claims: dict[str, Any] | None = None,
    ttl_min: int | None = None,
) -> str:
    """签发访问令牌。subject 通常为 user_id。"""
    ttl = ttl_min or settings.ACCESS_TOKEN_TTL_MIN
    expire = _now() + timedelta(minutes=ttl)
    payload: dict[str, Any] = {
        "sub": subject,
        "type": "access",
        "iat": int(_now().timestamp()),
        "exp": int(expire.timestamp()),
    }
    if extra_claims:
        payload.update(extra_claims)
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALG)


def create_refresh_token(subject: str) -> str:
    """签发刷新令牌。"""
    expire = _now() + timedelta(days=settings.REFRESH_TOKEN_TTL_DAY)
    payload = {
        "sub": subject,
        "type": "refresh",
        "iat": int(_now().timestamp()),
        "exp": int(expire.timestamp()),
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALG)


def decode_token(token: str) -> dict[str, Any]:
    """解码 JWT；失败抛出 JWTError。"""
    try:
        return jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALG])
    except JWTError as e:
        raise ValueError(f"invalid token: {e}") from e