<template>
  <div class="container utility-container">
    <!-- Hero -->
    <section class="utility-hero site-panel">
      <div>
        <div class="utility-kicker">社区</div>
        <h1 class="utility-title">讨论剧情、交换路线、一起拆解故事细节</h1>
        <p class="utility-copy">分享你的游玩体验，发现其他玩家的隐藏路线。</p>
      </div>
      <div class="utility-stat-strip">
        <div class="utility-stat">
          <span class="utility-stat-label">在线讨论</span>
          <strong>0</strong>
        </div>
      </div>
    </section>

    <!-- Tabs -->
    <div class="community-tabs">
      <button
        v-for="t in tabs" :key="t.key"
        :class="['community-tab', { active: activeTab === t.key }]"
        type="button" @click="activeTab = t.key"
      >{{ t.label }}</button>
    </div>

    <!-- Grid -->
    <section class="utility-grid community-grid">
      <section class="community-main-col">
        <!-- Post box -->
        <section class="site-panel">
          <div class="community-post-box">
            <div class="post-box-avatar">{{ postBoxInitial }}</div>
            <input class="post-box-input" type="text" placeholder="分享你的剧情心得或路线发现..." readonly />
            <button class="post-box-btn" type="button">发布</button>
          </div>
        </section>

        <!-- Feed -->
        <section class="site-panel">
          <div class="site-panel-kicker">动态墙</div>
          <h2 class="site-panel-title">最新讨论</h2>
          <div class="feed-list">
            <article v-for="f in feed" :key="f.id" class="feed-item">
              <div class="feed-avatar" :data-initial="f.author[0]">{{ f.author[0] }}</div>
              <div class="feed-content">
                <div class="feed-header">
                  <span class="feed-author">{{ f.author }}</span>
                  <span class="feed-time">{{ f.time }}</span>
                </div>
                <div class="feed-copy">{{ f.text }}</div>
                <div class="feed-footer">
                  <div class="feed-tags">
                    <span v-for="t in f.tags" :key="t" class="feed-tag">{{ t }}</span>
                  </div>
                  <div class="feed-actions">
                    <button class="feed-action-btn">❤ {{ f.likes }}</button>
                    <button class="feed-action-btn">💬 {{ f.comments }}</button>
                    <button class="feed-action-btn">↗ 分享</button>
                  </div>
                </div>
              </div>
            </article>
            <p v-if="!feed.length" class="utility-copy" style="text-align:center;padding:32px 0">暂无讨论动态，快来发表第一条吧</p>
          </div>
        </section>
      </section>

      <aside class="community-sidebar">
        <!-- Topics -->
        <section class="site-panel">
          <div class="site-panel-kicker">热议话题</div>
          <h2 class="site-panel-title">正在讨论</h2>
          <div class="topic-list">
            <div v-for="t in topics" :key="t.title" class="topic-item">
              <div class="topic-body">
                <div class="topic-title">{{ t.title }}</div>
                <div class="topic-meta">{{ t.replies }} 回复</div>
              </div>
              <span :class="['topic-heat', `topic-heat-${t.heat}`]">{{ t.heatLabel }}</span>
            </div>
            <p v-if="!topics.length" class="utility-copy" style="text-align:center;padding:16px 0">暂无话题</p>
          </div>
        </section>

        <!-- Events -->
        <section class="site-panel">
          <div class="site-panel-kicker">官方活动</div>
          <h2 class="site-panel-title">进行中</h2>
          <div class="event-list">
            <p class="utility-copy" style="text-align:center;padding:16px 0">暂无活动</p>
          </div>
        </section>

        <!-- Guides -->
        <section class="site-panel">
          <div class="site-panel-kicker">精选攻略</div>
          <h2 class="site-panel-title">高赞指南</h2>
          <div class="guide-list">
            <p class="utility-copy" style="text-align:center;padding:16px 0">暂无攻略</p>
          </div>
        </section>
      </aside>
    </section>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import { useAuthStore } from "@/stores/auth.js";

const auth = useAuthStore();
const postBoxInitial = computed(() => (auth.displayName || "旅客").slice(0, 1));

const activeTab = ref("feed");
const tabs = [
  { key: "feed", label: "最新动态" },
  { key: "guides", label: "攻略专区" },
  { key: "fanart", label: "同人创作" },
];

// Placeholder data — will be API-driven later
const feed = ref([
  { id: 1, author: "星辰猎人", time: "10 分钟前", text: "刚刚在《雾晚》里走出了另一条线，结局完全不同！", tags: ["路线讨论"], likes: 42, comments: 8 },
  { id: 2, author: "推理控老K", time: "1 小时前", text: "迷城谜案的第三章有个超隐蔽的分支，有人发现了吗？", tags: ["隐藏线索"], likes: 28, comments: 15 },
]);

const topics = ref([
  { title: "你最喜欢的结局是哪一个？", replies: 156, heat: "hot", heatLabel: "热门" },
  { title: "赛博朋克线的伏笔整理", replies: 89, heat: "best", heatLabel: "精华" },
  { title: "校园恋爱线全路线讨论", replies: 45, heat: "active", heatLabel: "活跃" },
]);
</script>
