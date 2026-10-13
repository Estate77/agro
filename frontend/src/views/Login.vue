<script setup lang="ts">
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { useAuthStore } from "@/stores/auth";

const auth = useAuthStore();
const router = useRouter();
const username = ref("admin");
const password = ref("admin123");
const loading = ref(false);
const redirect = computed(() => (router.currentRoute.value.query.redirect as string) || "/");

/** 演示账号快捷选择（与后端 seed.py 对应） */
const QUICK: Array<{ portal: string; user: string; pwd: string; label: string }> = [
  { portal: "B", user: "admin", pwd: "admin123", label: "平台超管" },
  { portal: "B", user: "manager", pwd: "manager123", label: "租户管理员" },
  { portal: "B", user: "worker", pwd: "worker123", label: "农场操作员" },
  { portal: "G", user: "gov", pwd: "gov123", label: "G端监管员" },
  { portal: "C", user: "cmall", pwd: "cmall123", label: "C端运营" },
  { portal: "B", user: "guest", pwd: "guest123", label: "只读访客" },
];

function pick(q: (typeof QUICK)[number]) {
  username.value = q.user;
  password.value = q.pwd;
}

async function onLogin() {
  if (!username.value || !password.value) return;
  loading.value = true;
  try {
    await auth.login(username.value, password.value);
    ElMessage.success(`欢迎，${auth.user?.display_name || auth.user?.username}`);
    router.replace(redirect.value);
  } catch (e: any) {
    ElMessage.error(e.message || "登录失败");
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="login-page">
    <div class="field-bg" aria-hidden="true" />
    <div class="card">
      <div class="brand-row">
        <svg class="mark" viewBox="0 0 36 36" aria-hidden="true">
          <circle cx="18" cy="18" r="15.5" fill="none" stroke="#d9a441" stroke-width="1.6" />
          <path d="M18 27 C18 21 18 17 18 12" stroke="#2f7d4f" stroke-width="1.8" fill="none" stroke-linecap="round" />
          <path d="M18 17 C13.5 17 10.5 14 10.5 9 C15.5 9 18 12.5 18 17 Z" fill="#67a05b" />
          <path d="M18 13.5 C18 9.5 21 7 26 7 C26 12 22.5 14 18 13.5 Z" fill="#d9a441" />
        </svg>
        <h1 class="title">智耘云</h1>
      </div>
      <p class="sub">智慧农业 SaaS · PC 端 v0.2 · B/G/C 三端权限</p>
      <el-form @submit.prevent="onLogin">
        <el-form-item>
          <el-input v-model="username" placeholder="用户名" size="large" />
        </el-form-item>
        <el-form-item>
          <el-input
            v-model="password"
            type="password"
            show-password
            placeholder="密码"
            size="large"
            @keyup.enter="onLogin"
          />
        </el-form-item>
        <el-button type="primary" :loading="loading" class="submit" @click="onLogin">
          登 录
        </el-button>
      </el-form>

      <div class="quick-title">演示账号 · 点击填入</div>
      <div class="quick">
        <button
          v-for="q in QUICK"
          :key="q.user"
          class="q-chip"
          type="button"
          :class="{ picked: username === q.user }"
          @click="pick(q)"
        >
          <span class="q-dot" :class="'p-' + q.portal.toLowerCase()" />
          <b>{{ q.label }}</b>
          <i>{{ q.user }}</i>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  background: linear-gradient(160deg, #16382a 0%, #1f4d38 55%, #2f7d4f 130%);
  overflow: hidden;
}
/* 顶部等高线纹理，与主布局顶栏呼应 */
.field-bg {
  position: absolute;
  inset: 0;
  background:
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='520' height='520' viewBox='0 0 520 520'%3E%3Cg fill='none' stroke='%23ffffff' stroke-opacity='0.045'%3E%3Cpath d='M-20 120 Q 140 60 300 110 T 540 90'/%3E%3Cpath d='M-20 220 Q 160 150 340 210 T 540 190'/%3E%3Cpath d='M-20 320 Q 150 250 330 310 T 540 290'/%3E%3Cpath d='M-20 420 Q 140 350 320 410 T 540 390'/%3E%3C/g%3E%3C/svg%3E");
}
.card {
  width: 400px;
  background: #fbf9f1;
  border: 1px solid #e3ddc8;
  border-radius: 14px;
  padding: 32px 34px 26px;
  box-shadow: 0 18px 44px rgba(10, 26, 18, 0.45);
  position: relative;
}
.brand-row { display: flex; align-items: center; justify-content: center; gap: 10px; }
.mark { width: 38px; height: 38px; }
.title {
  margin: 0;
  font-family: var(--zy-display);
  font-size: 28px;
  letter-spacing: 4px;
  color: #274434;
}
.sub {
  text-align: center;
  color: #97a08a;
  margin: 6px 0 24px;
  font-size: 12px;
  letter-spacing: 1px;
}
.submit {
  width: 100%;
  height: 42px;
  font-size: 15px;
  letter-spacing: 6px;
}
.quick-title {
  margin-top: 22px;
  font-size: 11px;
  color: #b0a880;
  letter-spacing: 2px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.quick-title::before,
.quick-title::after {
  content: "";
  flex: 1;
  height: 1px;
  background: #e3ddc8;
}
.quick {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
  margin-top: 10px;
}
.q-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 9px;
  border: 1px solid #e3ddc8;
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
  outline: none;
  transition: all 0.15s;
}
.q-chip:hover { border-color: #d9a441; }
.q-chip.picked { border-color: var(--zy-primary); background: var(--zy-primary-soft); }
.q-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
.q-dot.p-b { background: #67c23a; }
.q-dot.p-g { background: #d9a441; }
.q-dot.p-c { background: #e08d6d; }
.q-chip b { font-size: 12px; color: #2c3a2e; font-weight: 600; }
.q-chip i { font-style: normal; font-size: 10px; color: #97a08a; margin-left: auto; }
</style>
