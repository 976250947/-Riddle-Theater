<template>
  <div class="container utility-container">
    <section class="profile-hero site-panel">
      <div class="profile-hero-main profile-hero-main--stack">
        <div class="profile-portrait-shell">
          <div class="profile-portrait">{{ avatarText }}</div>
          <div class="profile-portrait-badge"><AppIcon name="sparkles" :size="14" /></div>
        </div>
        <div class="profile-hero-copy">
          <div class="utility-kicker">个人档案</div>
          <h1 class="profile-page-name">{{ auth.displayName || '旅行者' }}</h1>
          <div class="profile-level-row">
            <span class="profile-level-badge">{{ accountLabel }}</span>
            <span class="profile-member-since"><AppIcon name="calendar" :size="13" /> {{ memberSince }}</span>
          </div>
          <p class="utility-copy">{{ profileSummary }}</p>
          <div class="profile-action-row">
            <button class="profile-primary-btn" type="button" @click="continueJourney(featuredJourney)">
              <AppIcon :name="featuredJourney ? 'play' : 'layers'" :size="15" />
              {{ featuredJourney ? '继续最近旅程' : '浏览故事库' }}
            </button>
            <button class="profile-secondary-btn" type="button" @click="router.push({ name: 'catalog' })">
              <AppIcon name="bookmark" :size="15" />
              故事目录
            </button>
            <button class="auth-logout-btn profile-logout-btn" type="button" @click="logout">
              <AppIcon name="log-out" :size="14" />
              退出登录
            </button>
          </div>
        </div>
      </div>
      <div class="profile-progress-card">
        <div class="profile-stat-grid">
          <div class="utility-stat profile-stat-card">
            <span class="utility-stat-label">云端存档</span>
            <strong>{{ normalizedSaves.length }}</strong>
          </div>
          <div class="utility-stat profile-stat-card">
            <span class="utility-stat-label">已解锁结局</span>
            <strong>{{ totalUnlockedEndingCount }}</strong>
          </div>
          <div class="utility-stat profile-stat-card">
            <span class="utility-stat-label">活跃故事</span>
            <strong>{{ activeStoryCount }}</strong>
          </div>
          <div class="utility-stat profile-stat-card">
            <span class="utility-stat-label">最近代号</span>
            <strong>{{ featuredJourney?.alias || auth.displayName || '未命名' }}</strong>
          </div>
        </div>
        <div v-if="featuredJourney" class="profile-focus-card">
          <div class="site-panel-kicker">当前聚焦</div>
          <div class="profile-focus-title">{{ featuredJourney.storyTitle }}</div>
          <div class="profile-focus-meta">
            <span><AppIcon name="route" :size="13" /> {{ featuredJourney.stageTitle }}</span>
            <span><AppIcon name="timer" :size="13" /> {{ featuredJourney.duration }}</span>
          </div>
        </div>
      </div>
    </section>

    <section class="utility-grid profile-grid">
      <section class="site-panel">
        <div class="site-panel-kicker">最近旅程</div>
        <h2 class="site-panel-title">继续阅读</h2>
        <div class="recent-story-list">
          <article v-for="journey in recentJourneys" :key="journey.key" class="recent-story-item profile-journey-item">
            <div class="recent-story-cover" :data-story-theme="journey.uiTheme"></div>
            <div class="profile-journey-body">
              <div class="recent-story-title">{{ journey.storyTitle }}</div>
              <div class="mini-item-copy">{{ journey.featuredCategory }} · {{ journey.stageTitle }}</div>
              <div class="profile-journey-meta">{{ journey.kindLabel }} · {{ journey.updatedLabel }} · {{ journey.alias }}</div>
              <div class="profile-journey-tags">
                <span class="tpl-tag">{{ journey.slotLabel }}</span>
                <span class="tpl-tag">{{ journey.nodeLabel }}</span>
              </div>
            </div>
            <button class="profile-inline-btn" type="button" @click="continueJourney(journey)">
              <AppIcon name="play" :size="14" />
              继续
            </button>
          </article>
          <div v-if="!recentJourneys.length" class="profile-empty-state">
            <AppIcon name="bookmark" :size="22" />
            <span>还没有可继续的旅程，去故事库开启第一段剧情。</span>
          </div>
        </div>
      </section>

      <section class="site-panel">
        <div class="site-panel-kicker">故事档案</div>
        <h2 class="site-panel-title">进度总览</h2>
        <div class="badge-list profile-story-stack">
          <article v-for="story in storyProgress" :key="story.storyId" class="badge-item profile-story-card">
            <div class="badge-medal profile-story-icon"><AppIcon :name="story.icon" :size="20" /></div>
            <div class="profile-story-body">
              <div class="badge-title">{{ story.title }}</div>
              <div class="badge-copy">{{ story.summary }}</div>
              <div class="profile-story-meta">
                <span><AppIcon name="bookmark" :size="13" /> {{ story.unlockedCount }}/{{ story.totalEndings }} 结局</span>
                <span><AppIcon name="cloud" :size="13" /> {{ story.cloudCount }} 云档</span>
                <span v-if="story.hasLocalSession"><AppIcon name="activity" :size="13" /> 本地续玩</span>
              </div>
            </div>
            <button class="profile-inline-btn profile-inline-btn--ghost" type="button" @click="router.push({ name: 'story-detail', params: { id: story.storyId } })">
              <AppIcon name="chevron-right" :size="14" />
              查看
            </button>
          </article>
        </div>
      </section>

      <aside class="site-panel">
        <div class="site-panel-kicker">里程碑</div>
        <h2 class="site-panel-title">已点亮的徽记</h2>
        <div class="badge-list">
          <article v-for="badge in badges" :key="badge.title" class="badge-item profile-badge-item">
            <div class="badge-medal profile-badge-medal"><AppIcon :name="badge.icon" :size="18" /></div>
            <div>
              <div class="badge-title">{{ badge.title }}</div>
              <div class="badge-copy">{{ badge.copy }}</div>
            </div>
          </article>
          <div v-if="!badges.length" class="profile-empty-state compact">
            <AppIcon name="medal" :size="20" />
            <span>继续推进剧情后，这里会自动生成你的旅人徽记。</span>
          </div>
        </div>
      </aside>

      <aside class="site-panel">
        <div class="site-panel-kicker">最近动态</div>
        <h2 class="site-panel-title">你的足迹</h2>
        <div class="feed-list compact">
          <article v-for="entry in activityFeed" :key="entry.title" class="feed-item compact profile-feed-item">
            <div class="profile-feed-icon"><AppIcon :name="entry.icon" :size="16" /></div>
            <div>
              <div class="mini-item-title">{{ entry.title }}</div>
              <div class="mini-item-copy">{{ entry.copy }}</div>
            </div>
          </article>
          <div v-if="!activityFeed.length" class="profile-empty-state compact">
            <AppIcon name="activity" :size="20" />
            <span>你的选择、存档与结局记录会在这里累计。</span>
          </div>
        </div>
      </aside>

      <section class="site-panel site-panel-full">
        <div class="site-panel-kicker">存档管理</div>
        <h2 class="site-panel-title">云端存档</h2>
        <div class="save-slots">
          <article v-for="save in normalizedSaves" :key="save.key" class="save-slot save-slot--filled profile-save-slot">
            <div class="save-slot-top">
              <div>
                <div class="save-slot-name">{{ save.slotLabel }} · {{ save.storyTitle }}</div>
                <div class="save-slot-info">{{ save.stageTitle }} · {{ save.alias }} · {{ save.nodeLabel }}</div>
              </div>
              <div class="profile-save-actions">
                <button class="profile-inline-btn" type="button" :disabled="activeSlotAction === save.slotId" @click="continueJourney(save)">
                  <AppIcon name="play" :size="14" />
                  继续
                </button>
                <button class="save-slot-delete" type="button" @click="deleteSave(save.slotId)" title="删除存档">
                  <AppIcon name="trash" :size="14" />
                </button>
              </div>
            </div>
            <div class="profile-save-meta">
              <span><AppIcon name="cloud" :size="13" /> 云端同步</span>
              <span><AppIcon name="layers" :size="13" /> {{ save.featuredCategory }}</span>
              <span><AppIcon name="bookmark" :size="13" /> {{ save.unlockedLabel }}</span>
            </div>
            <div class="save-slot-time">{{ save.updatedLabel }}</div>
          </article>
          <div v-if="savesLoading" class="profile-empty-state compact">
            <AppIcon name="cloud" :size="20" />
            <span>正在同步云端存档…</span>
          </div>
          <div v-else-if="!normalizedSaves.length" class="profile-empty-state compact">
            <AppIcon name="archive" :size="20" />
            <span>暂无云端存档，开始游玩后可以在游戏内同步到账号。</span>
          </div>
        </div>
      </section>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import AppIcon from "@/components/AppIcon.vue";
