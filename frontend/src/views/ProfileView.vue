<template>
  <div class="container utility-container">
    <!-- Profile Hero -->
    <section class="profile-hero site-panel">
      <div class="profile-hero-main">
        <div class="profile-portrait">{{ avatarText }}</div>
        <div class="utility-kicker">个人主页</div>
        <h1 class="profile-page-name">{{ auth.displayName || '旅行者' }}</h1>
        <div class="profile-level-row">
          <span class="profile-level-badge">{{ auth.user?.role === 'GUEST' ? '游客' : '注册用户' }}</span>
        </div>
        <p class="utility-copy">故事的选择会留下痕迹。在这里追踪你的旅程、成就和足迹。</p>
        <button class="auth-logout-btn" type="button" @click="logout">退出登录</button>
      </div>
      <div class="profile-progress-card">
        <div class="profile-stat-item">
          <span class="profile-stat-num">{{ saves.length }}</span>
          <span class="profile-stat-label">云端存档</span>
        </div>
      </div>
    </section>

    <!-- Profile Grid -->
    <section class="utility-grid profile-grid">
      <!-- Recent Journeys -->
      <section class="site-panel">
        <div class="site-panel-kicker">最近旅程</div>
        <h2 class="site-panel-title">继续阅读</h2>
        <div class="recent-story-list">
          <div v-for="s in saves" :key="s.slotId" class="mini-item">
            <div class="mini-item-title">槽位 {{ s.slotId }}</div>
            <div class="mini-item-copy">{{ new Date(s.updatedAt).toLocaleString() }}</div>
          </div>
          <p v-if="!saves.length" class="utility-copy" style="text-align:center;padding:24px 0">暂无旅程记录</p>
        </div>
      </section>

      <!-- Badges -->
      <section class="site-panel">
        <div class="site-panel-kicker">成就与里程碑</div>
        <h2 class="site-panel-title">已点亮的徽记</h2>
        <div class="badge-list">
          <p class="utility-copy" style="text-align:center;padding:24px 0">暂无成就</p>
        </div>
      </section>

      <!-- Activity Feed -->
      <aside class="site-panel">
        <div class="site-panel-kicker">最近动态</div>
        <h2 class="site-panel-title">你的足迹</h2>
        <div class="feed-list compact">
          <p class="utility-copy" style="text-align:center;padding:24px 0">暂无动态</p>
        </div>
      </aside>

      <!-- Cloud Saves Management -->
      <section class="site-panel site-panel-full">
        <div class="site-panel-kicker">存档管理</div>
        <h2 class="site-panel-title">云端存档</h2>
        <div class="save-slots">
          <div v-for="s in saves" :key="s.slotId" class="save-slot save-slot--filled">
            <div class="save-slot-top">
              <div class="save-slot-name">槽位 {{ s.slotId }}</div>
              <button class="save-slot-delete" @click="deleteSave(s.slotId)" title="删除存档">&times;</button>
            </div>
            <div class="save-slot-time">{{ new Date(s.updatedAt).toLocaleString() }}</div>
          </div>
          <p v-if="!saves.length" class="utility-copy" style="text-align:center;padding:24px 0">暂无云端存档</p>
        </div>
      </section>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth.js";
import { saveApi } from "@/services/api.js";

const auth = useAuthStore();
const router = useRouter();
const saves = ref([]);

const avatarText = computed(() => {
  const n = auth.displayName || "旅";
  return n.charAt(0);
});

onMounted(async () => {
  try {
    const data = await saveApi.list();
    saves.value = data.saves || data || [];
  } catch {}
});

async function deleteSave(slotId) {
  try {
    await saveApi.remove(slotId);
    saves.value = saves.value.filter(s => s.slotId !== slotId);
  } catch {}
}

function logout() {
  auth.logout();
  router.push("/");
}
</script>
