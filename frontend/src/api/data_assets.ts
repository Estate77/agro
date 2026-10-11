import http, { type Resp, unwrap, type PageOut } from "./client";

export interface SchemaField {
  name: string;
  type: string;
  primary?: boolean;
  sensitive?: boolean;
  on_chain?: boolean;
  description?: string | null;
}

export interface DataAsset {
  id: number;
  tenant_id: number;
  code: string;
  name: string;
  domain: string;
  dataset: string;
  description: string | null;
  schema_json: SchemaField[];
  refresh_freq: string;
  source_system: string | null;
  owner: string | null;
  sla: string | null;
  share_scope: string;
  pricing: string | null;
  value_score: number;
  quality_score: number;
  is_certified: boolean;
  cert_hash: string | null;
  created_at: string;
  updated_at: string;
  qualities?: DataAssetQuality[];
}

export interface DataAssetQuality {
  id: number;
  asset_id: number;
  check_date: string;
  completeness: number;
  accuracy: number;
  timeliness: number;
  consistency: number;
  notes: string | null;
}

export function listAssets(params: {
  keyword?: string;
  domain?: string;
  page?: number;
  page_size?: number;
}) {
  return unwrap<PageOut<DataAsset>>(
    http.get<Resp<PageOut<DataAsset>>>("/v1/data-assets", { params })
  );
}

export function getAsset(id: number) {
  return unwrap<DataAsset>(http.get<Resp<DataAsset>>(`/v1/data-assets/${id}`));
}

export function certifyAsset(id: number) {
  return unwrap<{ id: number }>(
    http.post<Resp<{ id: number }>>(`/v1/data-assets/${id}/certify`)
  );
}

export function addQuality(
  id: number,
  payload: {
    completeness: number;
    accuracy: number;
    timeliness: number;
    consistency: number;
    notes?: string;
  }
) {
  return unwrap<DataAssetQuality>(
    http.post<Resp<DataAssetQuality>>(`/v1/data-assets/${id}/qualities`, payload)
  );
}