"""碳账户 / 碳足迹（演示 mock，公共接口：C 端游客免登录可访问）。

演示说明：
- 碳足迹按产品码确定性生成（同码同结果）
- 碳积分账户为全局演示账户（内存态，重启还原）
- v1.0 接入真实核算引擎后仅替换实现，契约不变
"""

import hashlib
import random
from datetime import date, datetime, timedelta
from typing import Any

from fastapi import APIRouter, Query
from pydantic import BaseModel, Field

from app.schemas.common import Resp

router = APIRouter()


def _rng(*parts: Any) -> random.Random:
    key = "|".join(str(p) for p in parts)
    seed = int(hashlib.sha256(key.encode("utf-8")).hexdigest()[:12], 16)
    return random.Random(seed)


# ---------- 碳足迹（产品级，公共） ----------


@router.get("/footprint", response_model=Resp[dict[str, Any]], summary="产品碳足迹（公共，C 端扫码展示）")
def carbon_footprint(product: str = Query(..., description="批次码")) -> Resp[dict[str, Any]]:
    rng = _rng("footprint", product)
    total = round(rng.uniform(0.6, 2.4), 2)
    parts = [("种植环节", 0.42), ("冷链运输", 0.26), ("包装材料", 0.18), ("加工仓储", 0.14)]
    breakdown = []
    left = total
    for i, (item, ratio) in enumerate(parts):
        kg = round(total * ratio, 2) if i < len(parts) - 1 else round(left, 2)
        left -= kg
        breakdown.append({"item": item, "kg": kg, "pct": round(ratio * 100, 0)})
    vs_avg = round(rng.uniform(-38, 12), 0)
    return Resp(
        data={
            "product": product,
            "kg_co2e": total,
            "unit": "kgCO₂e / kg",
            "breakdown": breakdown,
            "vs_category_avg_pct": vs_avg,
            "level": "低碳" if vs_avg < -15 else ("持平" if vs_avg < 0 else "偏高"),
            "is_mock": True,
        }
    )


# ---------- 碳账户（演示全局账户） ----------

_account = {
    "points": 1280,
    "total_footprint_kg": 36.8,
    "total_saved_kg": 12.4,
}

REDEEM_ITEMS = [
    {"id": "r1", "name": "有机肥 5kg 装兑换券", "points": 800, "stock": 12, "icon": "🧺"},
    {"id": "r2", "name": "生鲜满 39 减 10 券", "points": 300, "stock": 99, "icon": "🥬"},
    {"id": "r3", "name": "种子盲盒（时令蔬菜）", "points": 200, "stock": 30, "icon": "🌱"},
    {"id": "r4", "name": "公益捐赠·沙漠锁边林 1 棵", "points": 500, "stock": 999, "icon": "🌳"},
]


@router.get("/account", response_model=Resp[dict[str, Any]], summary="碳账户：积分 / 足迹 / 兑换商城（公共演示）")
def carbon_account() -> Resp[dict[str, Any]]:
    today = date.today()
    rng = _rng("carbon-history", today.isoformat())
    history = []
    for i in range(5):
        d = today - timedelta(days=i)
        pts = rng.choice([5, 10, 15, 20])
        history.append(
            {
                "date": d.isoformat(),
                "title": rng.choice(["扫码溯源 1 次", "低碳买菜", "绿色出行打卡", "参与碳中和活动"]),
                "points": pts,
            }
        )
    return Resp(
        data={
            **_account,
            "history": history,
            "redeem_items": REDEEM_ITEMS,
            "is_mock": True,
        }
    )


class RedeemIn(BaseModel):
    item_id: str = Field(..., description="兑换项 ID")


@router.post("/redeem", response_model=Resp[dict[str, Any]], summary="碳积分兑换（演示：内存扣减）")
def carbon_redeem(payload: RedeemIn) -> Resp[dict[str, Any]]:
    item = next((i for i in REDEEM_ITEMS if i["id"] == payload.item_id), None)
    if item is None:
        from app.core.exceptions import NotFoundError

        raise NotFoundError("兑换项不存在")
    if _account["points"] < item["points"]:
        from app.core.exceptions import ConflictError

        raise ConflictError("碳积分不足")
    _account["points"] -= item["points"]
    return Resp(
        data={
            "ok": True,
            "points_balance": _account["points"],
            "message": f"兑换成功：{item['name']}（券码 ZY-{datetime.now().strftime('%H%M%S')}）",
        }
    )
