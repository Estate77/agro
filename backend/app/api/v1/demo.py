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


# ---------- 设备台账（演示 mock，v0.5 接入真实设备后替换） ----------

DEVICE_SPECS: list[dict[str, Any]] = [
    {"type": "物联网网关", "sn": "SN-GW-0001", "vendor": "智耘物联", "firmware": "v2.3.1", "protocol": "MQTT"},
    {"type": "气象站", "sn": "SN-WX-0102", "vendor": "山东气象装备", "firmware": "v1.8.0", "protocol": "MQTT"},
    {"type": "土壤墒情传感器", "sn": "SN-SOIL-0117", "vendor": "农芯科技", "firmware": "v1.2.6", "protocol": "LoRaWAN"},
    {"type": "土壤墒情传感器", "sn": "SN-SOIL-0118", "vendor": "农芯科技", "firmware": "v1.2.6", "protocol": "LoRaWAN"},
    {"type": "虫情测报灯", "sn": "SN-BUG-0033", "vendor": "托普云农", "firmware": "v3.0.2", "protocol": "HTTP"},
    {"type": "视频摄像头", "sn": "SN-CAM-0201", "vendor": "海康威视", "firmware": "v5.5.1", "protocol": "GB28181"},
    {"type": "视频摄像头", "sn": "SN-CAM-0202", "vendor": "海康威视", "firmware": "v5.5.1", "protocol": "GB28181"},
    {"type": "智能灌溉阀", "sn": "SN-VALV-0301", "vendor": "华维节水", "firmware": "v1.0.9", "protocol": "Modbus TCP"},
    {"type": "卷帘机", "sn": "SN-RLR-0401", "vendor": "鹏飞农机", "firmware": "v0.9.3", "protocol": "Modbus RTU"},
    {"type": "植保无人机", "sn": "SN-UAV-0501", "vendor": "大疆农业", "firmware": "v07.20", "protocol": "HTTP"},
    {"type": "巡检机器人", "sn": "SN-BOT-0601", "vendor": "智耘物联", "firmware": "v2.1.0", "protocol": "MQTT"},
    {"type": "喂料机", "sn": "SN-FEED-0701", "vendor": "正大机电", "firmware": "v1.4.4", "protocol": "Modbus RTU"},
]


@router.get("/devices", response_model=Resp[dict[str, Any]], summary="设备台账（演示 mock）")
def demo_devices(
    current_user: CurrentUser,
    db: DbDep,
    tenant_id: TenantId,
) -> Resp[dict[str, Any]]:
    blocks = db.query(Block).filter(Block.tenant_id == tenant_id).order_by(Block.id).all()
    today = date.today()
    rng = _seed_rng("devices", tenant_id, today.isoformat())

    items: list[dict[str, Any]] = []
    for i, spec in enumerate(DEVICE_SPECS):
        b = blocks[i % len(blocks)] if blocks else None
        # 固定剧情：SN-SOIL-0117 离线（与告警联动）、SN-RLR-0401 故障待修，其余在线
        if spec["sn"] == "SN-SOIL-0117":
            status, battery = "离线", 0
        elif spec["sn"] == "SN-RLR-0401":
            status, battery = "故障", 66
        else:
            status = "在线"
            battery = rng.randint(58, 100) if spec["type"] in {"植保无人机", "巡检机器人", "土壤墒情传感器", "虫情测报灯"} else 100
        items.append(
            {
                "id": i + 1,
                **spec,
                "status": status,
                "battery": battery,
                "block_id": b.id if b else None,
                "block_name": b.name if b else "—",
                "last_heartbeat": f"{today.isoformat()} {rng.randint(8, 17):02d}:{rng.randint(10, 59):02d}",
                "uptime_days": rng.randint(3, 420),
            }
        )

    online = sum(1 for x in items if x["status"] == "在线")
    return Resp(
        data={
            "items": items,
            "total": len(items),
            "online": online,
            "online_rate": round(online / len(items) * 100, 1) if items else 0.0,
            "is_mock": True,
        }
    )


# ---------- 碳中和总览（PC 端演示 mock，IPCC/中国指南口径示意） ----------


