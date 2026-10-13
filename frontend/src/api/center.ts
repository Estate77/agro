import http, { type Resp, unwrap } from "./client";

/** 溯源中心 / 碳中和中心 / 政务监管平台（PC 端）接口封装 */

// ---------- 溯源中心 ----------
export interface TraceTemplateNode {
  seq: number;
  node_type: string;
  name: string;
  on_chain: boolean;
  required: boolean;
}
export interface TraceTemplate {
  id: string;
  name: string;
  applied_to: string;
  nodes: TraceTemplateNode[];
}
export function getTraceTemplates() {
  return unwrap<TraceTemplate[]>(http.get<Resp<TraceTemplate[]>>("/v1/trace/templates"));
}

export interface TraceEvent {
  node_type: string;
  node_name: string;
  ts: string;
  payload_hash: string;
  ipfs_cid: string;
  chain_tx: string | null;
  on_chain: boolean;
  status: string;
}
export function getTraceEvents(batchCode: string) {
  return unwrap<{ batch_code: string; items: TraceEvent[]; total: number }>(
    http.get<Resp<{ batch_code: string; items: TraceEvent[]; total: number }>>("/v1/trace/events", {
      params: { batch_code: batchCode },
    })
  );
}

export interface TraceStats {
  scans_7d: Array<{ date: string; weekday: string; count: number }>;
  regions_top: Array<{ region: string; count: number }>;
  batches_total: number;
  on_chain_rate: number;
  recalls: number;
}
export function getTraceStats() {
  return unwrap<TraceStats>(http.get<Resp<TraceStats>>("/v1/trace/stats"));
}

// ---------- 碳中和中心 ----------
export interface CarbonScope {
  items: Array<{ item: string; kg_co2e: number }>;
  total: number;
}
export interface CarbonOverview {
  scope1: CarbonScope;
  scope2: CarbonScope;
  scope3: CarbonScope;
  total_emission: number;
  total_sequestration: number;
  net_emission: number;
  intensity_kg_per_mu: number;
  offset_rate: number;
  monthly: Array<{ month: string; emission: number; sequestration: number }>;
  sequestration: Array<{ item: string; kg_co2e: number }>;
  projects: Array<{ id: string; name: string; methodology: string; standard: string; status: string; issued_credits: number; estimate_tCO2e: number }>;
  by_block: Array<{ block_name: string; crop: string; area_mu: number; emission: number; sequestration: number; net: number }>;
  methodology_note: string;
}
export function getCarbonOverview() {
  return unwrap<CarbonOverview>(http.get<Resp<CarbonOverview>>("/v1/demo/carbon-overview"));
}

// ---------- 政务监管平台 ----------
export interface SubsidyItem {
  id: string;
  name: string;
  level: string;
  budget_wan: number;
  applicants: number;
  status: string;
  progress: number;
  amount_paid_wan: number;
  beneficiaries: string;
  evidence_hash: string | null;
}
export function getSubsidies() {
  return unwrap<{ items: SubsidyItem[]; total: number; total_budget_wan: number; total_paid_wan: number; on_chain_check: string }>(
    http.get<Resp<{ items: SubsidyItem[]; total: number; total_budget_wan: number; total_paid_wan: number; on_chain_check: string }>>(
      "/v1/demo/subsidies"
    )
  );
}

// G 端主体 / 看板 / 应急（复用移动端演示接口）
export interface GovEntity {
  id: number;
  name: string;
  kind: string;
  legal: string;
  blocks: number;
  area_mu: number;
  risk_score: number;
  risk_level: "绿" | "黄" | "红";
  alerts_total: number;
  is_mock: boolean;
}
export function getGovEntities() {
  return unwrap<{ items: GovEntity[] }>(http.get<Resp<{ items: GovEntity[] }>>("/v1/gov/entities"));
}

export interface GovEntityDetail extends GovEntity {
  ledger: Record<string, string | number>;
  alerts: Array<{ date: string; type: string; level: string; msg: string }>;
  blockchain: { chain: string; cert_hash: string; last_block_height: number; last_anchor_at: string };
}
export function getGovEntity(id: number) {
  return unwrap<GovEntityDetail>(http.get<Resp<GovEntityDetail>>(`/v1/gov/entities/${id}`));
}

export interface GovBoard {
  kpi: {
    blocks: number;
    area_mu: number;
    tasks_total: number;
    tasks_done: number;
    task_done_rate: number;
    subjects: number;
    certified_batches: number;
    complaints_open: number;
  };
  week_scale: number[];
  alarm_trend: { high: number; mid: number; low: number };
}
export function getGovBoard() {
  return unwrap<GovBoard>(http.get<Resp<GovBoard>>("/v1/gov/board"));
}

