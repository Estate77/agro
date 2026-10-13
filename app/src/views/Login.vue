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
      <div class="logo">🌾</div>
      <h1>智耘系列</h1>
      <p>一个 APP · 三端角色 · 随时切换</p>
    </div>

    <!-- 第 1 步：选择端 -->
    <div v-if="!selected" class="form">
      <p class="center muted" style="margin-top: 0">请选择你的身份入口</p>
      <button class="term-card" @click="pick('b')">
        <span class="t-icon">🌱</span>
        <span class="grow" style="text-align: left">
          <b style="font-size: 20px">智耘农</b>
          <span class="muted" style="display: block; font-size: 14px">B 端 · 农户/合作社 · 农事打卡 · 看账本</span>
        </span>
        <span class="tag tag-green">演示账号已备好</span>
      </button>
      <button class="term-card" @click="pick('c')">
        <span class="t-icon">🥬</span>
        <span class="grow" style="text-align: left">
          <b style="font-size: 20px">智耘食</b>
          <span class="muted" style="display: block; font-size: 14px">C 端 · 消费者 · 扫码溯源 · 碳积分</span>
        </span>
        <span class="tag tag-green">免登录进入</span>
      </button>
      <button class="term-card" @click="pick('g')">
        <span class="t-icon">🛡️</span>
        <span class="grow" style="text-align: left">
          <b style="font-size: 20px">智耘政</b>
          <span class="muted" style="display: block; font-size: 14px">G 端 · 监管员 · 主体核查 · 应急上报</span>
        </span>
        <span class="tag tag-green">演示账号已备好</span>
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
  background: linear-gradient(180deg, #2f7d4f 0%, #3f9d68 32%, #f4f6f8 32%);
  padding: 0 22px calc(30px + env(safe-area-inset-bottom));
}
.hero {
  padding: calc(46px + env(safe-area-inset-top)) 0 30px;
  text-align: center;
  color: #fff;
}
.logo {
  font-size: 56px;
  margin-bottom: 6px;
}
.hero h1 {
  margin: 0;
  font-size: 30px;
  letter-spacing: 2px;
}
.hero p {
  margin: 8px 0 0;
  font-size: 15px;
  opacity: 0.92;
}
.form {
  background: #fff;
  border-radius: 18px;
  padding: 22px 18px;
  box-shadow: 0 8px 28px rgba(31, 45, 61, 0.1);
}
.term-card {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px 14px;
  margin-bottom: 12px;
  background: #f8faf9;
  border: 1.5px solid var(--zy-line);
  border-radius: 14px;
  text-align: left;
  cursor: pointer;
}
.term-card:active {
  background: var(--zy-primary-soft);
  border-color: var(--zy-primary);
}
.t-icon {
  font-size: 38px;
}
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
  background: #f0f2f4;
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
