import { createRouter, createWebHashHistory } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { allowedPortals, firstPathFor, type PortalId } from "@/config/portal";

/** hash 路由：GitHub Pages / 任意静态托管均可直接支持深链接 */
const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: "/login", component: () => import("@/views/Login.vue"), meta: { public: true } },
    {
      path: "/",
      component: () => import("@/layouts/BasicLayout.vue"),
      redirect: "/dashboard",
      children: [
        {
          path: "dashboard",
          name: "dashboard",
          component: () => import("@/views/Dashboard.vue"),
          meta: { title: "工作台", portals: ["B"] },
        },
        {
          path: "cockpit",
          name: "cockpit",
          component: () => import("@/views/Cockpit.vue"),
          meta: { title: "智慧农场驾驶舱", portals: ["B"] },
        },
        {
          path: "iot",
          name: "iot",
          component: () => import("@/views/Iot.vue"),
          meta: { title: "物联网设备中心", portals: ["B"] },
        },
        {
          path: "ai",
          name: "ai-center",
          component: () => import("@/views/AiCenter.vue"),
          meta: { title: "AI 决策中心", portals: ["B"] },
        },
        {
          path: "data-assets",
          name: "data-assets",
          component: () => import("@/views/data-assets/List.vue"),
          meta: { title: "数据资产管理 ★", portals: ["B", "G"] },
        },
        {
          path: "data-assets/:id",
          name: "data-asset-detail",
          component: () => import("@/views/data-assets/Detail.vue"),
          meta: { title: "数据资产详情", portals: ["B", "G"] },
        },
        {
          path: "blocks",
          name: "blocks",
          component: () => import("@/views/Blocks.vue"),
          meta: { title: "地块管理", portals: ["B"] },
        },
        {
          path: "tasks",
          name: "tasks",
          component: () => import("@/views/Tasks.vue"),
          meta: { title: "农事任务", portals: ["B"] },
        },
        {
          path: "batches",
          name: "batches",
          component: () => import("@/views/Batches.vue"),
          meta: { title: "溯源批次", portals: ["B", "G", "C"] },
        },
        {
          path: "trace-center",
          name: "trace-center",
          component: () => import("@/views/TraceCenter.vue"),
          meta: { title: "区块链溯源中心", portals: ["B", "G", "C"] },
        },
        {
          path: "carbon-center",
          name: "carbon-center",
          component: () => import("@/views/CarbonCenter.vue"),
          meta: { title: "碳中和计量中心", portals: ["B", "G", "C"] },
        },
        {
          path: "gov-center",
          name: "gov-center",
          component: () => import("@/views/GovCenter.vue"),
          meta: { title: "政务监管平台", portals: ["G"] },
        },
        {
          path: "uav",
          name: "uav-center",
          component: () => import("@/views/UavCenter.vue"),
          meta: { title: "无人机与机器人调度", portals: ["B"] },
        },
        {
          path: "finance",
          name: "finance",
          component: () => import("@/views/Finance.vue"),
          meta: { title: "经营管理", portals: ["B"] },
        },
        {
          path: "operation",
          name: "operation",
          component: () => import("@/views/Operation.vue"),
          meta: { title: "C 端运营", portals: ["B", "C"] },
        },
        {
          path: "settings",
          name: "settings",
          component: () => import("@/views/Settings.vue"),
          meta: { title: "系统设置", portals: ["B"] },
        },
        {
          path: "e2e",
          name: "e2e",
          component: () => import("@/views/e2e/BlockToBatch.vue"),
          meta: { title: "端到端示例", portals: ["B"] },
        },
      ],
    },
    { path: "/:pathMatch(.*)*", redirect: "/" },
  ],
});

router.beforeEach(async (to) => {
  const auth = useAuthStore();
  if (to.meta.public) return true;
  if (!auth.token) return { path: "/login", query: { redirect: to.fullPath } };
  if (!auth.user) {
    try {
      await auth.fetchUserInfo();
    } catch {
      auth.logout();
      return { path: "/login" };
    }
  }
  // 端口权限管控：路由要求端口必须与角色可用端口有交集，否则回退到该账号首个可访问页
  const rolePortals = allowedPortals(auth.user?.role_codes);
  const need = (to.meta.portals as PortalId[] | undefined) ?? [];
  if (need.length && !need.some((p) => rolePortals.includes(p))) {
    return { path: firstPathFor(rolePortals[0]) };
  }
  return true;
});

export default router;
