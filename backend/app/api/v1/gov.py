"""智耘政（G 端监管）演示接口：待办 / 主体核查 / 应急上报 / 领导看板。

演示说明：
- 待办 = 数据库逾期任务 + 设备告警 + 确定性 mock 核查任务
- 主体台账来自租户表，风险分/告警/存证哈希按主体+日期确定性生成
- 应急上报写入内存列表（演示），v1.5 对接 PC 端应急指挥派单
"""

import hashlib
import random
from datetime import date, datetime, timedelta
from datetime import timezone as _tz
from typing import Any

from fastapi import APIRouter
from pydantic import BaseModel, Field

from app.core.deps import CurrentUser, DbDep, TenantId
from app.models.block import Block
from app.models.farmwork import FarmworkTask
from app.models.tenant import Tenant
from app.schemas.common import Resp

router = APIRouter()


def _rng(*parts: Any) -> random.Random:
    key = "|".join(str(p) for p in parts)
    seed = int(hashlib.sha256(key.encode("utf-8")).hexdigest()[:12], 16)
    return random.Random(seed)


# ---------- 待办 ----------


@router.get("/todos", response_model=Resp[dict[str, Any]], summary="G 端待办（核查 / 应急）")
def gov_todos(db: DbDep, tenant_id: TenantId, current_user: CurrentUser) -> Resp[dict[str, Any]]:
    today = date.today()
    rng = _rng("gov-todos", tenant_id, today.isoformat())

    items: list[dict[str, Any]] = []
    # 1. 逾期任务 → 核查待办
    overdue = (
        db.query(FarmworkTask)
        .filter(
            FarmworkTask.tenant_id == tenant_id,
            FarmworkTask.status.in_(["待办", "进行中"]),
            FarmworkTask.plan_date < today,
        )
        .order_by(FarmworkTask.plan_date)
        .limit(4)
        .all()
    )
    for t in overdue:
        items.append(
            {
                "id": f"chk-task-{t.id}",
                "type": "农事核查",
                "level": "中",
                "title": f"核查「{t.type}」任务执行情况",
                "detail": f"计划 {t.plan_date}，执行人 {t.assignee or '未指派'}，已逾期",
                "deadline": (today + timedelta(days=2)).isoformat(),
                "link": "entities",
            }
        )

    # 2. 主体例行核查（确定性 mock）
    subjects = ["智耘示范园区", "绿丰家庭农场", "红旗蔬菜合作社"]
    for i, name in enumerate(subjects):
        if rng.random() < 0.7:
            items.append(
                {
                    "id": f"chk-subject-{i}",
                    "type": "主体核查",
                    "level": rng.choice(["中", "低"]),
                    "title": f"{name} 季度例行核查",
                    "detail": rng.choice(
                        ["投入品台账待核验", "新扩建大棚用地备案核查", "绿色认证年审材料核验"]
                    ),
                    "deadline": (today + timedelta(days=rng.randint(3, 10))).isoformat(),
                    "link": "entities",
                }
            )

    # 3. 应急事件待处置
    if rng.random() < 0.6:
        items.append(
            {
                "id": "emg-001",
                "type": "应急事件",
                "level": "高",
                "title": "西区地块发现异常死苗",
                "detail": "巡田上报：疑似药害或肥害，需现场核查并拍照留证",
                "deadline": today.isoformat(),
                "link": "report",
            }
        )

    high = sum(1 for i in items if i["level"] == "高")
    return Resp(data={"items": items, "total": len(items), "high_count": high, "is_mock": True})


# ---------- 主体核查 ----------

_MOCK_SUBJECTS = [
    {"id": 901, "name": "绿丰家庭农场", "kind": "家庭农场", "legal": "王建国", "blocks": 3, "area_mu": 180.0},
    {"id": 902, "name": "红旗蔬菜合作社", "kind": "合作社", "legal": "李秀兰", "blocks": 6, "area_mu": 520.0},
    {"id": 903, "name": "金穗种植大户（个体）", "kind": "种植大户", "legal": "张德福", "blocks": 2, "area_mu": 95.0},
]


