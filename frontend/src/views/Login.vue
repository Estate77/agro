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
    <div class="card">
      <h1 class="title">智耘云</h1>
      <p class="sub">智慧农业 SaaS · PC 端 v0.1</p>
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
      <div class="hint">
        默认账号：<code>admin / admin123</code> · 租户管理员：<code>manager / manager123</code>
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
  background: linear-gradient(135deg, #2f7d4f 0%, #4caf80 100%);
}
.card {
  width: 360px;
  background: #fff;
  border-radius: 10px;
  padding: 32px;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12);
}
.title {
  margin: 0;
  color: var(--zy-primary);
  text-align: center;
}
.sub {
  text-align: center;
  color: #889;
  margin-top: 4px;
  margin-bottom: 24px;
}
.submit {
  width: 100%;
  height: 40px;
  font-size: 15px;
}
.hint {
  margin-top: 16px;
  font-size: 12px;
  color: #888;
  text-align: center;
}
.hint code {
  background: #f0f5f0;
  padding: 1px 6px;
  border-radius: 3px;
}
</style>