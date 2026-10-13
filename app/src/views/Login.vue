<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const auth = useAuthStore();
const router = useRouter();

/** 三端选择：null=未选择 */
type Term = "b" | "c" | "g" | null;
const selected = ref<Term>(null);

const username = ref("worker");
const password = ref("worker123");
const loading = ref(false);
const error = ref("");

/** 一键填充演示账号（低门槛引导） */
const quickAccounts = [
  { label: "农户", u: "worker", p: "worker123" },
  { label: "管理员", u: "manager", p: "manager123" },
  { label: "超管", u: "admin", p: "admin123" },
];

function pick(t: Exclude<Term, null>) {
  selected.value = t;
  error.value = "";
  if (t === "c") {
    // C 端消费者：免登录游客模式
    auth.enterGuest();
    router.replace("/c");
  }
}

function fill(u: string, p: string) {
  username.value = u;
  password.value = p;
}

async function onLogin() {
  loading.value = true;
  error.value = "";
  try {
    await auth.login(username.value, password.value);
    if (selected.value === "g") {
      auth.setMode("g");
      router.replace("/g");
    } else {
      auth.setMode("b");
      router.replace("/");
    }
  } catch (e: any) {
    error.value = e.message || "登录失败";
  } finally {
    loading.value = false;
  }
}

function back() {
  selected.value = null;
}
</script>

