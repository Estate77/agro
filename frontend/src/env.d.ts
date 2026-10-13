/// <reference types="vite/client" />

declare module "*.vue" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

declare const __VITE_API_BASE__: string;

interface Window {
  /** 运行时 API 地址（由 public/config.js 注入），见 config.js 注释 */
  __ZYUN_API_BASE__?: string;
  /** 纯前端离线演示开关（GitHub Pages 部署注入）：true 时请求回放内置演示数据 */
  __ZYUN_DEMO_OFFLINE__?: boolean;
}