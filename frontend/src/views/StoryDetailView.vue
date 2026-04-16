<template>
  <div v-if="pack" class="container detail-container">
    <div class="detail-topbar">
      <RouterLink to="/catalog" class="back-link">返回剧本库</RouterLink>
      <div class="detail-tabs">
        <button :class="{ active: viewMode === 'info' }" @click="viewMode = 'info'">剧本信息</button>
        <button :class="{ active: viewMode === 'setup' }" @click="viewMode = 'setup'">进入设置</button>
      </div>
    </div>

    <section class="detail-hero">
      <aside class="detail-cover-column">
        <div class="detail-cover-card">
          <div class="detail-cover" :data-story-theme="pack.id"></div>
        </div>
      </aside>

      <section class="detail-main-column">
        <div class="detail-title-row">
          <div>
            <div class="detail-genre">{{ pack.genre }}</div>
            <h1 class="detail-title">{{ pack.title }}</h1>
            <div class="detail-subtitle">{{ pack.subtitle }}</div>
          </div>
          <div class="detail-badge">{{ pack.themeLabel }}</div>
        </div>

        <div class="detail-meta-row">
          <span>时长 {{ display.duration }}</span>
          <span>{{ display.playCount }} 游玩</span>
          <span>难度 {{ display.difficulty }}</span>
        </div>

        <p class="detail-synopsis">{{ pack.synopsis }}</p>
        <div class="detail-description">
          <div class="story-overview-lead">{{ pack.storyPromise || pack.description || '' }}</div>
        </div>

        <div class="detail-tag-row">
          <span v-for="tag in (display.tags || []).slice(0, 3)" :key="tag" class="detail-tag">{{ tag }}</span>
          <span class="detail-rating-pill">★ {{ display.rating }}</span>
        </div>

        <div class="detail-action-row">
          <button class="btn-primary" @click="startGame">{{ viewMode === 'setup' ? '确认并开始' : '开始故事' }}</button>
          <button v-if="canResume" class="btn-secondary" @click="handleResume">继续旅程</button>
        </div>
      </section>

      <aside class="detail-side-column">
        <!-- Info card (visible in info mode) -->
        <section v-if="viewMode === 'info'" class="detail-side-card detail-info-card ornate-card">
          <div class="side-card-title">剧本信息</div>
          <div class="detail-stat-list">
            <div class="detail-stat-row"><span>角色</span><strong>{{ charCount }}</strong></div>
            <div class="detail-stat-row"><span>结局</span><strong>{{ endingCount }}</strong></div>
            <div class="detail-stat-row"><span>字数</span><strong>{{ metaInfo.wordCount }}</strong></div>
          </div>
        </section>

        <!-- Score card (visible in info mode) -->
        <section v-if="viewMode === 'info'" class="detail-side-card detail-score-card ornate-card">
          <div class="side-card-title">玩家评分</div>
          <div class="detail-score-shell">
            <div class="detail-score-value">{{ display.rating }}</div>
            <div class="detail-score-meta">{{ display.playCount }} 人评分</div>
          </div>
        </section>

        <!-- Setup card (visible in setup mode) -->
        <section v-if="viewMode === 'setup'" class="detail-side-card detail-setup-card ornate-card">
          <div class="side-card-title">进入旅程</div>
          <label class="setup-label" for="playerAliasInput">旅程署名</label>
          <input
            v-model="playerAlias"
            class="setup-input"
            id="playerAliasInput"
            type="text"
            maxlength="16"
            placeholder="例如：无名旅人"
          />
          <div class="setup-label">你会怎样靠近这段故事</div>
          <div class="archetype-grid">
            <button
              v-for="(arc, key) in archetypes"
              :key="key"
              class="archetype-btn"
              :class="{ active: selectedArchetype === key }"
              type="button"
              @click="selectedArchetype = key"
            >
              <span class="archetype-label">{{ arc.label || key }}</span>
              <span class="archetype-desc">{{ arc.description || '' }}</span>
            </button>
          </div>
        </section>
      </aside>
    </section>

    <!-- Bottom grid -->
    <section class="detail-bottom-grid">
      <section class="detail-panel ornate-card">
        <div class="detail-panel-title">世界与人物</div>
        <div class="story-world-guide">
          <div class="world-guide-stack detail-overview-grid">
            <div v-if="pack.cinematicLead || pack.openingFrame" class="world-guide-block">
              <div class="world-guide-label">一句话前提</div>
              <p class="world-guide-copy">{{ pack.cinematicLead || pack.openingFrame }}</p>
            </div>
            <div v-if="pack.worldGuide || pack.storyPromise" class="world-guide-block">
              <div class="world-guide-label">背景</div>
              <p class="world-guide-copy">{{ pack.worldGuide || pack.storyPromise }}</p>
            </div>
          </div>
        </div>
        <div class="story-cast-guide">
          <div v-for="c in (pack.castGuide || []).slice(0, 3)" :key="c.name" class="cast-guide-item">
            <div class="cast-guide-name">{{ c.name }}</div>
            <div class="cast-guide-role">{{ c.role }}</div>
            <div class="cast-guide-note">{{ c.note }}</div>
          </div>
        </div>
      </section>

      <aside class="detail-panel detail-side-stack ornate-card">
        <div class="detail-panel-title">评论</div>
        <div v-for="c in comments" :key="c.id" class="save-summary" style="margin-bottom:8px">
          <strong style="color:var(--accent)">{{ c.author || c.alias || '匿名' }}</strong>: {{ c.content }}
        </div>
        <div v-if="!comments.length" class="save-summary">暂无评论</div>
      </aside>
    </section>
  </div>
  <div v-else style="text-align:center;padding:80px;color:var(--text-dim)">加载中…</div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { RouterLink, useRoute, useRouter } from "vue-router";
