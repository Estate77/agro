/**
 * 纯前端演示模式（离线 mock 后端）。
 *
 * 由 window.__ZYUN_DEMO_OFFLINE__ = true（Pages 部署的 config.js 注入）激活：
 * client.ts 会把 axios adapter 替换为本文件的 demoAdapter，
 * 所有 /v1/* 请求在本文件内返回确定性演示数据，无需真实后端。
 *
 * 数据与 backend/app/seed.py、各演示路由保持一致。
 */

import axios, { AxiosError, type AxiosAdapter, type AxiosResponse, type InternalAxiosRequestConfig } from "axios";

export const demoEnabled = (): boolean =>
  typeof window !== "undefined" && !!(window as unknown as { __ZYUN_DEMO_OFFLINE__?: boolean }).__ZYUN_DEMO_OFFLINE__;

// ---------- 确定性随机（与后端 _seed_rng 等价的演示实现） ----------

function hash32(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function rng(...parts: (string | number)[]): () => number {
  return mulberry32(hash32(parts.join("|")));
}

const pick = <T>(r: () => number, arr: T[]): T => arr[Math.floor(r() * arr.length)];
const between = (r: () => number, lo: number, hi: number): number => lo + r() * (hi - lo);
const ri = (r: () => number, lo: number, hi: number): number => Math.floor(between(r, lo, hi + 1));

// ---------- 日期工具 ----------

const WEEKDAYS = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];

function iso(d: Date): string {
  return d.toISOString().slice(0, 10);
}
function addDays(base: Date, n: number): Date {
  const d = new Date(base);
  d.setDate(d.getDate() + n);
  return d;
}
const TODAY = new Date();

// ---------- 演示数据（对齐 backend/app/seed.py） ----------

export interface DemoUser {
  id: number;
  username: string;
  password: string;
  display_name: string;
  role_codes: string[];
  permission_codes: string[];
  is_platform_admin: boolean;
}

const COMMON_PERMS = ["block:read", "planting:read", "farmwork:read", "batch:read", "asset:read"];
const DEMO_USERS: DemoUser[] = [
  {
    id: 1,
    username: "admin",
    password: "admin123",
    display_name: "平台超管",
    role_codes: ["platform_admin"],
    permission_codes: [...COMMON_PERMS, "block:write", "farmwork:write", "harvest:write", "asset:write", "user:write"],
    is_platform_admin: true,
  },
  {
    id: 2,
    username: "manager",
    password: "manager123",
    display_name: "园区管理员",
    role_codes: ["tenant_admin"],
    permission_codes: [...COMMON_PERMS, "block:write", "farmwork:write", "harvest:write", "asset:write"],
    is_platform_admin: false,
  },
  {
    id: 3,
    username: "worker",
    password: "worker123",
    display_name: "李技术员",
    role_codes: ["farm_operator"],
    permission_codes: ["block:read", "farmwork:read", "farmwork:write", "harvest:write", "batch:read"],
    is_platform_admin: false,
  },
  {
    id: 4,
    username: "guest",
    password: "guest123",
    display_name: "访客（只读）",
    role_codes: ["viewer"],
    permission_codes: COMMON_PERMS,
    is_platform_admin: false,
  },
];

interface DemoBlock {
  id: number;
  code: string;
  name: string;
  crop: string;
  variety: string;
  area_mu: number;
  owner_org: string;
  season: string;
  planting_start: string;
  planting_status: string;
}

const DEMO_BLOCKS: DemoBlock[] = [
  { id: 1, code: "BLK-001", name: "1 号稻田", crop: "水稻", variety: "南粳 9108", area_mu: 120.5, owner_org: "智耘示范园区", season: "2026 春", planting_start: iso(addDays(TODAY, -120)), planting_status: "种植中" },
  { id: 2, code: "BLK-002", name: "2 号稻田", crop: "水稻", variety: "南粳 9108", area_mu: 98.0, owner_org: "智耘示范园区", season: "2026 春", planting_start: iso(addDays(TODAY, -120)), planting_status: "种植中" },
  { id: 3, code: "BLK-003", name: "东区番茄棚", crop: "番茄", variety: "粉果 2 号", area_mu: 15.0, owner_org: "智耘示范园区", season: "2025-26 冬春茬", planting_start: iso(addDays(TODAY, -200)), planting_status: "已收获" },
  { id: 4, code: "BLK-004", name: "西区黄瓜棚", crop: "黄瓜", variety: "津优 35 号", area_mu: 12.0, owner_org: "智耘示范园区", season: "2025-26 冬春茬", planting_start: iso(addDays(TODAY, -200)), planting_status: "已收获" },
  { id: 5, code: "BLK-005", name: "北区麦田", crop: "小麦", variety: "济麦 22", area_mu: 210.0, owner_org: "智耘示范园区", season: "2025-26 秋播", planting_start: iso(addDays(TODAY, -120)), planting_status: "种植中" },
  { id: 6, code: "BLK-006", name: "南片玉米地", crop: "玉米", variety: "郑单 958", area_mu: 65.0, owner_org: "智耘示范园区", season: "2026 春", planting_start: iso(addDays(TODAY, -120)), planting_status: "种植中" },
];

export interface DemoTask {
  id: number;
  planting_id: number;
  type: string;
  plan_date: string;
  status: string;
  assignee: string | null;
  geo: string | null;
  note: string | null;
  evidences: Array<{ type: string; name?: string | null; data_url?: string | null; ts?: string | null }>;
}

