import { createRouter, createWebHashHistory } from "vue-router";
import { useAuthStore } from "@/stores/auth";

/**
 * 使用 hash 路由：GitHub Pages / 任意静态托管均可直接支持深链接，
 * 无需服务端 SPA rewrite 配置。
 *
 * 三端路由：meta.mode 标注归属端（b=智耘农 / c=智耘食 / g=智耘政），
 * 未标注为共享页（登录、我的、溯源详情）。
 */
const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: "/login",
      component: () => import("@/views/Login.vue"),
      meta: { public: true },
    },

    // ===== 智耘农（B 端农户）=====
    {
      path: "/",
      component: () => import("@/views/Home.vue"),
      meta: { tab: true, title: "智耘农", mode: "b" },
    },
    {
      path: "/tasks",
      component: () => import("@/views/Tasks.vue"),
      meta: { tab: true, title: "农事任务", mode: "b" },
    },
    {
      path: "/disease",
      component: () => import("@/views/Disease.vue"),
      meta: { tab: true, title: "识病虫害", mode: "b" },
    },
    {
      path: "/devices",
      component: () => import("@/views/Devices.vue"),
      meta: { title: "物联网设备", mode: "b" },
    },
    {
      path: "/blocks",
      component: () => import("@/views/Blocks.vue"),
      meta: { title: "我的地块", mode: "b" },
    },
    {
      path: "/farm",
      component: () => import("@/views/Farm.vue"),
      meta: { title: "经营账本", mode: "b" },
    },
    {
      path: "/qa",
      component: () => import("@/views/Qa.vue"),
      meta: { title: "AI 农技问答", mode: "b" },
    },
    {
      path: "/market",
      component: () => import("@/views/Market.vue"),
      meta: { title: "行情与政策", mode: "b" },
    },
    {
      path: "/messages",
      component: () => import("@/views/Messages.vue"),
      meta: { title: "消息", mode: "b" },
    },
    {
      path: "/sos",
      component: () => import("@/views/Sos.vue"),
      meta: { title: "紧急求助", mode: "b" },
    },

    // ===== 智耘食（C 端消费者，游客可用）=====
    {
      path: "/c",
      component: () => import("@/views/CHome.vue"),
      meta: { tab: true, title: "智耘食", mode: "c", guest: true },
    },
    {
      path: "/carbon",
      component: () => import("@/views/Carbon.vue"),
      meta: { tab: true, title: "碳账户", mode: "c", guest: true },
    },
    {
      path: "/trace",
      component: () => import("@/views/Trace.vue"),
      meta: { title: "扫码溯源", guest: true },
    },

    // ===== 智耘政（G 端监管）=====
    {
      path: "/g",
      component: () => import("@/views/GHome.vue"),
      meta: { tab: true, title: "智耘政", mode: "g" },
    },
    {
      path: "/gov/entities",
      component: () => import("@/views/GovEntity.vue"),
      meta: { tab: true, title: "主体核查", mode: "g" },
    },
    {
      path: "/gov/report",
      component: () => import("@/views/GovReport.vue"),
      meta: { tab: true, title: "应急上报", mode: "g" },
    },
    {
      path: "/gov/board",
      component: () => import("@/views/GovBoard.vue"),
      meta: { tab: true, title: "监管看板", mode: "g" },
    },

    // ===== 共享 =====
    {
      path: "/trace/:code",
      component: () => import("@/views/TraceDetail.vue"),
      meta: { title: "溯源详情", guest: true },
    },
    {
      path: "/me",
      component: () => import("@/views/Me.vue"),
      meta: { tab: true, title: "我的", guest: true },
    },
    { path: "/:pathMatch(.*)*", redirect: "/" },
  ],
});

router.beforeEach(async (to) => {
  const auth = useAuthStore();

  // 端守卫：进入的页面归属端与当前端不符 → 重定向到当前端首页
  const homeOf = (m: string) => (m === "c" ? "/c" : m === "g" ? "/g" : "/");
  if (to.meta.mode && to.meta.mode !== auth.mode) {
    return { path: homeOf(auth.mode as string) };
  }

  if (to.meta.public) return true;
  // C 端游客模式与共享「我的」页：免登录可用
  if (to.meta.guest) return true;

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
