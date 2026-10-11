"""用户/角色/权限 schemas。"""

from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.schemas.common import ORMBase


class UserBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=64)
    display_name: str | None = None
    email: EmailStr | None = None
    phone: str | None = None
    is_active: bool = True


class UserCreate(UserBase):
    password: str = Field(..., min_length=6, max_length=128)
    tenant_id: int | None = None  # 平台超管可指定
    role_ids: list[int] = Field(default_factory=list)
    is_platform_admin: bool = False


class UserUpdate(BaseModel):
    display_name: str | None = None
    email: EmailStr | None = None
    phone: str | None = None
    is_active: bool | None = None
    role_ids: list[int] | None = None
    password: str | None = Field(default=None, min_length=6, max_length=128)


class UserOut(ORMBase):
    id: int
    username: str
    display_name: str | None = None
    email: str | None = None
    phone: str | None = None
    is_active: bool
    is_platform_admin: bool
    tenant_id: int
    tenant_name: str | None = None
    role_codes: list[str] = []
    permission_codes: list[str] = []
    created_at: datetime


class RoleBase(BaseModel):
    code: str = Field(..., min_length=2, max_length=64)
    name: str
    description: str | None = None


class RoleCreate(RoleBase):
    permission_ids: list[int] = Field(default_factory=list)


class RoleUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    permission_ids: list[int] | None = None


class RoleOut(ORMBase):
    id: int
    code: str
    name: str
    description: str | None = None
    permission_codes: list[str] = []
    created_at: datetime


class PermissionOut(ORMBase):
    id: int
    code: str
    name: str
    module: str


class CurrentUserOut(BaseModel):
    """登录后回传给前端的当前用户信息。"""

    model_config = ConfigDict(from_attributes=True)

    id: int
    username: str
    display_name: str | None
    tenant_id: int
    tenant_name: str | None
    is_platform_admin: bool
    role_codes: list[str]
    permission_codes: list[str]