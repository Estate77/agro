import http, { type Resp, unwrap } from "./client";

/** 驾驶舱 / 物联网 / AI 决策中心相关演示接口封装 */

// ---------- 天气 ----------
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
export interface WeatherOut {
  today: WeatherToday;
  forecast: WeatherForecast[];
  is_mock: boolean;
}
export function getWeather(blockId?: number) {
  return unwrap<WeatherOut>(
    http.get<Resp<WeatherOut>>(
      "/v1/demo/weather",
      { params: blockId ? { block_id: blockId } : undefined }
    )
  );
}

// ---------- 告警 ----------
export interface AlertItem {
  level: string;
  type: string;
  msg: string;
  target: string;
}
export function getAlerts() {
  return unwrap<{ items: AlertItem[]; total: number; is_mock: boolean }>(
    http.get<Resp<{ items: AlertItem[]; total: number; is_mock: boolean }>>("/v1/demo/alerts")
  );
}

// ---------- 遥测 ----------
export interface TelemetryPoint {
  hour?: number;
  air_temp: number;
  air_humidity: number;
  soil_moisture: number;
  soil_ec: number;
  light: number;
  co2: number;
}
export interface TelemetryOut {
  block: { id: number; code: string; name: string; crop: string | null };
  latest: TelemetryPoint;
  history_24h: TelemetryPoint[];
  device_online_rate: number;
}
export function getTelemetry(blockId: number) {
  return unwrap<TelemetryOut>(
    http.get<Resp<TelemetryOut>>("/v1/demo/telemetry", { params: { block_id: blockId } })
  );
}

// ---------- 设备台账 ----------
export interface DeviceItem {
  id: number;
  type: string;
  sn: string;
  vendor: string;
  firmware: string;
  protocol: string;
  status: string;
  battery: number;
  block_id: number | null;
  block_name: string;
  last_heartbeat: string;
  uptime_days: number;
}
export function getDevices() {
  return unwrap<{ items: DeviceItem[]; total: number; online: number; online_rate: number; is_mock: boolean }>(
    http.get<Resp<{ items: DeviceItem[]; total: number; online: number; online_rate: number; is_mock: boolean }>>(
      "/v1/demo/devices"
    )
  );
}

// ---------- AI ----------
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
}
export function aiDisease(payload: { image_name?: string; crop?: string; block_id?: number }) {
  return unwrap<DiseaseResult>(http.post<Resp<DiseaseResult>>("/v1/ai/disease", payload));
}

export interface QaResult {
  answer: string;
  matched: boolean;
  suggestions: string[];
  model: string;
}
export function aiQa(question: string) {
  return unwrap<QaResult>(http.post<Resp<QaResult>>("/v1/ai/qa", { question }));
}
