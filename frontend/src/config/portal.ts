/**
 * 端口（C/B/G）权限与顶部导航配置中心。
 *
 * 权限模型：
 * - 每个角色对应可用的端口集合（ROLE_PORTALS），登录后由 role_codes 推导
 * - 顶部导航按"当前视角端口"过滤，路由守卫按"角色可用端口"拦截越权 URL
 * - 平台超管持有全部端口视角，可在顶部下拉切换；单端口账号仅显示徽标
 */

export type PortalId = "B" | "G" | "C";

export interface PortalMeta {
  id: PortalId;
  label: string;
  full: string;
  desc: string;
}

export const PORTALS: Record<PortalId, PortalMeta> = {
  B: { id: "B", label: "B 端", full: "B 端 · 生产经营", desc: "农场/合作社生产运营视角" },
  G: { id: "G", label: "G 端", full: "G 端 · 政务监管", desc: "政府监管与公共查询视角" },
  C: { id: "C", label: "C 端", full: "C 端 · 消费运营", desc: "商城运营与溯源客服视角" },
};

/** 角色 → 可用端口（与后端 seed.py DEFAULT_ROLES 对应） */
export const ROLE_PORTALS: Record<string, PortalId[]> = {
  platform_admin: ["B", "G", "C"],
  tenant_admin: ["B"],
  farm_operator: ["B"],
  viewer: ["B"],
  gov_regulator: ["G"],
  c_operator: ["C"],
};

export interface MenuItem {
  path: string;
  icon: string;
  label: string;
  desc: string;
  portals: PortalId[];
}

export interface MenuCategory {
  id: string;
  name: string;
  en: string;
  items: MenuItem[];
}

/** 顶部导航：最多 5 大分类 */
export const MENU_CATEGORIES: MenuCategory[] = [
  {
    id: "overview",
    name: "总览驾驶",
    en: "OVERVIEW",
    items: [
      { path: "/dashboard", icon: "DataLine", label: "工作台", desc: "待办 / KPI / 快捷入口", portals: ["B"] },
      { path: "/cockpit", icon: "Odometer", label: "农场驾驶舱", desc: "园区地图 / 遥测 / 告警", portals: ["B"] },
    ],
  },
  {
    id: "production",
    name: "生产管理",
    en: "PRODUCTION",
    items: [
      { path: "/blocks", icon: "Grid", label: "地块管理", desc: "地块台账 / 种植季", portals: ["B"] },
      { path: "/tasks", icon: "List", label: "农事任务", desc: "耕种肥药水收打卡", portals: ["B"] },
      { path: "/uav", icon: "Position", label: "无人机调度", desc: "任务派发 / 远程监控", portals: ["B"] },
      { path: "/iot", icon: "Cpu", label: "物联网中心", desc: "传感器 / 设备台账 / 指令", portals: ["B"] },
      { path: "/ai", icon: "MagicStick", label: "AI 决策中心", desc: "识病 / 问答 / 产量预测", portals: ["B"] },
    ],
  },
  {
    id: "trace",
    name: "产销溯源",
    en: "TRACE & CARBON",
    items: [
      { path: "/trace-center", icon: "Connection", label: "溯源中心", desc: "批次时间线 / 上链 / 扫码统计", portals: ["B", "G", "C"] },
      { path: "/carbon-center", icon: "Aim", label: "碳中和中心", desc: "三范围排放 / 碳汇 / 减排项目", portals: ["B", "G", "C"] },
    ],
  },
  {
    id: "business",
    name: "经营与监管",
    en: "BUSINESS & GOV",
    items: [
      { path: "/finance", icon: "Tickets", label: "经营管理", desc: "投入产出 / 订单 / 发票", portals: ["B"] },
      { path: "/operation", icon: "ShoppingCart", label: "C 端运营", desc: "用户分析 / 营销 / 履约", portals: ["B", "C"] },
      { path: "/gov-center", icon: "OfficeBuilding", label: "政务监管平台", desc: "主体名录 / 补贴 / 应急", portals: ["G"] },
      { path: "/data-assets", icon: "Coin", label: "数据资产 ★", desc: "资产目录 / 质量 / 存证", portals: ["B", "G"] },
    ],
  },
  {
    id: "system",
    name: "系统",
    en: "SYSTEM",
    items: [
      { path: "/settings", icon: "Setting", label: "系统设置", desc: "用户 / 角色权限 / 审计", portals: ["B"] },
      { path: "/e2e", icon: "Promotion", label: "端到端示例", desc: "地块 → 农事 → 采收 → 批次", portals: ["B"] },
    ],
  },
];

/** 由角色编码推导可用端口（未知角色默认 B 端只读） */
export function allowedPortals(roleCodes: string[] | undefined): PortalId[] {
  if (!roleCodes || !roleCodes.length) return ["B"];
  const set = new Set<PortalId>();
  for (const r of roleCodes) for (const p of ROLE_PORTALS[r] ?? []) set.add(p);
  return set.size ? Array.from(set) : ["B"];
}

/** 按端口过滤后的分类（保留含可见项的分类） */
export function categoriesFor(portal: PortalId): MenuCategory[] {
  return MENU_CATEGORIES.map((c) => ({ ...c, items: c.items.filter((i) => i.portals.includes(portal)) })).filter(
    (c) => c.items.length > 0
  );
}

/** 某端口下第一个可访问路径 */
export function firstPathFor(portal: PortalId): string {
  const cats = categoriesFor(portal);
  return cats[0]?.items[0]?.path ?? "/dashboard";
}

/** 当前视角徽标信息 */
export function portalMeta(id: PortalId): PortalMeta {
  return PORTALS[id] ?? PORTALS.B;
}
