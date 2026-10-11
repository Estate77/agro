import { createRouter, createWebHashHistory } from "vue-router";
import { useAuthStore } from "@/stores/auth";

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
          meta: { title: "工作台" },
        },
        {
          path: "data-assets",
          name: "data-assets",
          component: () => import("@/views/data-assets/List.vue"),
          meta: { title: "数据资产管理 ★" },
        },
        {
          path: "data-assets/:id",
          name: "data-asset-detail",
          component: () => import("@/views/data-assets/Detail.vue"),
          meta: { title: "数据资产详情" },
        },
        {
          path: "blocks",
          name: "blocks",
          component: () => import("@/views/Blocks.vue"),
          meta: { title: "地块管理" },
        },
        {
          path: "tasks",
          name: "tasks",
          component: () => import("@/views/Tasks.vue"),
          meta: { title: "农事任务" },
        },
        {
          path: "batches",
          name: "batches",
          component: () => import("@/views/Batches.vue"),
          meta: { title: "溯源批次" },
        },
        {
          path: "e2e",
          name: "e2e",
          component: () => import("@/views/e2e/BlockToBatch.vue"),
          meta: { title: "端到端示例" },
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
  return true;
});

export default router;