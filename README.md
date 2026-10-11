# 智耘云（智慧农业 SaaS · PC 端 + APP 端 v0.1 演示版）

> 智慧农业 = 物联网 + AI + 大数据 + 机器人与农业全产业链深度融合。
> 本仓库为 **可公开访问的 demo**：内置丰富演示样例数据，无真实设备/模型接入，浏览器打开即可完整体验。

## 三个应用

| 应用 | 目录 | 端口（本地） | 说明 |
| --- | --- | --- | --- |
| 后端 API | `backend/` | 8000 | FastAPI + SQLAlchemy + JWT + RBAC + SQLite |
| PC 管理端 | `frontend/` | 8080 / 5173 | Vue3 + Element Plus，面向 B/G 端管理驾驶舱 |
| 移动端 APP | `app/` | 8081 / 5174 | Vue3 移动 H5（智耘农），极简大字号，可当 APP 用 |

## 演示账号（seed 自动创建）

| 账号 | 密码 | 角色 | 适合演示 |
| --- | --- | --- | --- |
| `admin` | `admin123` | 平台超管 | 全部功能 |
| `manager` | `manager123` | 租户管理员 | 业务管理全流程 |
| `worker` | `worker123` | 农场操作员 | **APP 端农事打卡**（推荐手机演示） |
| `guest` | `guest123` | 只读访客 | 权限隔离演示（无写权限） |

## 内置演示样例数据

由 `python -m app.seed` 幂等生成（已随首次启动自动执行）：

- **6 个地块**：稻田×2 / 番茄棚 / 黄瓜棚 / 麦田 / 玉米地（大田 + 设施两类场景）
- **6 个种植季**：4 个"种植中"、2 个"已收获"
- **14 条农事任务**：待办 / 进行中 / 已完成 / 逾期（逾期自动产生告警）
- **3 笔采收 + 3 个溯源批次**，演示扫码码：
  - `TB-DEMO-20260315-A1`（番茄 · 已上架）
  - `TB-DEMO-20260420-B2`（番茄 · 在途）
  - `CG-DEMO-20260418-C3`（黄瓜 · 已上架）
- **10 个数据资产**：全部完成质量稽核 + 入库存证（cert_hash）
- **演示数据接口**（确定性 mock，天气/遥测/告警/AI 识病）：`/api/v1/demo/*`、`/api/v1/ai/*`

## 目录结构

```
.
├── README.md
├── docker-compose.yml        # 一键启动（后端 + PC + APP）
├── .env.example
├── 产品提示词-PC端.md          # 产品定义（PC）
├── 产品提示词-APP端.md         # 产品定义（APP）
├── backend/                  # FastAPI 后端
│   ├── Dockerfile
│   ├── pyproject.toml
│   └── app/
│       ├── main.py           # 入口（/docs 可看 Swagger）
│       ├── core/             # 配置/安全/JWT/审计
│       ├── db/               # 会话/建表
│       ├── models/           # 15 张表 ORM
│       ├── schemas/          # Pydantic v2
│       ├── api/v1/           # 路由（认证/RBAC/数据资产/地块/种植/农事/采收/批次/工作台/AI/演示）
│       ├── services/         # 业务逻辑
│       └── seed.py           # 演示样例数据
├── frontend/                 # PC 管理端（Vue3 + Element Plus）
│   ├── public/config.js      # ★ 运行时 API 地址（部署改这里）
│   └── src/                  # 登录/工作台/数据资产/地块/任务/批次/端到端示例
└── app/                      # 移动端 H5（智耘农）
    ├── public/config.js      # ★ 运行时 API 地址（部署改这里）
    └── src/
        ├── views/            # 登录/首页/任务打卡/识病害/设备/溯源/我的
        └── utils/offline.ts  # 弱网离线打卡队列
```

## 本地启动

### 方式一：Docker Compose（一键）

```bash
cp .env.example .env
docker compose up -d --build
# PC 端：  http://localhost:8080
# APP 端： http://localhost:8081（手机浏览器打开效果更佳）
# Swagger：http://localhost:8000/docs
```

### 方式二：原生开发（热重载）

```bash
# 后端
cd backend
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -e .
python -m app.seed
uvicorn app.main:app --reload --port 8000

# PC 端（另开终端）
cd frontend
npm install && npm run dev        # http://localhost:5173

# APP 端（另开终端）
cd app
npm install && npm run dev       # http://localhost:5174
```

> 后端依赖：`pip install fastapi "uvicorn[standard]" sqlalchemy pydantic pydantic-settings "python-jose[cryptography]" "passlib[bcrypt]" python-multipart email-validator`

## 公开部署（支持公网链接访问）

