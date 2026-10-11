"""审计日志：记录关键写操作（POST/PUT/PATCH/DELETE）到 audit_log 表。"""

from typing import Any

from fastapi import Request
from sqlalchemy.orm import Session

from app.models.audit import AuditLog


def write_audit(
    db: Session,
    *,
    action: str,
    resource: str,
    user_id: int | None,
    tenant_id: int | None,
    resource_id: str | None = None,
    payload: dict[str, Any] | None = None,
    request: Request | None = None,
) -> AuditLog:
    """写入一条审计日志。失败不影响业务事务。"""
    ip = None
    user_agent = None
    if request is not None:
        ip = request.client.host if request.client else None
        user_agent = request.headers.get("user-agent")

    log = AuditLog(
        tenant_id=tenant_id,
        user_id=user_id,
        action=action,
        resource=resource,
        resource_id=resource_id,
        payload=payload or {},
        ip=ip,
        user_agent=user_agent,
    )
    db.add(log)
    return log