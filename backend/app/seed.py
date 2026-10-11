"""初始化脚本：建库 + 演示样例数据。

运行：
    python -m app.seed

幂等：重复执行不会重复创建。

演示数据总览（供 PC 端与 APP 端 demo 使用）：
- 租户 1 个：示范园区（默认租户）
- 账号 4 个：admin / manager / worker / guest
- 地块 6 块：稻田×2、番茄棚、黄瓜棚、麦田、玉米地
- 种植季 6 个：4 个种植中、2 个已收获
- 农事任务 14 条：覆盖 待办/进行中/已完成/已逾期
- 采收 3 笔 → 自动生成溯源批次 3 个（番茄×2、黄瓜×1）
- 数据资产 10 个：全部完成至少 1 次质量稽核并入库存证
"""

import logging as _log
from datetime import date, timedelta

from sqlalchemy import select

from app.core.security import hash_password
from app.db.init_db import init_database
from app.db.session import SessionLocal
from app.models.batch import Batch
from app.models.block import Block
from app.models.data_asset import DataAsset, DataAssetQuality
from app.models.farmwork import FarmworkTask
from app.models.harvest import HarvestRecord
from app.models.planting import Planting
from app.models.rbac import Permission, Role, User
from app.models.tenant import Tenant

log = _log.getLogger("seed")

DEFAULT_PERMS: list[tuple[str, str, str]] = [
    # (code, name, module)
    ("user:read", "查看用户", "系统"),
    ("user:write", "编辑用户", "系统"),
    ("rbac:write", "编辑角色/权限", "系统"),
    ("asset:read", "查看数据资产", "数据资产"),
    ("asset:write", "编辑数据资产", "数据资产"),
    ("block:read", "查看地块", "地块"),
    ("block:write", "编辑地块", "地块"),
    ("planting:read", "查看种植季", "种植"),
    ("planting:write", "编辑种植季", "种植"),
    ("farmwork:read", "查看农事", "农事"),
    ("farmwork:write", "编辑农事", "农事"),
    ("harvest:write", "录入采收", "采收"),
    ("batch:read", "查看批次", "溯源"),
]

DEFAULT_ROLES: list[tuple[str, str, str, list[str]]] = [
    ("platform_admin", "平台超管", "跨租户所有权限", [c for c, _, _ in DEFAULT_PERMS]),
    (
        "tenant_admin",
        "租户管理员",
        "本租户全部业务权限",
        [
            "user:read", "user:write", "rbac:write",
            "asset:read", "asset:write",
            "block:read", "block:write",
            "planting:read", "planting:write",
            "farmwork:read", "farmwork:write",
            "harvest:write", "batch:read",
        ],
    ),
    (
        "farm_operator",
        "农场操作员",
        "农事打卡 / 采收录入",
        ["block:read", "farmwork:read", "farmwork:write", "harvest:write", "batch:read"],
    ),
    (
        "viewer",
        "只读访客",
        "只读数据资产与基础信息",
        ["asset:read", "block:read", "planting:read", "farmwork:read", "batch:read"],
    ),
]

