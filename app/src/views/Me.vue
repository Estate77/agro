<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore, MODE_NAME, type AppMode } from "@/stores/auth";
import { apiBase } from "@/api/client";
import { flushQueue, queueSize } from "@/utils/offline";

const auth = useAuthStore();
const router = useRouter();
const pending = ref(queueSize());
const syncing = ref(false);
const base = apiBase();

/** 大字号模式（老年模式核心开关） */
const largeFont = ref(localStorage.getItem("zy_font_large") === "1");

function applyFont() {
  document.documentElement.classList.toggle("zy-large", largeFont.value);
  localStorage.setItem("zy_font_large", largeFont.value ? "1" : "0");
}

function toggleFont() {
  largeFont.value = !largeFont.value;
  applyFont();
  say(largeFont.value ? "已开启大字号模式" : "已恢复正常字号");
}

onMounted(() => {
  pending.value = queueSize();
  applyFont();
});

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

/** 三端切换 */
const modes: Array<{ key: AppMode; icon: string; desc: string }> = [
  { key: "b", icon: "🌱", desc: "农户 · 农事打卡" },
  { key: "c", icon: "🥬", desc: "消费者 · 扫码溯源" },
  { key: "g", icon: "🛡️", desc: "监管员 · 核查上报" },
];

function switchMode(m: AppMode) {
  if (m === auth.mode) return;
  auth.setMode(m);
  say(`已切换到 ${MODE_NAME[m]}`);
  router.replace(m === "c" ? "/c" : m === "g" ? "/g" : "/");
}

function goLogin() {
  auth.logout();
  router.replace("/login");
}

function onLogout() {
  auth.logout();
  router.replace("/login");
}

const isGuest = computed(() => !auth.token);
</script>

<template>
  <div>
    <header class="navbar">
      <div class="title">我的</div>
    </header>

    <div class="page">
      <!-- 用户卡（游客态） -->
      <div class="card ucard">
        <div class="avatar">{{ isGuest ? "🧑‍🌾" : "👤" }}</div>
        <div class="grow">
          <b style="font-size: 20px" v-if="!isGuest">
            {{ auth.user?.display_name || auth.user?.username }}
          </b>
          <b style="font-size: 20px" v-else>游客模式</b>
          <div class="muted" v-if="!isGuest">
            {{ auth.user?.tenant_name }} · {{ auth.user?.role_codes?.join(" / ") }}
          </div>
          <div class="muted" v-else>登录后可同步数据、查看更多</div>
        </div>
        <button v-if="isGuest" class="btn btn-primary" style="min-height: 40px" @click="goLogin">
          去登录
        </button>
      </div>

      <!-- 三端切换 -->
      <div class="card">
        <b style="font-size: 17px">🔀 切换端（一个 APP · 三个身份）</b>
        <div class="modes mt8">
          <button
            v-for="m in modes"
            :key="m.key"
            class="mode"
            :class="{ on: auth.mode === m.key }"
            @click="switchMode(m.key)"
          >
            <span style="font-size: 26px">{{ m.icon }}</span>
            <b style="font-size: 16px">{{ MODE_NAME[m.key] }}</b>
            <span class="muted" style="font-size: 12px">{{ m.desc }}</span>
          </button>
        </div>
      </div>

      <!-- 无障碍：大字号（老年模式） -->
      <div class="card">
        <div class="row">
          <div class="grow">
            <b style="font-size: 17px">🔠 大字号模式</b>
            <div class="muted" style="font-size: 14px">
              全局放大 1.18 倍，适合年长用户（老年模式核心开关）
            </div>
          </div>
          <button
            class="switch"
            :class="{ on: largeFont }"
            role="switch"
            :aria-checked="largeFont"
            aria-label="大字号模式"
            @click="toggleFont"
          >
            <i></i>
          </button>
        </div>
      </div>

      <!-- 离线队列（登录用户） -->
      <div class="card" v-if="!isGuest">
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
          <span class="muted">智耘系列 v1.0（演示）</span>
        </div>
      </div>

      <button v-if="!isGuest" class="btn btn-danger btn-block mt16" @click="onLogout">退出登录</button>

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
.modes {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}
.mode {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 14px 4px;
  background: #f8faf9;
  border: 1.5px solid transparent;
  border-radius: 12px;
  cursor: pointer;
}
.mode.on {
  background: var(--zy-primary-soft);
  border-color: var(--zy-primary);
  color: var(--zy-primary);
}
.switch {
  width: 56px;
  height: 32px;
  border-radius: 999px;
  background: #d5dbe0;
  border: none;
  position: relative;
  cursor: pointer;
  flex-shrink: 0;
}
.switch i {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: #fff;
  transition: left 0.2s;
}
.switch.on {
  background: var(--zy-primary);
}
.switch.on i {
  left: 27px;
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
