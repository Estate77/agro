<script setup lang="ts">
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const auth = useAuthStore();
const route = useRoute();
const router = useRouter();

const menus = [
  { path: "/dashboard", icon: "DataLine", label: "工作台" },
  { path: "/data-assets", icon: "Coin", label: "数据资产 ★" },
  { path: "/blocks", icon: "Grid", label: "地块管理" },
  { path: "/tasks", icon: "List", label: "农事任务" },
  { path: "/batches", icon: "Box", label: "溯源批次" },
  { path: "/e2e", icon: "Promotion", label: "端到端示例" },
];

const activeMenu = computed(() => route.path);

function onLogout() {
  auth.logout();
  router.replace("/login");
}
</script>

<template>
  <el-container class="layout">
    <el-aside width="220px" class="aside">
      <div class="logo">智耘云 · PC</div>
      <el-menu :default-active="activeMenu" router class="menu-inner">
        <el-menu-item v-for="m in menus" :key="m.path" :index="m.path">
          <el-icon><component :is="m.icon" /></el-icon>
          <span>{{ m.label }}</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header class="header">
        <span class="title">{{ (route.meta.title as string) || "智耘云" }}</span>
        <div class="user">
          <span>{{ auth.user?.display_name || auth.user?.username }}</span>
          <el-tag size="small" type="success" v-if="auth.user?.is_platform_admin">平台超管</el-tag>
          <el-tag size="small" v-else>{{ auth.user?.tenant_name }}</el-tag>
          <el-button text type="primary" @click="onLogout">退出</el-button>
        </div>
      </el-header>
      <el-main>
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<style scoped>
.layout {
  height: 100vh;
}
.aside {
  background: #1f2d3d;
  color: #fff;
}
.logo {
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 16px;
  color: #fff;
  background: #182230;
}
.menu-inner {
  border-right: 0;
  background: #1f2d3d;
  color: #fff;
}
.menu-inner :deep(.el-menu-item) {
  color: #cfd8dc;
}
.menu-inner :deep(.el-menu-item.is-active) {
  background: var(--zy-primary);
  color: #fff;
}
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  border-bottom: 1px solid #ebeef5;
}
.title {
  font-size: 16px;
  font-weight: 600;
}
.user {
  display: flex;
  align-items: center;
  gap: 12px;
}
</style>