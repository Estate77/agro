"""通用响应/分页模型。"""

from typing import Generic, TypeVar

from pydantic import BaseModel, ConfigDict, Field

T = TypeVar("T")


class Resp(BaseModel, Generic[T]):
    """统一响应壳：{code, message, data}。"""

    code: int = 0
    message: str = "ok"
    data: T | None = None


class PageQuery(BaseModel):
    """通用分页查询。"""

    page: int = Field(1, ge=1, le=10_000)
    page_size: int = Field(20, ge=1, le=200)
    keyword: str | None = None


class PageOut(BaseModel, Generic[T]):
    """分页结果。"""

    items: list[T]
    total: int
    page: int
    page_size: int


class IdOut(BaseModel):
    id: int


class ORMBase(BaseModel):
    """ORM → Schema 通用基类。"""

    model_config = ConfigDict(from_attributes=True)