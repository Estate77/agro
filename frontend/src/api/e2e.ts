import http, { type Resp, unwrap, type PageOut } from "./client";

export interface Block {
  id: number;
  code: string;
  name: string;
  crop: string | null;
  variety: string | null;
  area_mu: number;
  owner_org: string | null;
  geometry_wkt: string | null;
  current_planting_id: number | null;
}

export interface Planting {
  id: number;
  block_id: number;
  season: string;
  crop: string;
  variety: string | null;
  start_date: string;
  end_date: string | null;
  expected_yield_kg: number;
  status: string;
}

export interface FarmworkTask {
  id: number;
  planting_id: number;
  type: string;
  plan_date: string;
  status: string;
  assignee: string | null;
  note: string | null;
}

export interface Batch {
  id: number;
  planting_id: number;
  harvest_id: number;
  code: string;
  product_name: string;
  variety: string | null;
  origin: string | null;
  status: string;
  chain_tx: string | null;
}

// ---------- Block ----------
export function listBlocks(params?: { keyword?: string; page?: number; page_size?: number }) {
  return unwrap<PageOut<Block>>(http.get<Resp<PageOut<Block>>>("/v1/blocks", { params }));
}

export function createBlock(payload: {
  code: string;
  name: string;
  crop?: string;
  variety?: string;
  area_mu?: number;
  owner_org?: string;
  geometry_wkt?: string;
}) {
  return unwrap<{ id: number }>(http.post<Resp<{ id: number }>>("/v1/blocks", payload));
}

// ---------- Planting ----------
export function createPlanting(payload: {
  block_id: number;
  season: string;
  crop: string;
  variety?: string;
  start_date: string;
  expected_yield_kg?: number;
}) {
  return unwrap<{ id: number }>(
    http.post<Resp<{ id: number }>>("/v1/plantings", payload)
  );
}

// ---------- Farmwork ----------
export function createTask(payload: {
  planting_id: number;
  type: string;
  plan_date: string;
  assignee?: string;
  geo?: string;
  note?: string;
}) {
  return unwrap<{ id: number }>(
    http.post<Resp<{ id: number }>>("/v1/farmwork", payload)
  );
}

export function completeTask(task_id: number, note?: string) {
  return unwrap<{ id: number }>(
    http.put<Resp<{ id: number }>>(`/v1/farmwork/${task_id}`, {
      status: "已完成",
      note,
    })
  );
}

// ---------- Harvest + Batch（端到端示例核心） ----------
export function createHarvest(payload: {
  planting_id: number;
  batch_code?: string;
  weight_kg: number;
  quality_grade: string;
  geo?: string;
  operator?: string;
}) {
  return unwrap<{ id: number }>(
    http.post<Resp<{ id: number }>>("/v1/harvests", payload)
  );
}

export function listBatches(params?: { page?: number; page_size?: number }) {
  return unwrap<PageOut<Batch>>(
    http.get<Resp<PageOut<Batch>>>("/v1/batches", { params })
  );
}

// ---------- Dashboard ----------
export function dashboardKpi() {
  return unwrap<Record<string, number>>(
    http.get<Resp<Record<string, number>>>("/v1/dashboard/kpi")
  );
}