import { useAuthStore } from "@/stores/auth.js";
import { useGameStore } from "@/stores/game.js";
import { saveApi } from "@/services/api.js";
import { getStoryDisplay } from "@runtime/config/story-display.js";
import { getStoryList, getStoryPack, getUnlockedEndingsForStory } from "@runtime/config/story-packs.js";
import { loadMeta, loadSession, saveSession } from "@runtime/core/story-storage.js";

const auth = useAuthStore();
const router = useRouter();
const game = useGameStore();
const saves = ref([]);
const savesLoading = ref(false);
const activeSlotAction = ref("");
const meta = ref(readMetaSafe());
const session = ref(readSessionSafe());
const storyList = getStoryList();

const avatarText = computed(() => {
  const n = auth.displayName || "旅";
  return n.charAt(0);
});

const accountLabel = computed(() => (auth.user?.role === "GUEST" ? "游客档案" : "注册用户"));
const memberSince = computed(() => {
  if (!auth.user?.createdAt) return "刚刚启程";
  return `加入于 ${new Date(auth.user.createdAt).toLocaleDateString("zh-CN")}`;
});

const totalUnlockedEndingCount = computed(() => meta.value.unlockedEndings?.length || 0);

const normalizedSaves = computed(() =>
  saves.value
    .map((save) => normalizeSave(save))
    .sort((left, right) => new Date(right.updatedAt || 0).getTime() - new Date(left.updatedAt || 0).getTime())
);