import { PLAYER_ARCHETYPES } from "@runtime/config/constants.js";
import { hasSessionForStory } from "@runtime/core/story-storage.js";
import { useGameStore } from "@/stores/game.js";
import { commentApi, storyApi } from "@/services/api.js";

const props = defineProps({ id: String });
const route = useRoute();
const router = useRouter();
const game = useGameStore();

const storyId = props.id || route.params.id;
const pack = ref(null);
const display = ref({});
const comments = ref([]);
const viewMode = ref("info");
const selectedArchetype = ref("witness");
const playerAlias = ref("");
const canResume = ref(false);

const archetypes = PLAYER_ARCHETYPES;
const charCount = computed(() => pack.value?.characterCount || (Object.keys(pack.value?.initialCharacters || {}).length + 1));
const endingCount = computed(() => Object.keys(pack.value?.endings || {}).length);

const DETAIL_META = {
  mistycity: { wordCount: "18.7万" },
  campuslove: { wordCount: "12.4万" },
  boardroom: { wordCount: "15.2万" },
  cyberpunk: { wordCount: "16.8万" },
  tingwan: { wordCount: "4章连载" },
};
const metaInfo = computed(() => DETAIL_META[storyId] || { wordCount: "10.0万" });

onMounted(async () => {
  try {
    const data = await storyApi.detail(storyId);
    pack.value = data.story || null;
    display.value = data.story?.display || {};
  } catch {
    const { getStoryPack } = await import("@runtime/config/story-packs.js");
    const { getStoryDisplay } = await import("@runtime/config/story-display.js");
    pack.value = getStoryPack(storyId);
    display.value = getStoryDisplay(storyId) || {};
  }
  canResume.value = hasSessionForStory(storyId);
  try {
    const data = await commentApi.list(storyId);
    comments.value = data.comments || data || [];
  } catch {}
});

function startGame() {
  if (viewMode.value === "info") {
    viewMode.value = "setup";
    return;
  }
  game.initGame(storyId, selectedArchetype.value, playerAlias.value || undefined);
  router.push({ name: "play", params: { id: storyId } });
}

function handleResume() {
  if (game.resumeGame(storyId)) {
    router.push({ name: "play", params: { id: game.storyId } });
  }
}
</script>