const TASK_SPECS: Array<[string, string, number, string, string]> = [
  ["BLK-001", "分蘖期追肥", -3, "已完成", "李技术员"],
  ["BLK-001", "灌溉", 0, "待办", "李技术员"],
  ["BLK-001", "病虫害巡检", -1, "进行中", "李技术员"],
  ["BLK-002", "晒田控蘖", 2, "待办", "王大姐"],
  ["BLK-002", "稻飞虱防治", -2, "待办", "王大姐"],
  ["BLK-003", "整枝打杈", 1, "待办", "张师傅"],
  ["BLK-003", "滴灌系统检修", -5, "已完成", "张师傅"],
  ["BLK-004", "霜霉病防治", -1, "待办", "张师傅"],
  ["BLK-004", "采收准备", 3, "待办", "赵工"],
  ["BLK-005", "返青期追肥", -4, "已完成", "赵工"],
  ["BLK-005", "杂草防除", 1, "待办", "赵工"],
  ["BLK-005", "苗情调查", 0, "进行中", "赵工"],
  ["BLK-006", "心叶期灌心防螟", -1, "进行中", "李技术员"],
  ["BLK-006", "追施穗肥", 4, "待办", "王大姐"],
];

const plantingIdOf = (code: string): number => DEMO_BLOCKS.find((b) => b.code === code)!.id;

export const demoTasks: DemoTask[] = TASK_SPECS.map(([code, type, offset, status, assignee], i) => ({
  id: i + 1,
  planting_id: plantingIdOf(code),
  type,
  plan_date: iso(addDays(TODAY, offset)),
  status,
  assignee,
  geo: "116.405,39.905",
  note: null,
  evidences: [],
}));

interface DemoBatch {
  id: number;
  code: string;
  product_name: string;
  variety: string;
  origin: string;
  status: string;
  block: DemoBlock;
  harvested_at: string;
  weight_kg: number;
  quality_grade: string;
  operator: string;
}

const DEMO_BATCHES: DemoBatch[] = [
  { id: 1, code: "TB-DEMO-20260315-A1", product_name: "番茄", variety: "粉果 2 号", origin: "东区番茄棚 · 智耘示范园区", status: "已上架", block: DEMO_BLOCKS[2], harvested_at: "2026-03-15", weight_kg: 4800, quality_grade: "A", operator: "张师傅" },
  { id: 2, code: "TB-DEMO-20260420-B2", product_name: "番茄", variety: "粉果 2 号", origin: "东区番茄棚 · 智耘示范园区", status: "在途", block: DEMO_BLOCKS[2], harvested_at: "2026-04-20", weight_kg: 3200, quality_grade: "A", operator: "张师傅" },
  { id: 3, code: "CG-DEMO-20260418-C3", product_name: "黄瓜", variety: "津优 35 号", origin: "西区黄瓜棚 · 智耘示范园区", status: "已上架", block: DEMO_BLOCKS[3], harvested_at: "2026-04-18", weight_kg: 2600, quality_grade: "B", operator: "赵工" },
];

// ---------- 病虫害知识库（对齐 backend ai.py） ----------

const DISEASE_LIBRARY = [
  { code: "aphid", name: "蚜虫", type: "虫害", host: "通用（番茄/黄瓜/小麦）", severity: "中度", conf: [88, 96], advice: ["悬挂黄色粘板诱杀有翅蚜", "喷施 10% 吡虫啉可湿性粉剂 1500 倍液，间隔 7 天再施 1 次", "保护瓢虫、食蚜蝇等天敌，减少广谱杀虫剂使用"], medicine: "10% 吡虫啉可湿性粉剂", withdraw: 7 },
  { code: "powdery_mildew", name: "白粉病", type: "真菌病害", host: "小麦/黄瓜", severity: "重度", conf: [85, 94], advice: ["发病初期喷施 15% 三唑酮可湿性粉剂 1000 倍液", "加强通风降湿，棚内湿度控制在 70% 以下", "及时清除下部老叶、病叶并带出田外销毁"], medicine: "15% 三唑酮可湿性粉剂", withdraw: 14 },
  { code: "rice_planthopper", name: "稻飞虱", type: "虫害", host: "水稻", severity: "重度", conf: [90, 97], advice: ["孕穗期百丛虫量达 500 头时立即用药", "喷施 25% 噻嗪酮可湿性粉剂 1500 倍液，重点喷水稻中下部", "保持浅水层 3-5cm，避免长期深灌"], medicine: "25% 噻嗪酮可湿性粉剂", withdraw: 14 },
  { code: "corn_borer", name: "玉米螟", type: "虫害", host: "玉米", severity: "中度", conf: [87, 95], advice: ["心叶期灌心防治，用白僵菌颗粒剂丢心", "释放赤眼蜂，每亩 1-2 万头，分 2 次释放", "成虫期挂频振式杀虫灯诱杀"], medicine: "白僵菌颗粒剂（生物防治）", withdraw: 0 },
  { code: "tomato_early_blight", name: "番茄早疫病", type: "真菌病害", host: "番茄", severity: "中度", conf: [86, 93], advice: ["发病初期摘除病叶，喷施 75% 百菌清可湿性粉剂 600 倍液", "控制浇水量，采用滴灌避免叶面结露", "增施磷钾肥提高植株抗性"], medicine: "75% 百菌清可湿性粉剂", withdraw: 7 },
  { code: "downy_mildew", name: "霜霉病", type: "真菌病害", host: "黄瓜", severity: "重度", conf: [89, 96], advice: ["发现中心病株立即喷施 72% 霜脲·锰锌可湿性粉剂 800 倍液", "夜间通风降温除湿，缩短结露时间", "雨后及时排水，降低棚内湿度"], medicine: "72% 霜脲·锰锌可湿性粉剂", withdraw: 10 },
  { code: "spider_mite", name: "红蜘蛛（叶螨）", type: "虫害", host: "通用（玉米/番茄/黄瓜）", severity: "中度", conf: [84, 92], advice: ["喷施 1.8% 阿维菌素乳油 3000 倍液，重点喷叶背", "高温干旱期加强巡查，及时灌水降温增湿", "清除田边杂草，减少虫源"], medicine: "1.8% 阿维菌素乳油", withdraw: 7 },
  { code: "healthy", name: "未见明显病虫害", type: "正常", host: "通用", severity: "无", conf: [80, 90], advice: ["作物长势正常，建议继续保持常规巡检", "关注未来 3 天天气，提前做好水肥安排"], medicine: "无需用药", withdraw: 0 },
];

