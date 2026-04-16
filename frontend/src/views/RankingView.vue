<template>
  <div class="container utility-container">
    <!-- Hero -->
    <section class="utility-hero site-panel">
      <div>
        <div class="utility-kicker">排行榜</div>
        <h1 class="utility-title">本周最受欢迎的互动剧本</h1>
        <p class="utility-copy">根据综合评分、游玩热度和完成率排列。</p>
      </div>
      <div class="utility-stat-strip">
        <div class="utility-stat">
          <span class="utility-stat-label">参与剧本</span>
          <strong>{{ stories.length }}</strong>
        </div>
      </div>
    </section>

    <!-- Tabs -->
    <div class="ranking-tabs">
      <button
        v-for="t in tabs" :key="t.key"
        :class="['ranking-tab', { active: activeTab === t.key }]"
        type="button" @click="activeTab = t.key"
      >{{ t.label }}</button>
    </div>

    <!-- Grid -->
    <section class="utility-grid ranking-grid">
      <!-- Main ranking list -->
      <section class="site-panel">
        <div class="ranking-list-header">
          <div>
            <div class="site-panel-kicker">热门剧本</div>
            <h2 class="site-panel-title">{{ currentTabLabel }}榜单</h2>
          </div>
          <div class="ranking-period">本周</div>
        </div>
        <div class="ranking-list">
          <article
            v-for="(s, idx) in ranked" :key="s.id"
            :class="['ranking-item', idx < 3 ? `ranking-medal-${idx + 1}` : '']"
            @click="$router.push({ name: 'story-detail', params: { id: s.id } })"
          >
            <div class="ranking-index-col">
              <div class="ranking-index">{{ idx + 1 }}</div>
            </div>
            <div class="ranking-cover" :data-story-theme="s.id"></div>
            <div class="ranking-main">
              <div class="ranking-title">{{ s.title }}</div>
              <div class="ranking-subtitle">{{ s.subtitle || '' }}</div>
              <div class="ranking-tag-row">
                <span v-for="t in (s.tags || []).slice(0, 3)" :key="t" class="ranking-tag">{{ t }}</span>
              </div>
              <div class="ranking-metrics">
                <span>{{ s.duration || '' }}</span>
                <span>{{ s.difficulty || '' }}</span>
              </div>
            </div>
            <div class="ranking-score-col">
              <div class="ranking-score">{{ s.rating || '-' }}</div>
              <div class="ranking-score-label">综合评分</div>
            </div>
          </article>
          <p v-if="!ranked.length" class="utility-copy" style="text-align:center;padding:32px 0">暂无排行数据</p>
        </div>
      </section>

      <!-- Sidebar -->
      <aside class="ranking-sidebar">
        <section class="site-panel">
          <div class="site-panel-kicker">聚光灯</div>
          <h2 class="site-panel-title">本周焦点</h2>
          <div v-if="ranked[0]" class="spotlight-card">
            <div class="spotlight-cover" :data-story-theme="ranked[0].id"></div>
            <div class="spotlight-body">
              <div class="spotlight-badge">🏆 本周冠军</div>
              <div class="spotlight-title">{{ ranked[0].title }}</div>
              <p class="spotlight-copy">{{ ranked[0].description || '' }}</p>
              <div class="spotlight-stats">
                <span v-if="ranked[0].rating">评分 {{ ranked[0].rating }}</span>
                <span>{{ ranked[0].difficulty || '' }}</span>
              </div>
            </div>
          </div>
        </section>

        <section class="site-panel">
          <div class="site-panel-kicker">上升最快</div>
          <h2 class="site-panel-title">新星剧本</h2>
          <div class="rising-list">
            <div v-for="(s, i) in ranked.slice(0, 3)" :key="s.id" class="rising-item">
              <div class="rising-index">{{ i + 1 }}</div>
              <div class="rising-body">
                <div class="rising-title">{{ s.title }}</div>
                <div class="rising-meta">{{ (s.tags || [])[0] || '' }}</div>
              </div>
              <div class="rising-trend trend-up">↑</div>
            </div>
          </div>
        </section>
      </aside>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";

const stories = ref([]);
const activeTab = ref("overall");
const tabs = [
  { key: "overall", label: "综合榜" },
  { key: "hot", label: "热度榜" },
  { key: "rating", label: "评分榜" },
  { key: "completion", label: "完成率榜" },
];

const currentTabLabel = computed(() => tabs.find(t => t.key === activeTab.value)?.label || "综合");
const ranked = computed(() => {
  if (activeTab.value === "rating") return [...stories.value].sort((a, b) => (b.rating || 0) - (a.rating || 0));
  return stories.value;
});

onMounted(async () => {
  try {
    const { storyApi } = await import("@/services/api.js");
    const data = await storyApi.list();
    stories.value = (data.stories || []).map((story) => ({
      id: story.id,
      title: story.title,
      subtitle: story.subtitle,
      description: story.description,
      ...(story.display || {}),
    }));
  } catch {
    const { getStoryList } = await import("@runtime/config/story-packs.js");
    const { getStoryDisplay } = await import("@runtime/config/story-display.js");
    const packs = getStoryList();
    stories.value = packs.map((pack) => ({
      id: pack.id,
      title: pack.title,
      subtitle: pack.subtitle,
      description: pack.description,
      ...(getStoryDisplay(pack.id) || {}),
    }));
  }
});
</script>