ASSET_TEMPLATES: list[dict] = [
    {
        "code": "block_basic", "name": "地块基础信息", "domain": "地块", "dataset": "block_basic",
        "description": "园区/地块档案：编码、面积、品种、所属组织。",
        "refresh_freq": "日", "share_scope": "内部", "value_score": 70,
        "schema": [
            {"name": "code", "type": "string", "primary": True, "description": "地块编码"},
            {"name": "name", "type": "string", "description": "地块名称"},
            {"name": "area_mu", "type": "float", "description": "面积（亩）"},
            {"name": "crop", "type": "string", "description": "当前作物"},
            {"name": "variety", "type": "string", "description": "品种"},
            {"name": "owner_org", "type": "string", "description": "所属组织"},
        ],
    },
    {
        "code": "planting_season", "name": "种植季档案", "domain": "种植", "dataset": "planting_season",
        "description": "种植季：地块在某时间段内的种植活动。",
        "refresh_freq": "实时", "share_scope": "内部", "value_score": 75,
        "schema": [
            {"name": "block_id", "type": "int", "primary": True},
            {"name": "season", "type": "string"},
            {"name": "crop", "type": "string"},
            {"name": "start_date", "type": "datetime"},
            {"name": "expected_yield_kg", "type": "float"},
            {"name": "status", "type": "string"},
        ],
    },
    {
        "code": "farmwork_task", "name": "农事任务", "domain": "农事", "dataset": "farmwork_task",
        "description": "耕/种/肥/药/水/收任务，含执行留痕。",
        "refresh_freq": "实时", "share_scope": "授权", "value_score": 80,
        "schema": [
            {"name": "task_id", "type": "int", "primary": True},
            {"name": "type", "type": "string"},
            {"name": "plan_date", "type": "datetime"},
            {"name": "status", "type": "string"},
            {"name": "assignee", "type": "string"},
            {"name": "evidences", "type": "json", "description": "照片/视频"},
        ],
    },
    {
        "code": "input_usage", "name": "投入品使用", "domain": "农事", "dataset": "input_usage",
        "description": "化肥/农药/种子使用量与休药期。",
        "refresh_freq": "实时", "share_scope": "授权", "value_score": 85,
        "schema": [
            {"name": "task_id", "type": "int"},
            {"name": "name", "type": "string"},
            {"name": "dosage", "type": "float"},
            {"name": "withdraw_period_days", "type": "int"},
            {"name": "batch_no", "type": "string", "on_chain": True},
        ],
    },
    {
        "code": "harvest_record", "name": "采收记录", "domain": "采收", "dataset": "harvest_record",
        "description": "采收批次、重量、等级、地理坐标。",
        "refresh_freq": "实时", "share_scope": "公开", "value_score": 88,
        "schema": [
            {"name": "harvest_id", "type": "int", "primary": True},
            {"name": "batch_code", "type": "string", "on_chain": True},
            {"name": "weight_kg", "type": "float"},
            {"name": "quality_grade", "type": "string"},
            {"name": "geo", "type": "string"},
            {"name": "harvested_at", "type": "datetime"},
        ],
    },
    {
        "code": "trace_batch", "name": "溯源批次", "domain": "溯源", "dataset": "trace_batch",
        "description": "最小批次（地块+采收日+品种），含溯源码与链上凭证。",
        "refresh_freq": "实时", "share_scope": "公开", "value_score": 90,
        "schema": [
            {"name": "code", "type": "string", "primary": True, "on_chain": True},
            {"name": "product_name", "type": "string"},
            {"name": "origin", "type": "string"},
            {"name": "status", "type": "string"},
            {"name": "chain_tx", "type": "string"},
        ],
    },
    {
        "code": "iot_telemetry", "name": "物联网遥测", "domain": "设备", "dataset": "iot_telemetry",
        "description": "传感器/网关/无人机遥测点（温/湿/墒/视频等）。",
        "refresh_freq": "实时", "share_scope": "内部", "value_score": 78,
        "schema": [
            {"name": "device_id", "type": "string"},
            {"name": "ts", "type": "datetime"},
            {"name": "key", "type": "string"},
            {"name": "value", "type": "float"},
        ],
    },
    {
        "code": "carbon_account", "name": "碳账户核算", "domain": "碳中和", "dataset": "carbon_account",
        "description": "排放/碳汇按地块/园区汇总，方法学版本可追溯。",
        "refresh_freq": "月", "share_scope": "授权", "value_score": 92,
        "schema": [
            {"name": "period", "type": "string"},
            {"name": "scope", "type": "string"},
            {"name": "kg_co2e", "type": "float"},
            {"name": "methodology", "type": "string"},
        ],
    },
    {
        "code": "ai_inference", "name": "AI 推理记录", "domain": "AI", "dataset": "ai_inference",
        "description": "病虫害识别、产量预测、灾害预警等推理日志。",
        "refresh_freq": "实时", "share_scope": "内部", "value_score": 86,
        "schema": [
            {"name": "model", "type": "string"},
            {"name": "prompt", "type": "string"},
            {"name": "confidence", "type": "float"},
            {"name": "cost", "type": "float"},
            {"name": "latency_ms", "type": "int"},
        ],
    },
    {
        "code": "subsidy_project", "name": "G 端补贴项目", "domain": "政务", "dataset": "subsidy_project",
        "description": "补贴项目立项-申报-公示-验收-兑付全流程。",
        "refresh_freq": "周", "share_scope": "内部", "value_score": 88,
        "schema": [
            {"name": "project_id", "type": "int", "primary": True},
            {"name": "name", "type": "string"},
            {"name": "budget", "type": "float"},
            {"name": "status", "type": "string"},
        ],
    },
]

