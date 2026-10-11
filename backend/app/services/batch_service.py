"""批次服务：创建批次（带溯源码生成）。"""

import secrets
import string
from datetime import datetime

from sqlalchemy.orm import Session

from app.core.exceptions import ConflictError, NotFoundError
from app.models.batch import Batch
from app.models.harvest import HarvestRecord


def _gen_batch_code(planting_id: int, tenant_id: int) -> str:
    suffix = "".join(secrets.choice(string.ascii_uppercase + string.digits) for _ in range(6))
    ts = datetime.utcnow().strftime("%Y%m%d")
    return f"B-{tenant_id:03d}-P{planting_id:05d}-{ts}-{suffix}"


def create_batch_from_harvest(db: Session, tenant_id: int, harvest_id: int) -> Batch:
    harvest = db.get(HarvestRecord, harvest_id)
    if harvest is None:
        raise NotFoundError("采收记录不存在")
    if harvest.tenant_id != tenant_id:
        raise NotFoundError("采收记录不存在")
    if harvest.batch is not None:
        raise ConflictError("该采收已生成批次")
    code = _gen_batch_code(harvest.planting_id, tenant_id)
    batch = Batch(
        tenant_id=tenant_id,
        planting_id=harvest.planting_id,
        harvest_id=harvest.id,
        code=code,
        product_name=f"{harvest.planting.crop}",
        variety=harvest.planting.variety,
        origin=harvest.planting.block.owner_org,
        status="已建批次",
    )
    db.add(batch)
    db.flush()
    return batch


def get_batch_by_code(db: Session, code: str) -> Batch:
    b = db.query(Batch).filter(Batch.code == code).first()
    if b is None:
        raise NotFoundError("批次不存在")
    return b