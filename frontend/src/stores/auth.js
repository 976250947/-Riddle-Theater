import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { authApi } from "@/services/api.js";

function normalizeAuthUser(data) {
  if (!data) return null;
  if (data.user) return data.user;
  if (data.userId || data.username || data.alias) {
    return {
      id: data.userId || "",
      username: data.username || "",
      alias: data.alias || data.username || "",
      role: data.role || (data.type === "guest" ? "GUEST" : "REGISTERED"),
      createdAt: data.createdAt || null,
    };
  }
  return null;
}

export const useAuthStore = defineStore("auth", () => {
  const user = ref(null);
  const token = ref(localStorage.getItem("token") || "");

  const isLoggedIn = computed(() => !!token.value);
  const displayName = computed(() => user.value?.alias || user.value?.username || "旅客");

  async function fetchMe() {
    if (!token.value) return;
    try {
      const data = await authApi.me();
      const normalizedUser = normalizeAuthUser(data);
      if (!normalizedUser) {
        logout();
        return;
      }
      user.value = normalizedUser;
    } catch {
      logout();
    }
  }

  async function login(username, password) {
    const data = await authApi.login(username, password);
    token.value = data.token;
    localStorage.setItem("token", data.token);
    user.value = normalizeAuthUser(data);
  }

  async function register(username, password, alias) {
    const data = await authApi.register(username, password, alias);
    token.value = data.token;
    localStorage.setItem("token", data.token);
    user.value = normalizeAuthUser(data);
  }

  async function loginAsGuest() {
    const data = await authApi.guest();
    token.value = data.token;
    localStorage.setItem("token", data.token);
    user.value = normalizeAuthUser(data);
  }

  function logout() {
    token.value = "";
    user.value = null;
    localStorage.removeItem("token");
  }

  return { user, token, isLoggedIn, displayName, fetchMe, login, register, loginAsGuest, logout };
});