const QA_KB: Array<{ keywords: string[]; answer: string }> = [
  { keywords: ["番茄", "西红柿"], answer: "番茄关键管理要点：\n1. 温度：白天 22–28℃、夜间不低于 13℃；\n2. 水分：滴灌小水勤浇，避免叶面结露；\n3. 常见病害：早疫病、晚疫病、灰霉病，注意通风降湿；\n4. 保花保果：熊蜂授粉或震荡授粉，慎用 2,4-D。" },
  { keywords: ["施肥", "追肥", "底肥", "肥料"], answer: "施肥建议：\n1. 底肥：腐熟有机肥 2–3 吨/亩 + 平衡复合肥 30–40kg/亩；\n2. 追肥：果期高钾水溶肥 5kg/亩，随水冲施，7–10 天 1 次；\n3. 叶面补肥：缺钙引起脐腐病可喷 0.3% 氯化钙。" },
  { keywords: ["浇水", "灌溉", "滴灌"], answer: "浇水原则「见干见湿」：\n1. 苗期控水蹲根，土壤湿度 55–65%；\n2. 果期需水大，晴天上午浇，避免午后高温浇水；\n3. 雨前不浇、雨后排水，棚内湿度控制在 70% 以下。" },
  { keywords: ["蚜虫", "白粉虱", "粉虱"], answer: "蚜虫/白粉虱防治：\n1. 物理防治：黄板每亩 25–30 张；\n2. 生物防治：释放丽蚜小蜂；\n3. 化学防治：10% 吡虫啉 1500 倍液，注意轮换用药防抗性，安全间隔期 7 天。" },
  { keywords: ["白粉病"], answer: "白粉病防治：\n1. 发病初期喷 15% 三唑酮 1000 倍液或 42% 苯菌悬浮剂；\n2. 加强通风降湿，避免偏施氮肥；\n3. 病叶及时摘除带出田外，安全间隔期 14 天。" },
  { keywords: ["低温", "冻害", "寒潮", "霜冻"], answer: "寒潮应对：\n1. 提前 1–2 天浇小水增加土壤热容；\n2. 棚室加盖二道幕/小拱棚，夜间温度低于 5℃ 建议临时加温；\n3. 冻后不要立即升温，缓慢回温并叶面喷糖氮液（1% 葡萄糖 + 0.3% 尿素）恢复。" },
  { keywords: ["补贴", "政策", "申报"], answer: "常见补贴有三类：\n1. 耕地地力保护补贴（6 月底前申报）；\n2. 农机购置补贴（购机后 60 日内）；\n3. 绿色/有机认证奖补（获证后 90 日内）。可在「补贴政策」里查看你所在地区的具体标准与材料清单。" },
  { keywords: ["药害", "烧叶", "黄叶"], answer: "疑似药害/肥害处理：\n1. 立即停用可疑药剂肥料，大水淋洗土壤；\n2. 叶面喷施 0.01% 芸苔素内酯 + 0.2% 磷酸二氢钾缓解；\n3. 保留标签与照片留证，必要时联系服务站上门。" },
];

const QA_FALLBACK =
  "这个问题我还在学习当中～你可以换个说法再问一次，比如「番茄白粉病怎么治」「尿素一亩用多少」。" +
  "如果比较紧急，建议在「紧急求助」里联系服务站农技员，或拍张照片用「拍照识病害」让 AI 先看看。";

// ---------- 行情 / 政策 / 投入品（对齐 backend market.py） ----------

const PRICE_PRODUCTS: Array<[string, string, number]> = [
  ["番茄（大棚）", "元/kg", 5.2],
  ["黄瓜（水果）", "元/kg", 6.8],
  ["普通白菜", "元/kg", 2.6],
  ["辣椒（线椒）", "元/kg", 9.4],
  ["水稻（籼稻）", "元/50kg", 138.0],
  ["小麦（三等）", "元/50kg", 121.0],
  ["玉米（干粮）", "元/kg", 2.4],
  ["鸡蛋（散养）", "元/kg", 11.6],
];
const MARKETS = ["河南万邦农产品物流园", "寿光地利农产品物流园", "新发地批发市场"];