@router.get("/carbon-overview", response_model=Resp[dict[str, Any]], summary="碳中和计量中心总览（演示）")
def demo_carbon_overview(
    current_user: CurrentUser,
    db: DbDep,
    tenant_id: TenantId,
) -> Resp[dict[str, Any]]:
    blocks = db.query(Block).filter(Block.tenant_id == tenant_id).order_by(Block.id).all()
    rng = _seed_rng("carbon-overview", tenant_id, date.today().isoformat())

    scope1 = [
        {"item": "农机柴油", "kg_co2e": round(rng.uniform(3200, 4800), 0)},
        {"item": "化肥施用（N₂O）", "kg_co2e": round(rng.uniform(5200, 7600), 0)},
        {"item": "灌溉用电（间接）", "kg_co2e": round(rng.uniform(1800, 3000), 0)},
    ]
    scope2 = [{"item": "外购电力（棚室/冷链）", "kg_co2e": round(rng.uniform(4200, 6800), 0)}]
    scope3 = [
        {"item": "冷链运输", "kg_co2e": round(rng.uniform(2400, 4200), 0)},
        {"item": "包装材料", "kg_co2e": round(rng.uniform(800, 1600), 0)},
    ]

    monthly = []
    for m in range(1, 13):
        r = _seed_rng("carbon-month", m)
        emission = round(r.uniform(800, 2200), 0)
        monthly.append(
            {
                "month": f"{m} 月",
                "emission": emission,
                "sequestration": round(emission * r.uniform(0.55, 0.95), 0),
            }
        )

    sequestration = [
        {"item": "土壤有机碳固碳（SOC）", "kg_co2e": round(rng.uniform(5200, 8600), 0)},
        {"item": "秸秆还田替代", "kg_co2e": round(rng.uniform(1800, 3400), 0)},
        {"item": "防护林/周边林木生物量", "kg_co2e": round(rng.uniform(900, 2200), 0)},
    ]

    projects = [
        {"id": "cp1", "name": "稻田节水减排项目", "methodology": "CCER-AR-CM-001 稻田甲烷减排", "standard": "CCER", "status": "审定中", "issued_credits": 0, "estimate_tCO2e": round(rng.uniform(180, 420), 0)},
        {"id": "cp2", "name": "光伏农业大棚替代电网", "methodology": "VCS VM0017 分布式光伏", "standard": "Verra VCS", "status": "已签发", "issued_credits": round(rng.uniform(240, 520), 0), "estimate_tCO2e": 0},
        {"id": "cp3", "name": "秸秆生物炭还田", "methodology": "GS-TPDDTEC 生物炭", "standard": "Gold Standard", "status": "监测期", "issued_credits": 0, "estimate_tCO2e": round(rng.uniform(90, 220), 0)},
    ]

    by_block = []
    for b in blocks:
        r = _seed_rng("carbon-block", b.id)
        emission = round(r.uniform(400, 1600) + b.area_mu * 3.2, 0)
        seqs = round(emission * r.uniform(0.5, 1.1), 0)
        by_block.append({"block_name": b.name, "crop": b.crop, "area_mu": b.area_mu, "emission": emission, "sequestration": seqs, "net": round(seqs - emission, 0)})

    total_emission = round(sum(x["kg_co2e"] for x in scope1 + scope2 + scope3), 0)
    total_seq = round(sum(x["kg_co2e"] for x in sequestration), 0)
    area_total = sum(b.area_mu for b in blocks) or 1

    return Resp(
        data={
            "scope1": {"items": scope1, "total": round(sum(x["kg_co2e"] for x in scope1), 0)},
            "scope2": {"items": scope2, "total": round(sum(x["kg_co2e"] for x in scope2), 0)},
            "scope3": {"items": scope3, "total": round(sum(x["kg_co2e"] for x in scope3), 0)},
            "total_emission": total_emission,
            "total_sequestration": total_seq,
            "net_emission": round(total_emission - total_seq, 0),
            "intensity_kg_per_mu": round(total_emission / area_total, 1),
            "offset_rate": round(min(100.0, total_seq / total_emission * 100), 1) if total_emission else 0.0,
            "monthly": monthly,
            "sequestration": sequestration,
            "projects": projects,
            "by_block": by_block,
            "methodology_note": "核算口径参考《省级温室气体清单编制指南》与 IPCC 2019 细分；方法学版本可追溯",
            "is_mock": True,
        }
    )


# ---------- 补贴监管（G 端演示 mock：立项→申报→公示→验收→兑付） ----------