export function reportEmergency(payload: { type: string; desc: string; geo?: string; photo_name?: string }) {
  return unwrap<{ id: string; dispatch_to: string; sla_min: number; status: string }>(
    http.post<Resp<{ id: string; dispatch_to: string; sla_min: number; status: string }>>("/v1/gov/emergency", payload)
  );
}

export interface EmergencyRecord {
  id: string;
  type?: string;
  desc?: string;
  reporter: string;
  reported_at: string;
  status: string;
  dispatch_to: string;
  sla_min: number;
}
export function listEmergency() {
  return unwrap<{ items: EmergencyRecord[]; total: number }>(
    http.get<Resp<{ items: EmergencyRecord[]; total: number }>>("/v1/gov/emergency")
  );
}

// ---------- 无人机与机器人调度（PC 演示） ----------
export interface UavAgent {
  sn: string;
  model: string;
  kind: string;
  battery: number;
  payload_l: number;
  pos: string;
  speed: string;
  status: string;
  task: string;
}
export interface UavMission {
  id: string;
  name: string;
  block_name: string;
  type: string;
  status: string;
  pilot: string;
  area_mu: number;
  agent: string;
}
export interface UavRoute {
  id: string;
  name: string;
  block_name: string;
  waypoints: number;
  length_m: number;
  spray_l_per_mu: number;
  obstacles: string;
}
export interface UavMaintenance {
  id: string;
  sn: string;
  type: string;
  desc: string;
  status: string;
  hours: number;
}
export interface UavOverview {
  fleet: UavAgent[];
  missions: UavMission[];
  routes: UavRoute[];
  maintenance: UavMaintenance[];
  stats: { active_missions: number; pending_missions: number; area_today_mu: number };
  is_mock: boolean;
}
export function getUavOverview() {
  return unwrap<UavOverview>(http.get<Resp<UavOverview>>("/v1/demo/uav"));
}

// ---------- 经营管理（B 端财务演示） ----------
export interface FinanceBlockRow {
  block_name: string;
  crop: string | null;
  area_mu: number;
  revenue: number;
  cost: number;
  profit: number;
  per_mu_revenue: number;
  per_mu_cost: number;
  margin: number;
}
export interface FinanceOrder {
  id: string;
  buyer: string;
  product: string;
  qty_kg: number;
  amount: number;
  status: string;
  date: string;
}
export interface FinanceInvoice {
  id: string;
  order_id: string;
  amount: number;
  status: string;
  issued_at: string | null;
  paid_at: string | null;
}
export interface FinanceData {
  by_block: FinanceBlockRow[];
  cost_items: Array<{ item: string; amount_wan: number }>;
  orders: FinanceOrder[];
  invoices: FinanceInvoice[];
  monthly: Array<{ month: string; revenue: number; cost: number }>;
  summary: { revenue_total_wan: number; cost_total_wan: number; receivable: number };
  is_mock: boolean;
}
export function getFinance() {
  return unwrap<FinanceData>(http.get<Resp<FinanceData>>("/v1/demo/finance"));
}

// ---------- C 端运营后台（演示） ----------
export interface OperationData {
  users: {
    dau: number;
    mau: number;
    scan_users_total: number;
    repurchase_rate: number;
    new_today: number;
    trend_7d: Array<{ date: string; weekday: string; dau: number; scans: number }>;
  };
  campaigns: Array<{ id: string; name: string; type: string; status: string; participants: number; conversion: number }>;
  orders: Array<{ id: string; user: string; product: string; amount: number; status: string; channel: string; date: string }>;
  is_mock: boolean;
}
export function getOperation() {
  return unwrap<OperationData>(http.get<Resp<OperationData>>("/v1/demo/operation"));
}

// ---------- 系统设置：用户 / 角色 / 权限（真实 RBAC 接口） ----------
export interface RbacUser {
  id: number;
  username: string;
  display_name: string | null;
  email: string | null;
  phone: string | null;
  is_active: boolean;
  is_platform_admin: boolean;
  tenant_id: number;
  tenant_name: string | null;
  role_codes: string[];
  permission_codes: string[];
  created_at: string | null;
}
export function getUsers() {
  return unwrap<RbacUser[]>(http.get<Resp<RbacUser[]>>("/v1/users"));
}

export interface RbacRole {
  id: number;
  code: string;
  name: string;
  description: string | null;
  permission_codes: string[];
  created_at: string | null;
}
export function getRoles() {
  return unwrap<RbacRole[]>(http.get<Resp<RbacRole[]>>("/v1/roles"));
}

export interface RbacPermission {
  id: number;
  code: string;
  name: string;
  module: string;
}
export function getPermissions() {
  return unwrap<RbacPermission[]>(http.get<Resp<RbacPermission[]>>("/v1/permissions"));
}
