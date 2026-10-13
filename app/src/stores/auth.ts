import { defineStore } from "pinia";
import { ref } from "vue";
import { fetchMe, loginApi, type CurrentUser } from "@/api/auth";

/** 三端模式：b=智耘农(B端农户) c=智耘食(C端消费者) g=智耘政(G端监管) */
export type AppMode = "b" | "c" | "g";

export const MODE_NAME: Record<AppMode, string> = {
  b: "智耘农",
  c: "智耘食",
  g: "智耘政",
};

export const useAuthStore = defineStore("auth", () => {
  const token = ref<string>(localStorage.getItem("zy_access_token") || "");
  const user = ref<CurrentUser | null>(null);
  const mode = ref<AppMode>((localStorage.getItem("zy_mode") as AppMode) || "b");

  function setMode(m: AppMode) {
    mode.value = m;
    localStorage.setItem("zy_mode", m);
  }

  async function login(username: string, password: string) {
    const t = await loginApi(username, password);
    token.value = t.access_token;
    localStorage.setItem("zy_access_token", t.access_token);
    localStorage.setItem("zy_refresh_token", t.refresh_token);
    user.value = await fetchMe();
  }

  async function fetchUserInfo() {
    user.value = await fetchMe();
    return user.value;
  }

  /** C 端游客模式：免登录进入智耘食 */
  function enterGuest() {
    setMode("c");
  }

  function logout() {
    token.value = "";
    user.value = null;
    localStorage.removeItem("zy_access_token");
    localStorage.removeItem("zy_refresh_token");
  }

  /** 是否拥有某权限点 */
  function can(perm: string): boolean {
    return !!user.value?.permission_codes?.includes(perm);
  }

  return { token, user, mode, setMode, login, logout, enterGuest, fetchUserInfo, can };
});
