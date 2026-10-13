# 智耘云 · 智慧农业 SaaS Demo

> 智慧农业 = 物联网 + AI + 大数据 + 区块链与农业全产业链深度融合。
> 一个平台、三端角色：**B 端农场经营 · C 端消费者 · G 端政府监管**，浏览器打开即可完整体验。

## 🌐 在线体验（无需部署，打开即用）

| 入口 | 地址 | 说明 |
| --- | --- | --- |
| 总入口 | https://estate77.github.io/agro/ | 两个端的选择页 |
| 💻 PC 管理端 | https://estate77.github.io/agro/pc/ | 10 大功能模块 · 三端视角切换 |
| 📱 移动端 APP | https://estate77.github.io/agro/app/ | 手机浏览器打开效果更佳 |

两端均为**纯前端离线演示模式**：全部数据内置在浏览器端回放（确定性演示数据），无后端依赖、无账号注册、无外网请求，断网也能跑。

## 👥 演示账号

| 账号 | 密码 | 角色 | 可用端口 |
| --- | --- | --- | --- |
| `admin` | `admin123` | 平台超管 | B + G + C（可自由切换视角） |
| `manager` | `manager123` | 租户管理员 | B 端 |
| `worker` | `worker123` | 农场操作员 | B 端（推荐 APP 端农事打卡） |
| `guest` | `guest123` | 只读访客 | B 端（权限隔离演示） |
| `gov` | `gov123` | G 端监管员 | G 端（政务监管平台） |
| `cmall` | `cmall123` | C 端运营 | C 端（商城运营后台） |

APP 端 C 端（智耘食）支持**免登录游客模式**，扫码溯源 / 碳积分开箱即用。

## 💻 PC 管理端：十大功能模块

顶部分类导航（5 大类）+ B/G/C 三端端口权限管控（角色 → 可用端口集合，路由守卫拦截越权直达）：

| 分类 | 模块 | 亮点 |
| --- | --- | --- |
| 总览驾驶 | 🛰️ 智慧农场驾驶舱 | 天气/告警/遥测曲线/KPI 一屏总览 |
| 生产管理 | 📡 物联网设备中心 | 设备台账 · 在线率 · 24h 遥测 · 地块切换 |
| 生产管理 | 🤖 AI 决策中心 | 拍照识病虫害（置信度+用药建议+安全间隔期）· 农技问答 |
| 产销溯源 | 🔗 区块链溯源中心 | 溯源模板 · 批次事件链 · 扫码统计 · 上链率 |
| 产销溯源 | 🌱 碳中和计量中心 | Scope 1/2/3 排放 · 碳汇 · 项目减排量 · 地块碳账 |
| 经营与监管 | 🏛️ 政务监管平台 | 主体风险画像 · 补贴发放 · 应急事件处置（G 端） |
| 经营与监管 | 🚁 无人机与机器人调度 | 机队/任务/航线/维保 四视图 · 一键派发 |
| 经营与监管 | 💰 经营管理 | 地块投入产出 · 订单/发票 · 月度收支图 |
| 经营与监管 | 🛒 C 端运营后台 | DAU/扫码趋势 · 营销活动 · 订单履约 |
| 系统 | ⚙️ 系统设置 | 用户/角色/权限矩阵（RBAC 真实接口） |

## 📱 移动端 APP：一个 APP · 三端角色

「丰收手账」视觉体系（松林绿 × 麦秆琥珀 × 米纸画布 · 等高线纹理 · 悬浮胶囊 TabBar），三端随时切换：

- **智耘农（B 端农户）**：今日任务前后两段打卡（拍照压缩 + GPS 留痕）、弱网离线队列自动重放、拍照识病虫害、AI 问答、地块管理、经营账本、行情与补贴政策、紧急求助；老年模式一键放大字号
- **智耘食（C 端消费者）**：扫码溯源全链路（种植→农事→检测→物流→上架）、碳积分账户、本地直采推荐（免登录）
- **智耘政（G 端监管员）**：待办核查、主体档案风险核查、应急上报（自动派单 + SLA）、监管看板

## 🏗️ 技术架构

```
┌─────────────────────────────────────────────┐
│  前端（静态托管 GitHub Pages）                │
│  ├─ frontend/  PC 管理端  Vue3 + Element Plus │
│  └─ app/       移动 H5    Vue3 纯手写 CSS     │
│     两者均支持「真实后端 / 离线演示」双模式     │
├─────────────────────────────────────────────┤
│  backend/  FastAPI + SQLAlchemy + JWT + RBAC │
│  多租户隔离 · 审计日志 · SQLite（可换 PG）     │
└─────────────────────────────────────────────┘
```

- 前端：Vue 3（`<script setup>` + TS）· Pinia · Vue Router（hash 路由，静态托管零配置）
- PC 端权限模型：角色 → 端口集合（B/G/C）→ 菜单过滤 + 路由守卫双层管控
- 后端：FastAPI · Pydantic v2 · JWT 双 token · RBAC（6 角色 / 权限点）· 审计日志
- 离线演示：`scripts/record-pc-demo.mjs` 从后端录制确定性演示数据 → 前端内置回放（PC 端 `frontend/src/mock/`、APP 端内置 mock 层）

