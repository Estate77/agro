<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { apiBase } from "@/api/client";
import { flushQueue, queueSize } from "@/utils/offline";

const auth = useAuthStore();
const router = useRouter();
const pending = ref(queueSize());
const syncing = ref(false);
const base = apiBase();

async function syncNow() {
  syncing.value = true;
  try {
    const r = await flushQueue();
    pending.value = queueSize();
    if (r.ok > 0) {
      say(`已同步 ${r.ok} 条打卡`);
    } else if (pending.value > 0) {
      say("仍无网络，稍后自动重试");
    } else {
      say("没有待同步数据");
    }
  } finally {
    syncing.value = false;
  }
}

const toast = ref("");
function say(m: string) {
  toast.value = m;
  setTimeout(() => (toast.value = ""), 2000);
}

function onLogout() {
  auth.logout();
  router.replace("/login");
}

onMounted(() => {
  pending.value = queueSize();
});
</script>

<template>
  <div>
    <header class="navbar">
      <div class="title">我的</div>
    </header>

    <div class="page">
      <!-- 用户卡 -->
      <div class="card ucard">
        <div class="avatar">👤</div>
        <div class="grow">
          <b style="font-size: 20px">{{ auth.user?.display_name || auth.user?.username }}</b>
          <div class="muted">{{ auth.user?.tenant_name }} · {{ auth.user?.role_codes?.join(" / ") }}</div>
        </div>
      </div>

      <!-- 离线队列 -->
      <div class="card">
        <div class="row">
          <div class="grow">
            <b style="font-size: 17px">离线打卡队列</b>
            <div class="muted" style="font-size: 14px">
              {{ pending > 0 ? `${pending} 条待同步，网络恢复自动上传` : "全部已同步 ✅" }}
            </div>
          </div>
          <button class="btn btn-soft" style="min-height: 44px" :disabled="syncing" @click="syncNow">
            {{ syncing ? "同步中…" : "立即同步" }}
          </button>
        </div>
      </div>

      <!-- 功能列表 -->
      <div class="card list">
        <div class="li">
          <span>📡 服务器地址</span>
          <span class="muted" style="font-size: 13px">{{ base }}</span>
        </div>
        <div class="li" @click="router.push('/trace')">
          <span>🔍 扫码溯源</span>
          <span class="muted">›</span>
        </div>
        <div class="li">
          <span>ℹ️ 关于</span>
          <span class="muted">智耘农 v0.1（演示）</span>
        </div>
      </div>

      <button class="btn btn-danger btn-block mt16" @click="onLogout">退出登录</button>

      <p class="muted center" style="font-size: 12px; margin-top: 18px">
        智慧农业 = 物联网 + AI + 大数据 + 机器人<br />
        精准种植 · 智能决策 · 可视化管理
      </p>
    </div>

    <div v-if="toast" class="toast">{{ toast }}</div>
  </div>
</template>

<style scoped>
.ucard {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 20px 16px;
}
.avatar {
  width: 62px;
  height: 62px;
  border-radius: 50%;
  background: var(--zy-primary-soft);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30px;
}
.list .li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 2px;
  border-bottom: 1px solid var(--zy-line);
  font-size: 16px;
  cursor: default;
}
.list .li:last-child {
  border-bottom: none;
}
.toast {
  position: fixed;
  bottom: 96px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(31, 45, 61, 0.85);
  color: #fff;
  padding: 10px 18px;
  border-radius: 999px;
  font-size: 15px;
  z-index: 99;
}
</style>