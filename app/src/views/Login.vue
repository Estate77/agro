<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const auth = useAuthStore();
const router = useRouter();

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

function fill(u: string, p: string) {
  username.value = u;
  password.value = p;
}

async function onLogin() {
  loading.value = true;
  error.value = "";
  try {
    await auth.login(username.value, password.value);
    router.replace("/");
  } catch (e: any) {
    error.value = e.message || "登录失败";
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="login-page">
    <div class="hero">
      <div class="logo">🌾</div>
      <h1>智耘农</h1>
      <p>一看就懂 · 一点就行的种田助手</p>
    </div>

    <div class="form">
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

    <p class="foot muted center">智慧农业 = 物联网 + AI + 大数据 · 演示版 v0.1</p>
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
  padding: calc(52px + env(safe-area-inset-top)) 0 34px;
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
.field {
  margin-bottom: 14px;
}
.field label {
  display: block;
  font-size: 14px;
  color: var(--zy-text-2);
  margin-bottom: 6px;
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
  margin-top: auto;
  padding-top: 20px;
  font-size: 13px;
}
</style>