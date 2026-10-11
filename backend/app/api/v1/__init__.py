"""v1 路由聚合。"""

from fastapi import APIRouter

from app.api.v1 import (
    ai,
    auth,
    batches,
    blocks,
    dashboard,
    data_assets,
    demo,
    farmwork,
    harvests,
    plantings,
    rbac,
    tenants,
)

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["认证"])
api_router.include_router(tenants.router, prefix="/tenants", tags=["租户"])
api_router.include_router(rbac.router, tags=["用户/角色/权限"])
api_router.include_router(data_assets.router, prefix="/data-assets", tags=["数据资产管理 ★"])
api_router.include_router(blocks.router, prefix="/blocks", tags=["地块"])
api_router.include_router(plantings.router, prefix="/plantings", tags=["种植季"])
api_router.include_router(farmwork.router, prefix="/farmwork", tags=["农事任务"])
api_router.include_router(harvests.router, prefix="/harvests", tags=["采收"])
api_router.include_router(batches.router, prefix="/batches", tags=["溯源批次"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["工作台"])
api_router.include_router(ai.router, prefix="/ai", tags=["AI 识病虫害（演示）"])
api_router.include_router(demo.router, prefix="/demo", tags=["演示数据（天气/遥测/告警）"])