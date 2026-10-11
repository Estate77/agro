"""RBAC 模型：User / Role / Permission。"""

from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Table
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin
from app.models.tenant import Tenant


# 用户-角色 多对多关联表
user_roles_table = Table(
    "user_roles",
    Base.metadata,
    Column("user_id", Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True),
    Column("role_id", Integer, ForeignKey("roles.id", ondelete="CASCADE"), primary_key=True),
)


role_permissions_table = Table(
    "role_permissions",
    Base.metadata,
    Column("role_id", Integer, ForeignKey("roles.id", ondelete="CASCADE"), primary_key=True),
    Column("permission_id", Integer, ForeignKey("permissions.id", ondelete="CASCADE"), primary_key=True),
)


class User(Base, TimestampMixin):
    """用户。"""

    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    tenant_id: Mapped[int] = mapped_column(ForeignKey("tenants.id"), index=True, nullable=False)
    username: Mapped[str] = mapped_column(String(64), index=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    display_name: Mapped[str | None] = mapped_column(String(64), default=None)
    email: Mapped[str | None] = mapped_column(String(128), default=None)
    phone: Mapped[str | None] = mapped_column(String(32), default=None)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_platform_admin: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    tenant = relationship("Tenant", back_populates="users")
    roles = relationship("Role", secondary=user_roles_table, back_populates="users", lazy="selectin")

    # ---------- 业务方法 ----------
    @property
    def role_codes(self) -> set[str]:
        return {r.code for r in self.roles}

    def permission_codes(self) -> set[str]:
        codes: set[str] = set()
        for r in self.roles:
            for p in r.permissions:
                codes.add(p.code)
        return codes


class Role(Base, TimestampMixin):
    """角色。"""

    __tablename__ = "roles"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    code: Mapped[str] = mapped_column(String(64), unique=True, index=True, nullable=False)
    name: Mapped[str] = mapped_column(String(128), nullable=False)
    description: Mapped[str | None] = mapped_column(String(255), default=None)

    users = relationship("User", secondary=user_roles_table, back_populates="roles")
    permissions = relationship("Permission", secondary=role_permissions_table, lazy="selectin")


class Permission(Base):
    """权限点。code 形如 'asset:read' / 'block:write'。"""

    __tablename__ = "permissions"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    code: Mapped[str] = mapped_column(String(64), unique=True, index=True, nullable=False)
    name: Mapped[str] = mapped_column(String(128), nullable=False)
    module: Mapped[str] = mapped_column(String(64), default="", nullable=False)