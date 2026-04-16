<template>
  <div class="container utility-container">
    <!-- Hero -->
    <section class="utility-hero site-panel">
      <div>
        <div class="utility-kicker">剧本库</div>
        <h1 class="utility-title">浏览所有剧本，找到最适合你的那一部</h1>
        <p class="utility-copy">按题材、难度、时长和热度筛选，总有一部故事在等你开启。</p>
      </div>
      <div class="utility-stat-strip">
        <div class="utility-stat">
          <span class="utility-stat-label">收录剧本</span>
          <strong>{{ stories.length }}</strong>
        </div>
      </div>
    </section>

    <!-- Toolbar -->
    <section class="catalog-toolbar site-panel">
      <div class="catalog-toolbar-main">
        <input
          class="catalog-search-input"
          type="search"
          placeholder="搜索剧本标题、题材或关键词"
          v-model="searchQuery"
        />
        <div class="catalog-filter-tabs">
          <button
            v-for="cat in categories"
            :key="cat"
            :class="{ active: activeCategory === cat }"
            type="button"
            @click="activeCategory = cat"
          >{{ cat }}</button>
        </div>
      </div>
      <div class="catalog-toolbar-side">
        <div class="catalog-result-count">共找到 {{ filtered.length }} 部剧本</div>
        <select class="catalog-sort-select" v-model="sortBy">
          <option value="recommended">推荐优先</option>
          <option value="rating">评分优先</option>
        </select>
      </div>
    </section>

    <!-- Grid -->
    <section class="catalog-grid">
      <button
        v-for="s in filtered" :key="s.id"
        class="catalog-card" type="button"
        :data-story-theme="s.id"
        @click="$router.push({ name: 'story-detail', params: { id: s.id } })"
      >
        <span class="catalog-card-cover">
          <span v-if="s.badge" class="badge">{{ s.badge }}</span>
        </span>
        <span class="catalog-card-body">
          <span class="catalog-card-title">{{ s.title }}</span>
          <span class="catalog-card-subtitle">{{ s.subtitle || '' }}</span>
          <span class="catalog-card-tags">
            <span v-for="t in (s.tags || [])" :key="t" class="tag">{{ t }}</span>
          </span>
          <span class="catalog-card-copy">{{ s.description || '' }}</span>
          <span class="catalog-card-meta">
            <span>{{ s.duration || '' }}</span>
            <span>{{ s.difficulty || '' }}</span>
            <span v-if="s.rating" class="rating">⭐ {{ s.rating }}</span>
          </span>
        </span>
      </button>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";

const stories = ref([]);
const searchQuery = ref("");
const activeCategory = ref("全部");
const sortBy = ref("recommended");

const categories = computed(() => {
  const cats = new Set(["全部"]);
  stories.value.forEach(s => (s.tags || []).forEach(t => cats.add(t)));
  return [...cats];
});

const filtered = computed(() => {
  let list = stories.value;
  if (activeCategory.value !== "全部") {
    list = list.filter(s => (s.tags || []).includes(activeCategory.value));
  }
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase();
    list = list.filter(s =>
      (s.title || "").toLowerCase().includes(q) ||
      (s.subtitle || "").toLowerCase().includes(q) ||
      (s.tags || []).some(t => t.toLowerCase().includes(q))
    );
  }
  if (sortBy.value === "rating") {
    list = [...list].sort((a, b) => (b.rating || 0) - (a.rating || 0));
  }
  return list;
});

onMounted(async () => {
  try {
    const { storyApi } = await import("@/services/api.js");
    const data = await storyApi.list();
    stories.value = (data.stories || []).map(s => ({
      id: s.id,
      title: s.title,
      subtitle: s.subtitle,
      description: s.description,
      uiTheme: s.uiTheme || s.id,
      coverImage: s.coverImage,
      badge: s.display?.badge || "",
      tags: s.display?.tags || [],
      duration: s.display?.duration || "",
      difficulty: s.display?.difficulty || "",
      playCount: s.display?.playCount || "",
      rating: s.display?.rating || "",
    }));
  } catch {
    // fallback to direct import
    const { getStoryList } = await import("@runtime/config/story-packs.js");
    const { getStoryDisplay } = await import("@runtime/config/story-display.js");
    const packs = getStoryList();
    stories.value = packs.map(pack => {
      const d = getStoryDisplay(pack.id) || {};
      return { id: pack.id, title: pack.title, subtitle: pack.subtitle, description: pack.description, uiTheme: pack.uiTheme || pack.id, ...d };
    });
  }
});
</script>
