import { createRouter, createWebHashHistory } from "vue-router";
import { useAuthStore } from "@/stores/auth";

/**
 * 使用 hash 路由：GitHub Pages / 任意静态托管均可直接支持深链接，
 * 无需服务端 SPA rewrite 配置。
 */
const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: "/login",
      component: () => import("@/views/Login.vue"),
      meta: { public: true },
    },
    {
      path: "/",
      component: () => import("@/views/Home.vue"),
      meta: { tab: true, title: "智耘农" },
    },
    {
      path: "/tasks",
      component: () => import("@/views/Tasks.vue"),
      meta: { tab: true, title: "今日任务" },
    },
    {
      path: "/disease",
      component: () => import("@/views/Disease.vue"),
      meta: { tab: true, title: "识病虫害" },
    },
    {
      path: "/me",
      component: () => import("@/views/Me.vue"),
      meta: { tab: true, title: "我的" },
    },
    {
      path: "/devices",
      component: () => import("@/views/Devices.vue"),
      meta: { title: "设备数据" },
    },
    {
      path: "/trace",
      component: () => import("@/views/Trace.vue"),
      meta: { title: "扫码溯源" },
    },
    {
      path: "/trace/:code",
      component: () => import("@/views/TraceDetail.vue"),
      meta: { title: "溯源详情" },
    },
    { path: "/:pathMatch(.*)*", redirect: "/" },
  ],
});

router.beforeEach(async (to) => {
  const auth = useAuthStore();
  if (to.meta.public) return true;
  if (!auth.token) return { path: "/login" };
  if (!auth.user) {
    try {
      await auth.fetchUserInfo();
    } catch {
      auth.logout();
      return { path: "/login" };
    }
  }
  return true;
});

export default router;