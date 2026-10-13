/**
 * PC 端离线演示数据录制脚本。
 *
 * 从本地运行的后端（默认 http://localhost:8200）录制全部 GET 接口的
 * 确定性演示响应，生成 frontend/src/mock/db.ts，供 GitHub Pages
 * 纯前端离线演示模式（window.__ZYUN_DEMO_OFFLINE__）回放。
 *
 * 用法：
 *   1. 本地起好后端（uvicorn app.main:app --port 8200）并已执行 python -m app.seed
 *   2. node scripts/record-pc-demo.mjs
 *
 * 数据全部来自 seed 的确定性演示接口，重复录制结果一致（仅时间戳类字段会变）。
 */

const BASE = process.env.DEMO_API_BASE || "http://localhost:8200/api/v1";

/** 6 个演示账号（与 backend seed.py 保持一致） */
const ACCOUNTS = [
  ["admin", "admin123"],
  ["manager", "manager123"],
  ["worker", "worker123"],
  ["guest", "guest123"],
  ["gov", "gov123"],
  ["cmall", "cmall123"],
];

async function api(path, { method = "GET", token, body } = {}) {
  const resp = await fetch(BASE + path, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!resp.ok) {
    throw new Error(`${method} ${path} -> HTTP ${resp.status}`);
  }
  const json = await resp.json();
  if (json.code !== 0) {
    throw new Error(`${method} ${path} -> code ${json.code}: ${json.message}`);
  }
  return json.data;
}

async function login(username, password) {
  const t = await api("/auth/login", { method: "POST", body: { username, password } });
  return t.access_token;
}

const db = {};
const profiles = {};

async function main() {
  console.log("== 1/5 登录各演示账号，录制 /auth/me ==");
  for (const [u, p] of ACCOUNTS) {
    const token = await login(u, p);
    profiles[u] = await api("/auth/me", { token });
    console.log(`  ${u}: ok (${profiles[u].role_codes.join(",")})`);
  }

  const admin = await login("admin", "admin123");

  console.log("== 2/5 地块与批次主数据 ==");
  const blocksPage = await api("/blocks?page=1&page_size=50", { token: admin });
  db.blocks = blocksPage;
  const blockIds = blocksPage.items.map((b) => b.id);
  console.log(`  blocks: ${blockIds.length}`);

  const batchesPage = await api("/batches?page=1&page_size=50", { token: admin });
  db.batches = batchesPage;
  const batchCodes = batchesPage.items.map((b) => b.code);
  console.log(`  batches: ${batchCodes.join(", ")}`);

  console.log("== 3/5 驾驶舱 / 物联网 / AI 演示接口 ==");
  db.weather = await api("/demo/weather", { token: admin });
  db.alerts = await api("/demo/alerts", { token: admin });
  db.telemetry = {};
  for (const id of blockIds) {
    db.telemetry[id] = await api(`/demo/telemetry?block_id=${id}`, { token: admin });
    console.log(`  telemetry#${id}: ok`);
  }
  db.devices = await api("/demo/devices", { token: admin });
  db.dashboard_kpi = await api("/dashboard/kpi", { token: admin });

  // AI 识病 / 问答（确定性演示响应，按固定入参录制）
  db.ai_disease = await api("/ai/disease", {
    method: "POST",
    token: admin,
    body: { image_name: "demo-tomato-leaf.jpg", crop: "番茄" },
  });
  db.ai_qa = await api("/ai/qa", {
    method: "POST",
    token: admin,
    body: { question: "番茄叶片出现黄褐色斑点怎么办？" },
  });

  console.log("== 4/5 溯源 / 碳 / 政务 / 无人机 / 经营 / 运营 ==");
  db.trace_templates = await api("/trace/templates", { token: admin });
  db.trace_events = {};
  for (const code of batchCodes) {
    db.trace_events[code] = await api(`/trace/events?batch_code=${encodeURIComponent(code)}`, { token: admin });
    console.log(`  trace#${code}: ${db.trace_events[code].total} 节点`);
  }
  db.trace_stats = await api("/trace/stats", { token: admin });
  db.carbon = await api("/demo/carbon-overview", { token: admin });
  db.subsidies = await api("/demo/subsidies", { token: admin });

  const entities = await api("/gov/entities", { token: admin });
  db.gov_entities = entities;
  db.gov_entity_detail = {};
  for (const e of entities.items) {
    db.gov_entity_detail[e.id] = await api(`/gov/entities/${e.id}`, { token: admin });
    console.log(`  entity#${e.id}: ok`);
  }
  db.gov_board = await api("/gov/board", { token: admin });
  db.gov_emergency = await api("/gov/emergency", { token: admin });

  db.uav = await api("/demo/uav", { token: admin });
  db.finance = await api("/demo/finance", { token: admin });
  db.operation = await api("/demo/operation", { token: admin });

  console.log("== 5/5 RBAC / 数据资产 ==");
  db.users = await api("/users", { token: admin });
  db.roles = await api("/roles", { token: admin });
  db.permissions = await api("/permissions", { token: admin });

  const assetsPage = await api("/data-assets?page=1&page_size=50", { token: admin });
  db.data_assets = assetsPage;
  db.data_asset_detail = {};
  for (const a of assetsPage.items) {
    db.data_asset_detail[a.id] = await api(`/data-assets/${a.id}`, { token: admin });
  }
  console.log(`  data-assets: ${assetsPage.items.length}`);

  // ---- 生成 db.ts ----
  const banner = `/**
 * ★ 自动生成文件：由 scripts/record-pc-demo.mjs 从本地后端录制，请勿手工编辑。
 *
 * PC 端离线演示数据库（GitHub Pages 纯前端演示模式回放）：
 *   - DEMO_USERS  演示账号（用户名 -> 密码 + /auth/me 档案）
 *   - DEMO_DB     全部 GET 接口的确定性演示响应
 * 数据更新方式：本地起好后端后重跑 node scripts/record-pc-demo.mjs
 */
export const DEMO_USERS = ${JSON.stringify(
    Object.fromEntries(
      ACCOUNTS.map(([u, p]) => [u, { password: p, profile: profiles[u] }])
    ),
    null,
    2
  )};

export const DEMO_DB = ${JSON.stringify(db, null, 2)} as const;
`;

  const { writeFileSync, mkdirSync } = await import("node:fs");
  const { dirname, join } = await import("node:path");
  const { fileURLToPath } = await import("node:url");
  const root = join(dirname(fileURLToPath(import.meta.url)), "..");
  const out = join(root, "frontend", "src", "mock", "db.ts");
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, banner, "utf8");

  const kb = (Buffer.byteLength(banner) / 1024).toFixed(1);
  console.log(`\n✅ 已生成 ${out}（${kb} KB）`);
}

main().catch((e) => {
  console.error("❌ 录制失败:", e.message);
  process.exit(1);
});
