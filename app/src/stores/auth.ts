import { defineStore } from "pinia";
import { ref } from "vue";
import { fetchMe, loginApi, type CurrentUser } from "@/api/auth";

export const useAuthStore = defineStore("auth", () => {
  const token = ref<string>(localStorage.getItem("zy_access_token") || "");
  const user = ref<CurrentUser | null>(null);

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

  return { token, user, login, logout, fetchUserInfo, can };
});