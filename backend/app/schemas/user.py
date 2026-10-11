"""用户模块专用 schema（前端"我的"页用）。"""

from app.schemas.rbac import CurrentUserOut  # noqa: F401

__all__ = ["CurrentUserOut"]