const localJourney = computed(() => buildLocalJourney(session.value));

const featuredJourney = computed(() => localJourney.value || normalizedSaves.value[0] || null);

const recentJourneys = computed(() => {
  const journeys = [];

  if (localJourney.value) {
    journeys.push(localJourney.value);
  }

  for (const save of normalizedSaves.value) {
    journeys.push(save);
  }

  return journeys.slice(0, 4);
});

const storyProgress = computed(() =>
  storyList
    .map((pack) => {
      const display = getStoryDisplay(pack.id);
      const unlockedCount = getUnlockedEndingsForStory(meta.value, pack.id).length;
      const totalEndings = Object.keys(pack.endings || {}).length;
      const cloudCount = normalizedSaves.value.filter((save) => save.storyId === pack.id).length;
      const hasLocalSession = session.value?.story?.id === pack.id;

      return {
        storyId: pack.id,
        title: pack.title,
        icon: storyIcon(pack.id),
        unlockedCount,
        totalEndings,
        cloudCount,
        hasLocalSession,
        score: unlockedCount * 10 + cloudCount * 4 + (hasLocalSession ? 6 : 0),
        summary: `${display.featuredCategory} · ${display.duration} · ${pack.themeLabel || pack.genre || "剧情叙事"}`
      };
    })
    .sort((left, right) => right.score - left.score)
);

const activeStoryCount = computed(() =>
  storyProgress.value.filter((story) => story.unlockedCount || story.cloudCount || story.hasLocalSession).length
);

const badges = computed(() => {
  const result = [];

  if (normalizedSaves.value.length) {
    result.push({ icon: "cloud", title: "云端记录者", copy: `已同步 ${normalizedSaves.value.length} 个云端存档。` });
  }

  if (totalUnlockedEndingCount.value) {
    result.push({ icon: "medal", title: "结局收藏家", copy: `已收集 ${totalUnlockedEndingCount.value} 个结局印记。` });
  }

  if (activeStoryCount.value >= 2) {
    result.push({ icon: "layers", title: "多线旅人", copy: `正在探索 ${activeStoryCount.value} 部不同故事。` });
  }

  if (localJourney.value) {
    result.push({ icon: "activity", title: "持续连载中", copy: `本地自动存档停留在《${localJourney.value.storyTitle}》。` });
  }

  return result.slice(0, 4);
});

const activityFeed = computed(() => {
  const items = [];

  if (localJourney.value) {
    items.push({
      icon: "play",
      title: `继续游玩《${localJourney.value.storyTitle}》`,
      copy: `${localJourney.value.stageTitle} · ${localJourney.value.alias}`
    });
  }

  normalizedSaves.value.slice(0, 2).forEach((save) => {
    items.push({
      icon: "cloud",
      title: `同步了 ${save.slotLabel}`,
      copy: `${save.storyTitle} · ${save.updatedLabel}`
    });
  });

  if (totalUnlockedEndingCount.value) {
    items.push({
      icon: "bookmark",
      title: "图鉴持续扩展",
      copy: `当前总计已解锁 ${totalUnlockedEndingCount.value} 个结局。`
    });
  }

  return items.slice(0, 4);
});

