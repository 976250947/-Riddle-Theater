<template>
  <div class="container utility-container">
    <!-- Hero -->
    <section class="utility-hero studio-hero site-panel">
      <div>
        <div class="utility-kicker">创作中心</div>
        <h1 class="utility-title">把一个故事写成一部可游玩的作品</h1>
        <p class="utility-copy">使用模板或从零开始，规划章节、角色与分支，发布你自己的互动剧本。</p>
      </div>
      <div class="utility-stat-strip" id="studioSelectedStory"></div>
    </section>

    <!-- Tabs -->
    <div class="studio-tabs">
      <button
        v-for="t in tabs" :key="t.key"
        :class="['studio-tab', { active: activeTab === t.key }]"
        type="button" @click="activeTab = t.key"
      >{{ t.label }}</button>
    </div>

    <!-- Projects View -->
    <section v-if="activeTab === 'projects'" class="utility-grid studio-grid">
      <aside class="site-panel">
        <div class="site-panel-kicker">草稿区</div>
        <h2 class="site-panel-title">当前项目</h2>
        <div class="draft-list">
          <div v-for="d in drafts" :key="d.id" class="mini-item draft-card">
            <div class="draft-card-header">
              <div class="draft-card-cover" :data-story-theme="d.theme || 'user'"></div>
              <div class="draft-card-info">
                <div class="mini-item-title">{{ d.title }}</div>
                <div class="mini-item-copy">{{ d.genre || '未分类' }} · {{ d.chapters || 0 }} 章节</div>
              </div>
            </div>
            <div class="draft-card-right">
              <span class="draft-status draft-status-user">{{ d.status || '草稿' }}</span>
            </div>
          </div>
          <p v-if="!drafts.length" class="utility-copy" style="text-align:center;padding:24px 0">暂无草稿</p>
        </div>
        <button class="studio-new-draft-btn" type="button">+ 新建草稿</button>
      </aside>

      <section class="site-panel studio-center-panel">
        <div class="site-panel-kicker">创作板</div>
        <h2 class="site-panel-title">章节与镜头计划</h2>
        <div class="scene-board">
          <p class="utility-copy" style="text-align:center;padding:32px 0">选择一个草稿开始编辑</p>
        </div>
      </section>

      <aside class="site-panel">
        <div class="site-panel-kicker">发布前检查</div>
        <h2 class="site-panel-title">创作清单</h2>
        <div class="checklist-stack">
          <div class="checklist-item"><div class="checklist-icon">☐</div> 至少 3 个章节</div>
          <div class="checklist-item"><div class="checklist-icon">☐</div> 至少 2 个结局</div>
          <div class="checklist-item"><div class="checklist-icon">☐</div> 封面图片</div>
          <div class="checklist-item"><div class="checklist-icon">☐</div> 简介描述</div>
        </div>
      </aside>
    </section>

    <!-- Templates View -->
    <section v-if="activeTab === 'templates'" class="utility-grid studio-grid">
      <section class="site-panel site-panel-full">
        <div class="site-panel-kicker">模板库</div>
        <h2 class="site-panel-title">快速开始</h2>
        <p class="utility-copy" style="padding:32px 0;text-align:center">模板功能开发中，敬请期待…</p>
      </section>
    </section>

    <!-- Tools View -->
    <section v-if="activeTab === 'tools'" class="studio-tools-grid">
      <article v-for="tool in tools" :key="tool.id" class="tool-card site-panel">
        <div class="tool-icon">{{ tool.icon }}</div>
        <div class="tool-body">
          <h3 class="tool-title">{{ tool.title }}</h3>
          <p class="tool-desc">{{ tool.desc }}</p>
        </div>
        <button class="tool-action-btn" type="button">打开工具</button>
      </article>
    </section>
  </div>
</template>

<script setup>
import { ref } from "vue";

const activeTab = ref("projects");
const tabs = [
  { key: "projects", label: "我的项目" },
  { key: "templates", label: "模板库" },
  { key: "tools", label: "写作工具" },
];

const drafts = ref([]);

const tools = [
  { id: "character-editor", icon: "👤", title: "角色卡编辑器", desc: "设定角色的身份、背景、性格特征与关系网络" },
  { id: "dialogue-writer", icon: "💬", title: "对白编辑器", desc: "为每个场景撰写角色对白与旁白" },
  { id: "branch-planner", icon: "🌿", title: "分支规划器", desc: "可视化规划故事的选择分支与多结局路径" },
  { id: "world-builder", icon: "🌍", title: "世界观构建器", desc: "构建故事的背景设定、地点与文化细节" },
];
</script>
