"""AI 识病虫害（演示版 mock）。

演示说明：
- v0.1 无真实模型接入，按请求特征（文件名/作物/随机种子）从内置知识库返回诊断结果
- v0.5 接入真实多模态模型（伏羲大脑等）时，仅替换 `diagnose()` 实现，接口契约不变
"""

import hashlib
import random
from datetime import datetime
from datetime import timezone as _tz
from typing import Any

from fastapi import APIRouter
from pydantic import BaseModel, Field

from app.core.deps import CurrentUser, DbDep
from app.schemas.common import Resp

router = APIRouter()

# 内置病虫害知识库（演示）
DISEASE_LIBRARY: list[dict[str, Any]] = [
    {
        "code": "aphid",
        "name": "蚜虫",
        "type": "虫害",
        "host": "通用（番茄/黄瓜/小麦）",
        "severity": "中度",
        "confidence_range": (88, 96),
        "advice": [
            "悬挂黄色粘板诱杀有翅蚜",
            "喷施 10% 吡虫啉可湿性粉剂 1500 倍液，间隔 7 天再施 1 次",
            "保护瓢虫、食蚜蝇等天敌，减少广谱杀虫剂使用",
        ],
        "medicine": "10% 吡虫啉可湿性粉剂",
        "withdraw_period_days": 7,
    },
    {
        "code": "powdery_mildew",
        "name": "白粉病",
        "type": "真菌病害",
        "host": "小麦/黄瓜",
        "severity": "重度",
        "confidence_range": (85, 94),
        "advice": [
            "发病初期喷施 15% 三唑酮可湿性粉剂 1000 倍液",
            "加强通风降湿，棚内湿度控制在 70% 以下",
            "及时清除下部老叶、病叶并带出田外销毁",
        ],
        "medicine": "15% 三唑酮可湿性粉剂",
        "withdraw_period_days": 14,
    },
    {
        "code": "rice_planthopper",
        "name": "稻飞虱",
        "type": "虫害",
        "host": "水稻",
        "severity": "重度",
        "confidence_range": (90, 97),
        "advice": [
            "孕穗期百丛虫量达 500 头时立即用药",
            "喷施 25% 噻嗪酮可湿性粉剂 1500 倍液，重点喷水稻中下部",
            "保持浅水层 3-5cm，避免长期深灌",
        ],
        "medicine": "25% 噻嗪酮可湿性粉剂",
        "withdraw_period_days": 14,
    },
    {
        "code": "corn_borer",
        "name": "玉米螟",
        "type": "虫害",
        "host": "玉米",
        "severity": "中度",
        "confidence_range": (87, 95),
        "advice": [
            "心叶期灌心防治，用白僵菌颗粒剂丢心",
            "释放赤眼蜂，每亩 1-2 万头，分 2 次释放",
            "成虫期挂频振式杀虫灯诱杀",
        ],
        "medicine": "白僵菌颗粒剂（生物防治）",
        "withdraw_period_days": 0,
    },
    {
        "code": "tomato_early_blight",
        "name": "番茄早疫病",
        "type": "真菌病害",
        "host": "番茄",
        "severity": "中度",
        "confidence_range": (86, 93),
        "advice": [
            "发病初期摘除病叶，喷施 75% 百菌清可湿性粉剂 600 倍液",
            "控制浇水量，采用滴灌避免叶面结露",
            "增施磷钾肥提高植株抗性",
        ],
        "medicine": "75% 百菌清可湿性粉剂",
        "withdraw_period_days": 7,
    },
    {
        "code": "downy_mildew",
        "name": "霜霉病",
        "type": "真菌病害",
        "host": "黄瓜",
        "severity": "重度",
        "confidence_range": (89, 96),
        "advice": [
            "发现中心病株立即喷施 72% 霜脲·锰锌可湿性粉剂 800 倍液",
            "夜间通风降温除湿，缩短结露时间",
            "雨后及时排水，降低棚内湿度",
        ],
        "medicine": "72% 霜脲·锰锌可湿性粉剂",
        "withdraw_period_days": 10,
    },
    {
        "code": "spider_mite",
        "name": "红蜘蛛（叶螨）",
        "type": "虫害",
        "host": "通用（玉米/番茄/黄瓜）",
        "severity": "中度",
        "confidence_range": (84, 92),
        "advice": [
            "喷施 1.8% 阿维菌素乳油 3000 倍液，重点喷叶背",
            "高温干旱期加强巡查，及时灌水降温增湿",
            "清除田边杂草，减少虫源",
        ],
        "medicine": "1.8% 阿维菌素乳油",
        "withdraw_period_days": 7,
    },
    {
        "code": "healthy",
        "name": "未见明显病虫害",
        "type": "正常",
        "host": "通用",
        "severity": "无",
        "confidence_range": (80, 90),
        "advice": [
            "作物长势正常，建议继续保持常规巡检",
            "关注未来 3 天天气，提前做好水肥安排",
        ],
        "medicine": "无需用药",
        "withdraw_period_days": 0,
    },
]


class DiseaseIn(BaseModel):
    """识病请求（演示）。"""

    image_name: str | None = Field(default=None, description="照片文件名，用于伪随机种子")
    crop: str | None = Field(default=None, description="作物名，用于匹配知识库")
    block_id: int | None = Field(default=None, description="所属地块")


class DiseaseOut(BaseModel):
    """识病结果。"""

    code: str
    name: str
    type: str
    host: str
    severity: str
    confidence: float
    advice: list[str]
    medicine: str
    withdraw_period_days: int
    analyzed_at: str
    model: str = "demo-mock-v0.1"
    is_mock: bool = True


def _pick(crop: str | None, image_name: str | None) -> dict[str, Any]:
    """根据作物与文件名确定性挑选结果，保证同图同结果、不同图有差异。"""
    # 按作物过滤候选
    candidates = [d for d in DISEASE_LIBRARY if d["code"] != "healthy"]
    if crop:
        matched = [d for d in candidates if crop in d["host"]]
        if matched:
            candidates = matched
    seed_str = f"{image_name or 'no-name'}|{crop or 'no-crop'}"
    seed = int(hashlib.sha256(seed_str.encode("utf-8")).hexdigest()[:8], 16)
    rng = random.Random(seed)
    # 10% 概率判为健康
    if rng.random() < 0.10:
        return next(d for d in DISEASE_LIBRARY if d["code"] == "healthy")
    return rng.choice(candidates)


@router.get("/diseases", response_model=Resp[list[dict[str, Any]]], summary="内置病虫害知识库（演示）")
def list_diseases(current_user: CurrentUser) -> Resp[list[dict[str, Any]]]:
    """APP 常见病虫害图鉴入口。"""
    return Resp(data=DISEASE_LIBRARY)


@router.post("/disease", response_model=Resp[DiseaseOut], summary="拍照识病虫害（演示 mock）")
def diagnose_disease(
    payload: DiseaseIn,
    current_user: CurrentUser,
    db: DbDep,
) -> Resp[DiseaseOut]:
    d = _pick(payload.crop, payload.image_name)
    lo, hi = d["confidence_range"]
    conf = round(random.uniform(lo, hi), 1)
    return Resp(
        data=DiseaseOut(
            code=d["code"],
            name=d["name"],
            type=d["type"],
            host=d["host"],
            severity=d["severity"],
            confidence=conf,
            advice=d["advice"],
            medicine=d["medicine"],
            withdraw_period_days=d["withdraw_period_days"],
            analyzed_at=datetime.now(_tz.utc).isoformat(),
        )
    )