# 演示地块（6 块，覆盖大田/设施两类场景）
DEMO_BLOCKS: list[dict] = [
    {"code": "BLK-001", "name": "1 号稻田", "crop": "水稻", "variety": "南粳 9108", "area_mu": 120.5,
     "wkt": "POLYGON((116.40 39.90,116.42 39.90,116.42 39.92,116.40 39.92,116.40 39.90))"},
    {"code": "BLK-002", "name": "2 号稻田", "crop": "水稻", "variety": "南粳 9108", "area_mu": 98.0,
     "wkt": "POLYGON((116.42 39.90,116.44 39.90,116.44 39.92,116.42 39.92,116.42 39.90))"},
    {"code": "BLK-003", "name": "东区番茄棚", "crop": "番茄", "variety": "粉果 2 号", "area_mu": 15.0,
     "wkt": "POLYGON((116.40 39.92,116.41 39.92,116.41 39.93,116.40 39.93,116.40 39.92))"},
    {"code": "BLK-004", "name": "西区黄瓜棚", "crop": "黄瓜", "variety": "津优 35 号", "area_mu": 12.0,
     "wkt": "POLYGON((116.41 39.92,116.42 39.92,116.42 39.93,116.41 39.93,116.41 39.92))"},
    {"code": "BLK-005", "name": "北区麦田", "crop": "小麦", "variety": "济麦 22", "area_mu": 210.0,
     "wkt": "POLYGON((116.36 39.93,116.39 39.93,116.39 39.95,116.36 39.95,116.36 39.93))"},
    {"code": "BLK-006", "name": "南片玉米地", "crop": "玉米", "variety": "郑单 958", "area_mu": 65.0,
     "wkt": "POLYGON((116.40 39.88,116.43 39.88,116.43 39.90,116.40 39.90,116.40 39.88))"},
]

_today = date.today()


