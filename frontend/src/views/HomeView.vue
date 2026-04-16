<template>
  <div class="container library-container">
    <!-- Hero Banner -->
    <section class="hero-banner">
      <div class="hero-left">
        <div class="bg-cursive-text text-your">Your</div>
        <div class="bg-cursive-text text-story">Story</div>
        <div class="title-wrapper">
          <h1 class="main-title title-line-1">你的选择</h1>
          <h1 class="main-title title-line-2">决定故事的结局</h1>
        </div>
        <div class="hero-subtitle">沉浸式剧情体验<span>·</span>多线分支结局<span>·</span>你的选择改变一切</div>
        <p class="hero-copy">先从剧本库里挑选你想进入的一部故事。每个题材都有不同的人物关系、叙事节奏与结局走向。</p>
        <div class="hero-button-row">
          <RouterLink v-if="featuredStory" :to="`/story/${featuredStory.id}`" class="btn-primary">开始探索</RouterLink>
          <button v-if="canResume" class="btn-secondary" @click="handleResume">继续旅程</button>
        </div>
      </div>
      <div class="hero-right">
        <div v-if="featuredStory" class="recommend-card" :data-story-theme="featuredStory.id">
          <span class="corner corner-tl"></span>
          <span class="corner corner-tr"></span>
          <span class="corner corner-bl"></span>
          <span class="corner corner-br"></span>
          <div class="rc-header">
            <span class="header-line"></span>
            每日推荐
            <span class="header-line"></span>
          </div>
          <div>
            <div class="rc-header-shell">
              <h3 class="rc-title">{{ featuredStory.title }}</h3>
              <div class="rc-subtitle">{{ featuredStory.subtitle }}</div>
            </div>
            <p class="rc-desc">{{ featuredDisplay.logline || featuredStory.synopsis || '' }}</p>
            <RouterLink :to="`/story/${featuredStory.id}`" class="btn-outline-wrapper">
              <svg class="btn-svg-bg" preserveAspectRatio="none" viewBox="0 0 150 38">
                <polygon class="btn-svg-polygon" points="14,1 136,1 149,19 136,37 14,37 1,19" />
              </svg>
              <span class="btn-text">进入故事</span>
            </RouterLink>
            <div class="pagination">
              <button
                v-for="s in stories"
                :key="s.id"
                class="dot"
                :class="{ active: s.id === featuredStory.id }"
                type="button"
                @click="featuredIndex = stories.indexOf(s)"
              ></button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Filter / Featured shelf -->
    <section class="filter-section">
      <div class="section-title">精选剧本</div>
      <div class="filter-tabs">
        <button
          v-for="cat in categories"
          :key="cat.value"
          :class="{ active: activeCategory === cat.value }"
          type="button"
          @click="activeCategory = cat.value"
        >{{ cat.label }}</button>
      </div>
      <div class="filter-dropdowns">
        <RouterLink to="/catalog" class="dropdown-btn">前往剧本库</RouterLink>
      </div>
    </section>

    <!-- Story grid -->
    <section class="grid-container" aria-label="首页精选剧本列表">
      <StoryCard
        v-for="s in filteredStories"
        :key="s.id"
        :story="s"
        :display="displayMap[s.id] || {}"
      />
    </section>

    <!-- Features -->
    <section class="features">
      <div class="feature-item">
        <div class="feature-icon-box">
          <svg class="svg-icon" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
        </div>
        <div class="feature-text"><h5>沉浸体验</h5><p>精美画面与音效，带来<br />身临其境的代入感</p></div>
      </div>
      <div class="feature-item">
        <div class="feature-icon-box">
          <svg class="svg-icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
        </div>
        <div class="feature-text"><h5>多重结局</h5><p>你的每一个选择，都会导向<br />不同的故事结局</p></div>
      </div>
      <div class="feature-item">
        <div class="feature-icon-box">
          <svg class="svg-icon" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>
        </div>
        <div class="feature-text"><h5>创作分享</h5><p>创作属于你的故事，分享给<br />全球玩家</p></div>
      </div>
      <div class="feature-item feature-save">
        <div class="feature-icon-box">
          <svg class="svg-icon" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
        </div>
        <div class="feature-text"><h5>社区互动</h5><p>与玩家交流心得，参与话题<br />讨论和活动</p></div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { RouterLink, useRouter } from "vue-router";
import StoryCard from "@/components/StoryCard.vue";
import { useGameStore } from "@/stores/game.js";

const router = useRouter();
const game = useGameStore();
const canResume = ref(false);
const featuredIndex = ref(0);

const stories = ref([]);
const displayMap = ref({});

const categories = [
  { value: "all", label: "全部" },
  { value: "悬疑推理", label: "悬疑推理" },
  { value: "情感沉浸", label: "情感沉浸" },
  { value: "都市博弈", label: "都市博弈" },
  { value: "未来科幻", label: "未来科幻" },
];
const activeCategory = ref("all");

const filteredStories = computed(() => {
  if (activeCategory.value === "all") return stories.value;
  return stories.value.filter((s) => {
    const d = displayMap.value[s.id];
    return d?.featuredCategory === activeCategory.value || d?.tags?.includes(activeCategory.value);
  });
});

const featuredStory = computed(() => stories.value[featuredIndex.value] || null);
const featuredDisplay = computed(() => featuredStory.value ? (displayMap.value[featuredStory.value.id] || {}) : {});

onMounted(async () => {
  try {
    const { storyApi } = await import("@/services/api.js");
    const data = await storyApi.list();
    stories.value = data.stories || [];
    displayMap.value = Object.fromEntries(stories.value.map((story) => [story.id, story.display || {}]));
  } catch {
    const { getStoryList, getStoryPack } = await import("@runtime/config/story-packs.js");
    const { getStoryDisplay } = await import("@runtime/config/story-display.js");
    const list = getStoryList();
    stories.value = list.map((pack) => getStoryPack(pack.id));
    displayMap.value = Object.fromEntries(stories.value.map((story) => [story.id, getStoryDisplay(story.id)]));
  }

  try {
    const { loadSession } = await import("@runtime/core/story-storage.js");
    canResume.value = !!loadSession();
  } catch {}
});

function handleResume() {
  if (game.resumeGame()) {
    router.push({ name: "play", params: { id: game.storyId } });
  }
}
</script>