const profileSummary = computed(() => {
  if (featuredJourney.value) {
    return `你已经在 ${Math.max(activeStoryCount.value, 1)} 部故事里留下选择痕迹，累计解锁 ${totalUnlockedEndingCount.value} 个结局。当前最近停留在《${featuredJourney.value.storyTitle}》的「${featuredJourney.value.stageTitle}」。`;
  }

  if (totalUnlockedEndingCount.value || normalizedSaves.value.length) {
    return `这里会汇总你的云端存档、结局图鉴和近期足迹，方便从任何一个节点重新进入故事。`;
  }

  return "这里会汇总你的云端存档、结局图鉴和近期足迹。开始第一段旅程后，个人中心会逐步长成你的故事档案。";
});

onMounted(async () => {
  savesLoading.value = true;
  try {
    const data = await saveApi.list();
    saves.value = data.saves || data || [];
  } catch {
    saves.value = [];
  } finally {
    savesLoading.value = false;
  }
});

async function deleteSave(slotId) {
  if (!window.confirm(`确定删除云端存档 ${slotId} 吗？`)) {
    return;
  }

  try {
    activeSlotAction.value = slotId;
    await saveApi.remove(slotId);
    saves.value = saves.value.filter(s => s.slotId !== slotId);
  } catch {
  } finally {
    activeSlotAction.value = "";
  }
}

function continueJourney(journey) {
  if (!journey) {
    router.push({ name: "catalog" });
    return;
  }

  if (journey.data) {
    game.cleanup();
    saveSession(journey.data);
    session.value = journey.data;
    router.push({ name: "play", params: { id: journey.storyId } });
    return;
  }

  router.push({ name: "story-detail", params: { id: journey.storyId } });
}

function logout() {
  auth.logout();
  router.push("/");
}

function readMetaSafe() {
  try {
    return loadMeta();
  } catch {
    return { unlockedEndings: [] };
  }
}

function readSessionSafe() {
  try {
    return loadSession();
  } catch {
    return null;
  }
}

function storyIcon(storyId) {
  return {
    mistycity: "mystery",
    campuslove: "romance",
    boardroom: "urban",
    cyberpunk: "cyberpunk",
    tingwan: "heart"
  }[storyId] || "book";
}

function normalizeSave(save) {
  const storyId = save.storyId || save.data?.story?.id || storyList[0]?.id;
  const pack = getStoryPack(storyId);
  const display = getStoryDisplay(storyId);
  const stageId = save.data?.session?.currentStageId;
  const stageTitle = pack.stages?.[stageId]?.title || pack.synopsis || "继续上次节点";
  const nodeCount = Array.isArray(save.data?.nodes) ? save.data.nodes.length : 0;
  const unlockedCount = getUnlockedEndingsForStory(meta.value, storyId).length;

  return {
    ...save,
    key: `cloud-${save.slotId}`,
    kind: "cloud",
    kindLabel: "云端续玩",
    storyId,
    data: save.data,
    storyTitle: pack.title,
    featuredCategory: display.featuredCategory,
    duration: display.duration,
    uiTheme: pack.uiTheme || storyId,
    alias: save.data?.player?.alias || auth.displayName || "旅人",
    stageTitle,
    nodeLabel: nodeCount ? `${nodeCount} 个节点` : "初始节点",
    unlockedLabel: `${unlockedCount} 个结局记录`,
    slotLabel: `槽位 ${save.slotId}`,
    updatedLabel: formatDateTime(save.updatedAt),
    unlockedCount
  };
}

function buildLocalJourney(state) {
  if (!state?.story?.id) return null;

  const storyId = state.story.id;
  const pack = getStoryPack(storyId);
  const display = getStoryDisplay(storyId);
  const stageId = state.session?.currentStageId;
  const stageTitle = pack.stages?.[stageId]?.title || pack.synopsis || "继续上次节点";
  const nodeCount = Array.isArray(state.nodes) ? state.nodes.length : 0;

  return {
    key: `local-${storyId}`,
    kind: "local",
    kindLabel: "本地自动存档",
    storyId,
    data: state,
    storyTitle: pack.title,
    featuredCategory: display.featuredCategory,
    duration: display.duration,
    uiTheme: pack.uiTheme || storyId,
    alias: state.player?.alias || auth.displayName || "旅人",
    stageTitle,
    nodeLabel: nodeCount ? `${nodeCount} 个节点` : "初始节点",
    slotLabel: "自动存档",
    updatedLabel: "刚刚记录"
  };
}

function formatDateTime(value) {
  if (!value) return "刚刚记录";
  return new Date(value).toLocaleString("zh-CN", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}
</script>
