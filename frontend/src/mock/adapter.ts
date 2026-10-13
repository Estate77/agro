/**
 * PC 端离线演示适配层。
 *
 * 部署站点由 config.js 注入 window.__ZYUN_DEMO_OFFLINE__ = true 后，
 * 所有 axios 请求被本适配层接管，直接回放 scripts/record-pc-demo.mjs
 * 录制的确定性演示数据（DEMO_DB），无需公网后端。
 *
 * - 登录：校验 DEMO_USERS（与后端 seed 演示账号一致），签发假 token `demo.<username>`
 * - GET：按路径回放录制数据，列表接口在内存中做筛选/分页
 * - 写操作：返回模拟成功（演示模式下数据不持久化，刷新即恢复）
 * - 关闭开关（本地开发）时回落到 axios 默认 adapter，走真实后端
 */
import type { AxiosAdapter, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { DEMO_DB, DEMO_USERS } from "./db";

type Params = Record<string, any> | undefined;

function ok(data: unknown): AxiosResponse {
  return {
    data: { code: 0, message: "ok", data },
    status: 200,
    statusText: "OK",
    headers: {},
    config: {} as InternalAxiosRequestConfig,
  };
}

function fail(message: string, status = 200): AxiosResponse {
  return {
    data: { code: 1, message },
    status,
    statusText: status === 200 ? "OK" : "Error",
    headers: {},
    config: {} as InternalAxiosRequestConfig,
  };
}

/** 假 token 形如 demo.<username> */
function userFromToken(config: InternalAxiosRequestConfig): string | null {
  const auth = (config.headers?.Authorization as string | undefined) || "";
  return auth.startsWith("Bearer demo.") ? auth.slice("Bearer demo.".length) : null;
}

function parseBody(config: InternalAxiosRequestConfig): any {
  if (!config.data) return {};
  if (typeof config.data === "string") {
    try {
      return JSON.parse(config.data);
    } catch {
      return {};
    }
  }
  return config.data;
}

/** 内存分页 + 关键字/域筛选（列表接口回放用） */
function paginate<T extends Record<string, any>>(items: T[], params: Params) {
  const page = Number(params?.page) || 1;
  const size = Number(params?.page_size) || 10;
  let list = items;
  const kw = (params?.keyword || "").toString().trim().toLowerCase();
  if (kw) {
    list = list.filter((x) => JSON.stringify(x).toLowerCase().includes(kw));
  }
  if (params?.domain) {
    list = list.filter((x) => x.domain === params.domain);
  }
  return {
    items: list.slice((page - 1) * size, page * size),
    total: list.length,
    page,
    page_size: size,
  };
}

function pathOf(config: InternalAxiosRequestConfig): string {
  return (config.url || "").split("?")[0].replace(/\/+$/, "");
}

function lookupGet(url: string, config: InternalAxiosRequestConfig): AxiosResponse | null {
  const params: Params = config.params as Params;
  const db = DEMO_DB as Record<string, any>;

  // 认证
  if (url === "/v1/auth/me") {
    const username = userFromToken(config);
    const profile = username && (DEMO_USERS as Record<string, any>)[username];
    return profile ? ok(profile) : fail("登录状态已失效", 401);
  }

  // 静态回放
  const staticRoutes: Record<string, unknown> = {
    "/v1/dashboard/kpi": db.dashboard_kpi,
    "/v1/demo/weather": db.weather,
    "/v1/demo/alerts": db.alerts,
    "/v1/demo/devices": db.devices,
    "/v1/trace/templates": db.trace_templates,
    "/v1/trace/stats": db.trace_stats,
    "/v1/demo/carbon-overview": db.carbon,
    "/v1/demo/subsidies": db.subsidies,
    "/v1/gov/entities": db.gov_entities,
    "/v1/gov/board": db.gov_board,
    "/v1/gov/emergency": db.gov_emergency,
    "/v1/demo/uav": db.uav,
    "/v1/demo/finance": db.finance,
    "/v1/demo/operation": db.operation,
    "/v1/users": db.users,
    "/v1/roles": db.roles,
    "/v1/permissions": db.permissions,
  };
  if (url in staticRoutes) return ok(staticRoutes[url]);

  // 带参数路由
  if (url === "/v1/demo/telemetry") {
    const id = String(params?.block_id ?? Object.keys(db.telemetry)[0]);
    const hit = db.telemetry[id] || Object.values(db.telemetry)[0];
    return ok(hit);
  }
  if (url === "/v1/trace/events") {
    const code = params?.batch_code || "";
    return ok(db.trace_events[code] || { batch_code: code, items: [], total: 0 });
  }
  if (url === "/v1/blocks") return ok(paginate(db.blocks.items, params));
  if (url === "/v1/batches") return ok(paginate(db.batches.items, params));
  if (url === "/v1/data-assets") return ok(paginate(db.data_assets.items, params));

  const govDetail = url.match(/^\/v1\/gov\/entities\/(\d+)$/);
  if (govDetail) {
    const hit = (DEMO_DB as any).gov_entity_detail[Number(govDetail[1])];
    return hit ? ok(hit) : fail("主体不存在");
  }
  const assetDetail = url.match(/^\/v1\/data-assets\/(\d+)$/);
  if (assetDetail) {
    const hit = (DEMO_DB as any).data_asset_detail[Number(assetDetail[1])];
    return hit ? ok(hit) : fail("记录不存在");
  }

  return null;
}

function handleWrite(method: string, url: string, config: InternalAxiosRequestConfig): AxiosResponse | null {
  const body = parseBody(config);

  if (method === "post" && url === "/v1/auth/login") {
    const rec = (DEMO_USERS as Record<string, any>)[body.username];
    if (rec && rec.password === body.password) {
      return ok({
        access_token: `demo.${body.username}`,
        refresh_token: `demo-refresh.${body.username}`,
        token_type: "bearer",
        expires_in: 3600,
      });
    }
    return fail("用户名或密码错误");
  }
  if (method === "post" && url === "/v1/auth/refresh") {
    const username = String(body.refresh_token || "").replace("demo-refresh.", "") || "admin";
    return ok({
      access_token: `demo.${username}`,
      refresh_token: `demo-refresh.${username}`,
      token_type: "bearer",
      expires_in: 3600,
    });
  }
  if (method === "post" && url === "/v1/ai/disease") return ok((DEMO_DB as any).ai_disease);
  if (method === "post" && url === "/v1/ai/qa") return ok((DEMO_DB as any).ai_qa);
  if (method === "post" && url === "/v1/gov/emergency") {
    return ok({
      id: `EM-${Date.now().toString(36).toUpperCase()}`,
      dispatch_to: "县农业农村局应急科",
      sla_min: 30,
      status: "已派单",
    });
  }
  // 通用写操作：返回模拟成功
  if (method === "post" && /^\/v1\/data-assets\/\d+\/certify$/.test(url)) {
    return ok({ id: Number(url.match(/\d+/)![0]) });
  }
  if (method === "post" && /^\/v1\/data-assets\/\d+\/qualities$/.test(url)) {
    return ok({
      id: 9999,
      asset_id: Number(url.match(/\d+/)![0]),
      check_date: new Date().toISOString().slice(0, 10),
      completeness: body.completeness ?? 96,
      accuracy: body.accuracy ?? 95,
      timeliness: body.timeliness ?? 94,
      consistency: body.consistency ?? 97,
      notes: body.notes ?? null,
    });
  }
  if (method === "post" && ["/v1/blocks", "/v1/plantings", "/v1/farmwork", "/v1/harvests"].includes(url)) {
    return ok({ id: 9999 });
  }
  if (method === "put" && /^\/v1\/farmwork\/\d+$/.test(url)) {
    return ok({ id: Number(url.match(/\d+/)![0]) });
  }
  return null;
}

async function offlineAdapter(config: InternalAxiosRequestConfig): Promise<AxiosResponse> {
  const method = (config.method || "get").toLowerCase();
  const url = pathOf(config);

  if (method === "get") {
    const hit = lookupGet(url, config);
    if (hit) return hit;
    return fail(`演示模式未收录该接口：GET ${url}`);
  }
  const wrote = handleWrite(method, url, config);
  if (wrote) return wrote;
  return fail(`演示模式暂不支持该操作：${method.toUpperCase()} ${url}`);
}

/** 安装离线演示适配层：运行时检查开关，未开启时走默认 adapter（真实后端） */
export function installOfflineAdapter(http: AxiosInstance): void {
  const defaultAdapter = http.defaults.adapter as AxiosAdapter | undefined;
  if (!defaultAdapter) return;
  http.defaults.adapter = async (config) => {
    if (typeof window !== "undefined" && window.__ZYUN_DEMO_OFFLINE__) {
      return offlineAdapter(config);
    }
    return defaultAdapter(config);
  };
}
