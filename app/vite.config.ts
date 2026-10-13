import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import { fileURLToPath, URL } from "node:url";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiBase = env.VITE_API_BASE || "/api";

  return {
    plugins: [vue()],
    base: "./", // 相对路径，支持 GitHub Pages 子路径部署
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
    server: {
      host: true,
      port: 5174,
      proxy: {
        "/api": {
          target: env.VITE_API_PROXY || "http://localhost:8000",
          changeOrigin: true,
        },
      },
    },
    define: {
      __VITE_API_BASE__: JSON.stringify(apiBase),
    },
    build: {
      outDir: "dist",
      sourcemap: false,
      chunkSizeWarningLimit: 800,
    },
  };
});