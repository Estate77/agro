import http, { type Resp, unwrap, type PageOut } from "./client";

// ---------- 地块 ----------
export interface Block {
  id: number;
  code: string;
  name: string;
  crop: string | null;
  variety: string | null;
  area_mu: number;
  owner_org: string | null;
}

export function listBlocks(params?: { page?: number; page_size?: number }) {
  return unwrap<PageOut<Block>>(http.get<Resp<PageOut<Block>>>("/v1/blocks", { params }));
}

// ---------- 农事任务 ----------
export interface TaskEvidence {
  type: string;
  name?: string | null;
  data_url?: string | null;
  ts?: string | null;
}

export interface FarmTask {
  id: number;
  planting_id: number;
  type: string;
  plan_date: string;
  status: string;
  assignee: string | null;
  geo: string | null;
  note: string | null;
  evidences: TaskEvidence[];
}

export function listTasks(params: { status?: string; page?: number; page_size?: number }) {
  return unwrap<PageOut<FarmTask>>(
    http.get<Resp<PageOut<FarmTask>>>("/v1/farmwork", { params })
  );
}

/** APP 打卡契约：phase=before 任务前留痕 / after 任务后完结 */
export function checkIn(
  taskId: number,
  payload: { phase: "before" | "after"; evidences: TaskEvidence[]; note?: string; geo?: string }
) {
  return unwrap<FarmTask>(http.post<Resp<FarmTask>>(`/v1/farmwork/${taskId}/check`, payload));
}

// ---------- 演示：天气 / 遥测 / 告警 ----------
export interface WeatherToday {
  date: string;
  condition: string;
  icon: string;
  temp_hi: number;
  temp_lo: number;
  humidity: number;
  wind: string;
  advice: string;
}

export interface WeatherForecast {
  date: string;
  weekday: string;
  condition: string;
  icon: string;
  temp_hi: number;
  temp_lo: number;
  suitable_for_spray: boolean;
}

export function getWeather(blockId?: number) {
  return unwrap<{ today: WeatherToday; forecast: WeatherForecast[] }>(
    http.get<Resp<{ today: WeatherToday; forecast: WeatherForecast[] }>>("/v1/demo/weather", {
      params: blockId ? { block_id: blockId } : {},
    })
  );
}

export interface Telemetry {
  block: { id: number; code: string; name: string; crop: string | null };
  latest: {
    air_temp: number;
    air_humidity: number;
    soil_moisture: number;
    soil_ec: number;
    light: number;
    co2: number;
  };
  history_24h: Array<{
    hour: number;
    air_temp: number;
    air_humidity: number;
    soil_moisture: number;
    soil_ec: number;
    light: number;
    co2: number;
  }>;
  device_online_rate: number;
}

export function getTelemetry(blockId: number) {
  return unwrap<Telemetry>(
    http.get<Resp<Telemetry>>("/v1/demo/telemetry", { params: { block_id: blockId } })
  );
}

export interface Alert {
  level: string;
  type: string;
  msg: string;
  target: string;
}

export function getAlerts() {
  return unwrap<{ items: Alert[]; total: number }>(
    http.get<Resp<{ items: Alert[]; total: number }>>("/v1/demo/alerts")
  );
}

// ---------- AI 识病虫害 ----------
export interface DiseaseResult {
  code: string;
  name: string;
  type: string;
  host: string;
  severity: string;
  confidence: number;
  advice: string[];
  medicine: string;
  withdraw_period_days: number;
  analyzed_at: string;
  model: string;
  is_mock: boolean;
}

export function diagnose(imageName: string, crop?: string) {
  return unwrap<DiseaseResult>(
    http.post<Resp<DiseaseResult>>("/v1/ai/disease", { image_name: imageName, crop })
  );
}

// ---------- 溯源批次 ----------
export interface BatchItem {
  id: number;
  code: string;
  product_name: string;
  variety: string | null;
  origin: string | null;
  status: string;
}

export function listBatches(params?: { page?: number; page_size?: number }) {
  return unwrap<PageOut<BatchItem>>(http.get<Resp<PageOut<BatchItem>>>("/v1/batches", { params }));
}

export interface TracePublic {
  code: string;
  product_name: string;
  variety: string | null;
  origin: string | null;
  status: string;
  harvested_at: string | null;
  block_name: string | null;
  block_code: string | null;
  crop: string | null;
  planting_start: string | null;
  season: string | null;
  operator: string | null;
  weight_kg: number | null;
  quality_grade: string | null;
  cert_chain: string | null;
}

/** 公共接口：无需登录（C 端扫码） */
export function getPublicTrace(code: string) {
  return unwrap<TracePublic>(http.get<Resp<TracePublic>>(`/v1/batches/public/${code}`));
}