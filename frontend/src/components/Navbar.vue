<template>
  <header class="navbar">
    <RouterLink to="/" class="logo">
      <svg class="logo-icon" viewBox="0 0 100 100" fill="currentColor" aria-hidden="true">
        <path d="M50 82 L45 80 L50 86 L55 80 Z" opacity="0.6" />
        <path d="M50 78 L10 70 L10 62 L50 70 L90 62 L90 70 Z" opacity="0.3" />
        <path d="M49 70 L12 60 L12 30 L49 40 Z" opacity="0.6" />
        <path d="M51 70 L88 60 L88 30 L51 40 Z" opacity="0.6" />
        <path d="M48 64 L16 52 L16 22 L48 34 Z" opacity="1" />
        <path d="M52 64 L84 52 L84 22 L52 34 Z" opacity="1" />
        <circle cx="28" cy="42" r="1.5" fill="#111" opacity="0.5" />
        <path d="M26 48 L34 50" stroke="#111" stroke-width="1.5" stroke-linecap="round" opacity="0.4" />
        <path d="M48 55 L38 75 L42 76 L50 60" opacity="0.9" />
        <path d="M48 55 C 60 30, 75 15, 95 5 C 80 15, 72 28, 68 38 C 75 35, 78 36, 70 46 C 62 55, 55 60, 48 55 Z" opacity="1" />
        <path d="M48 55 C 60 30, 75 15, 95 5" fill="none" stroke="#222" stroke-width="1.5" opacity="0.3" />
      </svg>
      <div class="logo-text-wrapper">
        <div class="logo-title">谜语剧场</div>
        <div class="logo-subtitle">剧情交互游戏</div>
      </div>
    </RouterLink>

    <button class="nav-toggle" type="button" aria-label="打开导航菜单" :aria-expanded="navOpen" @click="navOpen = !navOpen">
      <span class="nav-toggle-bar"></span>
      <span class="nav-toggle-bar"></span>
      <span class="nav-toggle-bar"></span>
    </button>

    <ul class="nav-links" :class="{ open: navOpen }" aria-label="站点导航">
      <li><RouterLink to="/" class="nav-link-btn" exact-active-class="active" @click="navOpen = false">首页</RouterLink></li>
      <li><RouterLink to="/catalog" class="nav-link-btn" active-class="active" @click="navOpen = false">剧本库</RouterLink></li>
      <li><RouterLink to="/studio" class="nav-link-btn" active-class="active" @click="navOpen = false">创作中心</RouterLink></li>
      <li><RouterLink to="/ranking" class="nav-link-btn" active-class="active" @click="navOpen = false">排行榜</RouterLink></li>
      <li><RouterLink to="/community" class="nav-link-btn" active-class="active" @click="navOpen = false">社区</RouterLink></li>
    </ul>

    <div class="nav-actions">
      <button class="icon-btn" type="button" aria-label="搜索">
        <svg class="svg-icon" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
      </button>
      <button class="icon-btn" type="button" aria-label="通知">
        <svg class="svg-icon" viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
      </button>
      <button class="user-profile" type="button" :aria-label="auth.isLoggedIn ? '个人主页' : '登录'" @click="handleUserClick">
        <div class="avatar">{{ avatarText }}</div>
        <div class="user-info">
          <div class="user-name">{{ auth.isLoggedIn ? auth.displayName : '未登录' }}
            <svg class="svg-icon" style="font-size:14px" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9" /></svg>
          </div>
          <div v-if="auth.user" class="level">{{ auth.user.role === 'GUEST' ? '游客' : '注册用户' }}</div>
        </div>
      </button>
    </div>

    <!-- Auth Modal -->
    <Teleport to="body">
      <section v-if="showAuth" class="auth-modal">
        <div class="auth-modal-backdrop" @click="showAuth = false"></div>
        <div class="auth-modal-card">
          <button class="auth-modal-close" type="button" aria-label="关闭" @click="showAuth = false">
            <svg class="svg-icon" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
          <div class="auth-modal-header">
            <h2 class="auth-modal-title">{{ isRegister ? '注册' : '登录' }}</h2>
            <p class="auth-modal-subtitle">登录以同步云存档与成就</p>
          </div>
          <form class="auth-form" autocomplete="off" @submit.prevent="handleAuth">
            <div v-if="isRegister" class="auth-field">
              <label class="auth-label" for="authAlias">昵称</label>
              <input v-model="form.alias" class="auth-input" id="authAlias" type="text" placeholder="给自己取个名字" maxlength="20" autocomplete="off" />
            </div>
            <div class="auth-field">
              <label class="auth-label" for="authUsername">用户名</label>
              <input v-model="form.username" class="auth-input" id="authUsername" type="text" placeholder="输入用户名" maxlength="32" required autocomplete="username" />
            </div>
            <div class="auth-field">
              <label class="auth-label" for="authPassword">密码</label>
              <input v-model="form.password" class="auth-input" id="authPassword" type="password" placeholder="输入密码" minlength="6" required autocomplete="current-password" />
            </div>
            <div v-if="errMsg" class="auth-error">{{ errMsg }}</div>
            <button class="auth-submit-btn" type="submit">{{ isRegister ? '注册' : '登录' }}</button>
          </form>
          <div class="auth-footer">
            <button class="auth-switch-btn" type="button" @click="isRegister = !isRegister">
              {{ isRegister ? '已有账号？去登录' : '还没有账号？去注册' }}
            </button>
            <button class="auth-guest-btn" type="button" @click="handleGuest">以访客身份继续</button>
          </div>
        </div>
      </section>
    </Teleport>
  </header>
</template>

<script setup>
import { ref, reactive, computed } from "vue";
import { RouterLink, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth.js";
import { getAvatarText } from "@runtime/core/utils.js";

const auth = useAuthStore();
const router = useRouter();
const navOpen = ref(false);
const showAuth = ref(false);
const isRegister = ref(false);
const errMsg = ref("");
const form = reactive({ username: "", password: "", alias: "" });

const avatarText = computed(() => getAvatarText(auth.isLoggedIn ? auth.displayName : ""));

function handleUserClick() {
  if (auth.isLoggedIn) {
    router.push("/profile");
  } else {
    showAuth.value = true;
  }
}

async function handleAuth() {
  errMsg.value = "";
  try {
    if (isRegister.value) {
      await auth.register(form.username, form.password, form.alias);
    } else {
      await auth.login(form.username, form.password);
    }
    showAuth.value = false;
  } catch (e) {
    errMsg.value = e.message || "操作失败";
  }
}

async function handleGuest() {
  errMsg.value = "";
  try {
    await auth.loginAsGuest();
    showAuth.value = false;
  } catch (e) {
    errMsg.value = e.message || "操作失败";
  }
}
</script>
