/**
 * 智耘云 PC 端运行时配置。
 *
 * 本地开发（vite dev 代理）：留空即可，请求走 /api 代理到 localhost:8000。
 * 公开部署（如 GitHub Pages / Vercel / 任意静态托管）：
 *   把下方 __ZYUN_API_BASE__ 改成后端公网地址，例如：
 *   window.__ZYUN_API_BASE__ = "https://your-backend.onrender.com/api";
 *
 * 好处：改配置不需要重新 npm build，直接改这个文件提交即可。
 */
window.__ZYUN_API_BASE__ = "";