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
  /** 纯前端演示模式开关（Pages 部署时注入 true），激活内置 mock 后端 */
  __ZYUN_DEMO_OFFLINE__?: boolean;
}