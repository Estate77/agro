/**
 * ★ 自动生成文件：由 scripts/record-pc-demo.mjs 从本地后端录制，请勿手工编辑。
 *
 * PC 端离线演示数据库（GitHub Pages 纯前端演示模式回放）：
 *   - DEMO_USERS  演示账号（用户名 -> 密码 + /auth/me 档案）
 *   - DEMO_DB     全部 GET 接口的确定性演示响应
 * 数据更新方式：本地起好后端后重跑 node scripts/record-pc-demo.mjs
 */
export const DEMO_USERS = {
  "admin": {
    "password": "admin123",
    "profile": {
      "id": 1,
      "username": "admin",
      "display_name": "平台超管",
      "tenant_id": 1,
      "tenant_name": "智耘示范园区",
      "is_platform_admin": true,
      "role_codes": [
        "platform_admin"
      ],
      "permission_codes": [
        "asset:read",
        "asset:write",
        "batch:read",
        "block:read",
        "block:write",
        "farmwork:read",
        "farmwork:write",
        "harvest:write",
        "planting:read",
        "planting:write",
        "rbac:write",
        "user:read",
        "user:write"
      ]
    }
  },
  "manager": {
    "password": "manager123",
    "profile": {
      "id": 2,
      "username": "manager",
      "display_name": "园区管理员",
      "tenant_id": 1,
      "tenant_name": "智耘示范园区",
      "is_platform_admin": false,
      "role_codes": [
        "tenant_admin"
      ],
      "permission_codes": [
        "asset:read",
        "asset:write",
        "batch:read",
        "block:read",
        "block:write",
        "farmwork:read",
        "farmwork:write",
        "harvest:write",
        "planting:read",
        "planting:write",
        "rbac:write",
        "user:read",
        "user:write"
      ]
    }
  },
  "worker": {
    "password": "worker123",
    "profile": {
      "id": 3,
      "username": "worker",
      "display_name": "李技术员",
      "tenant_id": 1,
      "tenant_name": "智耘示范园区",
      "is_platform_admin": false,
      "role_codes": [
        "farm_operator"
      ],
      "permission_codes": [
        "batch:read",
        "block:read",
        "farmwork:read",
        "farmwork:write",
        "harvest:write"
      ]
    }
  },
  "guest": {
    "password": "guest123",
    "profile": {
      "id": 4,
      "username": "guest",
      "display_name": "访客（只读）",
      "tenant_id": 1,
      "tenant_name": "智耘示范园区",
      "is_platform_admin": false,
      "role_codes": [
        "viewer"
      ],
      "permission_codes": [
        "asset:read",
        "batch:read",
        "block:read",
        "farmwork:read",
        "planting:read"
      ]
    }
  },
  "gov": {
    "password": "gov123",
    "profile": {
      "id": 5,
      "username": "gov",
      "display_name": "市场监管·王专员",
      "tenant_id": 1,
      "tenant_name": "智耘示范园区",
      "is_platform_admin": false,
      "role_codes": [
        "gov_regulator"
      ],
      "permission_codes": [
        "asset:read",
        "batch:read",
        "block:read",
        "farmwork:read",
        "planting:read"
      ]
    }
  },
  "cmall": {
    "password": "cmall123",
    "profile": {
      "id": 6,
      "username": "cmall",
      "display_name": "商城运营·小芸",
      "tenant_id": 1,
      "tenant_name": "智耘示范园区",
      "is_platform_admin": false,
      "role_codes": [
        "c_operator"
      ],
      "permission_codes": [
        "asset:read",
        "batch:read",
        "farmwork:read"
      ]
    }
  }
};

