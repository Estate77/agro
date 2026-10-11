"""演示数据模块：天气 / 物联网遥测 / 告警（确定性 mock）。

演示说明：
- v0.1 无真实设备与气象源接入，用确定性伪随机（种子=地块+日期+小时）生成稳定可复现的数据
- v0.5 接入 EMQX/InfluxDB 后，此路由可保留作为"演示模式"开关
"""

import hashlib
import random
from datetime import date, datetime, timedelta
from datetime import timezone as _tz
from typing import Any

from fastapi import APIRouter, Query

from app.core.deps import CurrentUser, DbDep, TenantId
from app.models.block import Block
from app.models.farmwork import FarmworkTask
from app.schemas.common import Resp

router = APIRouter()


def _seed_rng(*parts: Any) -> random.Random:
    key = "|".join(str(p) for p in parts)
    seed = int(hashlib.sha256(key.encode("utf-8")).hexdigest()[:12], 16)
    return random.Random(seed)


WEATHER_CONDITIONS = [
    ("晴", "☀️"),
    ("多云", "⛅"),
    ("阴", "☁️"),
    ("小雨", "🌧️"),
    ("阵雨", "🌦️"),
]


def _agri_advice(cond: str, temp: float) -> str:
    if "雨" in cond:
        return "有降雨，喷药/施肥作业请避开，注意清沟排水"
    if temp > 32:
        return "高温天气，灌溉宜在早晚进行，警惕高温逼熟"
    if temp < 8:
        return "低温天气，注意防寒防冻，棚室加强保温"
    return "天气平稳，适宜施肥、喷药等田间作业"


@router.get("/weather", response_model=Resp[dict[str, Any]], summary="地块天气与 7 天预报（演示）")
def demo_weather(
    current_user: CurrentUser,
    db: DbDep,
    tenant_id: TenantId,
    block_id: int | None = Query(default=None),
) -> Resp[dict[str, Any]]:
    today = date.today()
    rng = _seed_rng("weather", block_id or 0, today.isoformat())

    cond, icon = rng.choice(WEATHER_CONDITIONS)
    temp_hi = round(rng.uniform(22, 33), 1)
    temp_lo = round(temp_hi - rng.uniform(6, 11), 1)

    forecast = []
    for i in range(7):
        d = today + timedelta(days=i)
        r = _seed_rng("weather-forecast", block_id or 0, d.isoformat())
        c, ic = r.choice(WEATHER_CONDITIONS)
        hi = round(r.uniform(20, 34), 1)
        forecast.append(
            {
                "date": d.isoformat(),
                "weekday": ["周一", "周二", "周三", "周四", "周五", "周六", "周日"][d.weekday()],
                "condition": c,
                "icon": ic,
                "temp_hi": hi,
                "temp_lo": round(hi - r.uniform(6, 11), 1),
                "suitable_for_spray": "雨" not in c,
            }
        )

    return Resp(
        data={
            "today": {
                "date": today.isoformat(),
                "condition": cond,
                "icon": icon,
                "temp_hi": temp_hi,
                "temp_lo": temp_lo,
                "humidity": round(rng.uniform(45, 85), 0),
                "wind": f"{rng.randint(1, 5)} 级",
                "advice": _agri_advice(cond, temp_hi),
            },
            "forecast": forecast,
            "is_mock": True,
        }
    )


def _telemetry_point(block_id: int, hour: int) -> dict[str, float]:
    rng = _seed_rng("telemetry", block_id, hour)
    # 日变化曲线：温度白天高、湿度夜里高
    day_factor = max(0.0, ((hour - 6) % 24) / 12 - 1) if 6 <= hour <= 18 else 0.2
    return {
        "air_temp": round(18 + day_factor * 12 + rng.uniform(-1.5, 1.5), 1),
        "air_humidity": round(85 - day_factor * 30 + rng.uniform(-5, 5), 0),
        "soil_moisture": round(62 + rng.uniform(-8, 8), 0),
        "soil_ec": round(0.8 + rng.uniform(0, 0.4), 2),
        "light": round(day_factor * 70000 + rng.uniform(0, 3000), 0),
        "co2": round(420 + day_factor * 180 + rng.uniform(-30, 30), 0),
    }


@router.get("/telemetry", response_model=Resp[dict[str, Any]], summary="地块物联网实时数据与 24h 曲线（演示）")
def demo_telemetry(
    current_user: CurrentUser,
    db: DbDep,
    tenant_id: TenantId,
    block_id: int = Query(...),
) -> Resp[dict[str, Any]]:
    # 校验地块属于当前租户
    b = db.get(Block, block_id)
    if b is None or b.tenant_id != tenant_id:
        from app.core.exceptions import NotFoundError

        raise NotFoundError("地块不存在")

    now = datetime.now(_tz.utc)
    latest = _telemetry_point(block_id, now.hour)
    history = []
    for h in range(24):
        hh = (now.hour - 23 + h) % 24
        history.append({"hour": hh, **_telemetry_point(block_id, hh)})

    return Resp(
        data={
            "block": {"id": b.id, "code": b.code, "name": b.name, "crop": b.crop},
            "latest": latest,
            "history_24h": history,
            "device_online_rate": 99.2,
            "is_mock": True,
        }
    )


@router.get("/alerts", response_model=Resp[dict[str, Any]], summary="告警列表（演示：逾期任务 + 设备模拟告警）")
def demo_alerts(
    current_user: CurrentUser,
    db: DbDep,
    tenant_id: TenantId,
) -> Resp[dict[str, Any]]:
    today = date.today()
    # 1. 逾期未完成任务 → 告警
    overdue = (
        db.query(FarmworkTask)
        .filter(
            FarmworkTask.tenant_id == tenant_id,
            FarmworkTask.status.in_(["待办", "进行中"]),
            FarmworkTask.plan_date < today,
        )
        .order_by(FarmworkTask.plan_date)
        .limit(5)
        .all()
    )
    alerts: list[dict[str, Any]] = [
        {
            "level": "中",
            "type": "任务逾期",
            "msg": f"「{t.type}」任务已逾期（计划 {t.plan_date}），执行人：{t.assignee or '未指派'}",
            "target": f"farmwork:{t.id}",
        }
        for t in overdue
    ]

    # 2. 设备模拟告警（确定性）
    rng = _seed_rng("alerts", tenant_id, today.isoformat())
    device_alerts = [
        {
            "level": "高",
            "type": "设备离线",
            "msg": "3 号地块土壤墒情传感器（SN-SOIL-0117）已离线 2 小时",
            "target": "device:SN-SOIL-0117",
        },
        {
            "level": "中",
            "type": "温度越限",
            "msg": f"东区番茄棚气温 {round(rng.uniform(33, 36), 1)}℃，超过阈值 32℃",
            "target": "block:3",
        },
        {
            "level": "低",
            "type": "虫情预警",
            "msg": "虫情测报灯捕获稻飞虱 46 头/晚，接近防治指标",
            "target": "device:SN-BUG-0033",
        },
    ]
    alerts.extend(device_alerts[: 3 - len(alerts) % 3])

    return Resp(data={"items": alerts, "total": len(alerts), "is_mock": True})
