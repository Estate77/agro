<script setup lang="ts">
import { useRoute } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { queueSize } from "@/utils/offline";

const route = useRoute();
const auth = useAuthStore();

const tabs = [
  { path: "/", icon: "🏠", label: "首页" },
  { path: "/tasks", icon: "📝", label: "任务" },
  { path: "/disease", icon: "📷", label: "识病" },
  { path: "/me", icon: "👤", label: "我的" },
];
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