export const DEMO_DB = {
  "blocks": {
    "items": [
      {
        "id": 7,
        "tenant_id": 1,
        "code": "D-002",
        "name": "2 号示范田",
        "geometry_wkt": null,
        "crop": "水稻",
        "variety": "南粳 9108",
        "area_mu": 80,
        "owner_org": null,
        "current_planting_id": 7,
        "created_at": "2026-10-13T13:57:51.533709",
        "updated_at": "2026-10-13T13:57:57.264176"
      },
      {
        "id": 6,
        "tenant_id": 1,
        "code": "BLK-006",
        "name": "南片玉米地",
        "geometry_wkt": "POLYGON((116.40 39.88,116.43 39.88,116.43 39.90,116.40 39.90,116.40 39.88))",
        "crop": "玉米",
        "variety": "郑单 958",
        "area_mu": 65,
        "owner_org": "智耘示范园区",
        "current_planting_id": 6,
        "created_at": "2026-10-11T15:58:33.479016",
        "updated_at": "2026-10-11T15:58:33.500131"
      },
      {
        "id": 5,
        "tenant_id": 1,
        "code": "BLK-005",
        "name": "北区麦田",
        "geometry_wkt": "POLYGON((116.36 39.93,116.39 39.93,116.39 39.95,116.36 39.95,116.36 39.93))",
        "crop": "小麦",
        "variety": "济麦 22",
        "area_mu": 210,
        "owner_org": "智耘示范园区",
        "current_planting_id": 5,
        "created_at": "2026-10-11T15:58:33.477556",
        "updated_at": "2026-10-11T15:58:33.499127"
      },
      {
        "id": 4,
        "tenant_id": 1,
        "code": "BLK-004",
        "name": "西区黄瓜棚",
        "geometry_wkt": "POLYGON((116.41 39.92,116.42 39.92,116.42 39.93,116.41 39.93,116.41 39.92))",
        "crop": "黄瓜",
        "variety": "津优 35 号",
        "area_mu": 12,
        "owner_org": "智耘示范园区",
        "current_planting_id": 4,
        "created_at": "2026-10-11T15:58:33.476025",
        "updated_at": "2026-10-11T15:58:33.496960"
      },
      {
        "id": 3,
        "tenant_id": 1,
        "code": "BLK-003",
        "name": "东区番茄棚",
        "geometry_wkt": "POLYGON((116.40 39.92,116.41 39.92,116.41 39.93,116.40 39.93,116.40 39.92))",
        "crop": "番茄",
        "variety": "粉果 2 号",
        "area_mu": 15,
        "owner_org": "智耘示范园区",
        "current_planting_id": 3,
        "created_at": "2026-10-11T15:58:33.474077",
        "updated_at": "2026-10-11T15:58:33.494559"
      },
      {
        "id": 2,
        "tenant_id": 1,
        "code": "BLK-002",
        "name": "2 号稻田",
        "geometry_wkt": "POLYGON((116.42 39.90,116.44 39.90,116.44 39.92,116.42 39.92,116.42 39.90))",
        "crop": "水稻",
        "variety": "南粳 9108",
        "area_mu": 98,
        "owner_org": "智耘示范园区",
        "current_planting_id": 2,
        "created_at": "2026-10-11T15:58:33.470355",
        "updated_at": "2026-10-11T15:58:33.492130"
      },
      {
        "id": 1,
        "tenant_id": 1,
        "code": "BLK-001",
        "name": "1 号稻田",
        "geometry_wkt": "POLYGON((116.40 39.90,116.42 39.90,116.42 39.92,116.40 39.92,116.40 39.90))",
        "crop": "水稻",
        "variety": "南粳 9108",
        "area_mu": 120.5,
        "owner_org": "智耘示范园区",
        "current_planting_id": 1,
        "created_at": "2026-10-11T15:58:33.468030",
        "updated_at": "2026-10-11T15:58:33.488641"
      }
    ],
    "total": 7,
    "page": 1,
    "page_size": 50
  },
  "batches": {
    "items": [
      {
        "id": 4,
        "tenant_id": 1,
        "planting_id": 7,
        "harvest_id": 4,
        "code": "B-001-P00007-20261013-3A74GY",
        "product_name": "水稻",
        "variety": "南粳 9108",
        "origin": null,
        "status": "已建批次",
        "chain_tx": null,
        "created_at": "2026-10-13T13:58:08.442265"
      },
      {
        "id": 3,
        "tenant_id": 1,
        "planting_id": 4,
        "harvest_id": 3,
        "code": "CG-DEMO-20260418-C3",
        "product_name": "黄瓜",
        "variety": "津优 35 号",
        "origin": "西区黄瓜棚 · 智耘示范园区",
        "status": "已上架",
        "chain_tx": null,
        "created_at": "2026-10-11T15:58:33.524637"
      },
      {
        "id": 2,
        "tenant_id": 1,
        "planting_id": 3,
        "harvest_id": 2,
        "code": "TB-DEMO-20260420-B2",
        "product_name": "番茄",
        "variety": "粉果 2 号",
        "origin": "东区番茄棚 · 智耘示范园区",
        "status": "在途",
        "chain_tx": null,
        "created_at": "2026-10-11T15:58:33.523507"
      },
      {
        "id": 1,
        "tenant_id": 1,
        "planting_id": 3,
        "harvest_id": 1,
        "code": "TB-DEMO-20260315-A1",
        "product_name": "番茄",
        "variety": "粉果 2 号",
        "origin": "东区番茄棚 · 智耘示范园区",
        "status": "已上架",
        "chain_tx": null,
        "created_at": "2026-10-11T15:58:33.519732"
      }
    ],
    "total": 4,
    "page": 1,
    "page_size": 50
  },
  "weather": {
    "today": {
      "date": "2026-10-13",
      "condition": "阵雨",
      "icon": "🌦️",
      "temp_hi": 32.3,
      "temp_lo": 25.6,
      "humidity": 54,
      "wind": "2 级",
      "advice": "有降雨，喷药/施肥作业请避开，注意清沟排水"
    },
    "forecast": [
      {
        "date": "2026-10-13",
        "weekday": "周二",
        "condition": "晴",
        "icon": "☀️",
        "temp_hi": 31.9,
        "temp_lo": 22.3,
        "suitable_for_spray": true
      },
      {
        "date": "2026-10-14",
        "weekday": "周三",
        "condition": "阴",
        "icon": "☁️",
        "temp_hi": 32.4,
        "temp_lo": 22.6,
        "suitable_for_spray": true
      },
      {
        "date": "2026-10-15",
        "weekday": "周四",
        "condition": "阵雨",
        "icon": "🌦️",
        "temp_hi": 31.2,
        "temp_lo": 22.1,
        "suitable_for_spray": false
      },
      {
        "date": "2026-10-16",
        "weekday": "周五",
        "condition": "阵雨",
        "icon": "🌦️",
        "temp_hi": 28,
        "temp_lo": 19.9,
        "suitable_for_spray": false
      },
      {
        "date": "2026-10-17",
        "weekday": "周六",
        "condition": "小雨",
        "icon": "🌧️",
        "temp_hi": 30.2,
        "temp_lo": 19.5,
        "suitable_for_spray": false
      },
      {
        "date": "2026-10-18",
        "weekday": "周日",
        "condition": "阴",
        "icon": "☁️",
        "temp_hi": 26.5,
        "temp_lo": 17.3,
        "suitable_for_spray": true
      },
      {
        "date": "2026-10-19",
        "weekday": "周一",
        "condition": "阴",
        "icon": "☁️",
        "temp_hi": 20.7,
        "temp_lo": 13,
        "suitable_for_spray": true
      }
    ],
    "is_mock": true
  },
  "alerts": {
    "items": [
      {
        "level": "中",
        "type": "任务逾期",
        "msg": "「稻飞虱防治」任务已逾期（计划 2026-10-09），执行人：王大姐",
        "target": "farmwork:5"
      },
      {
        "level": "中",
        "type": "任务逾期",
        "msg": "「病虫害巡检」任务已逾期（计划 2026-10-10），执行人：李技术员",
        "target": "farmwork:3"
      },
      {
        "level": "中",
        "type": "任务逾期",
        "msg": "「霜霉病防治」任务已逾期（计划 2026-10-10），执行人：张师傅",
        "target": "farmwork:8"
      },
      {
        "level": "中",
        "type": "任务逾期",
        "msg": "「心叶期灌心防螟」任务已逾期（计划 2026-10-10），执行人：李技术员",
        "target": "farmwork:13"
      },
      {
        "level": "中",
        "type": "任务逾期",
        "msg": "「灌溉」任务已逾期（计划 2026-10-11），执行人：李技术员",
        "target": "farmwork:2"
      },
      {
        "level": "高",
        "type": "设备离线",
        "msg": "3 号地块土壤墒情传感器（SN-SOIL-0117）已离线 2 小时",
        "target": "device:SN-SOIL-0117"
      }
    ],
    "total": 6,
    "is_mock": true
  },
  "telemetry": {
    "1": {
      "block": {
        "id": 1,
        "code": "BLK-001",
        "name": "1 号稻田",
        "crop": "水稻"
      },
      "latest": {
        "air_temp": 19.5,
        "air_humidity": 82,
        "soil_moisture": 60,
        "soil_ec": 0.88,
        "light": 1594,
        "co2": 401
      },
      "history_24h": [
        {
          "hour": 15,
          "air_temp": 19.4,
          "air_humidity": 87,
          "soil_moisture": 66,
          "soil_ec": 0.87,
          "light": 49,
          "co2": 403
        },
        {
          "hour": 16,
          "air_temp": 17.6,
          "air_humidity": 84,
          "soil_moisture": 65,
          "soil_ec": 0.88,
          "light": 2835,
          "co2": 402
        },
        {
          "hour": 17,
          "air_temp": 18.6,
          "air_humidity": 83,
          "soil_moisture": 61,
          "soil_ec": 1.08,
          "light": 119,
          "co2": 424
        },
        {
          "hour": 18,
          "air_temp": 19.3,
          "air_humidity": 90,
          "soil_moisture": 58,
          "soil_ec": 0.91,
          "light": 534,
          "co2": 393
        },
        {
          "hour": 19,
          "air_temp": 19.7,
          "air_humidity": 76,
          "soil_moisture": 60,
          "soil_ec": 0.89,
          "light": 14197,
          "co2": 463
        },
        {
          "hour": 20,
          "air_temp": 21.8,
          "air_humidity": 76,
          "soil_moisture": 55,
          "soil_ec": 0.96,
          "light": 15383,
          "co2": 467
        },
        {
          "hour": 21,
          "air_temp": 20.4,
          "air_humidity": 79,
          "soil_moisture": 56,
          "soil_ec": 1.11,
          "light": 14253,
          "co2": 454
        },
        {
          "hour": 22,
          "air_temp": 19.7,
          "air_humidity": 83,
          "soil_moisture": 66,
          "soil_ec": 0.97,
          "light": 14150,
          "co2": 439
        },
        {
          "hour": 23,
          "air_temp": 19.6,
          "air_humidity": 83,
          "soil_moisture": 59,
          "soil_ec": 1.02,
          "light": 14690,
          "co2": 427
        },
        {
          "hour": 0,
          "air_temp": 20.9,
          "air_humidity": 82,
          "soil_moisture": 62,
          "soil_ec": 1.01,
          "light": 15620,
          "co2": 456
        },
        {
          "hour": 1,
          "air_temp": 19.8,
          "air_humidity": 82,
          "soil_moisture": 62,
          "soil_ec": 1.05,
          "light": 15528,
          "co2": 466
        },
        {
          "hour": 2,
          "air_temp": 19.6,
          "air_humidity": 75,
          "soil_moisture": 55,
          "soil_ec": 0.81,
          "light": 15284,
          "co2": 431
        },
        {
          "hour": 3,
          "air_temp": 21.1,
          "air_humidity": 77,
          "soil_moisture": 70,
          "soil_ec": 0.89,
          "light": 15380,
          "co2": 472
        },
        {
          "hour": 4,
          "air_temp": 19.9,
          "air_humidity": 83,
          "soil_moisture": 70,
          "soil_ec": 0.84,
          "light": 16058,
          "co2": 445
        },
        {
          "hour": 5,
          "air_temp": 20.2,
          "air_humidity": 78,
          "soil_moisture": 59,
          "soil_ec": 1.07,
          "light": 14102,
          "co2": 442
        },
        {
          "hour": 6,
          "air_temp": 18.5,
          "air_humidity": 88,
          "soil_moisture": 68,
          "soil_ec": 0.83,
          "light": 2345,
          "co2": 418
        },
        {
          "hour": 7,
          "air_temp": 17,
          "air_humidity": 81,
          "soil_moisture": 60,
          "soil_ec": 0.9,
          "light": 1447,
          "co2": 395
        },
        {
          "hour": 8,
          "air_temp": 19.3,
          "air_humidity": 86,
          "soil_moisture": 55,
          "soil_ec": 1.11,
          "light": 2411,
          "co2": 413
        },
        {
          "hour": 9,
          "air_temp": 16.6,
          "air_humidity": 83,
          "soil_moisture": 64,
          "soil_ec": 1.11,
          "light": 2708,
          "co2": 430
        },
        {
          "hour": 10,
          "air_temp": 18.1,
          "air_humidity": 83,
          "soil_moisture": 64,
          "soil_ec": 1.14,
          "light": 244,
          "co2": 416
        },
        {
          "hour": 11,
          "air_temp": 19.4,
          "air_humidity": 84,
          "soil_moisture": 55,
          "soil_ec": 1.2,
          "light": 1037,
          "co2": 411
        },
        {
          "hour": 12,
          "air_temp": 18.1,
          "air_humidity": 81,
          "soil_moisture": 58,
          "soil_ec": 0.83,
          "light": 1510,
          "co2": 393
        },
        {
          "hour": 13,
          "air_temp": 16.9,
          "air_humidity": 86,
          "soil_moisture": 66,
          "soil_ec": 0.93,
          "light": 636,
          "co2": 421
        },
        {
          "hour": 14,
          "air_temp": 19.5,
          "air_humidity": 82,
          "soil_moisture": 60,
          "soil_ec": 0.88,
          "light": 1594,
          "co2": 401
        }
      ],
      "device_online_rate": 99.2,
      "is_mock": true
    },
    "2": {
      "block": {
        "id": 2,
        "code": "BLK-002",
        "name": "2 号稻田",
        "crop": "水稻"
      },
      "latest": {
        "air_temp": 17.7,
        "air_humidity": 89,
        "soil_moisture": 66,
        "soil_ec": 1.02,
        "light": 878,
        "co2": 427
      },
      "history_24h": [
        {
          "hour": 15,
          "air_temp": 18.1,
          "air_humidity": 84,
          "soil_moisture": 64,
          "soil_ec": 1.03,
          "light": 2565,
          "co2": 416
        },
        {
          "hour": 16,
          "air_temp": 17.6,
          "air_humidity": 89,
          "soil_moisture": 66,
          "soil_ec": 0.82,
          "light": 1431,
          "co2": 420
        },
        {
          "hour": 17,
          "air_temp": 16.6,
          "air_humidity": 81,
          "soil_moisture": 69,
          "soil_ec": 1.16,
          "light": 705,
          "co2": 428
        },
        {
          "hour": 18,
          "air_temp": 18.8,
          "air_humidity": 83,
          "soil_moisture": 62,
          "soil_ec": 1.02,
          "light": 2235,
          "co2": 404
        },
        {
          "hour": 19,
          "air_temp": 19.7,
          "air_humidity": 78,
          "soil_moisture": 57,
          "soil_ec": 1.11,
          "light": 15521,
          "co2": 445
        },
        {
          "hour": 20,
          "air_temp": 19.7,
          "air_humidity": 83,
          "soil_moisture": 68,
          "soil_ec": 0.81,
          "light": 16677,
          "co2": 485
        },
        {
          "hour": 21,
          "air_temp": 19.4,
          "air_humidity": 80,
          "soil_moisture": 64,
          "soil_ec": 1.18,
          "light": 14276,
          "co2": 454
        },
        {
          "hour": 22,
          "air_temp": 21.4,
          "air_humidity": 84,
          "soil_moisture": 69,
          "soil_ec": 0.9,
          "light": 14378,
          "co2": 432
        },
        {
          "hour": 23,
          "air_temp": 21.2,
          "air_humidity": 79,
          "soil_moisture": 70,
          "soil_ec": 0.88,
          "light": 16621,
          "co2": 428
        },
        {
          "hour": 0,
          "air_temp": 19.6,
          "air_humidity": 76,
          "soil_moisture": 59,
          "soil_ec": 0.88,
          "light": 15812,
          "co2": 458
        },
        {
          "hour": 1,
          "air_temp": 20.6,
          "air_humidity": 80,
          "soil_moisture": 65,
          "soil_ec": 1.19,
          "light": 14927,
          "co2": 432
        },
        {
          "hour": 2,
          "air_temp": 19.8,
          "air_humidity": 77,
          "soil_moisture": 64,
          "soil_ec": 1.17,
          "light": 16447,
          "co2": 476
        },
        {
          "hour": 3,
          "air_temp": 19,
          "air_humidity": 77,
          "soil_moisture": 55,
          "soil_ec": 0.99,
          "light": 14769,
          "co2": 467
        },
        {
          "hour": 4,
          "air_temp": 20.3,
          "air_humidity": 75,
          "soil_moisture": 56,
          "soil_ec": 0.98,
          "light": 14466,
          "co2": 433
        },
        {
          "hour": 5,
          "air_temp": 20.6,
          "air_humidity": 77,
          "soil_moisture": 66,
          "soil_ec": 1.17,
          "light": 14353,
          "co2": 479
        },
        {
          "hour": 6,
          "air_temp": 16.5,
          "air_humidity": 88,
          "soil_moisture": 67,
          "soil_ec": 0.98,
          "light": 140,
          "co2": 422
        },
        {
          "hour": 7,
          "air_temp": 18.7,
          "air_humidity": 86,
          "soil_moisture": 69,
          "soil_ec": 1.04,
          "light": 400,
          "co2": 425
        },
        {
          "hour": 8,
          "air_temp": 18,
          "air_humidity": 86,
          "soil_moisture": 61,
          "soil_ec": 1.12,
          "light": 1303,
          "co2": 428
        },
        {
          "hour": 9,
          "air_temp": 18.7,
          "air_humidity": 87,
          "soil_moisture": 57,
          "soil_ec": 0.87,
          "light": 937,
          "co2": 447
        },
        {
          "hour": 10,
          "air_temp": 17.4,
          "air_humidity": 86,
          "soil_moisture": 62,
          "soil_ec": 0.96,
          "light": 628,
          "co2": 449
        },
        {
          "hour": 11,
          "air_temp": 16.9,
          "air_humidity": 82,
          "soil_moisture": 62,
          "soil_ec": 0.81,
          "light": 2961,
          "co2": 443
        },
        {
          "hour": 12,
          "air_temp": 17.8,
          "air_humidity": 80,
          "soil_moisture": 64,
          "soil_ec": 1.17,
          "light": 1885,
          "co2": 437
        },
        {
          "hour": 13,
          "air_temp": 17.5,
          "air_humidity": 88,
          "soil_moisture": 60,
          "soil_ec": 0.9,
          "light": 2521,
          "co2": 424
        },
        {
          "hour": 14,
          "air_temp": 17.7,
          "air_humidity": 89,
          "soil_moisture": 66,
          "soil_ec": 1.02,
          "light": 878,
          "co2": 427
        }
      ],
      "device_online_rate": 99.2,
      "is_mock": true
    },
    "3": {
      "block": {
        "id": 3,
        "code": "BLK-003",
        "name": "东区番茄棚",
        "crop": "番茄"
      },
      "latest": {
        "air_temp": 17.6,
        "air_humidity": 88,
        "soil_moisture": 67,
        "soil_ec": 1.1,
        "light": 616,
        "co2": 422
      },
      "history_24h": [
        {
          "hour": 15,
          "air_temp": 19,
          "air_humidity": 85,
          "soil_moisture": 61,
          "soil_ec": 1.03,
          "light": 458,
          "co2": 441
        },
        {
          "hour": 16,
          "air_temp": 19,
          "air_humidity": 86,
          "soil_moisture": 57,
          "soil_ec": 1.02,
          "light": 1840,
          "co2": 420
        },
        {
          "hour": 17,
          "air_temp": 16.6,
          "air_humidity": 90,
          "soil_moisture": 66,
          "soil_ec": 1.18,
          "light": 328,
          "co2": 425
        },
        {
          "hour": 18,
          "air_temp": 17.2,
          "air_humidity": 86,
          "soil_moisture": 69,
          "soil_ec": 1.17,
          "light": 2380,
          "co2": 401
        },
        {
          "hour": 19,
          "air_temp": 19.4,
          "air_humidity": 76,
          "soil_moisture": 56,
          "soil_ec": 0.86,
          "light": 14650,
          "co2": 460
        },
        {
          "hour": 20,
          "air_temp": 19.2,
          "air_humidity": 82,
          "soil_moisture": 65,
          "soil_ec": 0.89,
          "light": 14384,
          "co2": 473
        },
        {
          "hour": 21,
          "air_temp": 19.9,
          "air_humidity": 74,
          "soil_moisture": 55,
          "soil_ec": 1.03,
          "light": 14024,
          "co2": 439
        },
        {
          "hour": 22,
          "air_temp": 19.8,
          "air_humidity": 81,
          "soil_moisture": 55,
          "soil_ec": 1.19,
          "light": 14920,
          "co2": 454
        },
        {
          "hour": 23,
          "air_temp": 20.3,
          "air_humidity": 83,
          "soil_moisture": 56,
          "soil_ec": 0.9,
          "light": 15491,
          "co2": 463
        },
        {
          "hour": 0,
          "air_temp": 21.4,
          "air_humidity": 80,
          "soil_moisture": 62,
          "soil_ec": 0.96,
          "light": 16472,
          "co2": 439
        },
        {
          "hour": 1,
          "air_temp": 21.9,
          "air_humidity": 74,
          "soil_moisture": 57,
          "soil_ec": 0.98,
          "light": 15990,
          "co2": 450
        },
        {
          "hour": 2,
          "air_temp": 19.8,
          "air_humidity": 78,
          "soil_moisture": 69,
          "soil_ec": 1.2,
          "light": 14125,
          "co2": 459
        },
        {
          "hour": 3,
          "air_temp": 20.4,
          "air_humidity": 84,
          "soil_moisture": 56,
          "soil_ec": 1.17,
          "light": 16765,
          "co2": 456
        },
        {
          "hour": 4,
          "air_temp": 21.4,
          "air_humidity": 75,
          "soil_moisture": 59,
          "soil_ec": 0.81,
          "light": 15192,
          "co2": 433
        },
        {
          "hour": 5,
          "air_temp": 21.8,
          "air_humidity": 82,
          "soil_moisture": 55,
          "soil_ec": 0.83,
          "light": 14268,
          "co2": 467
        },
        {
          "hour": 6,
          "air_temp": 17.6,
          "air_humidity": 83,
          "soil_moisture": 65,
          "soil_ec": 1,
          "light": 2878,
          "co2": 406
        },
        {
          "hour": 7,
          "air_temp": 18.2,
          "air_humidity": 81,
          "soil_moisture": 62,
          "soil_ec": 0.94,
          "light": 1546,
          "co2": 398
        },
        {
          "hour": 8,
          "air_temp": 18.1,
          "air_humidity": 89,
          "soil_moisture": 59,
          "soil_ec": 0.89,
          "light": 734,
          "co2": 390
        },
        {
          "hour": 9,
          "air_temp": 17.5,
          "air_humidity": 86,
          "soil_moisture": 67,
          "soil_ec": 1.19,
          "light": 1668,
          "co2": 433
        },
        {
          "hour": 10,
          "air_temp": 17.1,
          "air_humidity": 81,
          "soil_moisture": 62,
          "soil_ec": 1.08,
          "light": 1462,
          "co2": 421
        },
        {
          "hour": 11,
          "air_temp": 19.1,
          "air_humidity": 84,
          "soil_moisture": 65,
          "soil_ec": 0.9,
          "light": 2693,
          "co2": 445
        },
        {
          "hour": 12,
          "air_temp": 17.3,
          "air_humidity": 82,
          "soil_moisture": 67,
          "soil_ec": 1.16,
          "light": 2563,
          "co2": 405
        },
        {
          "hour": 13,
          "air_temp": 17.8,
          "air_humidity": 82,
          "soil_moisture": 58,
          "soil_ec": 0.9,
          "light": 460,
          "co2": 393
        },
        {
          "hour": 14,
          "air_temp": 17.6,
          "air_humidity": 88,
          "soil_moisture": 67,
          "soil_ec": 1.1,
          "light": 616,
          "co2": 422
        }
      ],
      "device_online_rate": 99.2,
      "is_mock": true
    },
    "4": {
      "block": {
        "id": 4,
        "code": "BLK-004",
        "name": "西区黄瓜棚",
        "crop": "黄瓜"
      },
      "latest": {
        "air_temp": 18.2,
        "air_humidity": 89,
        "soil_moisture": 70,
        "soil_ec": 1.09,
        "light": 478,
        "co2": 405
      },
      "history_24h": [
        {
          "hour": 15,
          "air_temp": 17,
          "air_humidity": 89,
          "soil_moisture": 61,
          "soil_ec": 1.08,
          "light": 1442,
          "co2": 402
        },
        {
          "hour": 16,
          "air_temp": 18.6,
          "air_humidity": 89,
          "soil_moisture": 62,
          "soil_ec": 1.1,
          "light": 1963,
          "co2": 442
        },
        {
          "hour": 17,
          "air_temp": 17.7,
          "air_humidity": 86,
          "soil_moisture": 58,
          "soil_ec": 0.87,
          "light": 1372,
          "co2": 443
        },
        {
          "hour": 18,
          "air_temp": 17,
          "air_humidity": 86,
          "soil_moisture": 62,
          "soil_ec": 1.07,
          "light": 679,
          "co2": 443
        },
        {
          "hour": 19,
          "air_temp": 19.2,
          "air_humidity": 83,
          "soil_moisture": 61,
          "soil_ec": 0.88,
          "light": 15991,
          "co2": 472
        },
        {
          "hour": 20,
          "air_temp": 18.9,
          "air_humidity": 79,
          "soil_moisture": 60,
          "soil_ec": 0.92,
          "light": 14975,
          "co2": 426
        },
        {
          "hour": 21,
          "air_temp": 19.4,
          "air_humidity": 81,
          "soil_moisture": 58,
          "soil_ec": 0.89,
          "light": 14806,
          "co2": 481
        },
        {
          "hour": 22,
          "air_temp": 20.3,
          "air_humidity": 81,
          "soil_moisture": 66,
          "soil_ec": 0.91,
          "light": 15445,
          "co2": 430
        },
        {
          "hour": 23,
          "air_temp": 21.6,
          "air_humidity": 83,
          "soil_moisture": 67,
          "soil_ec": 1.11,
          "light": 16791,
          "co2": 485
        },
        {
          "hour": 0,
          "air_temp": 19.9,
          "air_humidity": 75,
          "soil_moisture": 63,
          "soil_ec": 0.93,
          "light": 14238,
          "co2": 456
        },
        {
          "hour": 1,
          "air_temp": 20.3,
          "air_humidity": 77,
          "soil_moisture": 57,
          "soil_ec": 1.01,
          "light": 16173,
          "co2": 431
        },
        {
          "hour": 2,
          "air_temp": 21.6,
          "air_humidity": 82,
          "soil_moisture": 59,
          "soil_ec": 1.17,
          "light": 14562,
          "co2": 450
        },
        {
          "hour": 3,
          "air_temp": 19.8,
          "air_humidity": 74,
          "soil_moisture": 62,
          "soil_ec": 0.98,
          "light": 16275,
          "co2": 455
        },
        {
          "hour": 4,
          "air_temp": 19.7,
          "air_humidity": 75,
          "soil_moisture": 62,
          "soil_ec": 0.94,
          "light": 14483,
          "co2": 465
        },
        {
          "hour": 5,
          "air_temp": 21.7,
          "air_humidity": 78,
          "soil_moisture": 70,
          "soil_ec": 0.9,
          "light": 15231,
          "co2": 451
        },
        {
          "hour": 6,
          "air_temp": 17.4,
          "air_humidity": 81,
          "soil_moisture": 54,
          "soil_ec": 1.02,
          "light": 1627,
          "co2": 423
        },
        {
          "hour": 7,
          "air_temp": 19.1,
          "air_humidity": 89,
          "soil_moisture": 58,
          "soil_ec": 0.99,
          "light": 1118,
          "co2": 439
        },
        {
          "hour": 8,
          "air_temp": 19.2,
          "air_humidity": 90,
          "soil_moisture": 57,
          "soil_ec": 1.15,
          "light": 1614,
          "co2": 408
        },
        {
          "hour": 9,
          "air_temp": 19,
          "air_humidity": 80,
          "soil_moisture": 69,
          "soil_ec": 1.19,
          "light": 1150,
          "co2": 399
        },
        {
          "hour": 10,
          "air_temp": 18.2,
          "air_humidity": 86,
          "soil_moisture": 66,
          "soil_ec": 0.81,
          "light": 507,
          "co2": 445
        },
        {
          "hour": 11,
          "air_temp": 19.5,
          "air_humidity": 86,
          "soil_moisture": 60,
          "soil_ec": 1.14,
          "light": 400,
          "co2": 399
        },
        {
          "hour": 12,
          "air_temp": 17.3,
          "air_humidity": 85,
          "soil_moisture": 61,
          "soil_ec": 1.11,
          "light": 1527,
          "co2": 411
        },
        {
          "hour": 13,
          "air_temp": 18.9,
          "air_humidity": 81,
          "soil_moisture": 68,
          "soil_ec": 0.86,
          "light": 1935,
          "co2": 448
        },
        {
          "hour": 14,
          "air_temp": 18.2,
          "air_humidity": 89,
          "soil_moisture": 70,
          "soil_ec": 1.09,
          "light": 478,
          "co2": 405
        }
      ],
      "device_online_rate": 99.2,
      "is_mock": true
    },
    "5": {
      "block": {
        "id": 5,
        "code": "BLK-005",
        "name": "北区麦田",
        "crop": "小麦"
      },
      "latest": {
        "air_temp": 16.9,
        "air_humidity": 86,
        "soil_moisture": 59,
        "soil_ec": 1.11,
        "light": 2955,
        "co2": 418
      },
      "history_24h": [
        {
          "hour": 15,
          "air_temp": 18.2,
          "air_humidity": 86,
          "soil_moisture": 57,
          "soil_ec": 1.16,
          "light": 1669,
          "co2": 432
        },
        {
          "hour": 16,
          "air_temp": 17,
          "air_humidity": 81,
          "soil_moisture": 64,
          "soil_ec": 1.09,
          "light": 1489,
          "co2": 394
        },
        {
          "hour": 17,
          "air_temp": 18,
          "air_humidity": 84,
          "soil_moisture": 66,
          "soil_ec": 0.8,
          "light": 1507,
          "co2": 406
        },
        {
          "hour": 18,
          "air_temp": 18.3,
          "air_humidity": 84,
          "soil_moisture": 58,
          "soil_ec": 0.81,
          "light": 2039,
          "co2": 395
        },
        {
          "hour": 19,
          "air_temp": 20.3,
          "air_humidity": 74,
          "soil_moisture": 65,
          "soil_ec": 0.98,
          "light": 16382,
          "co2": 465
        },
        {
          "hour": 20,
          "air_temp": 20.3,
          "air_humidity": 83,
          "soil_moisture": 67,
          "soil_ec": 1.05,
          "light": 15272,
          "co2": 449
        },
        {
          "hour": 21,
          "air_temp": 20.4,
          "air_humidity": 80,
          "soil_moisture": 60,
          "soil_ec": 1.06,
          "light": 16179,
          "co2": 468
        },
        {
          "hour": 22,
          "air_temp": 19.3,
          "air_humidity": 78,
          "soil_moisture": 59,
          "soil_ec": 0.9,
          "light": 14035,
          "co2": 486
        },
        {
          "hour": 23,
          "air_temp": 19.9,
          "air_humidity": 79,
          "soil_moisture": 56,
          "soil_ec": 0.95,
          "light": 14894,
          "co2": 470
        },
        {
          "hour": 0,
          "air_temp": 19.5,
          "air_humidity": 78,
          "soil_moisture": 63,
          "soil_ec": 1.11,
          "light": 14036,
          "co2": 445
        },
        {
          "hour": 1,
          "air_temp": 19.2,
          "air_humidity": 75,
          "soil_moisture": 55,
          "soil_ec": 1.03,
          "light": 15152,
          "co2": 465
        },
        {
          "hour": 2,
          "air_temp": 19.9,
          "air_humidity": 80,
          "soil_moisture": 70,
          "soil_ec": 1.04,
          "light": 15610,
          "co2": 461
        },
        {
          "hour": 3,
          "air_temp": 19,
          "air_humidity": 75,
          "soil_moisture": 62,
          "soil_ec": 1.12,
          "light": 14882,
          "co2": 432
        },
        {
          "hour": 4,
          "air_temp": 21.9,
          "air_humidity": 76,
          "soil_moisture": 66,
          "soil_ec": 1.01,
          "light": 14137,
          "co2": 470
        },
        {
          "hour": 5,
          "air_temp": 19.2,
          "air_humidity": 75,
          "soil_moisture": 69,
          "soil_ec": 0.91,
          "light": 15970,
          "co2": 462
        },
        {
          "hour": 6,
          "air_temp": 16.6,
          "air_humidity": 90,
          "soil_moisture": 69,
          "soil_ec": 0.87,
          "light": 1455,
          "co2": 436
        },
        {
          "hour": 7,
          "air_temp": 17.6,
          "air_humidity": 87,
          "soil_moisture": 63,
          "soil_ec": 1.17,
          "light": 38,
          "co2": 398
        },
        {
          "hour": 8,
          "air_temp": 18.2,
          "air_humidity": 80,
          "soil_moisture": 61,
          "soil_ec": 1.01,
          "light": 532,
          "co2": 411
        },
        {
          "hour": 9,
          "air_temp": 17,
          "air_humidity": 82,
          "soil_moisture": 58,
          "soil_ec": 1.19,
          "light": 1360,
          "co2": 441
        },
        {
          "hour": 10,
          "air_temp": 18.5,
          "air_humidity": 87,
          "soil_moisture": 55,
          "soil_ec": 0.82,
          "light": 708,
          "co2": 393
        },
        {
          "hour": 11,
          "air_temp": 18.8,
          "air_humidity": 86,
          "soil_moisture": 57,
          "soil_ec": 0.94,
          "light": 669,
          "co2": 436
        },
        {
          "hour": 12,
          "air_temp": 17,
          "air_humidity": 85,
          "soil_moisture": 55,
          "soil_ec": 1.18,
          "light": 1124,
          "co2": 446
        },
        {
          "hour": 13,
          "air_temp": 17.1,
          "air_humidity": 82,
          "soil_moisture": 66,
          "soil_ec": 0.84,
          "light": 1563,
          "co2": 425
        },
        {
          "hour": 14,
          "air_temp": 16.9,
          "air_humidity": 86,
          "soil_moisture": 59,
          "soil_ec": 1.11,
          "light": 2955,
          "co2": 418
        }
      ],
      "device_online_rate": 99.2,
      "is_mock": true
    },
    "6": {
      "block": {
        "id": 6,
        "code": "BLK-006",
        "name": "南片玉米地",
        "crop": "玉米"
      },
      "latest": {
        "air_temp": 17.2,
        "air_humidity": 89,
        "soil_moisture": 66,
        "soil_ec": 1.17,
        "light": 670,
        "co2": 414
      },
      "history_24h": [
        {
          "hour": 15,
          "air_temp": 17.4,
          "air_humidity": 80,
          "soil_moisture": 57,
          "soil_ec": 0.82,
          "light": 476,
          "co2": 396
        },
        {
          "hour": 16,
          "air_temp": 18.3,
          "air_humidity": 82,
          "soil_moisture": 62,
          "soil_ec": 0.89,
          "light": 148,
          "co2": 408
        },
        {
          "hour": 17,
          "air_temp": 18.7,
          "air_humidity": 88,
          "soil_moisture": 58,
          "soil_ec": 0.88,
          "light": 1825,
          "co2": 418
        },
        {
          "hour": 18,
          "air_temp": 18.8,
          "air_humidity": 85,
          "soil_moisture": 68,
          "soil_ec": 0.93,
          "light": 91,
          "co2": 447
        },
        {
          "hour": 19,
          "air_temp": 21.3,
          "air_humidity": 74,
          "soil_moisture": 67,
          "soil_ec": 1.13,
          "light": 16667,
          "co2": 485
        },
        {
          "hour": 20,
          "air_temp": 20.7,
          "air_humidity": 82,
          "soil_moisture": 59,
          "soil_ec": 1.07,
          "light": 14913,
          "co2": 471
        },
        {
          "hour": 21,
          "air_temp": 19.6,
          "air_humidity": 76,
          "soil_moisture": 61,
          "soil_ec": 0.87,
          "light": 15320,
          "co2": 467
        },
        {
          "hour": 22,
          "air_temp": 20.6,
          "air_humidity": 79,
          "soil_moisture": 60,
          "soil_ec": 1.07,
          "light": 16500,
          "co2": 472
        },
        {
          "hour": 23,
          "air_temp": 21.9,
          "air_humidity": 81,
          "soil_moisture": 65,
          "soil_ec": 1.17,
          "light": 14673,
          "co2": 473
        },
        {
          "hour": 0,
          "air_temp": 20.6,
          "air_humidity": 83,
          "soil_moisture": 69,
          "soil_ec": 0.95,
          "light": 16283,
          "co2": 451
        },
        {
          "hour": 1,
          "air_temp": 20.9,
          "air_humidity": 82,
          "soil_moisture": 69,
          "soil_ec": 0.97,
          "light": 14029,
          "co2": 486
        },
        {
          "hour": 2,
          "air_temp": 19.1,
          "air_humidity": 79,
          "soil_moisture": 68,
          "soil_ec": 0.85,
          "light": 16313,
          "co2": 477
        },
        {
          "hour": 3,
          "air_temp": 19.2,
          "air_humidity": 77,
          "soil_moisture": 63,
          "soil_ec": 0.88,
          "light": 14170,
          "co2": 479
        },
        {
          "hour": 4,
          "air_temp": 21.5,
          "air_humidity": 76,
          "soil_moisture": 66,
          "soil_ec": 1.1,
          "light": 14052,
          "co2": 437
        },
        {
          "hour": 5,
          "air_temp": 20.6,
          "air_humidity": 82,
          "soil_moisture": 58,
          "soil_ec": 0.91,
          "light": 15429,
          "co2": 455
        },
        {
          "hour": 6,
          "air_temp": 18,
          "air_humidity": 88,
          "soil_moisture": 63,
          "soil_ec": 1.17,
          "light": 1080,
          "co2": 404
        },
        {
          "hour": 7,
          "air_temp": 19.3,
          "air_humidity": 81,
          "soil_moisture": 63,
          "soil_ec": 0.98,
          "light": 197,
          "co2": 403
        },
        {
          "hour": 8,
          "air_temp": 18.6,
          "air_humidity": 87,
          "soil_moisture": 56,
          "soil_ec": 1.14,
          "light": 2901,
          "co2": 449
        },
        {
          "hour": 9,
          "air_temp": 18.5,
          "air_humidity": 83,
          "soil_moisture": 67,
          "soil_ec": 0.88,
          "light": 2135,
          "co2": 449
        },
        {
          "hour": 10,
          "air_temp": 18.9,
          "air_humidity": 86,
          "soil_moisture": 56,
          "soil_ec": 0.84,
          "light": 368,
          "co2": 431
        },
        {
          "hour": 11,
          "air_temp": 18.7,
          "air_humidity": 89,
          "soil_moisture": 62,
          "soil_ec": 0.99,
          "light": 2261,
          "co2": 398
        },
        {
          "hour": 12,
          "air_temp": 18.7,
          "air_humidity": 82,
          "soil_moisture": 58,
          "soil_ec": 1.12,
          "light": 1221,
          "co2": 414
        },
        {
          "hour": 13,
          "air_temp": 17.9,
          "air_humidity": 88,
          "soil_moisture": 58,
          "soil_ec": 0.98,
          "light": 1342,
          "co2": 390
        },
        {
          "hour": 14,
          "air_temp": 17.2,
          "air_humidity": 89,
          "soil_moisture": 66,
          "soil_ec": 1.17,
          "light": 670,
          "co2": 414
        }
      ],
      "device_online_rate": 99.2,
      "is_mock": true
    },
    "7": {
      "block": {
        "id": 7,
        "code": "D-002",
        "name": "2 号示范田",
        "crop": "水稻"
      },
      "latest": {
        "air_temp": 17.8,
        "air_humidity": 82,
        "soil_moisture": 59,
        "soil_ec": 1.12,
        "light": 2038,
        "co2": 440
      },
      "history_24h": [
        {
          "hour": 15,
          "air_temp": 19.2,
          "air_humidity": 84,
          "soil_moisture": 62,
          "soil_ec": 0.96,
          "light": 2831,
          "co2": 425
        },
        {
          "hour": 16,
          "air_temp": 18,
          "air_humidity": 87,
          "soil_moisture": 62,
          "soil_ec": 1.06,
          "light": 416,
          "co2": 423
        },
        {
          "hour": 17,
          "air_temp": 17.4,
          "air_humidity": 80,
          "soil_moisture": 66,
          "soil_ec": 0.81,
          "light": 2720,
          "co2": 396
        },
        {
          "hour": 18,
          "air_temp": 17.4,
          "air_humidity": 85,
          "soil_moisture": 57,
          "soil_ec": 1.08,
          "light": 2570,
          "co2": 393
        },
        {
          "hour": 19,
          "air_temp": 19.6,
          "air_humidity": 81,
          "soil_moisture": 65,
          "soil_ec": 0.86,
          "light": 16321,
          "co2": 461
        },
        {
          "hour": 20,
          "air_temp": 21.4,
          "air_humidity": 82,
          "soil_moisture": 56,
          "soil_ec": 0.86,
          "light": 15495,
          "co2": 452
        },
        {
          "hour": 21,
          "air_temp": 20,
          "air_humidity": 78,
          "soil_moisture": 54,
          "soil_ec": 1.12,
          "light": 15631,
          "co2": 448
        },
        {
          "hour": 22,
          "air_temp": 20.7,
          "air_humidity": 84,
          "soil_moisture": 54,
          "soil_ec": 0.84,
          "light": 15162,
          "co2": 475
        },
        {
          "hour": 23,
          "air_temp": 19.5,
          "air_humidity": 81,
          "soil_moisture": 66,
          "soil_ec": 0.94,
          "light": 16928,
          "co2": 463
        },
        {
          "hour": 0,
          "air_temp": 19.4,
          "air_humidity": 82,
          "soil_moisture": 55,
          "soil_ec": 1.03,
          "light": 16359,
          "co2": 478
        },
        {
          "hour": 1,
          "air_temp": 21.2,
          "air_humidity": 77,
          "soil_moisture": 61,
          "soil_ec": 1.17,
          "light": 14654,
          "co2": 461
        },
        {
          "hour": 2,
          "air_temp": 21.6,
          "air_humidity": 76,
          "soil_moisture": 64,
          "soil_ec": 0.81,
          "light": 14051,
          "co2": 462
        },
        {
          "hour": 3,
          "air_temp": 19.9,
          "air_humidity": 79,
          "soil_moisture": 64,
          "soil_ec": 0.92,
          "light": 15021,
          "co2": 460
        },
        {
          "hour": 4,
          "air_temp": 19,
          "air_humidity": 79,
          "soil_moisture": 61,
          "soil_ec": 0.82,
          "light": 16890,
          "co2": 436
        },
        {
          "hour": 5,
          "air_temp": 19.9,
          "air_humidity": 79,
          "soil_moisture": 54,
          "soil_ec": 1.19,
          "light": 16663,
          "co2": 437
        },
        {
          "hour": 6,
          "air_temp": 17.6,
          "air_humidity": 89,
          "soil_moisture": 64,
          "soil_ec": 0.96,
          "light": 1715,
          "co2": 442
        },
        {
          "hour": 7,
          "air_temp": 18.7,
          "air_humidity": 88,
          "soil_moisture": 64,
          "soil_ec": 0.81,
          "light": 2973,
          "co2": 403
        },
        {
          "hour": 8,
          "air_temp": 18,
          "air_humidity": 85,
          "soil_moisture": 61,
          "soil_ec": 0.98,
          "light": 578,
          "co2": 443
        },
        {
          "hour": 9,
          "air_temp": 16.8,
          "air_humidity": 88,
          "soil_moisture": 58,
          "soil_ec": 0.86,
          "light": 1223,
          "co2": 392
        },
        {
          "hour": 10,
          "air_temp": 18.3,
          "air_humidity": 88,
          "soil_moisture": 65,
          "soil_ec": 0.94,
          "light": 406,
          "co2": 405
        },
        {
          "hour": 11,
          "air_temp": 17.4,
          "air_humidity": 86,
          "soil_moisture": 59,
          "soil_ec": 0.81,
          "light": 401,
          "co2": 407
        },
        {
          "hour": 12,
          "air_temp": 17.9,
          "air_humidity": 82,
          "soil_moisture": 56,
          "soil_ec": 1.03,
          "light": 1696,
          "co2": 406
        },
        {
          "hour": 13,
          "air_temp": 17.1,
          "air_humidity": 83,
          "soil_moisture": 64,
          "soil_ec": 0.97,
          "light": 1833,
          "co2": 449
        },
        {
          "hour": 14,
          "air_temp": 17.8,
          "air_humidity": 82,
          "soil_moisture": 59,
          "soil_ec": 1.12,
          "light": 2038,
          "co2": 440
        }
      ],
      "device_online_rate": 99.2,
      "is_mock": true
    }
  },
  "devices": {
    "items": [
      {
        "id": 1,
        "type": "物联网网关",
        "sn": "SN-GW-0001",
        "vendor": "智耘物联",
        "firmware": "v2.3.1",
        "protocol": "MQTT",
        "status": "在线",
        "battery": 100,
        "block_id": 1,
        "block_name": "1 号稻田",
        "last_heartbeat": "2026-10-13 16:20",
        "uptime_days": 328
      },
      {
        "id": 2,
        "type": "气象站",
        "sn": "SN-WX-0102",
        "vendor": "山东气象装备",
        "firmware": "v1.8.0",
        "protocol": "MQTT",
        "status": "在线",
        "battery": 100,
        "block_id": 2,
        "block_name": "2 号稻田",
        "last_heartbeat": "2026-10-13 16:28",
        "uptime_days": 371
      },
      {
        "id": 3,
        "type": "土壤墒情传感器",
        "sn": "SN-SOIL-0117",
        "vendor": "农芯科技",
        "firmware": "v1.2.6",
        "protocol": "LoRaWAN",
        "status": "离线",
        "battery": 0,
        "block_id": 3,
        "block_name": "东区番茄棚",
        "last_heartbeat": "2026-10-13 10:20",
        "uptime_days": 59
      },
      {
        "id": 4,
        "type": "土壤墒情传感器",
        "sn": "SN-SOIL-0118",
        "vendor": "农芯科技",
        "firmware": "v1.2.6",
        "protocol": "LoRaWAN",
        "status": "在线",
        "battery": 83,
        "block_id": 4,
        "block_name": "西区黄瓜棚",
        "last_heartbeat": "2026-10-13 17:11",
        "uptime_days": 46
      },
      {
        "id": 5,
        "type": "虫情测报灯",
        "sn": "SN-BUG-0033",
        "vendor": "托普云农",
        "firmware": "v3.0.2",
        "protocol": "HTTP",
        "status": "在线",
        "battery": 94,
        "block_id": 5,
        "block_name": "北区麦田",
        "last_heartbeat": "2026-10-13 17:42",
        "uptime_days": 407
      },
      {
        "id": 6,
        "type": "视频摄像头",
        "sn": "SN-CAM-0201",
        "vendor": "海康威视",
        "firmware": "v5.5.1",
        "protocol": "GB28181",
        "status": "在线",
        "battery": 100,
        "block_id": 6,
        "block_name": "南片玉米地",
        "last_heartbeat": "2026-10-13 16:21",
        "uptime_days": 182
      },
      {
        "id": 7,
        "type": "视频摄像头",
        "sn": "SN-CAM-0202",
        "vendor": "海康威视",
        "firmware": "v5.5.1",
        "protocol": "GB28181",
        "status": "在线",
        "battery": 100,
        "block_id": 7,
        "block_name": "2 号示范田",
        "last_heartbeat": "2026-10-13 14:33",
        "uptime_days": 373
      },
      {
        "id": 8,
        "type": "智能灌溉阀",
        "sn": "SN-VALV-0301",
        "vendor": "华维节水",
        "firmware": "v1.0.9",
        "protocol": "Modbus TCP",
        "status": "在线",
        "battery": 100,
        "block_id": 1,
        "block_name": "1 号稻田",
        "last_heartbeat": "2026-10-13 13:24",
        "uptime_days": 188
      },
      {
        "id": 9,
        "type": "卷帘机",
        "sn": "SN-RLR-0401",
        "vendor": "鹏飞农机",
        "firmware": "v0.9.3",
        "protocol": "Modbus RTU",
        "status": "故障",
        "battery": 66,
        "block_id": 2,
        "block_name": "2 号稻田",
        "last_heartbeat": "2026-10-13 10:56",
        "uptime_days": 180
      },
      {
        "id": 10,
        "type": "植保无人机",
        "sn": "SN-UAV-0501",
        "vendor": "大疆农业",
        "firmware": "v07.20",
        "protocol": "HTTP",
        "status": "在线",
        "battery": 96,
        "block_id": 3,
        "block_name": "东区番茄棚",
        "last_heartbeat": "2026-10-13 10:58",
        "uptime_days": 197
      },
      {
        "id": 11,
        "type": "巡检机器人",
        "sn": "SN-BOT-0601",
        "vendor": "智耘物联",
        "firmware": "v2.1.0",
        "protocol": "MQTT",
        "status": "在线",
        "battery": 62,
        "block_id": 4,
        "block_name": "西区黄瓜棚",
        "last_heartbeat": "2026-10-13 10:34",
        "uptime_days": 182
      },
      {
        "id": 12,
        "type": "喂料机",
        "sn": "SN-FEED-0701",
        "vendor": "正大机电",
        "firmware": "v1.4.4",
        "protocol": "Modbus RTU",
        "status": "在线",
        "battery": 100,
        "block_id": 5,
        "block_name": "北区麦田",
        "last_heartbeat": "2026-10-13 10:22",
        "uptime_days": 82
      }
    ],
    "total": 12,
    "online": 10,
    "online_rate": 83.3,
    "is_mock": true
  },
  "dashboard_kpi": {
    "blocks": 7,
    "tasks_total": 15,
    "tasks_done": 5,
    "task_done_rate": 33.3,
    "harvests": 4,
    "batches": 4,
    "data_assets": 10,
    "data_assets_certified": 10,
    "asset_certified_rate": 100
  },
  "ai_disease": {
    "code": "tomato_early_blight",
    "name": "番茄早疫病",
    "type": "真菌病害",
    "host": "番茄",
    "severity": "中度",
    "confidence": 88,
    "advice": [
      "发病初期摘除病叶，喷施 75% 百菌清可湿性粉剂 600 倍液",
      "控制浇水量，采用滴灌避免叶面结露",
      "增施磷钾肥提高植株抗性"
    ],
    "medicine": "75% 百菌清可湿性粉剂",
    "withdraw_period_days": 7,
    "analyzed_at": "2026-10-13T14:39:32.686621+00:00",
    "model": "demo-mock-v0.1",
    "is_mock": true
  },
  "ai_qa": {
    "answer": "番茄关键管理要点：\n1. 温度：白天 22–28℃、夜间不低于 13℃；\n2. 水分：滴灌小水勤浇，避免叶面结露；\n3. 常见病害：早疫病、晚疫病、灰霉病，注意通风降湿；\n4. 保花保果：熊蜂授粉或震荡授粉，慎用 2,4-D。",
    "matched": true,
    "suggestions": [
      "怎么防蚜虫？",
      "滴灌多久浇一次？",
      "如何申报农机补贴？"
    ],
    "model": "demo-mock-v0.1",
    "is_mock": true
  },
  "trace_templates": [
    {
      "id": "tpl_veg",
      "name": "果蔬冷链全程模板",
      "applied_to": "番茄/黄瓜等设施蔬菜",
      "nodes": [
        {
          "seq": 1,
          "node_type": "地块",
          "name": "地块与种植季档案",
          "on_chain": true,
          "required": true
        },
        {
          "seq": 2,
          "node_type": "投入品",
          "name": "肥药使用与休药期",
          "on_chain": true,
          "required": true
        },
        {
          "seq": 3,
          "node_type": "采收",
          "name": "采收批次与分级",
          "on_chain": true,
          "required": true
        },
        {
          "seq": 4,
          "node_type": "加工",
          "name": "分拣/清洗/包装工序",
          "on_chain": false,
          "required": true
        },
        {
          "seq": 5,
          "node_type": "检测",
          "name": "农残检测报告",
          "on_chain": true,
          "required": true
        },
        {
          "seq": 6,
          "node_type": "物流",
          "name": "冷链运输温控",
          "on_chain": false,
          "required": false
        },
        {
          "seq": 7,
          "node_type": "销售",
          "name": "销售凭证/门店",
          "on_chain": false,
          "required": false
        }
      ]
    },
    {
      "id": "tpl_grain",
      "name": "粮食收储模板",
      "applied_to": "水稻/小麦/玉米",
      "nodes": [
        {
          "seq": 1,
          "node_type": "地块",
          "name": "地块与种植季档案",
          "on_chain": true,
          "required": true
        },
        {
          "seq": 2,
          "node_type": "投入品",
          "name": "投入品台账",
          "on_chain": true,
          "required": false
        },
        {
          "seq": 3,
          "node_type": "采收",
          "name": "采收与烘干",
          "on_chain": true,
          "required": true
        },
        {
          "seq": 4,
          "node_type": "加工",
          "name": "收储入库",
          "on_chain": true,
          "required": true
        },
        {
          "seq": 5,
          "node_type": "销售",
          "name": "出库与购销合同",
          "on_chain": false,
          "required": false
        }
      ]
    }
  ],
  "trace_events": {
    "B-001-P00007-20261013-3A74GY": {
      "batch_code": "B-001-P00007-20261013-3A74GY",
      "items": [
        {
          "node_type": "地块",
          "node_name": "地块与种植季档案确认",
          "ts": "2026-07-15 22:39",
          "payload_hash": "0x83e59cfd6fdc3b515085ef701716a9e3fef43b010410f0895492b99e73d2af",
          "ipfs_cid": "bafy83e59cfd6fdc3b515085ef701716a9e3fef43b010410",
          "chain_tx": "0xa738a3e39dbe740dff531331d65f3160ea30ba110918d9870c9f0d70994d28",
          "on_chain": true,
          "status": "已上链",
          "is_mock": true
        },
        {
          "node_type": "投入品",
          "node_name": "肥药使用记录锁定",
          "ts": "2026-08-29 22:39",
          "payload_hash": "0x4ec2714d3b21b81193a15265f8adc3b0ceb6f41d6bb68469e88b093e759d69",
          "ipfs_cid": "bafy4ec2714d3b21b81193a15265f8adc3b0ceb6f41d6bb6",
          "chain_tx": "0x0ed5a60068697f97d37fb914d52b89db15b021136f16ec8bd2019b990a3353",
          "on_chain": true,
          "status": "已上链",
          "is_mock": true
        },
        {
          "node_type": "采收",
          "node_name": "采收批次生成与分级",
          "ts": "2026-09-23 22:39",
          "payload_hash": "0x359118fa35a4b48da78cc3d155b124cfcc3121b7d87d0cca9f622faf09c22e",
          "ipfs_cid": "bafy359118fa35a4b48da78cc3d155b124cfcc3121b7d87d",
          "chain_tx": "0x009bb11002af4df2c36ef3616dcd9f5fc69ba5803c09e99d24384cbe617950",
          "on_chain": true,
          "status": "已上链",
          "is_mock": true
        },
        {
          "node_type": "加工",
          "node_name": "分拣包装工序完成",
          "ts": "2026-10-01 22:39",
          "payload_hash": "0x0ac51ddc677fce64b093f4ce44dc2afa5a1aed589b43c25c3e944ea23ae902",
          "ipfs_cid": "bafy0ac51ddc677fce64b093f4ce44dc2afa5a1aed589b43",
          "chain_tx": null,
          "on_chain": false,
          "status": "存证中",
          "is_mock": true
        },
        {
          "node_type": "检测",
          "node_name": "农残检测报告出具",
          "ts": "2026-10-07 22:39",
          "payload_hash": "0x63d7ca3803ac699a6f4e1a056e841e2d5ec9d356a61401881357a6ea17daae",
          "ipfs_cid": "bafy63d7ca3803ac699a6f4e1a056e841e2d5ec9d356a614",
          "chain_tx": "0xf69f9e8e1ec26f06420ffb5d3ff253c196e3821e4424d0c39dc9d568fee101",
          "on_chain": true,
          "status": "已上链",
          "is_mock": true
        },
        {
          "node_type": "物流",
          "node_name": "冷链运输在途",
          "ts": "2026-10-12 22:39",
          "payload_hash": "0x1562504ad0b4677066512477d80bb513b90037ab5bee55588c781a752a0f95",
          "ipfs_cid": "bafy1562504ad0b4677066512477d80bb513b90037ab5bee",
          "chain_tx": null,
          "on_chain": false,
          "status": "存证中",
          "is_mock": true
        },
        {
          "node_type": "销售",
          "node_name": "门店销售凭证",
          "ts": "2026-10-13 22:39",
          "payload_hash": "0x5ac813b4372df7dcb6a563b902fbf4920072ad10eabe39d064ca00a478a678",
          "ipfs_cid": "bafy5ac813b4372df7dcb6a563b902fbf4920072ad10eabe",
          "chain_tx": null,
          "on_chain": false,
          "status": "进行中",
          "is_mock": true
        }
      ],
      "total": 7
    },
    "CG-DEMO-20260418-C3": {
      "batch_code": "CG-DEMO-20260418-C3",
      "items": [
        {
          "node_type": "地块",
          "node_name": "地块与种植季档案确认",
          "ts": "2026-07-15 22:39",
          "payload_hash": "0x4239fdcc28c656ec6b13e5b42cdeb32af16f4df24380365a6dd422ee6bc1de",
          "ipfs_cid": "bafy4239fdcc28c656ec6b13e5b42cdeb32af16f4df24380",
          "chain_tx": "0x9cad72875370ff2a14ee39795a2e232ca157314bf1bde4d41642e7b47fa603",
          "on_chain": true,
          "status": "已上链",
          "is_mock": true
        },
        {
          "node_type": "投入品",
          "node_name": "肥药使用记录锁定",
          "ts": "2026-08-29 22:39",
          "payload_hash": "0x25a50f9e2a97e181d5824a09da63252d3b1e49597314a5d0d6933f3e2c50fb",
          "ipfs_cid": "bafy25a50f9e2a97e181d5824a09da63252d3b1e49597314",
          "chain_tx": "0x7d102b73813cc7cff58259be61115e07d944851375cb8088e7dfd47d3c59e0",
          "on_chain": true,
          "status": "已上链",
          "is_mock": true
        },
        {
          "node_type": "采收",
          "node_name": "采收批次生成与分级",
          "ts": "2026-09-23 22:39",
          "payload_hash": "0x4dc6e7d45368084aa1b8f8758093bd7457e1f2a093bf260b137097515487c3",
          "ipfs_cid": "bafy4dc6e7d45368084aa1b8f8758093bd7457e1f2a093bf",
          "chain_tx": "0xf7191e8bc5066f22f4455e0ac00b55692095beb04225e6d5812dbfc66a999e",
          "on_chain": true,
          "status": "已上链",
          "is_mock": true
        },
        {
          "node_type": "加工",
          "node_name": "分拣包装工序完成",
          "ts": "2026-10-01 22:39",
          "payload_hash": "0x96acedb0e1fd4351b5cf22edad3166a510b0680bfe7b89328991826e77f3b8",
          "ipfs_cid": "bafy96acedb0e1fd4351b5cf22edad3166a510b0680bfe7b",
          "chain_tx": null,
          "on_chain": false,
          "status": "存证中",
          "is_mock": true
        },
        {
          "node_type": "检测",
          "node_name": "农残检测报告出具",
          "ts": "2026-10-07 22:39",
          "payload_hash": "0x8351c9214fc2f56daf6a457d0da7c321bfda1fcac0d3fc2b5a1d378394f0f5",
          "ipfs_cid": "bafy8351c9214fc2f56daf6a457d0da7c321bfda1fcac0d3",
          "chain_tx": "0xebd2edfcb360af78c1566e6fc5a2cf6d40b86af3f19e136a2e4e207b9f81db",
          "on_chain": true,
          "status": "已上链",
          "is_mock": true
        },
        {
          "node_type": "物流",
          "node_name": "冷链运输在途",
          "ts": "2026-10-12 22:39",
          "payload_hash": "0xb6eb9f42b620963a3268aed1d8e96ddb8e3dc6b139285a85cb6af57a6216c2",
          "ipfs_cid": "bafyb6eb9f42b620963a3268aed1d8e96ddb8e3dc6b13928",
          "chain_tx": null,
          "on_chain": false,
          "status": "存证中",
          "is_mock": true
        },
        {
          "node_type": "销售",
          "node_name": "门店销售凭证",
          "ts": "2026-10-13 22:39",
          "payload_hash": "0xbc94d6ecdd22e7b5cb05d011e1c10845c65ae62fb79f56e32fc737f6e2fcb3",
          "ipfs_cid": "bafybc94d6ecdd22e7b5cb05d011e1c10845c65ae62fb79f",
          "chain_tx": null,
          "on_chain": false,
          "status": "进行中",
          "is_mock": true
        }
      ],
      "total": 7
    },
    "TB-DEMO-20260420-B2": {
      "batch_code": "TB-DEMO-20260420-B2",
      "items": [
        {
          "node_type": "地块",
          "node_name": "地块与种植季档案确认",
          "ts": "2026-07-15 22:39",
          "payload_hash": "0x2d6ba7e151c884525304a376f78775870eebbe448f9f2f022b96154f0337de",
          "ipfs_cid": "bafy2d6ba7e151c884525304a376f78775870eebbe448f9f",
          "chain_tx": "0x8822d6594418783dc9f25a3542e819e6e9d86b5fa54faf3892875aa9f86f9e",
          "on_chain": true,
          "status": "已上链",
          "is_mock": true
        },
        {
          "node_type": "投入品",
          "node_name": "肥药使用记录锁定",
          "ts": "2026-08-29 22:39",
          "payload_hash": "0x8420ded4faf70a51bef1efbe44d1c9946d7cefd99bffa89d1ec90a536bc236",
          "ipfs_cid": "bafy8420ded4faf70a51bef1efbe44d1c9946d7cefd99bff",
          "chain_tx": "0x6f0cca4ae740ee3b4739c3725dd057591c9861968230bd40819b3832b28633",
          "on_chain": true,
          "status": "已上链",
          "is_mock": true
        },
        {
          "node_type": "采收",
          "node_name": "采收批次生成与分级",
          "ts": "2026-09-23 22:39",
          "payload_hash": "0xe5948eda593bdc61be04e3d375ea4b6fce0f10717b1f772cc5969bdf0c6e7c",
          "ipfs_cid": "bafye5948eda593bdc61be04e3d375ea4b6fce0f10717b1f",
          "chain_tx": "0x5389f9464c0a20040213ebf0ab64ce1c0ce43471e5a1c79200b6bae76126f4",
          "on_chain": true,
          "status": "已上链",
          "is_mock": true
        },
        {
          "node_type": "加工",
          "node_name": "分拣包装工序完成",
          "ts": "2026-10-01 22:39",
          "payload_hash": "0x0723c4fbf5524b6795a52a1425f4d85de4c267209b18fc10ba98ecd8837517",
          "ipfs_cid": "bafy0723c4fbf5524b6795a52a1425f4d85de4c267209b18",
          "chain_tx": null,
          "on_chain": false,
          "status": "存证中",
          "is_mock": true
        },
        {
          "node_type": "检测",
          "node_name": "农残检测报告出具",
          "ts": "2026-10-07 22:39",
          "payload_hash": "0xcac94537a978df6aecd5f5fdcc02cbdac7115b9b22482bfeda3c05876fda30",
          "ipfs_cid": "bafycac94537a978df6aecd5f5fdcc02cbdac7115b9b2248",
          "chain_tx": "0x37385c55e8cb633cb796e4fef578a1efb124718dea80eab0caaa8d1ed20a35",
          "on_chain": true,
          "status": "已上链",
          "is_mock": true
        },
        {
          "node_type": "物流",
          "node_name": "冷链运输在途",
          "ts": "2026-10-12 22:39",
          "payload_hash": "0x9fec1bb783a58f69febc7434e40216d08441d0e96519cfc59fef6f6cdc9985",
          "ipfs_cid": "bafy9fec1bb783a58f69febc7434e40216d08441d0e96519",
          "chain_tx": null,
          "on_chain": false,
          "status": "存证中",
          "is_mock": true
        },
        {
          "node_type": "销售",
          "node_name": "门店销售凭证",
          "ts": "2026-10-13 22:39",
          "payload_hash": "0x41d73f379eb90e5a1d2d81a54eee16740da775a2172464f88436338810e91b",
          "ipfs_cid": "bafy41d73f379eb90e5a1d2d81a54eee16740da775a21724",
          "chain_tx": null,
          "on_chain": false,
          "status": "进行中",
          "is_mock": true
        }
      ],
      "total": 7
    },
    "TB-DEMO-20260315-A1": {
      "batch_code": "TB-DEMO-20260315-A1",
      "items": [
        {
          "node_type": "地块",
          "node_name": "地块与种植季档案确认",
          "ts": "2026-07-15 22:39",
          "payload_hash": "0xd15014cd5630970bfbbf2da773e26c3020b90a404a237c274ce6d59a328eb5",
          "ipfs_cid": "bafyd15014cd5630970bfbbf2da773e26c3020b90a404a23",
          "chain_tx": "0xe3957a4c92a28d062fc0f0f097ad65e150b7378795093afa4d17e1b7969d9f",
          "on_chain": true,
          "status": "已上链",
          "is_mock": true
        },
        {
          "node_type": "投入品",
          "node_name": "肥药使用记录锁定",
          "ts": "2026-08-29 22:39",
          "payload_hash": "0x28f6450444765416c55f4b555174e98d96015c657d43edae64c9a838bd3af5",
          "ipfs_cid": "bafy28f6450444765416c55f4b555174e98d96015c657d43",
          "chain_tx": "0xf58b49f72342d632efb7c9e7b2900e6900a5820d0929c1c7d9d02c7c0acf8f",
          "on_chain": true,
          "status": "已上链",
          "is_mock": true
        },
        {
          "node_type": "采收",
          "node_name": "采收批次生成与分级",
          "ts": "2026-09-23 22:39",
          "payload_hash": "0x61bde48895e4790cde83debbc96f165811fb6f9346d294cb30dc512ecc5369",
          "ipfs_cid": "bafy61bde48895e4790cde83debbc96f165811fb6f9346d2",
          "chain_tx": "0x683f99ec104b09cf4e20ffde16a6de6c8679649b831480ddf36136fe93b0e6",
          "on_chain": true,
          "status": "已上链",
          "is_mock": true
        },
        {
          "node_type": "加工",
          "node_name": "分拣包装工序完成",
          "ts": "2026-10-01 22:39",
          "payload_hash": "0x3fa88156d414f013732699032bd45fa92482cd3c4d432abcb9657316587a39",
          "ipfs_cid": "bafy3fa88156d414f013732699032bd45fa92482cd3c4d43",
          "chain_tx": null,
          "on_chain": false,
          "status": "存证中",
          "is_mock": true
        },
        {
          "node_type": "检测",
          "node_name": "农残检测报告出具",
          "ts": "2026-10-07 22:39",
          "payload_hash": "0x2d9675c4ef32d61d9b27be577ede6ce7094407a89b7474d8c354992a4c3e8e",
          "ipfs_cid": "bafy2d9675c4ef32d61d9b27be577ede6ce7094407a89b74",
          "chain_tx": "0x962bffd35ecfb93aa9ece8b939b62a750247cba5c67dcb3a2b7726a0be233e",
          "on_chain": true,
          "status": "已上链",
          "is_mock": true
        },
        {
          "node_type": "物流",
          "node_name": "冷链运输在途",
          "ts": "2026-10-12 22:39",
          "payload_hash": "0x5a7cd90d1900a8a4006fdd0e4622e77c2c88ca10488dcba3a5c50d1767f0a0",
          "ipfs_cid": "bafy5a7cd90d1900a8a4006fdd0e4622e77c2c88ca10488d",
          "chain_tx": null,
          "on_chain": false,
          "status": "存证中",
          "is_mock": true
        }
      ],
      "total": 6
    }
  },
  "trace_stats": {
    "scans_7d": [
      {
        "date": "2026-10-07",
        "weekday": "三",
        "count": 283
      },
      {
        "date": "2026-10-08",
        "weekday": "四",
        "count": 165
      },
      {
        "date": "2026-10-09",
        "weekday": "五",
        "count": 151
      },
      {
        "date": "2026-10-10",
        "weekday": "六",
        "count": 150
      },
      {
        "date": "2026-10-11",
        "weekday": "日",
        "count": 365
      },
      {
        "date": "2026-10-12",
        "weekday": "一",
        "count": 355
      },
      {
        "date": "2026-10-13",
        "weekday": "二",
        "count": 153
      }
    ],
    "regions_top": [
      {
        "region": "北京",
        "count": 555
      },
      {
        "region": "杭州",
        "count": 386
      },
      {
        "region": "上海",
        "count": 356
      },
      {
        "region": "成都",
        "count": 293
      },
      {
        "region": "广州",
        "count": 236
      }
    ],
    "batches_total": 3,
    "on_chain_rate": 95,
    "recalls": 0,
    "is_mock": true
  },
  "carbon": {
    "scope1": {
      "items": [
        {
          "item": "农机柴油",
          "kg_co2e": 3854
        },
        {
          "item": "化肥施用（N₂O）",
          "kg_co2e": 5644
        },
        {
          "item": "灌溉用电（间接）",
          "kg_co2e": 1927
        }
      ],
      "total": 11425
    },
    "scope2": {
      "items": [
        {
          "item": "外购电力（棚室/冷链）",
          "kg_co2e": 5175
        }
      ],
      "total": 5175
    },
    "scope3": {
      "items": [
        {
          "item": "冷链运输",
          "kg_co2e": 2653
        },
        {
          "item": "包装材料",
          "kg_co2e": 1113
        }
      ],
      "total": 3766
    },
    "total_emission": 20366,
    "total_sequestration": 8895,
    "net_emission": 11471,
    "intensity_kg_per_mu": 33.9,
    "offset_rate": 43.7,
    "monthly": [
      {
        "month": "1 月",
        "emission": 1878,
        "sequestration": 1118
      },
      {
        "month": "2 月",
        "emission": 1388,
        "sequestration": 1139
      },
      {
        "month": "3 月",
        "emission": 1209,
        "sequestration": 830
      },
      {
        "month": "4 月",
        "emission": 972,
        "sequestration": 621
      },
      {
        "month": "5 月",
        "emission": 1435,
        "sequestration": 928
      },
      {
        "month": "6 月",
        "emission": 1323,
        "sequestration": 1243
      },
      {
        "month": "7 月",
        "emission": 2077,
        "sequestration": 1390
      },
      {
        "month": "8 月",
        "emission": 1658,
        "sequestration": 1448
      },
      {
        "month": "9 月",
        "emission": 1458,
        "sequestration": 872
      },
      {
        "month": "10 月",
        "emission": 1570,
        "sequestration": 1253
      },
      {
        "month": "11 月",
        "emission": 1521,
        "sequestration": 969
      },
      {
        "month": "12 月",
        "emission": 1270,
        "sequestration": 711
      }
    ],
    "sequestration": [
      {
        "item": "土壤有机碳固碳（SOC）",
        "kg_co2e": 5212
      },
      {
        "item": "秸秆还田替代",
        "kg_co2e": 2298
      },
      {
        "item": "防护林/周边林木生物量",
        "kg_co2e": 1385
      }
    ],
    "projects": [
      {
        "id": "cp1",
        "name": "稻田节水减排项目",
        "methodology": "CCER-AR-CM-001 稻田甲烷减排",
        "standard": "CCER",
        "status": "审定中",
        "issued_credits": 0,
        "estimate_tCO2e": 413
      },
      {
        "id": "cp2",
        "name": "光伏农业大棚替代电网",
        "methodology": "VCS VM0017 分布式光伏",
        "standard": "Verra VCS",
        "status": "已签发",
        "issued_credits": 424,
        "estimate_tCO2e": 0
      },
      {
        "id": "cp3",
        "name": "秸秆生物炭还田",
        "methodology": "GS-TPDDTEC 生物炭",
        "standard": "Gold Standard",
        "status": "监测期",
        "issued_credits": 0,
        "estimate_tCO2e": 123
      }
    ],
    "by_block": [
      {
        "block_name": "1 号稻田",
        "crop": "水稻",
        "area_mu": 120.5,
        "emission": 853,
        "sequestration": 890,
        "net": 37
      },
      {
        "block_name": "2 号稻田",
        "crop": "水稻",
        "area_mu": 98,
        "emission": 758,
        "sequestration": 394,
        "net": -364
      },
      {
        "block_name": "东区番茄棚",
        "crop": "番茄",
        "area_mu": 15,
        "emission": 875,
        "sequestration": 912,
        "net": 37
      },
      {
        "block_name": "西区黄瓜棚",
        "crop": "黄瓜",
        "area_mu": 12,
        "emission": 629,
        "sequestration": 644,
        "net": 15
      },
      {
        "block_name": "北区麦田",
        "crop": "小麦",
        "area_mu": 210,
        "emission": 1634,
        "sequestration": 1211,
        "net": -423
      },
      {
        "block_name": "南片玉米地",
        "crop": "玉米",
        "area_mu": 65,
        "emission": 833,
        "sequestration": 878,
        "net": 45
      },
      {
        "block_name": "2 号示范田",
        "crop": "水稻",
        "area_mu": 80,
        "emission": 1753,
        "sequestration": 1336,
        "net": -417
      }
    ],
    "methodology_note": "核算口径参考《省级温室气体清单编制指南》与 IPCC 2019 细分；方法学版本可追溯",
    "is_mock": true
  },
  "subsidies": {
    "items": [
      {
        "id": "s1",
        "name": "高标准农田建设项目 2026",
        "level": "中央+省",
        "budget_wan": 1200,
        "applicants": 26,
        "status": "已兑付",
        "progress": 5,
        "amount_paid_wan": 1156,
        "beneficiaries": "绿丰家庭农场等 26 家主体",
        "evidence_hash": "076E8A32CEA2C153"
      },
      {
        "id": "s2",
        "name": "农机购置与应用补贴（第二批）",
        "level": "中央",
        "budget_wan": 460,
        "applicants": 58,
        "status": "公示中",
        "progress": 3,
        "amount_paid_wan": 0,
        "beneficiaries": "58 家主体 · 农机 74 台",
        "evidence_hash": "60536A1FAD38FF5D"
      },
      {
        "id": "s3",
        "name": "设施农业大棚建设补贴",
        "level": "县级",
        "budget_wan": 300,
        "applicants": 12,
        "status": "验收中",
        "progress": 4,
        "amount_paid_wan": 0,
        "beneficiaries": "12 家主体 · 新建日光温室 143 亩",
        "evidence_hash": "73818B2B72D65B31"
      },
      {
        "id": "s4",
        "name": "绿色食品认证奖补",
        "level": "市级",
        "budget_wan": 60,
        "applicants": 9,
        "status": "申报中",
        "progress": 2,
        "amount_paid_wan": 0,
        "beneficiaries": "9 家主体 · 新获证产品 11 个",
        "evidence_hash": null
      },
      {
        "id": "s5",
        "name": "化肥农药减量增效补贴",
        "level": "省级",
        "budget_wan": 180,
        "applicants": 34,
        "status": "已兑付",
        "progress": 5,
        "amount_paid_wan": 172.4,
        "beneficiaries": "34 家主体 · 统防统治 2.1 万亩",
        "evidence_hash": "A60FFA983E46FE73"
      }
    ],
    "total": 5,
    "total_budget_wan": 2200,
    "total_paid_wan": 1328.4,
    "on_chain_check": "抽查 6 笔资金流水 · 三流合一核验通过",
    "is_mock": true
  },
  "gov_entities": {
    "items": [
      {
        "id": 1,
        "name": "智耘示范园区",
        "kind": "园区/企业",
        "legal": "—",
        "blocks": 7,
        "area_mu": 600.5,
        "is_mock": false,
        "risk_score": 62,
        "risk_level": "红",
        "alerts_total": 6,
        "cert_hash": "5f2df3b7217b4aa6a205b3bbaa8acda4"
      },
      {
        "id": 901,
        "name": "绿丰家庭农场",
        "kind": "家庭农场",
        "legal": "王建国",
        "blocks": 3,
        "area_mu": 180,
        "is_mock": true,
        "risk_score": 83,
        "risk_level": "黄",
        "alerts_total": 2,
        "cert_hash": "90987f302cae6636dee52507992604f3"
      },
      {
        "id": 902,
        "name": "红旗蔬菜合作社",
        "kind": "合作社",
        "legal": "李秀兰",
        "blocks": 6,
        "area_mu": 520,
        "is_mock": true,
        "risk_score": 85,
        "risk_level": "绿",
        "alerts_total": 2,
        "cert_hash": "1b9d1904c8dcfe8aa3206f97b187f920"
      },
      {
        "id": 903,
        "name": "金穗种植大户（个体）",
        "kind": "种植大户",
        "legal": "张德福",
        "blocks": 2,
        "area_mu": 95,
        "is_mock": true,
        "risk_score": 70,
        "risk_level": "黄",
        "alerts_total": 5,
        "cert_hash": "cb19e276a9696be9a274c47c2818ac6c"
      }
    ],
    "total": 4,
    "is_mock": true
  },
  "gov_entity_detail": {
    "1": {
      "id": 1,
      "name": "智耘示范园区",
      "kind": "园区/企业",
      "legal": "—",
      "is_mock": true,
      "risk_score": 62,
      "risk_level": "红",
      "alerts_total": 6,
      "cert_hash": "5f2df3b7217b4aa6a205b3bbaa8acda4",
      "ledger": {
        "注册时间": "2024-03-18",
        "经营类别": "园区/企业",
        "地块数": 1,
        "种植面积(亩)": 120,
        "绿色认证": "有效（至 2027-03）",
        "上年抽检": "4 次，合格率 100%"
      },
      "alerts": [
        {
          "date": "2026-09-24",
          "type": "设备离线",
          "level": "中",
          "msg": "土壤墒情传感器离线超过 2 小时"
        },
        {
          "date": "2026-09-29",
          "type": "投入品超标",
          "level": "高",
          "msg": "抽检发现 1 批次叶菜农残接近限量值"
        },
        {
          "date": "2026-09-28",
          "type": "设备离线",
          "level": "中",
          "msg": "土壤墒情传感器离线超过 2 小时"
        }
      ],
      "blockchain": {
        "chain": "智耘联盟链（演示）",
        "cert_hash": "5f2df3b7217b4aa6a205b3bbaa8acda4",
        "last_block_height": 10241,
        "last_anchor_at": "2026-10-13 14:39"
      }
    },
    "901": {
      "id": 901,
      "name": "绿丰家庭农场",
      "kind": "家庭农场",
      "legal": "王建国",
      "blocks": 3,
      "area_mu": 180,
      "is_mock": true,
      "risk_score": 83,
      "risk_level": "黄",
      "alerts_total": 2,
      "cert_hash": "90987f302cae6636dee52507992604f3",
      "ledger": {
        "注册时间": "2024-03-18",
        "经营类别": "家庭农场",
        "地块数": 3,
        "种植面积(亩)": 180,
        "绿色认证": "有效（至 2027-03）",
        "上年抽检": "6 次，合格率 100%"
      },
      "alerts": [
        {
          "date": "2026-09-14",
          "type": "投入品超标",
          "level": "高",
          "msg": "抽检发现 1 批次叶菜农残接近限量值"
        },
        {
          "date": "2026-09-21",
          "type": "溯源缺失",
          "level": "低",
          "msg": "1 个批次未关联种植季档案"
        },
        {
          "date": "2026-09-22",
          "type": "溯源缺失",
          "level": "低",
          "msg": "1 个批次未关联种植季档案"
        }
      ],
      "blockchain": {
        "chain": "智耘联盟链（演示）",
        "cert_hash": "90987f302cae6636dee52507992604f3",
        "last_block_height": 11141,
        "last_anchor_at": "2026-10-13 14:39"
      }
    },
    "902": {
      "id": 902,
      "name": "红旗蔬菜合作社",
      "kind": "合作社",
      "legal": "李秀兰",
      "blocks": 6,
      "area_mu": 520,
      "is_mock": true,
      "risk_score": 85,
      "risk_level": "绿",
      "alerts_total": 2,
      "cert_hash": "1b9d1904c8dcfe8aa3206f97b187f920",
      "ledger": {
        "注册时间": "2024-03-18",
        "经营类别": "合作社",
        "地块数": 6,
        "种植面积(亩)": 520,
        "绿色认证": "有效（至 2027-03）",
        "上年抽检": "6 次，合格率 100%"
      },
      "alerts": [
        {
          "date": "2026-10-07",
          "type": "设备离线",
          "level": "中",
          "msg": "土壤墒情传感器离线超过 2 小时"
        },
        {
          "date": "2026-09-23",
          "type": "投入品超标",
          "level": "高",
          "msg": "抽检发现 1 批次叶菜农残接近限量值"
        },
        {
          "date": "2026-09-23",
          "type": "任务逾期",
          "level": "中",
          "msg": "采收计划逾期未执行"
        }
      ],
      "blockchain": {
        "chain": "智耘联盟链（演示）",
        "cert_hash": "1b9d1904c8dcfe8aa3206f97b187f920",
        "last_block_height": 11142,
        "last_anchor_at": "2026-10-13 14:39"
      }
    },
    "903": {
      "id": 903,
      "name": "金穗种植大户（个体）",
      "kind": "种植大户",
      "legal": "张德福",
      "blocks": 2,
      "area_mu": 95,
      "is_mock": true,
      "risk_score": 70,
      "risk_level": "黄",
      "alerts_total": 5,
      "cert_hash": "cb19e276a9696be9a274c47c2818ac6c",
      "ledger": {
        "注册时间": "2024-03-18",
        "经营类别": "种植大户",
        "地块数": 2,
        "种植面积(亩)": 95,
        "绿色认证": "有效（至 2027-03）",
        "上年抽检": "4 次，合格率 100%"
      },
      "alerts": [
        {
          "date": "2026-09-26",
          "type": "投入品超标",
          "level": "高",
          "msg": "抽检发现 1 批次叶菜农残接近限量值"
        },
        {
          "date": "2026-09-17",
          "type": "设备离线",
          "level": "中",
          "msg": "土壤墒情传感器离线超过 2 小时"
        }
      ],
      "blockchain": {
        "chain": "智耘联盟链（演示）",
        "cert_hash": "cb19e276a9696be9a274c47c2818ac6c",
        "last_block_height": 11143,
        "last_anchor_at": "2026-10-13 14:39"
      }
    }
  },
  "gov_board": {
    "kpi": {
      "blocks": 7,
      "area_mu": 600.5,
      "tasks_total": 15,
      "tasks_done": 5,
      "task_done_rate": 33.3,
      "subjects": 4,
      "certified_batches": 15,
      "complaints_open": 2
    },
    "week_scale": [
      274,
      298,
      199,
      312,
      257,
      265,
      266
    ],
    "alarm_trend": {
      "high": 2,
      "mid": 3,
      "low": 6
    },
    "is_mock": true
  },
  "gov_emergency": {
    "items": [],
    "total": 0,
    "is_mock": true
  },
  "uav": {
    "fleet": [
      {
        "sn": "SN-UAV-0501",
        "model": "大疆 T60",
        "kind": "植保无人机",
        "battery": 51,
        "payload_l": 60,
        "pos": "116.412,39.921",
        "speed": "8.2 m/s",
        "status": "作业中",
        "task": "东区番茄棚 · 统防统治"
      },
      {
        "sn": "SN-BOT-0601",
        "model": "智耘巡田 R2",
        "kind": "巡检机器人",
        "battery": 35,
        "payload_l": 0,
        "pos": "116.402,39.905",
        "speed": "1.2 m/s",
        "status": "巡检中",
        "task": "1 号稻田 · 苗情巡检"
      },
      {
        "sn": "SN-UAV-0502",
        "model": "大疆 T25",
        "kind": "植保无人机",
        "battery": 100,
        "payload_l": 25,
        "pos": "机库",
        "speed": "0",
        "status": "待命",
        "task": "—"
      }
    ],
    "missions": [
      {
        "id": "M-101",
        "name": "东区番茄棚 早疫病统防统治",
        "block_name": "东区番茄棚",
        "type": "喷洒",
        "status": "作业中",
        "pilot": "王飞手",
        "area_mu": 15,
        "agent": "SN-UAV-0501"
      },
      {
        "id": "M-102",
        "name": "南片玉米地 心叶期灌心（白僵菌）",
        "block_name": "南片玉米地",
        "type": "喷洒",
        "status": "待起飞",
        "pilot": "王飞手",
        "area_mu": 65,
        "agent": "SN-UAV-0502"
      },
      {
        "id": "M-103",
        "name": "1 号稻田 苗情巡检（每周 2 次）",
        "block_name": "1 号稻田",
        "type": "巡检",
        "status": "作业中",
        "pilot": "自动任务",
        "area_mu": 120.5,
        "agent": "SN-BOT-0601"
      },
      {
        "id": "M-104",
        "name": "北区麦田 返青肥撒施",
        "block_name": "北区麦田",
        "type": "播撒",
        "status": "已完成",
        "pilot": "李飞手",
        "area_mu": 210,
        "agent": "SN-UAV-0501"
      },
      {
        "id": "M-105",
        "name": "西区黄瓜棚 霜霉病预防",
        "block_name": "西区黄瓜棚",
        "type": "喷洒",
        "status": "已完成",
        "pilot": "王飞手",
        "area_mu": 12,
        "agent": "SN-UAV-0501"
      }
    ],
    "routes": [
      {
        "id": "R-01",
        "name": "东区番茄棚 A 区五边航线",
        "block_name": "东区番茄棚",
        "waypoints": 18,
        "length_m": 1240,
        "spray_l_per_mu": 1.5,
        "obstacles": "棚架 2 处已标记"
      },
      {
        "id": "R-02",
        "name": "南片玉米地 之字往复",
        "block_name": "南片玉米地",
        "waypoints": 24,
        "length_m": 3600,
        "spray_l_per_mu": 1.2,
        "obstacles": "高压线 1 处绕行"
      },
      {
        "id": "R-03",
        "name": "1 号稻田 环田巡检圈",
        "block_name": "1 号稻田",
        "waypoints": 12,
        "length_m": 980,
        "spray_l_per_mu": 0,
        "obstacles": "无"
      }
    ],
    "maintenance": [
      {
        "id": "W-201",
        "sn": "SN-UAV-0501",
        "type": "定期保养",
        "desc": "飞行 120h 保养：喷头/桨叶/电池循环检查",
        "status": "待处理",
        "hours": 121.6
      },
      {
        "id": "W-202",
        "sn": "SN-RLR-0401",
        "type": "故障维修",
        "desc": "卷帘机限位开关失灵（与设备台账联动）",
        "status": "处理中",
        "hours": 0
      },
      {
        "id": "W-203",
        "sn": "SN-BOT-0601",
        "type": "定期保养",
        "desc": "履带张紧与摄像头清洁",
        "status": "已完成",
        "hours": 88.2
      }
    ],
    "stats": {
      "active_missions": 2,
      "pending_missions": 1,
      "area_today_mu": 120.4
    },
    "is_mock": true
  },
  "finance": {
    "by_block": [
      {
        "block_name": "1 号稻田",
        "crop": "水稻",
        "area_mu": 120.5,
        "revenue": 534996,
        "cost": 316328,
        "profit": 218668,
        "per_mu_revenue": 4440,
        "per_mu_cost": 2625,
        "margin": 40.9
      },
      {
        "block_name": "2 号稻田",
        "crop": "水稻",
        "area_mu": 98,
        "revenue": 439316,
        "cost": 213601,
        "profit": 225715,
        "per_mu_revenue": 4483,
        "per_mu_cost": 2180,
        "margin": 51.4
      },
      {
        "block_name": "东区番茄棚",
        "crop": "番茄",
        "area_mu": 15,
        "revenue": 70629,
        "cost": 43987,
        "profit": 26642,
        "per_mu_revenue": 4709,
        "per_mu_cost": 2932,
        "margin": 37.7
      },
      {
        "block_name": "西区黄瓜棚",
        "crop": "黄瓜",
        "area_mu": 12,
        "revenue": 63418,
        "cost": 28311,
        "profit": 35107,
        "per_mu_revenue": 5285,
        "per_mu_cost": 2359,
        "margin": 55.4
      },
      {
        "block_name": "北区麦田",
        "crop": "小麦",
        "area_mu": 210,
        "revenue": 1075595,
        "cost": 480027,
        "profit": 595568,
        "per_mu_revenue": 5122,
        "per_mu_cost": 2286,
        "margin": 55.4
      },
      {
        "block_name": "南片玉米地",
        "crop": "玉米",
        "area_mu": 65,
        "revenue": 279147,
        "cost": 162204,
        "profit": 116943,
        "per_mu_revenue": 4295,
        "per_mu_cost": 2495,
        "margin": 41.9
      },
      {
        "block_name": "2 号示范田",
        "crop": "水稻",
        "area_mu": 80,
        "revenue": 273677,
        "cost": 143651,
        "profit": 130026,
        "per_mu_revenue": 3421,
        "per_mu_cost": 1796,
        "margin": 47.5
      }
    ],
    "cost_items": [
      {
        "item": "农资（种/肥/药）",
        "amount_wan": 15.3
      },
      {
        "item": "人工与劳务",
        "amount_wan": 7.3
      },
      {
        "item": "机械与燃油",
        "amount_wan": 2.8
      },
      {
        "item": "水电与棚室能耗",
        "amount_wan": 3.3
      },
      {
        "item": "物流与包装",
        "amount_wan": 2.9
      }
    ],
    "orders": [
      {
        "id": "SO-2026-0311",
        "buyer": "永辉超市（华北区）",
        "product": "粉果番茄",
        "qty_kg": 2400,
        "amount": 16800,
        "status": "已结算",
        "date": "2026-03-22"
      },
      {
        "id": "SO-2026-0402",
        "buyer": "盒马鲜生",
        "product": "水果黄瓜",
        "qty_kg": 1200,
        "amount": 9600,
        "status": "已签收",
        "date": "2026-04-25"
      },
      {
        "id": "SO-2026-0405",
        "buyer": "美团买菜",
        "product": "粉果番茄",
        "qty_kg": 800,
        "amount": 6400,
        "status": "配送中",
        "date": "2026-05-02"
      },
      {
        "id": "SO-2026-0408",
        "buyer": "学校食堂联采",
        "product": "普通白菜",
        "qty_kg": 1500,
        "amount": 3900,
        "status": "待确认",
        "date": "2026-05-06"
      }
    ],
    "invoices": [
      {
        "id": "INV-8812",
        "order_id": "SO-2026-0311",
        "amount": 16800,
        "status": "已回款",
        "issued_at": "2026-03-23",
        "paid_at": "2026-04-02"
      },
      {
        "id": "INV-8845",
        "order_id": "SO-2026-0402",
        "amount": 9600,
        "status": "已开票",
        "issued_at": "2026-04-26",
        "paid_at": null
      },
      {
        "id": "INV-8871",
        "order_id": "SO-2026-0405",
        "amount": 6400,
        "status": "待开票",
        "issued_at": null,
        "paid_at": null
      }
    ],
    "monthly": [
      {
        "month": "1 月",
        "revenue": 4.6,
        "cost": 4.3
      },
      {
        "month": "2 月",
        "revenue": 4.3,
        "cost": 5.4
      },
      {
        "month": "3 月",
        "revenue": 10.9,
        "cost": 8
      },
      {
        "month": "4 月",
        "revenue": 11.5,
        "cost": 8.5
      },
      {
        "month": "5 月",
        "revenue": 7.7,
        "cost": 6.7
      }
    ],
    "summary": {
      "revenue_total_wan": 273.7,
      "cost_total_wan": 138.8,
      "receivable": 16000
    },
    "is_mock": true
  },
  "operation": {
    "users": {
      "dau": 500,
      "mau": 4300,
      "scan_users_total": 12680,
      "repurchase_rate": 38.4,
      "new_today": 60,
      "trend_7d": [
        {
          "date": "2026-10-07",
          "weekday": "三",
          "dau": 608,
          "scans": 338
        },
        {
          "date": "2026-10-08",
          "weekday": "四",
          "dau": 411,
          "scans": 268
        },
        {
          "date": "2026-10-09",
          "weekday": "五",
          "dau": 475,
          "scans": 417
        },
        {
          "date": "2026-10-10",
          "weekday": "六",
          "dau": 447,
          "scans": 298
        },
        {
          "date": "2026-10-11",
          "weekday": "日",
          "dau": 465,
          "scans": 261
        },
        {
          "date": "2026-10-12",
          "weekday": "一",
          "dau": 463,
          "scans": 495
        },
        {
          "date": "2026-10-13",
          "weekday": "二",
          "dau": 500,
          "scans": 300
        }
      ]
    },
    "campaigns": [
      {
        "id": "c1",
        "name": "五月生鲜节 · 满减",
        "type": "满减",
        "status": "进行中",
        "participants": 3260,
        "conversion": 12.8
      },
      {
        "id": "c2",
        "name": "扫码抽免单 · 溯源抽奖",
        "type": "溯源抽奖",
        "status": "进行中",
        "participants": 8420,
        "conversion": 22.5
      },
      {
        "id": "c3",
        "name": "碳积分商城 · 有机肥兑换",
        "type": "碳积分商城",
        "status": "进行中",
        "participants": 1180,
        "conversion": 8.9
      },
      {
        "id": "c4",
        "name": "618 预售 · 产地直发",
        "type": "满减",
        "status": "筹备中",
        "participants": 0,
        "conversion": 0
      }
    ],
    "orders": [
      {
        "id": "CO-90231",
        "user": "微信用户_7362",
        "product": "智耘粉果番茄 2.5kg",
        "amount": 39.9,
        "status": "配送中",
        "channel": "小程序",
        "date": "2026-05-06"
      },
      {
        "id": "CO-90232",
        "user": "微信用户_1187",
        "product": "水果黄瓜 1.5kg×2",
        "amount": 29.8,
        "status": "待配单",
        "channel": "APP",
        "date": "2026-05-06"
      },
      {
        "id": "CO-90233",
        "user": "支付宝用户_9205",
        "product": "智耘粉果番茄 2.5kg",
        "amount": 39.9,
        "status": "已签收",
        "channel": "小程序",
        "date": "2026-05-05"
      },
      {
        "id": "CO-90234",
        "user": "微信用户_5511",
        "product": "碳积分兑换 · 种子盲盒",
        "amount": 0,
        "status": "待配单",
        "channel": "APP",
        "date": "2026-05-06"
      }
    ],
    "is_mock": true
  },
  "users": [
    {
      "id": 1,
      "username": "admin",
      "display_name": "平台超管",
      "email": null,
      "phone": null,
      "is_active": true,
      "is_platform_admin": true,
      "tenant_id": 1,
      "tenant_name": "智耘示范园区",
      "role_codes": [
        "platform_admin"
      ],
      "permission_codes": [
        "asset:read",
        "asset:write",
        "batch:read",
        "block:read",
        "block:write",
        "farmwork:read",
        "farmwork:write",
        "harvest:write",
        "planting:read",
        "planting:write",
        "rbac:write",
        "user:read",
        "user:write"
      ],
      "created_at": "2026-10-11T15:58:33.459225"
    },
    {
      "id": 2,
      "username": "manager",
      "display_name": "园区管理员",
      "email": null,
      "phone": null,
      "is_active": true,
      "is_platform_admin": false,
      "tenant_id": 1,
      "tenant_name": "智耘示范园区",
      "role_codes": [
        "tenant_admin"
      ],
      "permission_codes": [
        "asset:read",
        "asset:write",
        "batch:read",
        "block:read",
        "block:write",
        "farmwork:read",
        "farmwork:write",
        "harvest:write",
        "planting:read",
        "planting:write",
        "rbac:write",
        "user:read",
        "user:write"
      ],
      "created_at": "2026-10-11T15:58:33.459236"
    },
    {
      "id": 3,
      "username": "worker",
      "display_name": "李技术员",
      "email": null,
      "phone": null,
      "is_active": true,
      "is_platform_admin": false,
      "tenant_id": 1,
      "tenant_name": "智耘示范园区",
      "role_codes": [
        "farm_operator"
      ],
      "permission_codes": [
        "batch:read",
        "block:read",
        "farmwork:read",
        "farmwork:write",
        "harvest:write"
      ],
      "created_at": "2026-10-11T15:58:33.459239"
    },
    {
      "id": 4,
      "username": "guest",
      "display_name": "访客（只读）",
      "email": null,
      "phone": null,
      "is_active": true,
      "is_platform_admin": false,
      "tenant_id": 1,
      "tenant_name": "智耘示范园区",
      "role_codes": [
        "viewer"
      ],
      "permission_codes": [
        "asset:read",
        "batch:read",
        "block:read",
        "farmwork:read",
        "planting:read"
      ],
      "created_at": "2026-10-11T15:58:33.459242"
    },
    {
      "id": 5,
      "username": "gov",
      "display_name": "市场监管·王专员",
      "email": null,
      "phone": null,
      "is_active": true,
      "is_platform_admin": false,
      "tenant_id": 1,
      "tenant_name": "智耘示范园区",
      "role_codes": [
        "gov_regulator"
      ],
      "permission_codes": [
        "asset:read",
        "batch:read",
        "block:read",
        "farmwork:read",
        "planting:read"
      ],
      "created_at": "2026-10-13T13:31:28.145987"
    },
    {
      "id": 6,
      "username": "cmall",
      "display_name": "商城运营·小芸",
      "email": null,
      "phone": null,
      "is_active": true,
      "is_platform_admin": false,
      "tenant_id": 1,
      "tenant_name": "智耘示范园区",
      "role_codes": [
        "c_operator"
      ],
      "permission_codes": [
        "asset:read",
        "batch:read",
        "farmwork:read"
      ],
      "created_at": "2026-10-13T13:31:28.145995"
    }
  ],
  "roles": [
    {
      "id": 1,
      "code": "platform_admin",
      "name": "平台超管",
      "description": "跨租户所有权限",
      "permission_codes": [
        "asset:read",
        "asset:write",
        "batch:read",
        "block:read",
        "block:write",
        "farmwork:read",
        "farmwork:write",
        "harvest:write",
        "planting:read",
        "planting:write",
        "rbac:write",
        "user:read",
        "user:write"
      ],
      "created_at": "2026-10-11T15:58:30.912424"
    },
    {
      "id": 2,
      "code": "tenant_admin",
      "name": "租户管理员",
      "description": "本租户全部业务权限",
      "permission_codes": [
        "asset:read",
        "asset:write",
        "batch:read",
        "block:read",
        "block:write",
        "farmwork:read",
        "farmwork:write",
        "harvest:write",
        "planting:read",
        "planting:write",
        "rbac:write",
        "user:read",
        "user:write"
      ],
      "created_at": "2026-10-11T15:58:30.912434"
    },
    {
      "id": 3,
      "code": "farm_operator",
      "name": "农场操作员",
      "description": "农事打卡 / 采收录入",
      "permission_codes": [
        "batch:read",
        "block:read",
        "farmwork:read",
        "farmwork:write",
        "harvest:write"
      ],
      "created_at": "2026-10-11T15:58:30.912438"
    },
    {
      "id": 4,
      "code": "viewer",
      "name": "只读访客",
      "description": "只读数据资产与基础信息",
      "permission_codes": [
        "asset:read",
        "batch:read",
        "block:read",
        "farmwork:read",
        "planting:read"
      ],
      "created_at": "2026-10-11T15:58:30.912441"
    },
    {
      "id": 5,
      "code": "gov_regulator",
      "name": "G端监管员",
      "description": "政务监管：主体档案 / 批次溯源 / 数据共享目录",
      "permission_codes": [
        "asset:read",
        "batch:read",
        "block:read",
        "farmwork:read",
        "planting:read"
      ],
      "created_at": "2026-10-13T13:31:26.773893"
    },
    {
      "id": 6,
      "code": "c_operator",
      "name": "C端运营",
      "description": "C 端商城运营：订单履约 / 溯源客服 / 碳积分",
      "permission_codes": [
        "asset:read",
        "batch:read",
        "farmwork:read"
      ],
      "created_at": "2026-10-13T13:31:26.773906"
    }
  ],
  "permissions": [
    {
      "id": 10,
      "code": "farmwork:read",
      "name": "查看农事",
      "module": "农事"
    },
    {
      "id": 11,
      "code": "farmwork:write",
      "name": "编辑农事",
      "module": "农事"
    },
    {
      "id": 6,
      "code": "block:read",
      "name": "查看地块",
      "module": "地块"
    },
    {
      "id": 7,
      "code": "block:write",
      "name": "编辑地块",
      "module": "地块"
    },
    {
      "id": 4,
      "code": "asset:read",
      "name": "查看数据资产",
      "module": "数据资产"
    },
    {
      "id": 5,
      "code": "asset:write",
      "name": "编辑数据资产",
      "module": "数据资产"
    },
    {
      "id": 13,
      "code": "batch:read",
      "name": "查看批次",
      "module": "溯源"
    },
    {
      "id": 8,
      "code": "planting:read",
      "name": "查看种植季",
      "module": "种植"
    },
    {
      "id": 9,
      "code": "planting:write",
      "name": "编辑种植季",
      "module": "种植"
    },
    {
      "id": 1,
      "code": "user:read",
      "name": "查看用户",
      "module": "系统"
    },
    {
      "id": 2,
      "code": "user:write",
      "name": "编辑用户",
      "module": "系统"
    },
    {
      "id": 3,
      "code": "rbac:write",
      "name": "编辑角色/权限",
      "module": "系统"
    },
    {
      "id": 12,
      "code": "harvest:write",
      "name": "录入采收",
      "module": "采收"
    }
  ],
  "data_assets": {
    "items": [
      {
        "id": 10,
        "tenant_id": 1,
        "code": "subsidy_project",
        "name": "G 端补贴项目",
        "domain": "政务",
        "dataset": "subsidy_project",
        "description": "补贴项目立项-申报-公示-验收-兑付全流程。",
        "schema_json": [
          {
            "name": "project_id",
            "type": "int",
            "primary": true
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "budget",
            "type": "float"
          },
          {
            "name": "status",
            "type": "string"
          }
        ],
        "refresh_freq": "周",
        "source_system": "智耘云 v0.1",
        "owner": "园区管理员",
        "sla": null,
        "share_scope": "内部",
        "pricing": null,
        "value_score": 88,
        "quality_score": 97.75,
        "is_certified": true,
        "cert_hash": "c7732dd04e6669e28c4533c7d2c5b8af100ec62a35e59f39169a93c2fbc62d5d",
        "created_at": "2026-10-11T15:58:34.660123",
        "updated_at": "2026-10-11T15:58:34.749613",
        "qualities": [
          {
            "id": 10,
            "asset_id": 10,
            "check_date": "2026-10-11T15:58:34.746411",
            "completeness": 98.5,
            "accuracy": 96,
            "timeliness": 99,
            "consistency": 97.5,
            "notes": "v0.1 演示数据首次稽核通过"
          }
        ]
      },
      {
        "id": 9,
        "tenant_id": 1,
        "code": "ai_inference",
        "name": "AI 推理记录",
        "domain": "AI",
        "dataset": "ai_inference",
        "description": "病虫害识别、产量预测、灾害预警等推理日志。",
        "schema_json": [
          {
            "name": "model",
            "type": "string"
          },
          {
            "name": "prompt",
            "type": "string"
          },
          {
            "name": "confidence",
            "type": "float"
          },
          {
            "name": "cost",
            "type": "float"
          },
          {
            "name": "latency_ms",
            "type": "int"
          }
        ],
        "refresh_freq": "实时",
        "source_system": "智耘云 v0.1",
        "owner": "园区管理员",
        "sla": null,
        "share_scope": "内部",
        "pricing": null,
        "value_score": 86,
        "quality_score": 97,
        "is_certified": true,
        "cert_hash": "524c2fcc0baf8798883514a00e0828611041a24c8f8807988be0932586d26b56",
        "created_at": "2026-10-11T15:58:34.659230",
        "updated_at": "2026-10-13T13:52:29.202310",
        "qualities": [
          {
            "id": 9,
            "asset_id": 9,
            "check_date": "2026-10-11T15:58:34.736733",
            "completeness": 98.5,
            "accuracy": 96,
            "timeliness": 99,
            "consistency": 97.5,
            "notes": "v0.1 演示数据首次稽核通过"
          },
          {
            "id": 11,
            "asset_id": 9,
            "check_date": "2026-10-13T13:52:29.192642",
            "completeness": 98,
            "accuracy": 95,
            "timeliness": 99,
            "consistency": 96,
            "notes": "首批稽核通过"
          }
        ]
      },
      {
        "id": 8,
        "tenant_id": 1,
        "code": "carbon_account",
        "name": "碳账户核算",
        "domain": "碳中和",
        "dataset": "carbon_account",
        "description": "排放/碳汇按地块/园区汇总，方法学版本可追溯。",
        "schema_json": [
          {
            "name": "period",
            "type": "string"
          },
          {
            "name": "scope",
            "type": "string"
          },
          {
            "name": "kg_co2e",
            "type": "float"
          },
          {
            "name": "methodology",
            "type": "string"
          }
        ],
        "refresh_freq": "月",
        "source_system": "智耘云 v0.1",
        "owner": "园区管理员",
        "sla": null,
        "share_scope": "授权",
        "pricing": null,
        "value_score": 92,
        "quality_score": 97.75,
        "is_certified": true,
        "cert_hash": "c5c34b02bed2a472c3b13178f16952542b036dab54a91515925a5cdc0bd05162",
        "created_at": "2026-10-11T15:58:34.658373",
        "updated_at": "2026-10-11T15:58:34.733682",
        "qualities": [
          {
            "id": 8,
            "asset_id": 8,
            "check_date": "2026-10-11T15:58:34.730492",
            "completeness": 98.5,
            "accuracy": 96,
            "timeliness": 99,
            "consistency": 97.5,
            "notes": "v0.1 演示数据首次稽核通过"
          }
        ]
      },
      {
        "id": 7,
        "tenant_id": 1,
        "code": "iot_telemetry",
        "name": "物联网遥测",
        "domain": "设备",
        "dataset": "iot_telemetry",
        "description": "传感器/网关/无人机遥测点（温/湿/墒/视频等）。",
        "schema_json": [
          {
            "name": "device_id",
            "type": "string"
          },
          {
            "name": "ts",
            "type": "datetime"
          },
          {
            "name": "key",
            "type": "string"
          },
          {
            "name": "value",
            "type": "float"
          }
        ],
        "refresh_freq": "实时",
        "source_system": "智耘云 v0.1",
        "owner": "园区管理员",
        "sla": null,
        "share_scope": "内部",
        "pricing": null,
        "value_score": 78,
        "quality_score": 97.75,
        "is_certified": true,
        "cert_hash": "c6b14c2a8e52da7df34fdbb307d559a5808492c2c257bd93b5064d503921b232",
        "created_at": "2026-10-11T15:58:34.657322",
        "updated_at": "2026-10-11T15:58:34.726995",
        "qualities": [
          {
            "id": 7,
            "asset_id": 7,
            "check_date": "2026-10-11T15:58:34.723231",
            "completeness": 98.5,
            "accuracy": 96,
            "timeliness": 99,
            "consistency": 97.5,
            "notes": "v0.1 演示数据首次稽核通过"
          }
        ]
      },
      {
        "id": 6,
        "tenant_id": 1,
        "code": "trace_batch",
        "name": "溯源批次",
        "domain": "溯源",
        "dataset": "trace_batch",
        "description": "最小批次（地块+采收日+品种），含溯源码与链上凭证。",
        "schema_json": [
          {
            "name": "code",
            "type": "string",
            "primary": true,
            "on_chain": true
          },
          {
            "name": "product_name",
            "type": "string"
          },
          {
            "name": "origin",
            "type": "string"
          },
          {
            "name": "status",
            "type": "string"
          },
          {
            "name": "chain_tx",
            "type": "string"
          }
        ],
        "refresh_freq": "实时",
        "source_system": "智耘云 v0.1",
        "owner": "园区管理员",
        "sla": null,
        "share_scope": "公开",
        "pricing": null,
        "value_score": 90,
        "quality_score": 97.75,
        "is_certified": true,
        "cert_hash": "10af049ee044a92ea07f2b8db040deb3982341c5bd53b73e15e5388043b3e682",
        "created_at": "2026-10-11T15:58:34.654971",
        "updated_at": "2026-10-11T15:58:34.718213",
        "qualities": [
          {
            "id": 6,
            "asset_id": 6,
            "check_date": "2026-10-11T15:58:34.715092",
            "completeness": 98.5,
            "accuracy": 96,
            "timeliness": 99,
            "consistency": 97.5,
            "notes": "v0.1 演示数据首次稽核通过"
          }
        ]
      },
      {
        "id": 5,
        "tenant_id": 1,
        "code": "harvest_record",
        "name": "采收记录",
        "domain": "采收",
        "dataset": "harvest_record",
        "description": "采收批次、重量、等级、地理坐标。",
        "schema_json": [
          {
            "name": "harvest_id",
            "type": "int",
            "primary": true
          },
          {
            "name": "batch_code",
            "type": "string",
            "on_chain": true
          },
          {
            "name": "weight_kg",
            "type": "float"
          },
          {
            "name": "quality_grade",
            "type": "string"
          },
          {
            "name": "geo",
            "type": "string"
          },
          {
            "name": "harvested_at",
            "type": "datetime"
          }
        ],
        "refresh_freq": "实时",
        "source_system": "智耘云 v0.1",
        "owner": "园区管理员",
        "sla": null,
        "share_scope": "公开",
        "pricing": null,
        "value_score": 88,
        "quality_score": 97.75,
        "is_certified": true,
        "cert_hash": "b64dc111308fb07c7c2578c09b4f20ab2e3a4ed017bdb66ba8bdcec542e4b3ab",
        "created_at": "2026-10-11T15:58:34.653743",
        "updated_at": "2026-10-11T15:58:34.711932",
        "qualities": [
          {
            "id": 5,
            "asset_id": 5,
            "check_date": "2026-10-11T15:58:34.707988",
            "completeness": 98.5,
            "accuracy": 96,
            "timeliness": 99,
            "consistency": 97.5,
            "notes": "v0.1 演示数据首次稽核通过"
          }
        ]
      },
      {
        "id": 4,
        "tenant_id": 1,
        "code": "input_usage",
        "name": "投入品使用",
        "domain": "农事",
        "dataset": "input_usage",
        "description": "化肥/农药/种子使用量与休药期。",
        "schema_json": [
          {
            "name": "task_id",
            "type": "int"
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "dosage",
            "type": "float"
          },
          {
            "name": "withdraw_period_days",
            "type": "int"
          },
          {
            "name": "batch_no",
            "type": "string",
            "on_chain": true
          }
        ],
        "refresh_freq": "实时",
        "source_system": "智耘云 v0.1",
        "owner": "园区管理员",
        "sla": null,
        "share_scope": "授权",
        "pricing": null,
        "value_score": 85,
        "quality_score": 97.75,
        "is_certified": true,
        "cert_hash": "1ea7e5d852213d12671f92007f443d556072fb5cc82505cf70b79c13ac19de89",
        "created_at": "2026-10-11T15:58:34.652916",
        "updated_at": "2026-10-11T15:58:34.702581",
        "qualities": [
          {
            "id": 4,
            "asset_id": 4,
            "check_date": "2026-10-11T15:58:34.699411",
            "completeness": 98.5,
            "accuracy": 96,
            "timeliness": 99,
            "consistency": 97.5,
            "notes": "v0.1 演示数据首次稽核通过"
          }
        ]
      },
      {
        "id": 3,
        "tenant_id": 1,
        "code": "farmwork_task",
        "name": "农事任务",
        "domain": "农事",
        "dataset": "farmwork_task",
        "description": "耕/种/肥/药/水/收任务，含执行留痕。",
        "schema_json": [
          {
            "name": "task_id",
            "type": "int",
            "primary": true
          },
          {
            "name": "type",
            "type": "string"
          },
          {
            "name": "plan_date",
            "type": "datetime"
          },
          {
            "name": "status",
            "type": "string"
          },
          {
            "name": "assignee",
            "type": "string"
          },
          {
            "name": "evidences",
            "type": "json",
            "description": "照片/视频"
          }
        ],
        "refresh_freq": "实时",
        "source_system": "智耘云 v0.1",
        "owner": "园区管理员",
        "sla": null,
        "share_scope": "授权",
        "pricing": null,
        "value_score": 80,
        "quality_score": 97.75,
        "is_certified": true,
        "cert_hash": "5e9b6cd0ff674f589af533d265ce24d39d03ff2bbfc482bc68e3e488a2a0b38f",
        "created_at": "2026-10-11T15:58:34.652108",
        "updated_at": "2026-10-11T15:58:34.696188",
        "qualities": [
          {
            "id": 3,
            "asset_id": 3,
            "check_date": "2026-10-11T15:58:34.691250",
            "completeness": 98.5,
            "accuracy": 96,
            "timeliness": 99,
            "consistency": 97.5,
            "notes": "v0.1 演示数据首次稽核通过"
          }
        ]
      },
      {
        "id": 2,
        "tenant_id": 1,
        "code": "planting_season",
        "name": "种植季档案",
        "domain": "种植",
        "dataset": "planting_season",
        "description": "种植季：地块在某时间段内的种植活动。",
        "schema_json": [
          {
            "name": "block_id",
            "type": "int",
            "primary": true
          },
          {
            "name": "season",
            "type": "string"
          },
          {
            "name": "crop",
            "type": "string"
          },
          {
            "name": "start_date",
            "type": "datetime"
          },
          {
            "name": "expected_yield_kg",
            "type": "float"
          },
          {
            "name": "status",
            "type": "string"
          }
        ],
        "refresh_freq": "实时",
        "source_system": "智耘云 v0.1",
        "owner": "园区管理员",
        "sla": null,
        "share_scope": "内部",
        "pricing": null,
        "value_score": 75,
        "quality_score": 97.75,
        "is_certified": true,
        "cert_hash": "380028c6e15c664c207eb0666ec5c37a45f0db0f12540285429211cdad37a58c",
        "created_at": "2026-10-11T15:58:34.651267",
        "updated_at": "2026-10-11T15:58:34.686145",
        "qualities": [
          {
            "id": 2,
            "asset_id": 2,
            "check_date": "2026-10-11T15:58:34.682980",
            "completeness": 98.5,
            "accuracy": 96,
            "timeliness": 99,
            "consistency": 97.5,
            "notes": "v0.1 演示数据首次稽核通过"
          }
        ]
      },
      {
        "id": 1,
        "tenant_id": 1,
        "code": "block_basic",
        "name": "地块基础信息",
        "domain": "地块",
        "dataset": "block_basic",
        "description": "园区/地块档案：编码、面积、品种、所属组织。",
        "schema_json": [
          {
            "name": "code",
            "type": "string",
            "primary": true,
            "description": "地块编码"
          },
          {
            "name": "name",
            "type": "string",
            "description": "地块名称"
          },
          {
            "name": "area_mu",
            "type": "float",
            "description": "面积（亩）"
          },
          {
            "name": "crop",
            "type": "string",
            "description": "当前作物"
          },
          {
            "name": "variety",
            "type": "string",
            "description": "品种"
          },
          {
            "name": "owner_org",
            "type": "string",
            "description": "所属组织"
          }
        ],
        "refresh_freq": "日",
        "source_system": "智耘云 v0.1",
        "owner": "园区管理员",
        "sla": null,
        "share_scope": "内部",
        "pricing": null,
        "value_score": 70,
        "quality_score": 97.75,
        "is_certified": true,
        "cert_hash": "fb1e7f65d7ca67d914bf9c3ba7f78871e02347565f3d7c1b776045a22977f557",
        "created_at": "2026-10-11T15:58:34.649465",
        "updated_at": "2026-10-11T15:58:34.679598",
        "qualities": [
          {
            "id": 1,
            "asset_id": 1,
            "check_date": "2026-10-11T15:58:34.673761",
            "completeness": 98.5,
            "accuracy": 96,
            "timeliness": 99,
            "consistency": 97.5,
            "notes": "v0.1 演示数据首次稽核通过"
          }
        ]
      }
    ],
    "total": 10,
    "page": 1,
    "page_size": 50
  },
  "data_asset_detail": {
    "1": {
      "id": 1,
      "tenant_id": 1,
      "code": "block_basic",
      "name": "地块基础信息",
      "domain": "地块",
      "dataset": "block_basic",
      "description": "园区/地块档案：编码、面积、品种、所属组织。",
      "schema_json": [
        {
          "name": "code",
          "type": "string",
          "primary": true,
          "description": "地块编码"
        },
        {
          "name": "name",
          "type": "string",
          "description": "地块名称"
        },
        {
          "name": "area_mu",
          "type": "float",
          "description": "面积（亩）"
        },
        {
          "name": "crop",
          "type": "string",
          "description": "当前作物"
        },
        {
          "name": "variety",
          "type": "string",
          "description": "品种"
        },
        {
          "name": "owner_org",
          "type": "string",
          "description": "所属组织"
        }
      ],
      "refresh_freq": "日",
      "source_system": "智耘云 v0.1",
      "owner": "园区管理员",
      "sla": null,
      "share_scope": "内部",
      "pricing": null,
      "value_score": 70,
      "quality_score": 97.75,
      "is_certified": true,
      "cert_hash": "fb1e7f65d7ca67d914bf9c3ba7f78871e02347565f3d7c1b776045a22977f557",
      "created_at": "2026-10-11T15:58:34.649465",
      "updated_at": "2026-10-11T15:58:34.679598",
      "qualities": [
        {
          "id": 1,
          "asset_id": 1,
          "check_date": "2026-10-11T15:58:34.673761",
          "completeness": 98.5,
          "accuracy": 96,
          "timeliness": 99,
          "consistency": 97.5,
          "notes": "v0.1 演示数据首次稽核通过"
        }
      ]
    },
    "2": {
      "id": 2,
      "tenant_id": 1,
      "code": "planting_season",
      "name": "种植季档案",
      "domain": "种植",
      "dataset": "planting_season",
      "description": "种植季：地块在某时间段内的种植活动。",
      "schema_json": [
        {
          "name": "block_id",
          "type": "int",
          "primary": true
        },
        {
          "name": "season",
          "type": "string"
        },
        {
          "name": "crop",
          "type": "string"
        },
        {
          "name": "start_date",
          "type": "datetime"
        },
        {
          "name": "expected_yield_kg",
          "type": "float"
        },
        {
          "name": "status",
          "type": "string"
        }
      ],
      "refresh_freq": "实时",
      "source_system": "智耘云 v0.1",
      "owner": "园区管理员",
      "sla": null,
      "share_scope": "内部",
      "pricing": null,
      "value_score": 75,
      "quality_score": 97.75,
      "is_certified": true,
      "cert_hash": "380028c6e15c664c207eb0666ec5c37a45f0db0f12540285429211cdad37a58c",
      "created_at": "2026-10-11T15:58:34.651267",
      "updated_at": "2026-10-11T15:58:34.686145",
      "qualities": [
        {
          "id": 2,
          "asset_id": 2,
          "check_date": "2026-10-11T15:58:34.682980",
          "completeness": 98.5,
          "accuracy": 96,
          "timeliness": 99,
          "consistency": 97.5,
          "notes": "v0.1 演示数据首次稽核通过"
        }
      ]
    },
    "3": {
      "id": 3,
      "tenant_id": 1,
      "code": "farmwork_task",
      "name": "农事任务",
      "domain": "农事",
      "dataset": "farmwork_task",
      "description": "耕/种/肥/药/水/收任务，含执行留痕。",
      "schema_json": [
        {
          "name": "task_id",
          "type": "int",
          "primary": true
        },
        {
          "name": "type",
          "type": "string"
        },
        {
          "name": "plan_date",
          "type": "datetime"
        },
        {
          "name": "status",
          "type": "string"
        },
        {
          "name": "assignee",
          "type": "string"
        },
        {
          "name": "evidences",
          "type": "json",
          "description": "照片/视频"
        }
      ],
      "refresh_freq": "实时",
      "source_system": "智耘云 v0.1",
      "owner": "园区管理员",
      "sla": null,
      "share_scope": "授权",
      "pricing": null,
      "value_score": 80,
      "quality_score": 97.75,
      "is_certified": true,
      "cert_hash": "5e9b6cd0ff674f589af533d265ce24d39d03ff2bbfc482bc68e3e488a2a0b38f",
      "created_at": "2026-10-11T15:58:34.652108",
      "updated_at": "2026-10-11T15:58:34.696188",
      "qualities": [
        {
          "id": 3,
          "asset_id": 3,
          "check_date": "2026-10-11T15:58:34.691250",
          "completeness": 98.5,
          "accuracy": 96,
          "timeliness": 99,
          "consistency": 97.5,
          "notes": "v0.1 演示数据首次稽核通过"
        }
      ]
    },
    "4": {
      "id": 4,
      "tenant_id": 1,
      "code": "input_usage",
      "name": "投入品使用",
      "domain": "农事",
      "dataset": "input_usage",
      "description": "化肥/农药/种子使用量与休药期。",
      "schema_json": [
        {
          "name": "task_id",
          "type": "int"
        },
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "dosage",
          "type": "float"
        },
        {
          "name": "withdraw_period_days",
          "type": "int"
        },
        {
          "name": "batch_no",
          "type": "string",
          "on_chain": true
        }
      ],
      "refresh_freq": "实时",
      "source_system": "智耘云 v0.1",
      "owner": "园区管理员",
      "sla": null,
      "share_scope": "授权",
      "pricing": null,
      "value_score": 85,
      "quality_score": 97.75,
      "is_certified": true,
      "cert_hash": "1ea7e5d852213d12671f92007f443d556072fb5cc82505cf70b79c13ac19de89",
      "created_at": "2026-10-11T15:58:34.652916",
      "updated_at": "2026-10-11T15:58:34.702581",
      "qualities": [
        {
          "id": 4,
          "asset_id": 4,
          "check_date": "2026-10-11T15:58:34.699411",
          "completeness": 98.5,
          "accuracy": 96,
          "timeliness": 99,
          "consistency": 97.5,
          "notes": "v0.1 演示数据首次稽核通过"
        }
      ]
    },
    "5": {
      "id": 5,
      "tenant_id": 1,
      "code": "harvest_record",
      "name": "采收记录",
      "domain": "采收",
      "dataset": "harvest_record",
      "description": "采收批次、重量、等级、地理坐标。",
      "schema_json": [
        {
          "name": "harvest_id",
          "type": "int",
          "primary": true
        },
        {
          "name": "batch_code",
          "type": "string",
          "on_chain": true
        },
        {
          "name": "weight_kg",
          "type": "float"
        },
        {
          "name": "quality_grade",
          "type": "string"
        },
        {
          "name": "geo",
          "type": "string"
        },
        {
          "name": "harvested_at",
          "type": "datetime"
        }
      ],
      "refresh_freq": "实时",
      "source_system": "智耘云 v0.1",
      "owner": "园区管理员",
      "sla": null,
      "share_scope": "公开",
      "pricing": null,
      "value_score": 88,
      "quality_score": 97.75,
      "is_certified": true,
      "cert_hash": "b64dc111308fb07c7c2578c09b4f20ab2e3a4ed017bdb66ba8bdcec542e4b3ab",
      "created_at": "2026-10-11T15:58:34.653743",
      "updated_at": "2026-10-11T15:58:34.711932",
      "qualities": [
        {
          "id": 5,
          "asset_id": 5,
          "check_date": "2026-10-11T15:58:34.707988",
          "completeness": 98.5,
          "accuracy": 96,
          "timeliness": 99,
          "consistency": 97.5,
          "notes": "v0.1 演示数据首次稽核通过"
        }
      ]
    },
    "6": {
      "id": 6,
      "tenant_id": 1,
      "code": "trace_batch",
      "name": "溯源批次",
      "domain": "溯源",
      "dataset": "trace_batch",
      "description": "最小批次（地块+采收日+品种），含溯源码与链上凭证。",
      "schema_json": [
        {
          "name": "code",
          "type": "string",
          "primary": true,
          "on_chain": true
        },
        {
          "name": "product_name",
          "type": "string"
        },
        {
          "name": "origin",
          "type": "string"
        },
        {
          "name": "status",
          "type": "string"
        },
        {
          "name": "chain_tx",
          "type": "string"
        }
      ],
      "refresh_freq": "实时",
      "source_system": "智耘云 v0.1",
      "owner": "园区管理员",
      "sla": null,
      "share_scope": "公开",
      "pricing": null,
      "value_score": 90,
      "quality_score": 97.75,
      "is_certified": true,
      "cert_hash": "10af049ee044a92ea07f2b8db040deb3982341c5bd53b73e15e5388043b3e682",
      "created_at": "2026-10-11T15:58:34.654971",
      "updated_at": "2026-10-11T15:58:34.718213",
      "qualities": [
        {
          "id": 6,
          "asset_id": 6,
          "check_date": "2026-10-11T15:58:34.715092",
          "completeness": 98.5,
          "accuracy": 96,
          "timeliness": 99,
          "consistency": 97.5,
          "notes": "v0.1 演示数据首次稽核通过"
        }
      ]
    },
    "7": {
      "id": 7,
      "tenant_id": 1,
      "code": "iot_telemetry",
      "name": "物联网遥测",
      "domain": "设备",
      "dataset": "iot_telemetry",
      "description": "传感器/网关/无人机遥测点（温/湿/墒/视频等）。",
      "schema_json": [
        {
          "name": "device_id",
          "type": "string"
        },
        {
          "name": "ts",
          "type": "datetime"
        },
        {
          "name": "key",
          "type": "string"
        },
        {
          "name": "value",
          "type": "float"
        }
      ],
      "refresh_freq": "实时",
      "source_system": "智耘云 v0.1",
      "owner": "园区管理员",
      "sla": null,
      "share_scope": "内部",
      "pricing": null,
      "value_score": 78,
      "quality_score": 97.75,
      "is_certified": true,
      "cert_hash": "c6b14c2a8e52da7df34fdbb307d559a5808492c2c257bd93b5064d503921b232",
      "created_at": "2026-10-11T15:58:34.657322",
      "updated_at": "2026-10-11T15:58:34.726995",
      "qualities": [
        {
          "id": 7,
          "asset_id": 7,
          "check_date": "2026-10-11T15:58:34.723231",
          "completeness": 98.5,
          "accuracy": 96,
          "timeliness": 99,
          "consistency": 97.5,
          "notes": "v0.1 演示数据首次稽核通过"
        }
      ]
    },
    "8": {
      "id": 8,
      "tenant_id": 1,
      "code": "carbon_account",
      "name": "碳账户核算",
      "domain": "碳中和",
      "dataset": "carbon_account",
      "description": "排放/碳汇按地块/园区汇总，方法学版本可追溯。",
      "schema_json": [
        {
          "name": "period",
          "type": "string"
        },
        {
          "name": "scope",
          "type": "string"
        },
        {
          "name": "kg_co2e",
          "type": "float"
        },
        {
          "name": "methodology",
          "type": "string"
        }
      ],
      "refresh_freq": "月",
      "source_system": "智耘云 v0.1",
      "owner": "园区管理员",
      "sla": null,
      "share_scope": "授权",
      "pricing": null,
      "value_score": 92,
      "quality_score": 97.75,
      "is_certified": true,
      "cert_hash": "c5c34b02bed2a472c3b13178f16952542b036dab54a91515925a5cdc0bd05162",
      "created_at": "2026-10-11T15:58:34.658373",
      "updated_at": "2026-10-11T15:58:34.733682",
      "qualities": [
        {
          "id": 8,
          "asset_id": 8,
          "check_date": "2026-10-11T15:58:34.730492",
          "completeness": 98.5,
          "accuracy": 96,
          "timeliness": 99,
          "consistency": 97.5,
          "notes": "v0.1 演示数据首次稽核通过"
        }
      ]
    },
    "9": {
      "id": 9,
      "tenant_id": 1,
      "code": "ai_inference",
      "name": "AI 推理记录",
      "domain": "AI",
      "dataset": "ai_inference",
      "description": "病虫害识别、产量预测、灾害预警等推理日志。",
      "schema_json": [
        {
          "name": "model",
          "type": "string"
        },
        {
          "name": "prompt",
          "type": "string"
        },
        {
          "name": "confidence",
          "type": "float"
        },
        {
          "name": "cost",
          "type": "float"
        },
        {
          "name": "latency_ms",
          "type": "int"
        }
      ],
      "refresh_freq": "实时",
      "source_system": "智耘云 v0.1",
      "owner": "园区管理员",
      "sla": null,
      "share_scope": "内部",
      "pricing": null,
      "value_score": 86,
      "quality_score": 97,
      "is_certified": true,
      "cert_hash": "524c2fcc0baf8798883514a00e0828611041a24c8f8807988be0932586d26b56",
      "created_at": "2026-10-11T15:58:34.659230",
      "updated_at": "2026-10-13T13:52:29.202310",
      "qualities": [
        {
          "id": 9,
          "asset_id": 9,
          "check_date": "2026-10-11T15:58:34.736733",
          "completeness": 98.5,
          "accuracy": 96,
          "timeliness": 99,
          "consistency": 97.5,
          "notes": "v0.1 演示数据首次稽核通过"
        },
        {
          "id": 11,
          "asset_id": 9,
          "check_date": "2026-10-13T13:52:29.192642",
          "completeness": 98,
          "accuracy": 95,
          "timeliness": 99,
          "consistency": 96,
          "notes": "首批稽核通过"
        }
      ]
    },
    "10": {
      "id": 10,
      "tenant_id": 1,
      "code": "subsidy_project",
      "name": "G 端补贴项目",
      "domain": "政务",
      "dataset": "subsidy_project",
      "description": "补贴项目立项-申报-公示-验收-兑付全流程。",
      "schema_json": [
        {
          "name": "project_id",
          "type": "int",
          "primary": true
        },
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "budget",
          "type": "float"
        },
        {
          "name": "status",
          "type": "string"
        }
      ],
      "refresh_freq": "周",
      "source_system": "智耘云 v0.1",
      "owner": "园区管理员",
      "sla": null,
      "share_scope": "内部",
      "pricing": null,
      "value_score": 88,
      "quality_score": 97.75,
      "is_certified": true,
      "cert_hash": "c7732dd04e6669e28c4533c7d2c5b8af100ec62a35e59f39169a93c2fbc62d5d",
      "created_at": "2026-10-11T15:58:34.660123",
      "updated_at": "2026-10-11T15:58:34.749613",
      "qualities": [
        {
          "id": 10,
          "asset_id": 10,
          "check_date": "2026-10-11T15:58:34.746411",
          "completeness": 98.5,
          "accuracy": 96,
          "timeliness": 99,
          "consistency": 97.5,
          "notes": "v0.1 演示数据首次稽核通过"
        }
      ]
    }
  }
} as const;