SUBSIDY_ITEMS: list[dict[str, Any]] = [
    {"id": "s1", "name": "高标准农田建设项目 2026", "level": "中央+省", "budget_wan": 1200.0, "applicants": 26, "status": "已兑付", "progress": 5, "amount_paid_wan": 1156.0, "beneficiaries": "绿丰家庭农场等 26 家主体", "evidence_hash": None},
    {"id": "s2", "name": "农机购置与应用补贴（第二批）", "level": "中央", "budget_wan": 460.0, "applicants": 58, "status": "公示中", "progress": 3, "amount_paid_wan": 0.0, "beneficiaries": "58 家主体 · 农机 74 台", "evidence_hash": None},
    {"id": "s3", "name": "设施农业大棚建设补贴", "level": "县级", "budget_wan": 300.0, "applicants": 12, "status": "验收中", "progress": 4, "amount_paid_wan": 0.0, "beneficiaries": "12 家主体 · 新建日光温室 143 亩", "evidence_hash": None},
    {"id": "s4", "name": "绿色食品认证奖补", "level": "市级", "budget_wan": 60.0, "applicants": 9, "status": "申报中", "progress": 2, "amount_paid_wan": 0.0, "beneficiaries": "9 家主体 · 新获证产品 11 个", "evidence_hash": None},
    {"id": "s5", "name": "化肥农药减量增效补贴", "level": "省级", "budget_wan": 180.0, "applicants": 34, "status": "已兑付", "progress": 5, "amount_paid_wan": 172.4, "beneficiaries": "34 家主体 · 统防统治 2.1 万亩", "evidence_hash": None},
]


@router.get("/subsidies", response_model=Resp[dict[str, Any]], summary="补贴项目监管全流程（演示）")
def demo_subsidies(
    current_user: CurrentUser,
    tenant_id: TenantId,
) -> Resp[dict[str, Any]]:
    rng = _seed_rng("subsidies", tenant_id, date.today().isoformat())
    items = []
    for s in SUBSIDY_ITEMS:
        h = None
        if s["progress"] >= 3:
            h = hashlib.sha256(f"{s['id']}|{s['name']}|2026".encode()).hexdigest()[:16].upper()
        items.append({**s, "evidence_hash": h})
    total_budget = round(sum(x["budget_wan"] for x in items), 1)
    total_paid = round(sum(x["amount_paid_wan"] for x in items), 1)
    return Resp(
        data={
            "items": items,
            "total": len(items),
            "total_budget_wan": total_budget,
            "total_paid_wan": total_paid,
            "on_chain_check": f"抽查 {rng.randint(3, 8)} 笔资金流水 · 三流合一核验通过",
            "is_mock": True,
        }
    )


# ---------- 无人机与机器人调度（演示 mock） ----------


@router.get("/uav", response_model=Resp[dict[str, Any]], summary="无人机与机器人调度总览（演示）")
def demo_uav(
    current_user: CurrentUser,
    db: DbDep,
    tenant_id: TenantId,
) -> Resp[dict[str, Any]]:
    blocks = db.query(Block).filter(Block.tenant_id == tenant_id).order_by(Block.id).all()
    names = [b.name for b in blocks] or ["示范地块"]
    today = date.today()
    rng = _seed_rng("uav", tenant_id, today.isoformat())

    fleet = [
        {"sn": "SN-UAV-0501", "model": "大疆 T60", "kind": "植保无人机", "battery": rng.randint(45, 95), "payload_l": 60, "pos": "116.412,39.921", "speed": "8.2 m/s", "status": "作业中", "task": "东区番茄棚 · 统防统治"},
        {"sn": "SN-BOT-0601", "model": "智耘巡田 R2", "kind": "巡检机器人", "battery": rng.randint(30, 90), "payload_l": 0, "pos": "116.402,39.905", "speed": "1.2 m/s", "status": "巡检中", "task": "1 号稻田 · 苗情巡检"},
        {"sn": "SN-UAV-0502", "model": "大疆 T25", "kind": "植保无人机", "battery": 100, "payload_l": 25, "pos": "机库", "speed": "0", "status": "待命", "task": "—"},
    ]

    missions = [
        {"id": "M-101", "name": "东区番茄棚 早疫病统防统治", "block_name": names[2] if len(names) > 2 else names[0], "type": "喷洒", "status": "作业中", "pilot": "王飞手", "area_mu": 15.0, "agent": "SN-UAV-0501"},
        {"id": "M-102", "name": "南片玉米地 心叶期灌心（白僵菌）", "block_name": names[5] if len(names) > 5 else names[0], "type": "喷洒", "status": "待起飞", "pilot": "王飞手", "area_mu": 65.0, "agent": "SN-UAV-0502"},
        {"id": "M-103", "name": "1 号稻田 苗情巡检（每周 2 次）", "block_name": names[0], "type": "巡检", "status": "作业中", "pilot": "自动任务", "area_mu": 120.5, "agent": "SN-BOT-0601"},
        {"id": "M-104", "name": "北区麦田 返青肥撒施", "block_name": names[4] if len(names) > 4 else names[0], "type": "播撒", "status": "已完成", "pilot": "李飞手", "area_mu": 210.0, "agent": "SN-UAV-0501"},
        {"id": "M-105", "name": "西区黄瓜棚 霜霉病预防", "block_name": names[3] if len(names) > 3 else names[0], "type": "喷洒", "status": "已完成", "pilot": "王飞手", "area_mu": 12.0, "agent": "SN-UAV-0501"},
    ]

    routes = [
        {"id": "R-01", "name": "东区番茄棚 A 区五边航线", "block_name": names[2] if len(names) > 2 else names[0], "waypoints": 18, "length_m": 1240, "spray_l_per_mu": 1.5, "obstacles": "棚架 2 处已标记"},
        {"id": "R-02", "name": "南片玉米地 之字往复", "block_name": names[5] if len(names) > 5 else names[0], "waypoints": 24, "length_m": 3600, "spray_l_per_mu": 1.2, "obstacles": "高压线 1 处绕行"},
        {"id": "R-03", "name": "1 号稻田 环田巡检圈", "block_name": names[0], "waypoints": 12, "length_m": 980, "spray_l_per_mu": 0, "obstacles": "无"},
    ]

    maintenance = [
        {"id": "W-201", "sn": "SN-UAV-0501", "type": "定期保养", "desc": "飞行 120h 保养：喷头/桨叶/电池循环检查", "status": "待处理", "hours": 121.6},
        {"id": "W-202", "sn": "SN-RLR-0401", "type": "故障维修", "desc": "卷帘机限位开关失灵（与设备台账联动）", "status": "处理中", "hours": 0},
        {"id": "W-203", "sn": "SN-BOT-0601", "type": "定期保养", "desc": "履带张紧与摄像头清洁", "status": "已完成", "hours": 88.2},
    ]

    return Resp(
        data={
            "fleet": fleet,
            "missions": missions,
            "routes": routes,
            "maintenance": maintenance,
            "stats": {"active_missions": sum(1 for m in missions if m["status"] == "作业中"), "pending_missions": sum(1 for m in missions if m["status"] == "待起飞"), "area_today_mu": round(rng.uniform(60, 180), 1)},
            "is_mock": True,
        }
    )