const POLICIES = [
  { id: "p1", title: "耕地地力保护补贴", level: "中央", region: "全国", amount_desc: "约 80–120 元/亩（各地标准不同）", deadline: "每年 6 月 30 日前申报", requirement: "拥有耕地承包权、实际种植粮食作物", status: "申报中" },
  { id: "p2", title: "农机购置与应用补贴", level: "中央+省", region: "全国", amount_desc: "购机价的 15%–35%", deadline: "常年受理，购机后 60 日内", requirement: "购置目录内农机具，一台一档", status: "常年申报" },
  { id: "p3", title: "设施农业大棚建设补贴", level: "县级", region: "示范县", amount_desc: "新建日光温室 8000–15000 元/亩", deadline: "2026-11-30 前", requirement: "集中连片 10 亩以上、验收合格", status: "申报中" },
  { id: "p4", title: "绿色食品 / 有机认证奖补", level: "市级", region: "全市", amount_desc: "绿色食品 2 万元、有机 3 万元一次性奖补", deadline: "获证后 90 日内", requirement: "本年度新获证且在有效期内", status: "申报中" },
  { id: "p5", title: "化肥农药减量增效补贴", level: "省级", region: "产粮大县", amount_desc: "有机肥替代 300 元/吨、统防统治 30 元/亩次", deadline: "2026-12-15 前", requirement: "购买目录内投入品并有台账记录", status: "申报中" },
];

const INPUTS = [
  { id: "i1", name: "10% 吡虫啉可湿性粉剂", category: "杀虫剂", target: "蚜虫/飞虱", dosage: "1500 倍液叶面喷施", withdraw_days: 7, price: "6.5 元/袋" },
  { id: "i2", name: "15% 三唑酮可湿性粉剂", category: "杀菌剂", target: "白粉病/锈病", dosage: "1000 倍液喷雾", withdraw_days: 14, price: "4.2 元/袋" },
  { id: "i3", name: "75% 百菌清可湿性粉剂", category: "杀菌剂", target: "早疫病/霜霉病", dosage: "600 倍液喷雾", withdraw_days: 7, price: "5.0 元/袋" },
  { id: "i4", name: "1.8% 阿维菌素乳油", category: "杀虫杀螨", target: "红蜘蛛/斑潜蝇", dosage: "3000 倍液喷叶背", withdraw_days: 7, price: "8.8 元/瓶" },
  { id: "i5", name: "腐殖酸水溶肥", category: "肥料", target: "促根壮苗", dosage: "5kg/亩 随水冲施", withdraw_days: 0, price: "45 元/袋" },
  { id: "i6", name: "生物有机肥", category: "肥料", target: "改土培肥", dosage: "200–300kg/亩 基施", withdraw_days: 0, price: "88 元/袋" },
  { id: "i7", name: "黄色粘虫板", category: "物理防治", target: "蚜虫/粉虱", dosage: "25–30 张/亩 悬挂", withdraw_days: 0, price: "0.8 元/张" },
];

// ---------- 碳账户 / G 端（内存态） ----------

const carbonAccount = { points: 1280, total_footprint_kg: 36.8, total_saved_kg: 12.4 };
const REDEEM_ITEMS = [
  { id: "r1", name: "有机肥 5kg 装兑换券", points: 800, stock: 12, icon: "🧺" },
  { id: "r2", name: "生鲜满 39 减 10 券", points: 300, stock: 99, icon: "🥬" },
  { id: "r3", name: "种子盲盒（时令蔬菜）", points: 200, stock: 30, icon: "🌱" },
  { id: "r4", name: "公益捐赠·沙漠锁边林 1 棵", points: 500, stock: 999, icon: "🌳" },
];

const MOCK_SUBJECTS = [
  { id: 901, name: "绿丰家庭农场", kind: "家庭农场", legal: "王建国", blocks: 3, area_mu: 180.0 },
  { id: 902, name: "红旗蔬菜合作社", kind: "合作社", legal: "李秀兰", blocks: 6, area_mu: 520.0 },
  { id: 903, name: "金穗种植大户（个体）", kind: "种植大户", legal: "张德福", blocks: 2, area_mu: 95.0 },
];

const emergencyStore: Array<Record<string, unknown>> = [];

// ---------- 业务函数 ----------

function currentUser(headers: Record<string, unknown>): DemoUser | null {
  const auth = String(headers?.Authorization || headers?.authorization || "");
  const m = auth.match(/^Bearer demo-token\.(.+)$/);
  if (!m) return null;
  return DEMO_USERS.find((u) => u.username === m[1]) || null;
}

function requireUser(headers: Record<string, unknown>): DemoUser {
  const u = currentUser(headers);
  if (!u) {
    const err = new Error("登录已过期") as Error & { status?: number };
    err.status = 401;
    throw err;
  }
  return u;
}

function page<T>(items: T[], params: Record<string, unknown>): { items: T[]; total: number; page: number; page_size: number } {
  const page1 = Number(params.page || 1);
  const size = Number(params.page_size || 20);
  return { items: items.slice((page1 - 1) * size, page1 * size), total: items.length, page: page1, page_size: size };
}

