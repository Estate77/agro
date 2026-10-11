<script setup lang="ts">
import { onMounted } from "vue";
import { useAuthStore } from "@/stores/auth";

const auth = useAuthStore();

onMounted(async () => {
  if (auth.token && !auth.user) {
    try {
      await auth.fetchUserInfo();
    } catch (e) {
      /* 静默 */
    }
  }
});
</script>

<template>
  <router-view />
</template>