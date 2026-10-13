"""区块链溯源中心（PC 端演示 mock）。

演示说明：
- v0.1 无真实链适配层，事件哈希/链上 tx 用确定性伪随机生成
- v0.5 接入长安链/BSN 适配层后，仅替换 `_events_for_batch()` 的数据来源，接口契约不变
"""

import hashlib
import random
from datetime import date, datetime, timedelta
from typing import Any

from fastapi import APIRouter, Query

from app.core.deps import CurrentUser
from app.schemas.common import Resp

router = APIRouter()


def _rng(*parts: Any) -> random.Random:
    key = "|".join(str(p) for p in parts)
    seed = int(hashlib.sha256(key.encode("utf-8")).hexdigest()[:12], 16)
    return random.Random(seed)


def _hash(prefix: str, seed: str) -> str:
    return prefix + hashlib.sha256(seed.encode("utf-8")).hexdigest()[:62]


# 溯源模板：节点编排（颗粒度：地块→投入品→加工→物流→销售）
TRACE_TEMPLATES: list[dict[str, Any]] = [
    {
        "id": "tpl_veg",
        "name": "果蔬冷链全程模板",
        "applied_to": "番茄/黄瓜等设施蔬菜",
        "nodes": [
            {"seq": 1, "node_type": "地块", "name": "地块与种植季档案", "on_chain": True, "required": True},
            {"seq": 2, "node_type": "投入品", "name": "肥药使用与休药期", "on_chain": True, "required": True},
            {"seq": 3, "node_type": "采收", "name": "采收批次与分级", "on_chain": True, "required": True},
            {"seq": 4, "node_type": "加工", "name": "分拣/清洗/包装工序", "on_chain": False, "required": True},
            {"seq": 5, "node_type": "检测", "name": "农残检测报告", "on_chain": True, "required": True},
            {"seq": 6, "node_type": "物流", "name": "冷链运输温控", "on_chain": False, "required": False},
            {"seq": 7, "node_type": "销售", "name": "销售凭证/门店", "on_chain": False, "required": False},
        ],
    },
    {
        "id": "tpl_grain",
        "name": "粮食收储模板",
        "applied_to": "水稻/小麦/玉米",
        "nodes": [
            {"seq": 1, "node_type": "地块", "name": "地块与种植季档案", "on_chain": True, "required": True},
            {"seq": 2, "node_type": "投入品", "name": "投入品台账", "on_chain": True, "required": False},
            {"seq": 3, "node_type": "采收", "name": "采收与烘干", "on_chain": True, "required": True},
            {"seq": 4, "node_type": "加工", "name": "收储入库", "on_chain": True, "required": True},
            {"seq": 5, "node_type": "销售", "name": "出库与购销合同", "on_chain": False, "required": False},
        ],
    },
]

NODE_FLOW: list[tuple[str, str, int]] = [
    # (node_type, node_name, 事件距今天数偏移)
    ("地块", "地块与种植季档案确认", -90),
    ("投入品", "肥药使用记录锁定", -45),
    ("采收", "采收批次生成与分级", -20),
    ("加工", "分拣包装工序完成", -12),
    ("检测", "农残检测报告出具", -6),
    ("物流", "冷链运输在途", -1),
    ("销售", "门店销售凭证", 0),
]


@router.get("/templates", response_model=Resp[list[dict[str, Any]]], summary="溯源模板（节点编排）")
def list_templates(current_user: CurrentUser) -> Resp[list[dict[str, Any]]]:
    return Resp(data=TRACE_TEMPLATES)


@router.get("/events", response_model=Resp[dict[str, Any]], summary="批次溯源事件时间线（演示）")
def list_events(
    batch_code: str = Query(..., description="溯源批次编码"),
    current_user: CurrentUser = None,  # type: ignore[assignment]
) -> Resp[dict[str, Any]]:
    """演示实现：CurrentUser 仅做登录校验（FastAPI 依赖注入），不参与业务。"""
    rng = _rng("trace-events", batch_code, date.today().isoformat())
    # 已推进到第几个节点（5-7 之间，确定性）
    reached = 5 + (hash32(batch_code) % 3)
    events: list[dict[str, Any]] = []
    for i, (ntype, name, offset) in enumerate(NODE_FLOW):
        if i >= reached:
            break
        seed = f"{batch_code}|{ntype}|{name}"
        done = offset < 0 or (ntype != "销售")
        events.append(
            {
                "node_type": ntype,
                "node_name": name,
                "ts": (datetime.now() + timedelta(days=offset)).strftime("%Y-%m-%d %H:%M"),
                "payload_hash": _hash("0x", seed),
                "ipfs_cid": f"bafy{hashlib.sha256(seed.encode()).hexdigest()[:44]}",
                "chain_tx": _hash("0x", seed + "|tx") if ntype in {"地块", "投入品", "采收", "检测"} else None,
                "on_chain": ntype in {"地块", "投入品", "采收", "检测"},
                "status": "已上链" if (done and ntype in {"地块", "投入品", "采收", "检测"}) else ("存证中" if done else "进行中"),
                "is_mock": True,
            }
        )
    return Resp(data={"batch_code": batch_code, "items": events, "total": len(events)})


def hash32(s: str) -> int:
    h = 2166136261
    for ch in s:
        h ^= ord(ch)
        h = (h * 16777619) & 0xFFFFFFFF
    return h


@router.get("/stats", response_model=Resp[dict[str, Any]], summary="溯源查询统计（扫码/地域/上链率，演示）")
def trace_stats(current_user: CurrentUser) -> Resp[dict[str, Any]]:
    today = date.today()
    rng = _rng("trace-stats", today.isoformat())
    scans = []
    for i in range(6, -1, -1):
        d = today - timedelta(days=i)
        r = _rng("scan", d.isoformat())
        scans.append({"date": d.isoformat(), "weekday": ["一", "二", "三", "四", "五", "六", "日"][d.weekday()], "count": r.randint(120, 460)})
    regions = [
        {"region": "北京", "count": rng.randint(400, 700)},
        {"region": "上海", "count": rng.randint(300, 560)},
        {"region": "杭州", "count": rng.randint(200, 420)},
        {"region": "成都", "count": rng.randint(120, 300)},
        {"region": "广州", "count": rng.randint(80, 260)},
    ]
    regions.sort(key=lambda x: -x["count"])
    return Resp(
        data={
            "scans_7d": scans,
            "regions_top": regions,
            "batches_total": 3,
            "on_chain_rate": 95.0,
            "recalls": 0,
            "is_mock": True,
        }
    )
