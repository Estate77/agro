"""移动端聚合接口（契约 §15：/api/mobile/home）。

演示说明：聚合 B 端首页所需的天气 / 告警 / 今日任务，减少弱网下的请求次数。
"""

import random
from datetime import date
from typing import Any

from fastapi import APIRouter

from app.core.deps import CurrentUser, DbDep, TenantId
from app.models.farmwork import FarmworkTask
from app.schemas.common import Resp
from app.api.v1.demo import WEATHER_CONDITIONS, _seed_rng, _agri_advice

router = APIRouter()


@router.get("/home", response_model=Resp[dict[str, Any]], summary="B 端首页聚合（天气+告警+今日任务）")
def mobile_home(db: DbDep, tenant_id: TenantId, current_user: CurrentUser) -> Resp[dict[str, Any]]:
    today = date.today()
    rng: random.Random = _seed_rng("weather", 0, today.isoformat())
    cond, icon = rng.choice(WEATHER_CONDITIONS)
    temp_hi = round(rng.uniform(22, 33), 1)

    tasks = (
        db.query(FarmworkTask)
        .filter(
            FarmworkTask.tenant_id == tenant_id,
            FarmworkTask.status.in_(["待办", "进行中"]),
        )
        .order_by(FarmworkTask.plan_date)
        .limit(3)
        .all()
    )
    today_tasks = [t for t in tasks if t.plan_date == today] or tasks[:3]
    alert_rng = _seed_rng("mobile-alerts", tenant_id, today.isoformat())

    return Resp(
        data={
            "weather": {
                "date": today.isoformat(),
                "condition": cond,
                "icon": icon,
                "temp_hi": temp_hi,
                "temp_lo": round(temp_hi - rng.uniform(6, 11), 1),
                "humidity": round(rng.uniform(45, 85), 0),
                "wind": f"{rng.randint(1, 5)} 级",
                "advice": _agri_advice(cond, temp_hi),
            },
            "alerts": [
                {
                    "level": "中",
                    "type": "任务逾期",
                    "msg": "存在逾期未完成的农事任务，请尽快处理",
                    "target": "farmwork",
                }
            ],
            "today_tasks": [
                {
                    "id": t.id,
                    "type": t.type,
                    "plan_date": t.plan_date,
                    "status": t.status,
                    "assignee": t.assignee,
                }
                for t in today_tasks
            ],
            "is_mock": True,
        }
    )