def seed() -> None:
    init_database()
    db = SessionLocal()
    try:
        # ---------- 1. 租户 ----------
        tenant = db.scalar(select(Tenant).where(Tenant.code == "default"))
        if tenant is None:
            tenant = Tenant(
                code="default",
                name="智耘示范园区",
                tenant_type="B",
                contact_name="园区管理员",
                contact_phone="138-0000-0000",
            )
            db.add(tenant)
            db.flush()
            log.info("创建默认租户: %s", tenant.name)

        # ---------- 2. 权限点 ----------
        existing_perm_codes = {p.code for p in db.scalars(select(Permission)).all()}
        new_perms = [
            Permission(code=c, name=n, module=m)
            for c, n, m in DEFAULT_PERMS
            if c not in existing_perm_codes
        ]
        if new_perms:
            db.add_all(new_perms)
            db.flush()

        # ---------- 3. 角色 ----------
        all_perms = {p.code: p for p in db.scalars(select(Permission)).all()}
        for code, name, desc, perm_codes in DEFAULT_ROLES:
            r = db.scalar(select(Role).where(Role.code == code))
            if r is None:
                r = Role(code=code, name=name, description=desc)
                r.permissions = [all_perms[c] for c in perm_codes if c in all_perms]
                db.add(r)
        db.flush()

        # ---------- 4. 账号（4 个，覆盖 4 类角色） ----------
        role_map = {r.code: r for r in db.scalars(select(Role)).all()}
        demo_users: list[tuple[str, str, str, str, bool]] = [
            # (username, password, display_name, role_code, is_platform_admin)
            ("admin", "admin123", "平台超管", "platform_admin", True),
            ("manager", "manager123", "园区管理员", "tenant_admin", False),
            ("worker", "worker123", "李技术员", "farm_operator", False),
            ("guest", "guest123", "访客（只读）", "viewer", False),
        ]
        for username, password, display_name, role_code, is_admin in demo_users:
            if db.scalar(select(User).where(User.username == username)) is None:
                u = User(
                    tenant_id=tenant.id,
                    username=username,
                    password_hash=hash_password(password),
                    display_name=display_name,
                    is_active=True,
                    is_platform_admin=is_admin,
                )
                u.roles = [role_map[role_code]]
                db.add(u)
        db.flush()
        log.info("账号就绪: admin / manager / worker / guest")

        # ---------- 5. 地块 ----------
        block_map: dict[str, Block] = {}
        for tpl in DEMO_BLOCKS:
            b = db.scalar(
                select(Block).where(Block.tenant_id == tenant.id, Block.code == tpl["code"])
            )
            if b is None:
                b = Block(
                    tenant_id=tenant.id,
                    code=tpl["code"],
                    name=tpl["name"],
                    crop=tpl["crop"],
                    variety=tpl["variety"],
                    area_mu=tpl["area_mu"],
                    owner_org=tenant.name,
                    geometry_wkt=tpl["wkt"],
                )
                db.add(b)
                db.flush()
            block_map[tpl["code"]] = b

        # ---------- 6. 种植季 ----------
        # 4 个大田作物：种植中；2 个设施作物：已收获
        planting_map: dict[str, Planting] = {}
        planting_specs: list[tuple[str, str, str]] = [
            # (block_code, season, status)
            ("BLK-001", "2026 春", "种植中"),
            ("BLK-002", "2026 春", "种植中"),
            ("BLK-003", "2025-26 冬春茬", "已收获"),
            ("BLK-004", "2025-26 冬春茬", "已收获"),
            ("BLK-005", "2025-26 秋播", "种植中"),
            ("BLK-006", "2026 春", "种植中"),
        ]
        for block_code, season, status in planting_specs:
            blk = block_map[block_code]
            p = db.scalar(
                select(Planting).where(
                    Planting.tenant_id == tenant.id,
                    Planting.block_id == blk.id,
                    Planting.season == season,
                )
            )
            if p is None:
                start = _today - timedelta(days=120 if status == "种植中" else 200)
                p = Planting(
                    tenant_id=tenant.id,
                    block_id=blk.id,
                    season=season,
                    crop=blk.crop or "未知",
                    variety=blk.variety,
                    start_date=start,
                    expected_yield_kg=round((blk.area_mu or 0) * 650),
                    status=status,
                )
                db.add(p)
                db.flush()
                blk.current_planting_id = p.id
            planting_map[block_code] = p
        db.flush()
        log.info("地块 6 块 / 种植季 6 个就绪")

        # ---------- 7. 农事任务（14 条，状态丰富） ----------
        existing_tasks = db.scalar(select(FarmworkTask.id).limit(1))
        if existing_tasks is None:
            task_specs: list[tuple[str, str, int, str, str]] = [
                # (block_code, type, plan_offset_days, status, assignee)
                ("BLK-001", "分蘖期追肥", -3, "已完成", "李技术员"),
                ("BLK-001", "灌溉", 0, "待办", "李技术员"),
                ("BLK-001", "病虫害巡检", -1, "进行中", "李技术员"),
                ("BLK-002", "晒田控蘖", 2, "待办", "王大姐"),
                ("BLK-002", "稻飞虱防治", -2, "待办", "王大姐"),  # 逾期 → 告警演示
                ("BLK-003", "整枝打杈", 1, "待办", "张师傅"),
                ("BLK-003", "滴灌系统检修", -5, "已完成", "张师傅"),
                ("BLK-004", "霜霉病防治", -1, "待办", "张师傅"),  # 逾期 → 告警演示
                ("BLK-004", "采收准备", 3, "待办", "赵工"),
                ("BLK-005", "返青期追肥", -4, "已完成", "赵工"),
                ("BLK-005", "杂草防除", 1, "待办", "赵工"),
                ("BLK-005", "苗情调查", 0, "进行中", "赵工"),
                ("BLK-006", "心叶期灌心防螟", -1, "进行中", "李技术员"),
                ("BLK-006", "追施穗肥", 4, "待办", "王大姐"),
            ]
            for block_code, ttype, offset, status, assignee in task_specs:
                p = planting_map[block_code]
                db.add(
                    FarmworkTask(
                        tenant_id=tenant.id,
                        planting_id=p.id,
                        type=ttype,
                        plan_date=_today + timedelta(days=offset),
                        status=status,
                        assignee=assignee,
                        geo="116.405,39.905",
                        completed_at=None,
                    )
                )
            db.flush()
            log.info("农事任务 14 条就绪（含 2 条逾期）")

        # ---------- 8. 采收 + 溯源批次（3 笔） ----------
        existing_batch = db.scalar(select(Batch.id).limit(1))
        if existing_batch is None:
            harvest_specs = [
                ("BLK-003", "TB-DEMO-20260315-A1", 4800, "A", "张师傅", "已上架"),
                ("BLK-003", "TB-DEMO-20260420-B2", 3200, "A", "张师傅", "在途"),
                ("BLK-004", "CG-DEMO-20260418-C3", 2600, "B", "赵工", "已上架"),
            ]
            for block_code, batch_code, weight, grade, operator, batch_status in harvest_specs:
                p = planting_map[block_code]
                h = HarvestRecord(
                    tenant_id=tenant.id,
                    planting_id=p.id,
                    batch_code=batch_code,
                    weight_kg=weight,
                    quality_grade=grade,
                    geo="116.405,39.905",
                    operator=operator,
                )
                db.add(h)
                db.flush()
                db.add(
                    Batch(
                        tenant_id=tenant.id,
                        planting_id=p.id,
                        harvest_id=h.id,
                        code=batch_code,
                        product_name=p.crop or "农产品",
                        variety=p.variety,
                        origin=f"{block_map[block_code].name} · {tenant.name}",
                        status=batch_status,
                        chain_tx=None,  # v0.5 接入区块链后填充
                    )
                )
            db.flush()
            log.info("采收 3 笔 + 溯源批次 3 个就绪（扫码码: TB-DEMO-20260315-A1 等）")

        # ---------- 9. 数据资产（10 个）+ 质量稽核 + 入库存证 ----------
        from app.services.data_asset_service import certify_asset, add_quality
        from app.schemas.data_asset import DataAssetQualityCreate

        existing_asset_codes = {a.code for a in db.scalars(select(DataAsset)).all()}
        created_ids: list[int] = []
        for tpl in ASSET_TEMPLATES:
            if tpl["code"] in existing_asset_codes:
                continue
            a = DataAsset(
                tenant_id=tenant.id,
                code=tpl["code"],
                name=tpl["name"],
                domain=tpl["domain"],
                dataset=tpl["dataset"],
                description=tpl["description"],
                schema_json=tpl["schema"],
                refresh_freq=tpl["refresh_freq"],
                share_scope=tpl["share_scope"],
                value_score=tpl["value_score"],
                owner="园区管理员",
                source_system="智耘云 v0.1",
            )
            db.add(a)
            db.flush()
            created_ids.append(a.id)

        # 所有资产（含新建与既有）都补一次质量稽核 + 认证
        all_assets = db.scalars(select(DataAsset)).all()
        certified_count = 0
        for a in all_assets:
            if not db.scalars(
                select(DataAssetQuality.id).where(DataAssetQuality.asset_id == a.id).limit(1)
            ).first():
                add_quality(
                    db, a.id, tenant.id,
                    DataAssetQualityCreate(
                        completeness=98.5,
                        accuracy=96.0,
                        timeliness=99.0,
                        consistency=97.5,
                        notes="v0.1 演示数据首次稽核通过",
                    ),
                )
            if not a.is_certified:
                certify_asset(db, a.id, tenant.id)
                certified_count += 1
        db.flush()
        log.info(
            "数据资产 %d 个，本次新认证 %d 个（全部带质量稽核记录）",
            len(all_assets), certified_count,
        )

        db.commit()
        log.info("=" * 56)
        log.info("初始化完成 ✅（演示样例已就绪）")
        log.info("账号: admin/admin123 · manager/manager123")
        log.info("      worker/worker123（农事打卡） · guest/guest123（只读）")
        log.info("溯源码演示: TB-DEMO-20260315-A1 / TB-DEMO-20260420-B2 / CG-DEMO-20260418-C3")
        log.info("Swagger: http://localhost:8000/docs")
        log.info("=" * 56)
    finally:
        db.close()


if __name__ == "__main__":
    seed()