function weather(blockId: number | undefined) {
  const today = new Date();
  const r = rng("weather", blockId ?? 0, iso(today));
  const conds: Array<[string, string]> = [["晴", "☀️"], ["多云", "⛅"], ["阴", "☁️"], ["小雨", "🌧️"], ["阵雨", "🌦️"]];
  const [cond, icon] = pick(r, conds);
  const hi = between(r, 22, 33);
  const advice = (c: string, t: number) =>
    c.includes("雨") ? "有降雨，喷药/施肥作业请避开，注意清沟排水" : t > 32 ? "高温天气，灌溉宜在早晚进行，警惕高温逼熟" : t < 8 ? "低温天气，注意防寒防冻，棚室加强保温" : "天气平稳，适宜施肥、喷药等田间作业";
  const forecast = [];
  for (let i = 0; i < 7; i++) {
    const d = addDays(today, i);
    const fr = rng("weather-forecast", blockId ?? 0, iso(d));
    const [c, ic] = pick(fr, conds);
    const h = between(fr, 20, 34);
    forecast.push({ date: iso(d), weekday: WEEKDAYS[d.getDay()], condition: c, icon: ic, temp_hi: +h.toFixed(1), temp_lo: +(h - between(fr, 6, 11)).toFixed(1), suitable_for_spray: !c.includes("雨") });
  }
  return {
    today: { date: iso(today), condition: cond, icon, temp_hi: +hi.toFixed(1), temp_lo: +(hi - between(r, 6, 11)).toFixed(1), humidity: Math.round(between(r, 45, 85)), wind: `${ri(r, 1, 5)} 级`, advice: advice(cond, hi) },
    forecast,
    is_mock: true,
  };
}

function telemetryPoint(blockId: number, hour: number) {
  const r = rng("telemetry", blockId, hour);
  const dayFactor = hour >= 6 && hour <= 18 ? Math.max(0, (((hour - 6) % 24) / 12 - 1)) : 0.2;
  return {
    air_temp: +(18 + dayFactor * 12 + between(r, -1.5, 1.5)).toFixed(1),
    air_humidity: Math.round(85 - dayFactor * 30 + between(r, -5, 5)),
    soil_moisture: Math.round(62 + between(r, -8, 8)),
    soil_ec: +(0.8 + between(r, 0, 0.4)).toFixed(2),
    light: Math.round(dayFactor * 70000 + between(r, 0, 3000)),
    co2: Math.round(420 + dayFactor * 180 + between(r, -30, 30)),
  };
}

function telemetry(blockId: number) {
  const b = DEMO_BLOCKS.find((x) => x.id === blockId);
  if (!b) throw bizErr("地块不存在");
  const now = new Date();
  const history = [];
  for (let h = 0; h < 24; h++) {
    const hh = (now.getHours() - 23 + h + 48) % 24;
    history.push({ hour: hh, ...telemetryPoint(blockId, hh) });
  }
  return { block: { id: b.id, code: b.code, name: b.name, crop: b.crop }, latest: telemetryPoint(blockId, now.getHours()), history_24h: history, device_online_rate: 99.2, is_mock: true };
}

function alerts() {
  const t = iso(TODAY);
  const items: Array<{ level: string; type: string; msg: string; target: string }> = demoTasks
    .filter((x) => (x.status === "待办" || x.status === "进行中") && x.plan_date < t)
    .slice(0, 5)
    .map((x) => ({ level: "中", type: "任务逾期", msg: `「${x.type}」任务已逾期（计划 ${x.plan_date}），执行人：${x.assignee || "未指派"}`, target: `farmwork:${x.id}` }));
  const r = rng("alerts", 1, t);
  const device = [
    { level: "高", type: "设备离线", msg: "3 号地块土壤墒情传感器（SN-SOIL-0117）已离线 2 小时", target: "device:SN-SOIL-0117" },
    { level: "中", type: "温度越限", msg: `东区番茄棚气温 ${between(r, 33, 36).toFixed(1)}℃，超过阈值 32℃`, target: "block:3" },
    { level: "低", type: "虫情预警", msg: "虫情测报灯捕获稻飞虱 46 头/晚，接近防治指标", target: "device:SN-BUG-0033" },
  ];
  items.push(...device.slice(0, Math.max(1, 3 - (items.length % 3))));
  return { items, total: items.length, is_mock: true };
}

function diagnose(imageName: string | null, crop: string | null) {
  let candidates = DISEASE_LIBRARY.filter((d) => d.code !== "healthy");
  if (crop) {
    const m = candidates.filter((d) => (d.host as string).includes(crop));
    if (m.length) candidates = m;
  }
  const r = rng(imageName || "no-name", crop || "no-crop");
  const d = r() < 0.1 ? DISEASE_LIBRARY.find((x) => x.code === "healthy")! : pick(r, candidates);
  return {
    code: d.code, name: d.name, type: d.type, host: d.host, severity: d.severity,
    confidence: +between(r, d.conf[0], d.conf[1]).toFixed(1),
    advice: d.advice, medicine: d.medicine, withdraw_period_days: d.withdraw,
    analyzed_at: new Date().toISOString(), model: "demo-offline-v1.0", is_mock: true,
  };
}

function carbonFootprint(product: string) {
  const r = rng("footprint", product);
  const total = +between(r, 0.6, 2.4).toFixed(2);
  const parts: Array<[string, number]> = [["种植环节", 42], ["冷链运输", 26], ["包装材料", 18], ["加工仓储", 14]];
  let left = total;
  const breakdown = parts.map(([item, pct], i) => {
    const kg = i === parts.length - 1 ? +left.toFixed(2) : +(total * (pct / 100)).toFixed(2);
    left -= kg;
    return { item, kg, pct };
  });
  const vs = Math.round(between(r, -38, 12));
  return { product, kg_co2e: total, unit: "kgCO₂e / kg", breakdown, vs_category_avg_pct: vs, level: vs < -15 ? "低碳" : vs < 0 ? "持平" : "偏高", is_mock: true };
}

