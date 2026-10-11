"""RBAC 服务：用户/角色/权限的 CRUD。"""

from typing import Iterable

from sqlalchemy.orm import Session, selectinload

from app.core.exceptions import ConflictError, NotFoundError
from app.core.security import hash_password
from app.models.rbac import Permission, Role, User


# ---------- 角色 ----------
def list_roles(db: Session) -> list[Role]:
    return db.query(Role).options(selectinload(Role.permissions)).order_by(Role.id).all()


def get_role(db: Session, role_id: int) -> Role:
    r = db.get(Role, role_id)
    if r is None:
        raise NotFoundError("角色不存在")
    return r


def create_role(
    db: Session, *, code: str, name: str, description: str | None, permission_ids: Iterable[int]
) -> Role:
    if db.query(Role).filter(Role.code == code).first():
        raise ConflictError("角色编码已存在")
    role = Role(code=code, name=name, description=description)
    perms = db.query(Permission).filter(Permission.id.in_(list(permission_ids))).all()
    role.permissions = perms
    db.add(role)
    db.flush()
    return role


def update_role(
    db: Session,
    role_id: int,
    *,
    name: str | None = None,
    description: str | None = None,
    permission_ids: Iterable[int] | None = None,
) -> Role:
    role = get_role(db, role_id)
    if name is not None:
        role.name = name
    if description is not None:
        role.description = description
    if permission_ids is not None:
        perms = db.query(Permission).filter(Permission.id.in_(list(permission_ids))).all()
        role.permissions = perms
    db.flush()
    return role


# ---------- 权限 ----------
def list_permissions(db: Session) -> list[Permission]:
    return db.query(Permission).order_by(Permission.module, Permission.id).all()


# ---------- 用户 ----------
def list_users(db: Session, tenant_id: int | None = None) -> list[User]:
    q = db.query(User).options(selectinload(User.roles))
    if tenant_id is not None:
        q = q.filter(User.tenant_id == tenant_id)
    return q.order_by(User.id).all()


def get_user(db: Session, user_id: int) -> User:
    u = db.get(User, user_id)
    if u is None:
        raise NotFoundError("用户不存在")
    return u


def create_user(
    db: Session,
    *,
    tenant_id: int,
    username: str,
    password: str,
    display_name: str | None,
    email: str | None,
    phone: str | None,
    role_ids: Iterable[int],
    is_platform_admin: bool = False,
) -> User:
    if db.query(User).filter(User.username == username).first():
        raise ConflictError("用户名已存在")
    user = User(
        tenant_id=tenant_id,
        username=username,
        password_hash=hash_password(password),
        display_name=display_name,
        email=email,
        phone=phone,
        is_platform_admin=is_platform_admin,
    )
    if role_ids:
        roles = db.query(Role).filter(Role.id.in_(list(role_ids))).all()
        user.roles = roles
    db.add(user)
    db.flush()
    return user


def update_user(
    db: Session,
    user_id: int,
    *,
    display_name: str | None = None,
    email: str | None = None,
    phone: str | None = None,
    is_active: bool | None = None,
    role_ids: Iterable[int] | None = None,
    password: str | None = None,
) -> User:
    user = get_user(db, user_id)
    if display_name is not None:
        user.display_name = display_name
    if email is not None:
        user.email = email
    if phone is not None:
        user.phone = phone
    if is_active is not None:
        user.is_active = is_active
    if password:
        user.password_hash = hash_password(password)
    if role_ids is not None:
        roles = db.query(Role).filter(Role.id.in_(list(role_ids))).all()
        user.roles = roles
    db.flush()
    return user