def _risk_score(subject_id: int) -> dict[str, Any]:
    rng = _rng("risk", subject_id, date.today().isoformat())
    score = rng.randint(62, 98)
    level = "绿" if score >= 85 else ("黄" if score >= 70 else "红")
    return {
        "risk_score": score,
        "risk_level": level,
        "alerts_total": max(0, (100 - score) // 6),
        "cert_hash": hashlib.sha256(f"cert|{subject_id}|{date.today().year}".encode()).hexdigest()[:32],
    }


@router.get("/entities", response_model=Resp[dict[str, Any]], summary="监管主体列表（真实租户 + 演示主体）")
def gov_entities(db: DbDep, current_user: CurrentUser) -> Resp[dict[str, Any]]:
    items: list[dict[str, Any]] = []
    tenants = db.query(Tenant).all()
    for t in tenants:
        cnt = db.query(Block).filter(Block.tenant_id == t.id).count()
        area = (
            db.query(Block)
            .filter(Block.tenant_id == t.id)
            .with_entities(Block.area_mu)
            .all()
        )
        r = _risk_score(t.id)
        items.append(
            {
                "id": t.id,
                "name": t.name,
                "kind": "园区/企业",
                "legal": (t.contact or "—") if hasattr(t, "contact") else "—",
                "blocks": cnt,
                "area_mu": round(sum(a[0] or 0 for a in area), 1),
                "is_mock": False,
                **r,
            }
        )
    items.extend({**m, "is_mock": True, **_risk_score(m["id"])} for m in _MOCK_SUBJECTS)
    return Resp(data={"items": items, "total": len(items), "is_mock": True})


@router.get("/entities/{entity_id}", response_model=Resp[dict[str, Any]], summary="主体台账 / 历史告警 / 存证")
def gov_entity_detail(entity_id: int, db: DbDep, current_user: CurrentUser) -> Resp[dict[str, Any]]:
    t = db.get(Tenant, entity_id)
    if t is not None:
        base = {
            "id": t.id,
            "name": t.name,
            "kind": "园区/企业",
            "legal": "—",
            "is_mock": False,
        }
    else:
        m = next((x for x in _MOCK_SUBJECTS if x["id"] == entity_id), None)
        if m is None:
            from app.core.exceptions import NotFoundError

            raise NotFoundError("主体不存在")
        base = {**m, "is_mock": True}

    r = _risk_score(entity_id)
    rng = _rng("entity-alerts", entity_id, date.today().isoformat())
    alert_types = [
        ("设备离线", "中", "土壤墒情传感器离线超过 2 小时"),
        ("投入品超标", "高", "抽检发现 1 批次叶菜农残接近限量值"),
        ("任务逾期", "中", "采收计划逾期未执行"),
        ("溯源缺失", "低", "1 个批次未关联种植季档案"),
    ]
    alerts = []
    for _ in range(r["alerts_total"] % 4 + 1):
        tp, lv, msg = rng.choice(alert_types)
        d = date.today() - timedelta(days=rng.randint(1, 30))
        alerts.append({"date": d.isoformat(), "type": tp, "level": lv, "msg": msg})

    return Resp(
        data={
            **base,
            **r,
            "ledger": {
                "注册时间": "2024-03-18",
                "经营类别": base["kind"],
                "地块数": base.get("blocks", 1),
                "种植面积(亩)": base.get("area_mu", 120.0),
                "绿色认证": "有效（至 2027-03）",
                "上年抽检": f"{rng.randint(2, 6)} 次，合格率 100%",
            },
            "alerts": alerts,
            "blockchain": {
                "chain": "智耘联盟链（演示）",
                "cert_hash": r["cert_hash"],
                "last_block_height": 10240 + entity_id,
                "last_anchor_at": datetime.now(_tz.utc).strftime("%Y-%m-%d %H:%M"),
            },
            "is_mock": True,
        }
    )


# ---------- 应急上报（演示：内存） ----------

_emergency_store: list[dict[str, Any]] = []


class EmergencyIn(BaseModel):
    type: str = Field(..., description="事件类型：病虫害/药害/污染/自然灾害/其他")
    desc: str = Field("", description="文字/语音转写描述")
    geo: str | None = Field(None, description="定位，如 34.746,113.625")
    photo_name: str | None = Field(None, description="现场照片文件名（演示）")
    voice_text: str | None = Field(None, description="语音描述转写（演示）")


@router.post("/emergency", response_model=Resp[dict[str, Any]], summary="应急上报（演示：自动派单）")
def gov_emergency(payload: EmergencyIn, current_user: CurrentUser) -> Resp[dict[str, Any]]:
    rid = f"EMG-{datetime.now(_tz.utc).strftime('%Y%m%d%H%M%S')}"
    rec = {
        "id": rid,
        **payload.model_dump(),
        "reporter": current_user.display_name or current_user.username,
        "reported_at": datetime.now(_tz.utc).isoformat(),
        "status": "已派单",
        "dispatch_to": "区农业农村局应急指挥中心",
        "sla_min": 120,
    }
    _emergency_store.insert(0, rec)
    if len(_emergency_store) > 50:
        _emergency_store.pop()
    return Resp(data=rec)


@router.get("/emergency", response_model=Resp[dict[str, Any]], summary="应急上报记录（本次会话内存）")
def gov_emergency_list(current_user: CurrentUser) -> Resp[dict[str, Any]]:
    return Resp(data={"items": _emergency_store, "total": len(_emergency_store), "is_mock": True})


# ---------- 领导看板（只读，镜像 PC 工作台） ----------


@router.get("/board", response_model=Resp[dict[str, Any]], summary="G 端看板（只读镜像）")
def gov_board(db: DbDep, tenant_id: TenantId, current_user: CurrentUser) -> Resp[dict[str, Any]]:
    blocks = db.query(Block).filter(Block.tenant_id == tenant_id).count()
    area = db.query(Block).filter(Block.tenant_id == tenant_id).with_entities(Block.area_mu).all()
    tasks = db.query(FarmworkTask).filter(FarmworkTask.tenant_id == tenant_id).count()
    done = (
        db.query(FarmworkTask)
        .filter(FarmworkTask.tenant_id == tenant_id, FarmworkTask.status == "已完成")
        .count()
    )
    rng = _rng("gov-board", tenant_id, date.today().isoformat())
    week_scale = [round(rng.uniform(180, 320), 0) for _ in range(7)]
    return Resp(
        data={
            "kpi": {
                "blocks": blocks,
                "area_mu": round(sum(a[0] or 0 for a in area), 1),
                "tasks_total": tasks,
                "tasks_done": done,
                "task_done_rate": round(done / tasks * 100, 1) if tasks else 0.0,
                "subjects": 4,
                "certified_batches": rng.randint(8, 20),
                "complaints_open": rng.randint(0, 2),
            },
            "week_scale": week_scale,  # 近 7 日抽检/核查量（演示）
            "alarm_trend": {"high": rng.randint(0, 2), "mid": rng.randint(1, 4), "low": rng.randint(2, 6)},
            "is_mock": True,
        }
    )