## 📂 目录结构

```
.
├── .github/workflows/pages.yml   # push main 自动构建双端并部署 GitHub Pages
├── docker-compose.yml            # 一键启动（后端 + PC + APP）
├── scripts/
│   └── record-pc-demo.mjs        # ★ PC 离线演示数据录制脚本
├── backend/                      # FastAPI 后端
│   └── app/
│       ├── main.py               # 入口（/docs 可看 Swagger）
│       ├── api/v1/               # 认证/RBAC/资产/地块/种植/农事/采收/批次/溯源/政务/AI/演示
│       ├── models/ · schemas/ · services/
│       └── seed.py               # 演示样例数据（幂等）
├── frontend/                     # PC 管理端
│   ├── public/config.js          # ★ 运行时配置（离线开关 / API 地址）
│   ├── src/config/portal.ts      # 三端端口权限配置中心
│   ├── src/mock/                 # 离线演示数据 + 适配层
│   └── src/views/                # 驾驶舱/物联网/AI/溯源/碳/政务/无人机/经营/运营/设置…
└── app/                          # 移动端 H5（智耘农 / 智耘食 / 智耘政）
    ├── public/config.js          # ★ 运行时配置
    └── src/views/ · utils/offline.ts   # 弱网离线打卡队列
```

## 🚀 本地启动

### 方式一：Docker Compose（一键）

```bash
cp .env.example .env
docker compose up -d --build
# PC 端：  http://localhost:8080
# APP 端： http://localhost:8081（手机浏览器打开效果更佳）
# Swagger：http://localhost:8000/docs
```

### 方式二：原生开发（热重载，后端 8200）

```bash
# 后端
cd backend
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -e .
python -m app.seed          # 幂等，生成全部演示数据 + 6 个演示账号
uvicorn app.main:app --reload --port 8200

# PC 端（另开终端）→ http://localhost:5173
cd frontend && npm install && npm run dev

# APP 端（另开终端）→ http://localhost:5174
cd app && npm install && npm run dev
```

> 本地开发走真实后端（vite 代理）；部署站点由 `config.js` 注入 `__ZYUN_DEMO_OFFLINE__` 走内置数据。两种模式互不影响。
> 更新离线演示数据：`node scripts/record-pc-demo.mjs`（需后端已启动）。

## 🔑 内置演示样例数据（seed 幂等生成）

- **7 个地块**：稻田 ×2 / 番茄棚 / 黄瓜棚 / 麦田 / 玉米地 / 示范园（大田 + 设施两类场景）
- **14 条农事任务**：待办 / 进行中 / 已完成 / 逾期（逾期自动产生告警）
- **4 个溯源批次**（演示扫码码）：
  - `TB-DEMO-20260315-A1`（番茄 · 已上架）
  - `TB-DEMO-20260420-B2`（番茄 · 在途）
  - `CG-DEMO-20260418-C3`（黄瓜 · 已上架）
- **10 个数据资产**：全部完成质量稽核 + 入库存证（cert_hash）
- **4 个监管主体**：含风险评分 / 告警 / 区块链存证画像
- **确定性演示接口**：天气 / 遥测 / 告警 / AI 识病 / 无人机机队 / 碳核算 / 补贴（`/api/v1/demo/*`、`/api/v1/ai/*`）

## 🧪 部署（GitHub Pages 自动化）

push 到 `main` 即自动触发 [pages.yml](.github/workflows/pages.yml)：构建双端 → 组装站点（落地页 + `/pc` + `/app`）→ 注入离线演示开关 → 部署。

如需接入真实后端：把站点 `config.js` 中 `__ZYUN_DEMO_OFFLINE__` 删除、`__ZYUN_API_BASE__` 指向后端公网地址即可（无需重新构建），后端部署方案见下：

| 平台 | 方式 |
| --- | --- |
| **Render / Railway** | 指定 `backend` 目录 → Start: `python -m app.seed && uvicorn app.main:app --host 0.0.0.0 --port $PORT` |
| **Docker / VPS** | `cd backend && docker build -t zyun-api .` |

环境变量：`JWT_SECRET=<随机串>`（必须）；可选 `CORS_ORIGINS=*`、`DATABASE_URL=sqlite:////data/app.db`。

## ❓ 常见问题

- **Windows npm 报"禁止运行脚本"**：用 `npm.cmd` 代替 `npm`，或 `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`
- **APP 打卡提示"已暂存"**：正常现象，弱网离线队列演示；恢复网络或点"立即同步"即可
- **本地登录 401**：先跑 `python -m app.seed`；线上站点请确认 `config.js` 开关状态
- **离线模式下写操作**（新建地块/完成任务/上报应急）：返回模拟成功，刷新后恢复初始演示数据
- **Swagger**：本地 http://localhost:8200/docs

## 🗺️ 后续路线

- **v0.5**：真实物联网接入（EMQX + InfluxDB）· 区块链溯源上链适配（长安链/BSN）· 真实 AI 识病模型
- **v1.0**：碳交易对接 · 模型/提示词市场 · 数据资产开放共享