前端已做零配置适配：**hash 路由 + 相对资源路径 + 运行时 API 地址**，可部署到任何静态托管。

### 架构

```
浏览器 ──> 静态托管（PC + APP 两个站点）──> 后端 API（支持公网访问的 PaaS）
```

### 第 1 步：部署后端（免费方案任选其一）

| 平台 | 方式 |
| --- | --- |
| **Render** | 新建 Web Service → 连接本 GitHub 仓库 → Root Directory 填 `backend` → Build: `pip install fastapi "uvicorn[standard]" sqlalchemy pydantic pydantic-settings "python-jose[cryptography]" "passlib[bcrypt]" python-multipart email-validator` → Start: `python -m app.seed && uvicorn app.main:app --host 0.0.0.0 --port $PORT` |
| **Railway** | 连接仓库 → 指定 `backend` 目录，同上启动命令 |
| **Fly.io / VPS** | `cd backend && docker build -t zyun-api .` 后运行 |

环境变量（必须）：`JWT_SECRET=<随机串>`；可选：`CORS_ORIGINS=*`、`DATABASE_URL=sqlite:////data/app.db`（挂持久卷）。
部署成功后得到公网地址，例如 `https://zyun-api.onrender.com`。

### 第 2 步：部署前端（GitHub Pages）

1. 构建：`cd frontend && npm install && npm run build`（APP 同理 `cd app`）
2. 把 `dist/` 推到 `gh-pages` 分支（或仓库的 `docs/` 目录），也可用 [Vercel](https://vercel.com)/[Netlify](https://netlify.com) 直接导入仓库（Root=frontend/app，Output=dist）
3. **改运行时 API 地址**：编辑部署站点上的 `config.js`（构建产物里的 `dist/config.js`）：

```js
window.__ZYUN_API_BASE__ = "https://zyun-api.onrender.com/api";
```

> 改 `config.js` 不需要重新构建。PC 端与 APP 端各有一份 `config.js`。

### 上传到 GitHub

```bash
git init
git add .
git commit -m "feat: 智慧农业 demo v0.1（PC + APP + 演示数据）"
git branch -M main
git remote add origin https://github.com/<你的用户名>/smart-agri-demo.git
git push -u origin main
```

> `.gitignore` 已排除 `node_modules/`、`dist/`、`*.db`、`.env`，可放心公开仓库。
> 公开演示请勿修改默认演示密码以外的真实凭据——本 demo 仅为演示用途。

## 核心功能对照（产品提示词 → 实现）

| 产品规划 | v0.1 实现 |
| --- | --- |
| RBAC 多角色 | ✅ 4 角色 / 13 权限点 / 多租户隔离 / 审计日志 |
| 数据资产入库 | ✅ 目录 / 登记 / 质量稽核 / cert_hash 存证，10 个数据集全认证 |
| 端到端示例 | ✅ 地块→种植季→任务→采收→批次 自动闭环 |
| APP 极简交互 | ✅ 大字号(17px+)/大按钮(48px+)/九宫格/一键填账号 |
| APP 打卡 | ✅ 任务前后两段打卡 + 拍照留痕(压缩 base64) + GPS |
| 弱网离线 | ✅ localStorage 队列，online 自动重放，最多 5 次重试 |
| 拍照识病虫害 | ✅ 演示版：8 种病虫害知识库 + 防治建议（v0.5 接真实模型） |
| 设备遥测 | ✅ 演示版：确定性 mock 6 项传感器 + 24h SVG 曲线 |
| 区块链溯源 | ◐ 预留 chain_tx/cert_hash 字段与 C 端免登录扫码页，v0.5 接长安链/BSN |
| 碳中和 | ◐ 数据资产含 carbon_account 数据集，v1.0 实装计量中心 |

## 后续路线

- **v0.5**：物联网设备中心（EMQX + InfluxDB）· 区块链溯源适配层（长安链/BSN）· 真实 AI 识病模型
- **v1.0**：AI 决策中心 · 碳中和计量中心 · 无人机调度
- **v1.5**：政务监管平台（G 端）
- **v2.0**：模型/提示词市场 · 数据资产开放 · 碳交易对接

## 常见问题

- **Windows npm 报"禁止运行脚本"**：用 `npm.cmd` 代替 `npm`，或 `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`
- **APP 打卡提示"已暂存"**：正常现象，演示了弱网离线队列；恢复网络或点"立即同步"即可
- **登录 401**：先跑 `python -m app.seed`；公开部署时确认 `config.js` 的 API 地址正确且后端已启动
- **Swagger**：http://localhost:8000/docs（部署后为 `https://<后端域名>/docs`）