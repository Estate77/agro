import axios, { AxiosError, type AxiosInstance } from "axios";
import { demoAdapter, demoEnabled } from "@/mock/demo";

/**
 * API 地址优先级：
 * 1. window.__ZYUN_API_BASE__（运行时，由 public/config.js 注入，公开部署改它）
 * 2. __VITE_API_BASE__（构建期，默认 /api，开发走 vite 代理）
 */
const runtimeBase = (typeof window !== "undefined" && window.__ZYUN_API_BASE__) || "";
const API_BASE: string = runtimeBase || __VITE_API_BASE__ || "/api";

const http: AxiosInstance = axios.create({
  baseURL: API_BASE,
  timeout: 15_000,
});

// 纯前端演示模式：Pages 部署注入 window.__ZYUN_DEMO_OFFLINE__ 后，
// 所有请求由内置 mock 层（src/mock/demo.ts）响应，无需真实后端。
if (demoEnabled()) http.defaults.adapter = demoAdapter;

http.interceptors.request.use((config) => {
  const token = localStorage.getItem("zy_access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

http.interceptors.response.use(
  (resp) => resp,
  (err: AxiosError<{ code?: number; message?: string }>) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("zy_access_token");
      localStorage.removeItem("zy_refresh_token");
      const isHashRouter = window.location.hash.includes("#/");
      const toLogin = () => {
        if (!window.location.hash.includes("#/login") && !window.location.pathname.includes("/login")) {
          if (isHashRouter) {
            window.location.hash = "#/login";
          } else {
            window.location.href = "/login";
          }
        }
      };
      toLogin();
    }
    const message = err.response?.data?.message || err.message || "请求失败";
    // 网络类错误标记，供离线队列判断
    const enriched = new Error(message) as Error & { isNetworkError?: boolean };
    enriched.isNetworkError = !err.response;
    return Promise.reject(enriched);
  }
);

export interface Resp<T> {
  code: number;
  message: string;
  data: T;
}

export interface PageOut<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
}

export async function unwrap<T>(p: Promise<{ data: Resp<T> }>): Promise<T> {
  const r = await p;
  if (r.data.code !== 0) {
    throw new Error(r.data.message);
  }
  return r.data.data;
}

export function apiBase(): string {
  return API_BASE;
}

export default http;