function carbonAccountData() {
  const t = new Date();
  const r = rng("carbon-history", iso(t));
  const history = [];
  for (let i = 0; i < 5; i++) {
    history.push({ date: iso(addDays(t, -i)), title: pick(r, ["扫码溯源 1 次", "低碳买菜", "绿色出行打卡", "参与碳中和活动"]), points: pick(r, [5, 10, 15, 20]) });
  }
  return { ...carbonAccount, history, redeem_items: REDEEM_ITEMS, is_mock: true };
}

function riskScore(id: number) {
  const r = rng("risk", id, iso(TODAY));
  const score = ri(r, 62, 98);
  return { risk_score: score, risk_level: score >= 85 ? "绿" : score >= 70 ? "黄" : "红", alerts_total: Math.max(0, Math.floor((100 - score) / 6)), cert_hash: hash32(`cert|${id}|2026`).toString(16).padStart(8, "0").repeat(4) };
}

function govTodos() {
  const t = iso(TODAY);
  const r = rng("gov-todos", 1, t);
  const items: Array<Record<string, unknown>> = demoTasks
    .filter((x) => (x.status === "待办" || x.status === "进行中") && x.plan_date < t)
    .slice(0, 4)
    .map((x) => ({ id: `chk-task-${x.id}`, type: "农事核查", level: "中", title: `核查「${x.type}」任务执行情况`, detail: `计划 ${x.plan_date}，执行人 ${x.assignee || "未指派"}，已逾期`, deadline: iso(addDays(TODAY, 2)), link: "entities" }));
  for (const [i, name] of ["智耘示范园区", "绿丰家庭农场", "红旗蔬菜合作社"].entries()) {
    if (r() < 0.7) {
      items.push({ id: `chk-subject-${i}`, type: "主体核查", level: pick(r, ["中", "低"]), title: `${name} 季度例行核查`, detail: pick(r, ["投入品台账待核验", "新扩建大棚用地备案核查", "绿色认证年审材料核验"]), deadline: iso(addDays(TODAY, ri(r, 3, 10))), link: "entities" });
    }
  }
  if (r() < 0.6) {
    items.push({ id: "emg-001", type: "应急事件", level: "高", title: "西区地块发现异常死苗", detail: "巡田上报：疑似药害或肥害，需现场核查并拍照留证", deadline: t, link: "report" });
  }
  return { items, total: items.length, high_count: items.filter((i) => i.level === "高").length, is_mock: true };
}

function govEntities() {
  const area = DEMO_BLOCKS.reduce((s, b) => s + b.area_mu, 0);
  const items = [
    { id: 1, name: "智耘示范园区", kind: "园区/企业", legal: "—", blocks: DEMO_BLOCKS.length, area_mu: +area.toFixed(1), is_mock: false, ...riskScore(1) },
    ...MOCK_SUBJECTS.map((m) => ({ ...m, is_mock: true, ...riskScore(m.id) })),
  ];
  return { items, total: items.length, is_mock: true };
}

function govEntityDetail(id: number) {
  const real = id === 1 ? { id: 1, name: "智耘示范园区", kind: "园区/企业", legal: "—", blocks: DEMO_BLOCKS.length, area_mu: +DEMO_BLOCKS.reduce((s, b) => s + b.area_mu, 0).toFixed(1), is_mock: false } : MOCK_SUBJECTS.find((m) => m.id === id);
  if (!real) throw bizErr("主体不存在");
  const rs = riskScore(id);
  const r = rng("entity-alerts", id, iso(TODAY));
  const types: Array<[string, string, string]> = [
    ["设备离线", "中", "土壤墒情传感器离线超过 2 小时"],
    ["投入品超标", "高", "抽检发现 1 批次叶菜农残接近限量值"],
    ["任务逾期", "中", "采收计划逾期未执行"],
    ["溯源缺失", "低", "1 个批次未关联种植季档案"],
  ];
  const alerts = [];
  const n = (rs.alerts_total % 4) + 1;
  for (let i = 0; i < n; i++) {
    const [type, level, msg] = pick(r, types);
    alerts.push({ date: iso(addDays(TODAY, -ri(r, 1, 30))), type, level, msg });
  }
  return {
    ...real, ...rs, alerts,
    ledger: { 注册时间: "2024-03-18", 经营类别: real.kind, 地块数: real.blocks, "种植面积(亩)": real.area_mu, 绿色认证: "有效（至 2027-03）", 上年抽检: `${ri(r, 2, 6)} 次，合格率 100%` },
    blockchain: { chain: "智耘联盟链（演示）", cert_hash: rs.cert_hash, last_block_height: 10240 + id, last_anchor_at: new Date().toISOString().slice(0, 16).replace("T", " ") },
    is_mock: true,
  };
}

function govBoard() {
  const r = rng("gov-board", 1, iso(TODAY));
  const tasks = demoTasks.length;
  const done = demoTasks.filter((x) => x.status === "已完成").length;
  return {
    kpi: { blocks: DEMO_BLOCKS.length, area_mu: +DEMO_BLOCKS.reduce((s, b) => s + b.area_mu, 0).toFixed(1), tasks_total: tasks, tasks_done: done, task_done_rate: +((done / tasks) * 100).toFixed(1), subjects: 4, certified_batches: ri(r, 8, 20), complaints_open: ri(r, 0, 2) },
    week_scale: Array.from({ length: 7 }, () => Math.round(between(r, 180, 320))),
    alarm_trend: { high: ri(r, 0, 2), mid: ri(r, 1, 4), low: ri(r, 2, 6) },
    is_mock: true,
  };
}