<template>
  <div class="login-page">
    <div class="hero">
      <svg class="logo" viewBox="0 0 36 36" aria-hidden="true">
        <circle cx="18" cy="18" r="15.5" fill="none" stroke="#d9a441" stroke-width="1.6" />
        <path d="M18 27 C18 21 18 17 18 12" stroke="#eaf3e6" stroke-width="1.8" fill="none" stroke-linecap="round" />
        <path d="M18 17 C13.5 17 10.5 14 10.5 9 C15.5 9 18 12.5 18 17 Z" fill="#9fce8f" />
        <path d="M18 13.5 C18 9.5 21 7 26 7 C26 12 22.5 14 18 13.5 Z" fill="#d9a441" />
      </svg>
      <h1>智耘系列</h1>
      <p>一个 APP · 三端角色 · 随时切换</p>
    </div>

    <!-- 第 1 步：选择端 -->
    <div v-if="!selected" class="form">
      <p class="center muted" style="margin-top: 0">请选择你的身份入口</p>
      <button class="term-card t-b" @click="pick('b')">
        <span class="t-icon">🌱</span>
        <span class="grow" style="text-align: left">
          <b style="font-size: 20px">智耘农</b>
          <span class="muted" style="display: block; font-size: 14px">B 端 · 农户/合作社 · 农事打卡 · 看账本</span>
        </span>
        <span class="tag tag-green">演示账号已备好</span>
      </button>
      <button class="term-card t-c" @click="pick('c')">
        <span class="t-icon">🥬</span>
        <span class="grow" style="text-align: left">
          <b style="font-size: 20px">智耘食</b>
          <span class="muted" style="display: block; font-size: 14px">C 端 · 消费者 · 扫码溯源 · 碳积分</span>
        </span>
        <span class="tag tag-amber">免登录进入</span>
      </button>
      <button class="term-card t-g" @click="pick('g')">
        <span class="t-icon">🛡️</span>
        <span class="grow" style="text-align: left">
          <b style="font-size: 20px">智耘政</b>
          <span class="muted" style="display: block; font-size: 14px">G 端 · 监管员 · 主体核查 · 应急上报</span>
        </span>
        <span class="tag tag-blue">演示账号已备好</span>
      </button>
      <p class="foot muted center">三端可随时在「我的」里切换 · 演示版 v1.0</p>
    </div>

    <!-- 第 2 步：登录（B/G 端） -->
    <div v-else class="form">
      <div class="row" style="margin-bottom: 14px">
        <button class="back" @click="back">‹</button>
        <b style="font-size: 20px">{{ selected === "b" ? "智耘农 · 登录" : "智耘政 · 登录" }}</b>
      </div>

      <div class="field">
        <label>账号</label>
        <input v-model="username" class="input" placeholder="手机号 / 用户名" autocomplete="username" />
      </div>
      <div class="field">
        <label>密码</label>
        <input
          v-model="password"
          class="input"
          type="password"
          placeholder="密码"
          autocomplete="current-password"
          @keyup.enter="onLogin"
        />
      </div>

      <p v-if="error" class="error">{{ error }}</p>

      <button class="btn btn-primary btn-block" :disabled="loading" @click="onLogin">
        {{ loading ? "登录中…" : "登 录" }}
      </button>

      <div class="quick">
        <p class="muted center">演示账号，点一下即填</p>
        <div class="row" style="justify-content: center">
          <button
            v-for="q in quickAccounts"
            :key="q.u"
            class="btn btn-soft"
            style="min-height: 40px; font-size: 15px"
            @click="fill(q.u, q.p)"
          >
            {{ q.label }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100%;
  display: flex;
  flex-direction: column;
  background:
    var(--zy-contour),
    linear-gradient(180deg, #16382a 0%, #1f4d38 30%, #2f7d4f 46%, #f5f3ea 46.2%);
  padding: 0 22px calc(30px + env(safe-area-inset-bottom));
}
.hero {
  padding: calc(46px + env(safe-area-inset-top)) 0 34px;
  text-align: center;
  color: #fff;
}
.logo {
  width: 60px;
  height: 60px;
  margin-bottom: 8px;
  filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.25));
}
.hero h1 {
  margin: 0;
  font-family: var(--zy-display);
  font-size: 31px;
  letter-spacing: 6px;
  font-weight: 700;
}
.hero p {
  margin: 8px 0 0;
  font-size: 14px;
  letter-spacing: 2px;
  color: #d9a441;
  opacity: 0.95;
}
.form {
  background: #fbf9f1;
  border: 1px solid #e7e2d2;
  border-radius: 20px;
  padding: 22px 18px;
  box-shadow: 0 14px 36px rgba(16, 36, 26, 0.28);
  animation: cardIn 0.36s ease both;
}
.term-card {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px 14px;
  margin-bottom: 12px;
  background: #fff;
  border: 1.5px solid var(--zy-line);
  border-radius: 16px;
  text-align: left;
  cursor: pointer;
  transition: transform 0.14s ease, box-shadow 0.14s ease, border-color 0.14s;
}
.term-card:active {
  transform: scale(0.98);
}
.t-icon {
  font-size: 36px;
  width: 58px;
  height: 58px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 15px;
  flex-shrink: 0;
}
/* 三端个性色块 */
.t-b .t-icon { background: var(--zy-primary-soft); }
.t-c .t-icon { background: var(--zy-accent-soft); }
.t-g .t-icon { background: #e3edf7; }
.t-b:active { border-color: var(--zy-primary); box-shadow: 0 0 0 3px rgba(47, 125, 79, 0.12); }
.t-c:active { border-color: var(--zy-accent); box-shadow: 0 0 0 3px rgba(217, 164, 65, 0.15); }
.t-g:active { border-color: #2d5a8e; box-shadow: 0 0 0 3px rgba(45, 90, 142, 0.12); }
.tag-blue { background: #e3edf7; color: #2d5a8e; }
.field {
  margin-bottom: 14px;
}
.field label {
  display: block;
  font-size: 14px;
  color: var(--zy-text-2);
  margin-bottom: 6px;
}
.back {
  font-size: 22px;
  padding: 4px 12px;
  background: #f0efe6;
  border-radius: 10px;
  border: none;
  cursor: pointer;
}
.error {
  color: var(--zy-danger);
  font-size: 15px;
  margin: 0 0 10px;
}
.quick {
  margin-top: 18px;
}
.quick p {
  margin: 0 0 8px;
  font-size: 13px;
}
.foot {
  margin: 10px 0 0;
  font-size: 13px;
}
</style>