# ---------- 经营管理（B 端财务演示） ----------


@router.get("/finance", response_model=Resp[dict[str, Any]], summary="经营管理：投入产出/订单/发票（演示）")
def demo_finance(
    current_user: CurrentUser,
    db: DbDep,
    tenant_id: TenantId,
) -> Resp[dict[str, Any]]:
    blocks = db.query(Block).filter(Block.tenant_id == tenant_id).order_by(Block.id).all()
    rng = _seed_rng("finance", tenant_id, date.today().isoformat())

    by_block = []
    for b in blocks:
        r = _seed_rng("fin-block", b.id)
        revenue = round(b.area_mu * r.uniform(2200, 6800), 0)
        cost = round(revenue * r.uniform(0.42, 0.68), 0)
        by_block.append(
            {
                "block_name": b.name,
                "crop": b.crop,
                "area_mu": b.area_mu,
                "revenue": revenue,
                "cost": cost,
                "profit": round(revenue - cost, 0),
                "per_mu_revenue": round(revenue / b.area_mu, 0),
                "per_mu_cost": round(cost / b.area_mu, 0),
                "margin": round((revenue - cost) / revenue * 100, 1) if revenue else 0.0,
            }
        )

    cost_items = [
        {"item": "农资（种/肥/药）", "amount_wan": round(rng.uniform(8, 16), 1)},
        {"item": "人工与劳务", "amount_wan": round(rng.uniform(5, 11), 1)},
        {"item": "机械与燃油", "amount_wan": round(rng.uniform(2.5, 6), 1)},
        {"item": "水电与棚室能耗", "amount_wan": round(rng.uniform(1.8, 4), 1)},
        {"item": "物流与包装", "amount_wan": round(rng.uniform(1.2, 3), 1)},
    ]

    orders = [
        {"id": "SO-2026-0311", "buyer": "永辉超市（华北区）", "product": "粉果番茄", "qty_kg": 2400, "amount": 16800.0, "status": "已结算", "date": "2026-03-22"},
        {"id": "SO-2026-0402", "buyer": "盒马鲜生", "product": "水果黄瓜", "qty_kg": 1200, "amount": 9600.0, "status": "已签收", "date": "2026-04-25"},
        {"id": "SO-2026-0405", "buyer": "美团买菜", "product": "粉果番茄", "qty_kg": 800, "amount": 6400.0, "status": "配送中", "date": "2026-05-02"},
        {"id": "SO-2026-0408", "buyer": "学校食堂联采", "product": "普通白菜", "qty_kg": 1500, "amount": 3900.0, "status": "待确认", "date": "2026-05-06"},
    ]

    invoices = [
        {"id": "INV-8812", "order_id": "SO-2026-0311", "amount": 16800.0, "status": "已回款", "issued_at": "2026-03-23", "paid_at": "2026-04-02"},
        {"id": "INV-8845", "order_id": "SO-2026-0402", "amount": 9600.0, "status": "已开票", "issued_at": "2026-04-26", "paid_at": None},
        {"id": "INV-8871", "order_id": "SO-2026-0405", "amount": 6400.0, "status": "待开票", "issued_at": None, "paid_at": None},
    ]

    monthly = [
        {"month": "1 月", "revenue": round(rng.uniform(4, 9), 1), "cost": round(rng.uniform(3, 6), 1)},
        {"month": "2 月", "revenue": round(rng.uniform(4, 9), 1), "cost": round(rng.uniform(3, 6), 1)},
        {"month": "3 月", "revenue": round(rng.uniform(9, 16), 1), "cost": round(rng.uniform(5, 9), 1)},
        {"month": "4 月", "revenue": round(rng.uniform(8, 15), 1), "cost": round(rng.uniform(5, 9), 1)},
        {"month": "5 月", "revenue": round(rng.uniform(7, 13), 1), "cost": round(rng.uniform(4, 8), 1)},
    ]

    return Resp(
        data={
            "by_block": by_block,
            "cost_items": cost_items,
            "orders": orders,
            "invoices": invoices,
            "monthly": monthly,
            "summary": {
                "revenue_total_wan": round(sum(x["revenue"] for x in by_block) / 10000, 1),
                "cost_total_wan": round(sum(x["cost"] for x in by_block) / 10000, 1),
                "receivable": round(sum(x["amount"] for x in invoices if x["status"] != "已回款"), 0),
            },
            "is_mock": True,
        }
    )


