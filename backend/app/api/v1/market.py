"""价格行情 / 补贴政策 / 投入品字典（演示 mock，公共接口）。

演示说明：
- 行情按「品种 × 日期」确定性生成，同日同价、隔日波动
- 政策与投入品为静态演示数据源
"""

import hashlib
import random
from datetime import date
from typing import Any

from fastapi import APIRouter

from app.schemas.common import Resp

router = APIRouter()


def _rng(*parts: Any) -> random.Random:
    key = "|".join(str(p) for p in parts)
    seed = int(hashlib.sha256(key.encode("utf-8")).hexdigest()[:12], 16)
    return random.Random(seed)


PRODUCTS = [
    ("番茄（大棚）", "元/kg", 5.2),
    ("黄瓜（水果）", "元/kg", 6.8),
    ("普通白菜", "元/kg", 2.6),
    ("辣椒（线椒）", "元/kg", 9.4),
    ("水稻（籼稻）", "元/50kg", 138.0),
    ("小麦（三等）", "元/50kg", 121.0),
    ("玉米（干粮）", "元/kg", 2.4),
    ("鸡蛋（散养）", "元/kg", 11.6),
]

MARKETS = ["河南万邦农产品物流园", "寿光地利农产品物流园", "新发地批发市场"]


@router.get("/prices", response_model=Resp[dict[str, Any]], summary="价格行情（演示，按日确定性）")
def market_prices() -> Resp[dict[str, Any]]:
    today = date.today().isoformat()
    items = []
    for name, unit, base in PRODUCTS:
        r = _rng("price", name, today)
        price = round(base * (1 + r.uniform(-0.12, 0.12)), 2)
        prev = round(base * (1 + _rng("price", name, date.today().toordinal() - 1).uniform(-0.12, 0.12)), 2)
        items.append(
            {
                "name": name,
                "unit": unit,
                "price": price,
                "prev_price": prev,
                "change_pct": round((price - prev) / prev * 100, 1),
                "market": r.choice(MARKETS),
                "date": today,
            }
        )
    return Resp(data={"items": items, "updated_at": today, "is_mock": True})


POLICIES = [
    {
        "id": "p1",
        "title": "耕地地力保护补贴",
        "level": "中央",
        "region": "全国",
        "amount_desc": "约 80–120 元/亩（各地标准不同）",
        "deadline": "每年 6 月 30 日前申报",
        "requirement": "拥有耕地承包权、实际种植粮食作物",
        "status": "申报中",
    },
    {
        "id": "p2",
        "title": "农机购置与应用补贴",
        "level": "中央+省",
        "region": "全国",
        "amount_desc": "购机价的 15%–35%",
        "deadline": "常年受理，购机后 60 日内",
        "requirement": "购置目录内农机具，一台一档",
        "status": "常年申报",
    },
    {
        "id": "p3",
        "title": "设施农业大棚建设补贴",
        "level": "县级",
        "region": "示范县",
        "amount_desc": "新建日光温室 8000–15000 元/亩",
        "deadline": "2026-11-30 前",
        "requirement": "集中连片 10 亩以上、验收合格",
        "status": "申报中",
    },
    {
        "id": "p4",
        "title": "绿色食品 / 有机认证奖补",
        "level": "市级",
        "region": "全市",
        "amount_desc": "绿色食品 2 万元、有机 3 万元一次性奖补",
        "deadline": "获证后 90 日内",
        "requirement": "本年度新获证且在有效期内",
        "status": "申报中",
    },
    {
        "id": "p5",
        "title": "化肥农药减量增效补贴",
        "level": "省级",
        "region": "产粮大县",
        "amount_desc": "有机肥替代 300 元/吨、统防统治 30 元/亩次",
        "deadline": "2026-12-15 前",
        "requirement": "购买目录内投入品并有台账记录",
        "status": "申报中",
    },
]


@router.get("/policies", response_model=Resp[dict[str, Any]], summary="补贴政策（演示数据源）")
def market_policies() -> Resp[dict[str, Any]]:
    return Resp(data={"items": POLICIES, "total": len(POLICIES), "is_mock": True})


INPUTS = [
    {"id": "i1", "name": "10% 吡虫啉可湿性粉剂", "category": "杀虫剂", "target": "蚜虫/飞虱", "dosage": "1500 倍液叶面喷施", "withdraw_days": 7, "price": "6.5 元/袋"},
    {"id": "i2", "name": "15% 三唑酮可湿性粉剂", "category": "杀菌剂", "target": "白粉病/锈病", "dosage": "1000 倍液喷雾", "withdraw_days": 14, "price": "4.2 元/袋"},
    {"id": "i3", "name": "75% 百菌清可湿性粉剂", "category": "杀菌剂", "target": "早疫病/霜霉病", "dosage": "600 倍液喷雾", "withdraw_days": 7, "price": "5.0 元/袋"},
    {"id": "i4", "name": "1.8% 阿维菌素乳油", "category": "杀虫杀螨", "target": "红蜘蛛/斑潜蝇", "dosage": "3000 倍液喷叶背", "withdraw_days": 7, "price": "8.8 元/瓶"},
    {"id": "i5", "name": "腐殖酸水溶肥", "category": "肥料", "target": "促根壮苗", "dosage": "5kg/亩 随水冲施", "withdraw_days": 0, "price": "45 元/袋"},
    {"id": "i6", "name": "生物有机肥", "category": "肥料", "target": "改土培肥", "dosage": "200–300kg/亩 基施", "withdraw_days": 0, "price": "88 元/袋"},
    {"id": "i7", "name": "黄色粘虫板", "category": "物理防治", "target": "蚜虫/粉虱", "dosage": "25–30 张/亩 悬挂", "withdraw_days": 0, "price": "0.8 元/张"},
]


@router.get("/inputs", response_model=Resp[dict[str, Any]], summary="投入品字典（演示）")
def market_inputs() -> Resp[dict[str, Any]]:
    return Resp(data={"items": INPUTS, "total": len(INPUTS), "is_mock": True})
