import axios, { AxiosError, type AxiosInstance } from "axios";
import { installOfflineAdapter } from "@/mock/adapter";

/**
 * API 地址优先级：
 * 1. window.__ZYUN_API_BASE__（运行时，由 public/config.js 注入，公开部署改它）
 * 2. __VITE_API_BASE__（构建期，默认 /api，开发走 vite 代理）
 */
const runtimeBase = (typeof window !== "undefined" && window.__ZYUN_API_BASE__) || "";
const API_BASE: string = runtimeBase || __VITE_API_BASE__ || "/api";

const http: AxiosInstance = axios.create({
  baseURL: API_BASE,
  timeout: 20_000,
});

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
    // 401 → 跳登录（hash 路由）
    if (err.response?.status === 401) {
      localStorage.removeItem("zy_access_token");
      localStorage.removeItem("zy_refresh_token");
      if (!window.location.hash.includes("#/login")) {
        window.location.hash = "#/login";
      }
    }
    const message = err.response?.data?.message || err.message || "请求失败";
    return Promise.reject(new Error(message));
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

// 离线演示适配层：站点 config.js 注入 window.__ZYUN_DEMO_OFFLINE__ = true 时生效
installOfflineAdapter(http);

export default http;