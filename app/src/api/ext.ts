import http, { type Resp, unwrap } from "./client";

// ---------- AI 农技问答 ----------

export interface QaResult {
  answer: string;
  matched: boolean;
  suggestions: string[];
  model: string;
  is_mock: boolean;
}

export function aiQa(question: string) {
  return unwrap<QaResult>(
    http.post<Resp<QaResult>>("/v1/ai/qa", { question })
  );
}

// ---------- 行情 / 政策 / 投入品 ----------

export interface MarketPrice {
  name: string;
  unit: string;
  price: number;
  prev_price: number;
  change_pct: number;
  market: string;
  date: string;
}

export function getPrices() {
  return unwrap<{ items: MarketPrice[]; updated_at: string }>(
    http.get<Resp<{ items: MarketPrice[]; updated_at: string }>>("/v1/market/prices")
  );
}

export interface Policy {
  id: string;
  title: string;
  level: string;
  region: string;
  amount_desc: string;
  deadline: string;
  requirement: string;
  status: string;
}

export function getPolicies() {
  return unwrap<{ items: Policy[] }>(
    http.get<Resp<{ items: Policy[] }>>("/v1/market/policies")
  );
}

export interface InputItem {
  id: string;
  name: string;
  category: string;
  target: string;
  dosage: string;
  withdraw_days: number;
  price: string;
}

export function getInputs() {
  return unwrap<{ items: InputItem[] }>(
    http.get<Resp<{ items: InputItem[] }>>("/v1/market/inputs")
  );
}

// ---------- 碳账户（C 端，公共） ----------

export interface CarbonFootprint {
  product: string;
  kg_co2e: number;
  unit: string;
  breakdown: Array<{ item: string; kg: number; pct: number }>;
  vs_category_avg_pct: number;
  level: string;
}

export function getCarbonFootprint(product: string) {
  return unwrap<CarbonFootprint>(
    http.get<Resp<CarbonFootprint>>("/v1/carbon/footprint", { params: { product } })
  );
}

export interface CarbonAccount {
  points: number;
  total_footprint_kg: number;
  total_saved_kg: number;
  history: Array<{ date: string; title: string; points: number }>;
  redeem_items: Array<{ id: string; name: string; points: number; stock: number; icon: string }>;
}

export function getCarbonAccount() {
  return unwrap<CarbonAccount>(http.get<Resp<CarbonAccount>>("/v1/carbon/account"));
}

export function redeemCarbon(itemId: string) {
  return unwrap<{ ok: boolean; points_balance: number; message: string }>(
    http.post<Resp<{ ok: boolean; points_balance: number; message: string }>>("/v1/carbon/redeem", {
      item_id: itemId,
    })
  );
}

// ---------- 智耘政（G 端） ----------

export interface GovTodo {
  id: string;
  type: string;
  level: string;
  title: string;
  detail: string;
  deadline: string;
  link: string;
}

export function getGovTodos() {
  return unwrap<{ items: GovTodo[]; total: number; high_count: number }>(
    http.get<Resp<{ items: GovTodo[]; total: number; high_count: number }>>("/v1/gov/todos")
  );
}

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
  return unwrap<{ items: GovEntity[] }>(
    http.get<Resp<{ items: GovEntity[] }>>("/v1/gov/entities")
  );
}

export interface GovEntityDetail extends GovEntity {
  ledger: Record<string, string | number>;
  alerts: Array<{ date: string; type: string; level: string; msg: string }>;
  blockchain: { chain: string; cert_hash: string; last_block_height: number; last_anchor_at: string };
}

export function getGovEntity(id: number) {
  return unwrap<GovEntityDetail>(http.get<Resp<GovEntityDetail>>(`/v1/gov/entities/${id}`));
}

export function reportEmergency(payload: {
  type: string;
  desc: string;
  geo?: string;
  photo_name?: string;
  voice_text?: string;
}) {
  return unwrap<{ id: string; dispatch_to: string; sla_min: number; status: string }>(
    http.post<Resp<{ id: string; dispatch_to: string; sla_min: number; status: string }>>(
      "/v1/gov/emergency",
      payload
    )
  );
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
