<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import { useAuthStore, type AppMode } from "@/stores/auth";
import { queueSize } from "@/utils/offline";

const route = useRoute();
const auth = useAuthStore();

/** 三端各自的底部导航 */
const tabSets: Record<AppMode, Array<{ path: string; icon: string; label: string }>> = {
  b: [
    { path: "/", icon: "🏠", label: "首页" },
    { path: "/tasks", icon: "📝", label: "任务" },
    { path: "/disease", icon: "📷", label: "识病" },
    { path: "/me", icon: "👤", label: "我的" },
  ],
  c: [
    { path: "/c", icon: "🏠", label: "首页" },
    { path: "/trace", icon: "🔍", label: "溯源" },
    { path: "/carbon", icon: "🌱", label: "碳账户" },
    { path: "/me", icon: "👤", label: "我的" },
  ],
  g: [
    { path: "/g", icon: "📋", label: "待办" },
    { path: "/gov/entities", icon: "🏭", label: "核查" },
    { path: "/gov/report", icon: "🚨", label: "上报" },
    { path: "/gov/board", icon: "📊", label: "看板" },
  ],
};

const tabs = computed(() => tabSets[auth.mode]);
</script>

<template>
  <router-view />

  <!-- 底部导航：仅主 Tab 页显示 -->
  <nav v-if="route.meta.tab" class="tabbar">
    <router-link v-for="t in tabs" :key="t.path" :to="t.path">
      <span class="icon">{{ t.icon }}</span>
      <span>{{ t.label }}</span>
      <span
        v-if="t.path === '/me' && queueSize() > 0"
        class="tag tag-red"
        style="position: absolute; margin: -34px 0 0 26px"
      >
        {{ queueSize() }}
      </span>
    </router-link>
  </nav>
</template>