function mobileHome() {
  const t = iso(TODAY);
  const tasks = demoTasks.filter((x) => x.status === "待办" || x.status === "进行中").slice(0, 3);
  const todayTasks = tasks.filter((x) => x.plan_date === t);
  return { weather: weather(0).today, alerts: [{ level: "中", type: "任务逾期", msg: "存在逾期未完成的农事任务，请尽快处理", target: "farmwork" }], today_tasks: (todayTasks.length ? todayTasks : tasks).map((x) => ({ id: x.id, type: x.type, plan_date: x.plan_date, status: x.status, assignee: x.assignee })), is_mock: true };
}

// ---------- 错误与响应工具 ----------

function bizErr(message: string): Error & { status: number } {
  const e = new Error(message) as Error & { status: number };
  e.status = 200;
  (e as unknown as { respCode: number }).respCode = 40401;
  return e;
}

function resp(data: unknown) {
  return { code: 0, message: "ok", data };
}

function fail(code: number, message: string) {
  return { code, message, data: null };
}

// ---------- 路由 ----------

function route(method: string, path: string, params: Record<string, unknown>, body: Record<string, unknown>, headers: Record<string, unknown>): { code: number; message: string; data: unknown } {
  method = method.toUpperCase(); // 适配器传入的 method 为小写，统一成大写再比较
  const seg = path.replace(/^\/api/, "").replace(/^\/v1\//, "").split("/").filter(Boolean);
  const q = (k: string): string | undefined => (params[k] === undefined ? undefined : String(params[k]));

  // 认证
  if (path === "/v1/auth/login" && method === "POST") {
    const u = DEMO_USERS.find((x) => x.username === body.username && x.password === body.password);
    if (!u) return fail(40001, "用户名或密码错误");
    return resp({ access_token: `demo-token.${u.username}`, refresh_token: `demo-refresh.${u.username}`, token_type: "bearer", expires_in: 86400 });
  }
  if (path === "/v1/auth/me" && method === "GET") {
    const u = requireUser(headers);
    return resp({ id: u.id, username: u.username, display_name: u.display_name, tenant_id: 1, tenant_name: "智耘示范园区", is_platform_admin: u.is_platform_admin, role_codes: u.role_codes, permission_codes: u.permission_codes });
  }

  // 地块 / 农事
  if (path === "/v1/blocks" && method === "GET") return resp(page(DEMO_BLOCKS.map(({ id, code, name, crop, variety, area_mu, owner_org }) => ({ id, code, name, crop, variety, area_mu, owner_org })), params));
  if (path === "/v1/farmwork" && method === "GET") {
    let items = demoTasks;
    const status = q("status");
    if (status) items = items.filter((t) => t.status === status);
    return resp(page(items, params));
  }
  if (seg[0] === "farmwork" && seg[2] === "check" && method === "POST") {
    requireUser(headers);
    const t = demoTasks.find((x) => x.id === Number(seg[1]));
    if (!t) return fail(40401, "任务不存在");
    const phase = String(body.phase || "before");
    const evidences = (body.evidences as DemoTask["evidences"]) || [];
    t.evidences.push(...evidences.map((e) => ({ ...e, ts: new Date().toISOString() })));
    if (phase === "after") t.status = "已完成";
    else if (t.status === "待办") t.status = "进行中";
    return resp(t);
  }

  // 演示数据
  if (path === "/v1/demo/weather" && method === "GET") return resp(weather(q("block_id") ? Number(q("block_id")) : undefined));
  if (path === "/v1/demo/telemetry" && method === "GET") return resp(telemetry(Number(q("block_id"))));
  if (path === "/v1/demo/alerts" && method === "GET") return resp(alerts());
  if (path === "/v1/mobile/home" && method === "GET") { requireUser(headers); return resp(mobileHome()); }

  // AI
  if (path === "/v1/ai/disease" && method === "POST") { requireUser(headers); return resp(diagnose((body.image_name as string) || null, (body.crop as string) || null)); }
  if (path === "/v1/ai/qa" && method === "POST") {
    const question = String(body.question || "");
    let best: { keywords: string[]; answer: string } | null = null;
    let hits = 0;
    for (const item of QA_KB) {
      const h = item.keywords.filter((k) => question.includes(k)).length;
      if (h > hits) { best = item; hits = h; }
    }
    if (!best) return resp({ answer: QA_FALLBACK, matched: false, suggestions: ["番茄白粉病怎么治？", "一亩地底肥用多少？", "寒潮来了怎么防冻？"], model: "demo-offline-v1.0", is_mock: true });
    const r = rng(question);
    return resp({ answer: best.answer, matched: true, suggestions: ["怎么防蚜虫？", "滴灌多久浇一次？", "叶面肥浓度多少？", "大棚湿度怎么降？", "如何申报农机补贴？"].sort(() => r() - 0.5).slice(0, 3), model: "demo-offline-v1.0", is_mock: true });
  }

  // 批次 / 溯源
  if (path === "/v1/batches" && method === "GET") return resp(page(DEMO_BATCHES.map(({ id, code, product_name, variety, origin, status }) => ({ id, code, product_name, variety, origin, status })), params));
  if (seg[0] === "batches" && seg[1] === "public" && seg[2] && method === "GET") {
    const code = decodeURIComponent(seg[2]);
    const b = DEMO_BATCHES.find((x) => x.code === code);
    if (!b) return fail(40401, "溯源码无效或不存在");
    return resp({
      code: b.code, product_name: b.product_name, variety: b.variety, origin: b.origin, status: b.status,
      harvested_at: b.harvested_at, block_name: b.block.name, block_code: b.block.code, crop: b.block.crop,
      planting_start: b.block.planting_start, season: b.block.season, operator: b.operator,
      weight_kg: b.weight_kg, quality_grade: b.quality_grade, cert_chain: null,
    });
  }

  // 行情 / 政策 / 投入品
  if (path === "/v1/market/prices" && method === "GET") {
    const t = iso(TODAY);
    const items = PRICE_PRODUCTS.map(([name, unit, base]) => {
      const r = rng("price", name, t);
      const price = +(base * (1 + between(r, -0.12, 0.12))).toFixed(2);
      const prev = +(base * (1 + between(rng("price", name, t + "|prev"), -0.12, 0.12))).toFixed(2);
      return { name, unit, price, prev_price: prev, change_pct: +(((price - prev) / prev) * 100).toFixed(1), market: pick(r, MARKETS), date: t };
    });
    return resp({ items, updated_at: t, is_mock: true });
  }
  if (path === "/v1/market/policies" && method === "GET") return resp({ items: POLICIES, total: POLICIES.length, is_mock: true });
  if (path === "/v1/market/inputs" && method === "GET") return resp({ items: INPUTS, total: INPUTS.length, is_mock: true });

  // 碳账户
  if (path === "/v1/carbon/footprint" && method === "GET") return resp(carbonFootprint(q("product") || ""));
  if (path === "/v1/carbon/account" && method === "GET") return resp(carbonAccountData());
  if (path === "/v1/carbon/redeem" && method === "POST") {
    const item = REDEEM_ITEMS.find((i) => i.id === body.item_id);
    if (!item) return fail(40401, "兑换项不存在");
    if (carbonAccount.points < item.points) return fail(40901, "碳积分不足");
    carbonAccount.points -= item.points;
    return resp({ ok: true, points_balance: carbonAccount.points, message: `兑换成功：${item.name}（券码 ZY-${new Date().toTimeString().slice(0, 8).replace(/:/g, "")}）` });
  }

  // 智耘政
  if (path === "/v1/gov/todos" && method === "GET") { requireUser(headers); return resp(govTodos()); }
  if (path === "/v1/gov/entities" && seg.length === 2 && method === "GET") { requireUser(headers); return resp(govEntities()); }
  if (seg[0] === "gov" && seg[1] === "entities" && seg[2] && method === "GET") { requireUser(headers); return resp(govEntityDetail(Number(seg[2]))); }
  if (path === "/v1/gov/emergency" && method === "POST") {
    const u = requireUser(headers);
    const rec = { id: `EMG-${new Date().toISOString().slice(0, 19).replace(/[-T:]/g, "")}`, ...body, reporter: u.display_name, reported_at: new Date().toISOString(), status: "已派单", dispatch_to: "区农业农村局应急指挥中心", sla_min: 120 };
    emergencyStore.unshift(rec);
    return resp(rec);
  }
  if (path === "/v1/gov/emergency" && method === "GET") { requireUser(headers); return resp({ items: emergencyStore, total: emergencyStore.length, is_mock: true }); }
  if (path === "/v1/gov/board" && method === "GET") { requireUser(headers); return resp(govBoard()); }

  return fail(40404, `演示模式未实现该接口: ${method} ${path}`);
}

// ---------- axios 适配器 ----------

export const demoAdapter: AxiosAdapter = async (config: InternalAxiosRequestConfig): Promise<AxiosResponse> => {
  const method = (config.method || "get").toLowerCase();
  const [rawUrl, queryStr] = (config.url || "").split("?");
  const params: Record<string, unknown> = { ...(config.params || {}) };
  if (queryStr) {
    for (const [k, v] of new URLSearchParams(queryStr)) params[k] = v;
  }
  let body: Record<string, unknown> = {};
  if (config.data) {
    try {
      body = typeof config.data === "string" ? JSON.parse(config.data) : config.data;
    } catch {
      body = {};
    }
  }
  const headers = (config.headers || {}) as unknown as Record<string, unknown>;

  await new Promise((r) => setTimeout(r, 120 + Math.random() * 180)); // 模拟网络延迟

  try {
    const out = route(method, rawUrl, params, body, headers);
    return {
      data: out,
      status: 200,
      statusText: "OK",
      headers: {},
      config,
    };
  } catch (e) {
    const err = e as Error & { status?: number; respCode?: number };
    if (err.status === 401) {
      // 触发 client.ts 的 401 处理：清除令牌并回登录页
      throw new AxiosError(
        err.message,
        AxiosError.ERR_BAD_REQUEST,
        config,
        undefined,
        { status: 401, statusText: "Unauthorized", headers: {}, config, data: { code: 40101, message: err.message, data: null } } as AxiosResponse
      );
    }
    return {
      data: { code: err.respCode || 50000, message: err.message || "演示模式内部错误", data: null },
      status: 200,
      statusText: "OK",
      headers: {},
      config,
    };
  }
};
