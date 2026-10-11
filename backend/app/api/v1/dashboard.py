"""工作台首页 KPI 聚合。"""

from fastapi import APIRouter

from app.core.deps import CurrentUser, DbDep, TenantId
from app.models.batch import Batch
from app.models.block import Block
from app.models.data_asset import DataAsset
from app.models.farmwork import FarmworkTask
from app.models.harvest import HarvestRecord
from app.schemas.common import Resp

router = APIRouter()


@router.get("/kpi", summary="工作台 KPI 聚合", response_model=Resp[dict])
def dashboard_kpi(db: DbDep, tenant_id: TenantId, current_user: CurrentUser) -> Resp[dict]:
    blocks = db.query(Block).filter(Block.tenant_id == tenant_id).count()
    tasks_today = db.query(FarmworkTask).filter(FarmworkTask.tenant_id == tenant_id).count()
    tasks_done = (
        db.query(FarmworkTask)
        .filter(FarmworkTask.tenant_id == tenant_id, FarmworkTask.status == "已完成")
        .count()
    )
    harvests = db.query(HarvestRecord).filter(HarvestRecord.tenant_id == tenant_id).count()
    batches = db.query(Batch).filter(Batch.tenant_id == tenant_id).count()
    assets = db.query(DataAsset).filter(DataAsset.tenant_id == tenant_id).count()
    assets_certified = (
        db.query(DataAsset)
        .filter(DataAsset.tenant_id == tenant_id, DataAsset.is_certified.is_(True))
        .count()
    )

    return Resp(
        data={
            "blocks": blocks,
            "tasks_total": tasks_today,
            "tasks_done": tasks_done,
            "task_done_rate": round(tasks_done / tasks_today * 100, 1) if tasks_today else 0.0,
            "harvests": harvests,
            "batches": batches,
            "data_assets": assets,
            "data_assets_certified": assets_certified,
            "asset_certified_rate": round(assets_certified / assets * 100, 1) if assets else 0.0,
        }
    )