# ---------- C 端运营后台（演示） ----------


@router.get("/operation", response_model=Resp[dict[str, Any]], summary="C 端运营：用户分析/营销活动/订单履约（演示）")
def demo_operation(
    current_user: CurrentUser,
    tenant_id: TenantId,
) -> Resp[dict[str, Any]]:
    today = date.today()
    trend = []
    for i in range(6, -1, -1):
        d = today - timedelta(days=i)
        r = _seed_rng("ops-day", d.isoformat())
        trend.append({"date": d.isoformat(), "weekday": ["一", "二", "三", "四", "五", "六", "日"][d.weekday()], "dau": r.randint(320, 780), "scans": r.randint(180, 520)})

    dau = trend[-1]["dau"]
    return Resp(
        data={
            "users": {
                "dau": dau,
                "mau": round(dau * 8.6),
                "scan_users_total": 12680,
                "repurchase_rate": 38.4,
                "new_today": _seed_rng("ops-new", today.isoformat()).randint(40, 160),
                "trend_7d": trend,
            },
            "campaigns": [
                {"id": "c1", "name": "五月生鲜节 · 满减", "type": "满减", "status": "进行中", "participants": 3260, "conversion": 12.8},
                {"id": "c2", "name": "扫码抽免单 · 溯源抽奖", "type": "溯源抽奖", "status": "进行中", "participants": 8420, "conversion": 22.5},
                {"id": "c3", "name": "碳积分商城 · 有机肥兑换", "type": "碳积分商城", "status": "进行中", "participants": 1180, "conversion": 8.9},
                {"id": "c4", "name": "618 预售 · 产地直发", "type": "满减", "status": "筹备中", "participants": 0, "conversion": 0.0},
            ],
            "orders": [
                {"id": "CO-90231", "user": "微信用户_7362", "product": "智耘粉果番茄 2.5kg", "amount": 39.9, "status": "配送中", "channel": "小程序", "date": "2026-05-06"},
                {"id": "CO-90232", "user": "微信用户_1187", "product": "水果黄瓜 1.5kg×2", "amount": 29.8, "status": "待配单", "channel": "APP", "date": "2026-05-06"},
                {"id": "CO-90233", "user": "支付宝用户_9205", "product": "智耘粉果番茄 2.5kg", "amount": 39.9, "status": "已签收", "channel": "小程序", "date": "2026-05-05"},
                {"id": "CO-90234", "user": "微信用户_5511", "product": "碳积分兑换 · 种子盲盒", "amount": 0.0, "status": "待配单", "channel": "APP", "date": "2026-05-06"},
            ],
            "is_mock": True,
        }
    )
