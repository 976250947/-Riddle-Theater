import { ENDING_ORDER } from "../config/constants.js";
import { getStoryDisplay } from "../config/story-display.js";
import { getStoryList, getStoryPack, getUnlockedEndingsForStory } from "../config/story-packs.js";
import { escapeHtml } from "../core/utils.js";
import { svg, svgStars } from "./icons.js";
import { getLocalUser, isLoggedIn } from "../core/api-client.js";

/* ══════════════════════════════════════════════════
   User Draft Storage (localStorage-backed)
   ══════════════════════════════════════════════════ */
const DRAFT_STORAGE_KEY = "ai-narrative-game-user-drafts";

function loadUserDrafts() {
  try {
    const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveUserDrafts(drafts) {
  localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(drafts));
}

function createDraft(opts = {}) {
  const drafts = loadUserDrafts();
  const draft = {
    id: "draft_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6),
    title: opts.title || "未命名草稿",
    genre: opts.genre || "原创",
    desc: opts.desc || "",
    templateId: opts.templateId || null,
    templateTitle: opts.templateTitle || null,
    chapters: opts.chapters || [],
    characters: opts.characters || [],
    endings: opts.endings || [],
    mechanics: opts.mechanics || [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  drafts.unshift(draft);
  saveUserDrafts(drafts);
  return draft;
}

function deleteDraft(draftId) {
  const drafts = loadUserDrafts().filter((d) => d.id !== draftId);
  saveUserDrafts(drafts);
}

function renameDraft(draftId, newTitle) {
  const drafts = loadUserDrafts();
  const d = drafts.find((d) => d.id === draftId);
  if (d) { d.title = newTitle; d.updatedAt = new Date().toISOString(); }
  saveUserDrafts(drafts);
}

const CREATOR_NAMES = {
  mistycity: "迷城叙事组",
  campuslove: "夏夜广播社",
  boardroom: "第七编辑室",
  cyberpunk: "零域回声",
  tingwan: "临川夜话"
};

function sortStories(left, right, sort) {
  switch (sort) {
    case "rating":
      return Number(right.display.rating) - Number(left.display.rating);
    case "popular":
      return parsePlayCount(right.display.playCount) - parsePlayCount(left.display.playCount);
    case "latest":
      return right.title.localeCompare(left.title, "zh-CN");
    case "recommended":
    default:
      return Number(right.display.recommended) - Number(left.display.recommended);
  }
}

function parsePlayCount(value) {
  if (!value) return 0;
  if (value.includes("万")) {
    return Number.parseFloat(value) * 10000;
  }
  return Number.parseFloat(value);
}

export function renderCatalogScreen(elements, meta, options = {}) {
  const { query = "", category = "all", sort = "recommended" } = options;
  const normalizedQuery = query.trim().toLowerCase();

  const stories = getStoryList()
    .map((pack) => {
      const display = getStoryDisplay(pack.id);
      return {
        ...pack,
        display,
        unlockedCount: getUnlockedEndingsForStory(meta, pack.id).length
      };
    })
    .filter((pack) => {
      const matchesCategory = category === "all" || pack.display.featuredCategory === category;
      const haystack = `${pack.title} ${pack.themeLabel} ${pack.description} ${pack.synopsis}`.toLowerCase();
      const matchesQuery = !normalizedQuery || haystack.includes(normalizedQuery);
      return matchesCategory && matchesQuery;
    })
    .sort((left, right) => sortStories(left, right, sort));

  elements.catalogSearchInput.value = query;
  elements.catalogResultCount.textContent = `共找到 ${stories.length} 部剧本`;
  elements.catalogGrid.innerHTML = stories.length
    ? stories
    .map(
      (pack) => `<button
        class="catalog-card"
        type="button"
        data-catalog-story-id="${pack.id}"
        data-story-theme="${escapeHtml(pack.uiTheme || pack.id)}"
        aria-label="查看剧本《${escapeHtml(pack.title)}》详情"
      >
        <span class="catalog-card-cover" aria-hidden="true">
          ${pack.display.badge ? `<span class="badge ${escapeHtml(pack.display.badgeClass)}">${escapeHtml(pack.display.badge)}</span>` : ""}
        </span>
        <span class="catalog-card-body">
          <span class="catalog-card-title">${escapeHtml(pack.title)}</span>
          <span class="catalog-card-subtitle">${escapeHtml(pack.subtitle)}</span>
          <span class="catalog-card-tags">
            ${pack.display.tags.map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join("")}
          </span>
          <span class="catalog-card-copy">${escapeHtml(pack.display.featuredCopy)}</span>
          <span class="catalog-card-meta">
            <span>${escapeHtml(pack.display.duration)}</span>
            <span>${escapeHtml(pack.display.difficulty)}</span>
            <span>${escapeHtml(pack.display.playCount)}</span>
            <span class="rating">${escapeHtml(pack.display.rating)}</span>
          </span>
          <span class="catalog-card-progress">已解锁 ${pack.unlockedCount} / ${ENDING_ORDER.length} 结局</span>
        </span>
      </button>`
    )
    .join("")
    : `<div class="catalog-empty-state">没有找到匹配的剧本，试试更换关键词或筛选条件。</div>`;
}

export function renderAtlasScreen(elements, meta, selectedStoryId) {
  const pack = getStoryPack(selectedStoryId);
  const unlocked = getUnlockedEndingsForStory(meta, selectedStoryId);
  const castCount = Object.keys(pack.initialCharacters || {}).length + 1;
  const branchCount = (pack.progressSteps?.length || 0) * 2 + ENDING_ORDER.length;
  const stageEntries = Object.values(pack.stages || {});
  const stageKeys = Object.keys(pack.stages || {});

  elements.atlasStoryGenre.textContent = pack.themeLabel;
  elements.atlasStoryTitle.textContent = pack.title;
  elements.atlasStorySubtitle.textContent = pack.subtitle;
  elements.atlasMetaInfo.innerHTML = `
    <div class="atlas-meta-row"><span>作者</span><strong>${escapeHtml(CREATOR_NAMES[pack.id] || "谜语工作室")}</strong></div>
    <div class="atlas-meta-row"><span>角色</span><strong>${castCount}</strong></div>
    <div class="atlas-meta-row"><span>分支</span><strong>${branchCount}</strong></div>
    <div class="atlas-meta-row"><span>结局</span><strong>${Object.keys(pack.endings).length}</strong></div>
  `;
  elements.atlasUnlockedCount.textContent = `结局总览 ${unlocked.length} / ${ENDING_ORDER.length}`;

  /* ── Timeline-style progress board ── */
  elements.atlasBranchBoard.innerHTML = (pack.progressSteps || [])
    .map((step, index) => {
      const stateClass = index === 0 ? "complete" : index < unlocked.length + 1 ? "available" : "locked";
      const stage = stageEntries[index];
      const leadText = stage?.title || step.label;
      const stageId = stageKeys[index] || "";
      const choiceCount = stage?.choices?.length || 0;
      const isLast = index === (pack.progressSteps.length - 1);

      return `<div class="atlas-timeline-item ${isLast ? "last" : ""}">
        <div class="atlas-timeline-rail">
          <div class="atlas-timeline-dot ${stateClass}"></div>
          ${isLast ? "" : '<div class="atlas-timeline-line"></div>'}
        </div>
        <article class="atlas-node ${stateClass}" data-atlas-node="${stageId}" role="button" tabindex="0">
          <div class="atlas-node-header">
            <div class="atlas-node-kicker">阶段 ${index + 1}</div>
            <svg class="atlas-node-chevron" viewBox="0 0 16 16" width="14" height="14"><path d="M4.5 2L10.5 8L4.5 14" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </div>
          <h3 class="atlas-node-title">${escapeHtml(step.label)}</h3>
          <p class="atlas-node-copy">${escapeHtml(leadText)}</p>
          <div class="atlas-node-detail">
            ${choiceCount ? `<div class="atlas-node-stat">可选路径: ${choiceCount}</div>` : ""}
            ${stage?.chapterLead ? `<p class="atlas-node-lead">${escapeHtml(stage.chapterLead)}</p>` : ""}
          </div>
        </article>
      </div>`;
    })
    .join("");

  /* ── Toggle expand on node click ── */
  elements.atlasBranchBoard.addEventListener("click", (e) => {
    const node = e.target.closest(".atlas-node");
    if (!node) return;
    node.classList.toggle("expanded");
  });

  /* ── Ending gallery with unlock effects ── */
  const ENDING_ICONS = { good: svg("ending-good", 18), normal: svg("ending-normal", 18), bad: svg("ending-bad", 18), hidden: svg("ending-hidden", 18) };
  const ENDING_LABELS = { good: "最佳结局", normal: "普通结局", bad: "暗黑结局", hidden: "隐藏结局" };

  elements.atlasEndingList.innerHTML = ENDING_ORDER.map((endingId) => {
    const ending = pack.endings[endingId];
    const isUnlocked = unlocked.includes(endingId);

    return `<article class="atlas-ending-card ${isUnlocked ? "unlocked" : "locked"}">
      <div class="atlas-ending-icon">${ENDING_ICONS[endingId] || svg("ending-default", 18)}</div>
      <div class="atlas-ending-label">${escapeHtml(ENDING_LABELS[endingId] || endingId)}</div>
      <div class="atlas-ending-name">${escapeHtml(isUnlocked ? ending.title : "???")}</div>
      <div class="atlas-ending-meta">${escapeHtml(isUnlocked ? ending.subtitle : "尚未解锁")}</div>
      <div class="atlas-ending-badge">${escapeHtml(ending.badge)}</div>
      <div class="atlas-ending-state">${isUnlocked ? "已达成" : "未达成"}</div>
    </article>`;
  }).join("");
}

export function renderStudioScreen(elements, meta, savedState, selectedStoryId) {
  const pack = getStoryPack(selectedStoryId);
  const unlocked = getUnlockedEndingsForStory(meta, selectedStoryId);
  const allStories = getStoryList();
  const userDrafts = loadUserDrafts();
  const totalDrafts = allStories.length + userDrafts.length;

  elements.studioSelectedStory.innerHTML = `
    <div class="utility-stat">
      <span class="utility-stat-label">当前参考</span>
      <strong>${escapeHtml(pack.title)}</strong>
    </div>
    <div class="utility-stat">
      <span class="utility-stat-label">已解锁结局</span>
      <strong>${unlocked.length} / ${ENDING_ORDER.length}</strong>
    </div>
    <div class="utility-stat">
      <span class="utility-stat-label">草稿数</span>
      <strong>${totalDrafts}</strong>
    </div>
    <div class="utility-stat">
      <span class="utility-stat-label">最近旅程</span>
      <strong>${escapeHtml(savedState?.player?.alias || "无记录")}</strong>
    </div>
  `;

  /* ── Draft list: built-in packs + user drafts ── */
  const builtInDrafts = allStories.map((p) => {
    const display = getStoryDisplay(p.id);
    const stages = Object.keys(p.stages || {}).length;
    const endingCount = Object.keys(p.endings || {}).length;
    const status = p.id === selectedStoryId ? "编辑中" : "内置";
    const statusClass = p.id === selectedStoryId ? "active" : "builtin";
    return { id: p.id, title: p.title, themeLabel: p.themeLabel, stages, endingCount, status, statusClass, uiTheme: p.uiTheme || p.id, isBuiltin: true };
  });

  const userDraftCards = userDrafts.map((d) => {
    const ago = timeAgo(d.updatedAt);
    return {
      id: d.id,
      title: d.title,
      themeLabel: d.genre,
      stages: d.chapters.length,
      endingCount: d.endings.length,
      status: ago,
      statusClass: "user",
      templateTitle: d.templateTitle,
      isBuiltin: false
    };
  });

  const allDrafts = [...userDraftCards, ...builtInDrafts];

  elements.studioDraftList.innerHTML = allDrafts
    .map(
      (d) => `<div class="mini-item draft-card ${d.isBuiltin ? "" : "user-draft"}" data-draft-id="${d.id}" data-builtin="${d.isBuiltin}">
        <div class="draft-card-header">
          <div class="draft-card-cover" data-story-theme="${escapeHtml(d.uiTheme || "user")}">
            ${d.isBuiltin ? "" : `<span class="draft-card-user-icon">${svg("file", 18)}</span>`}
          </div>
          <div class="draft-card-info">
            <div class="mini-item-title">${escapeHtml(d.title)}</div>
            <div class="mini-item-copy">${escapeHtml(d.themeLabel)}${d.stages ? ` · ${d.stages} 章节` : ""}${d.endingCount ? ` · ${d.endingCount} 结局` : ""}${d.templateTitle ? ` · 基于${escapeHtml(d.templateTitle)}` : ""}</div>
          </div>
        </div>
        <div class="draft-card-right">
          <span class="draft-status draft-status-${d.statusClass}">${escapeHtml(d.status)}</span>
          ${d.isBuiltin ? "" : `<div class="draft-card-actions">
            <button class="draft-action-btn" data-draft-action="edit" data-draft-target="${d.id}" title="编辑">${svg("edit", 14)}</button>
            <button class="draft-action-btn draft-action-delete" data-draft-action="delete" data-draft-target="${d.id}" title="删除">${svg("trash", 14)}</button>
          </div>`}
        </div>
      </div>`
    )
    .join("")
    || '<div class="draft-empty">暂无草稿，点击下方新建或从模板库选择</div>';

  /* ── Scene board (contextual to selected pack) ── */
  elements.studioSceneBoard.innerHTML = (pack.progressSteps || [])
    .map(
      (step, index) => {
        const stage = Object.values(pack.stages || {})[index];
        const choiceCount = stage?.choices?.length || 0;
        return `<div class="scene-board-item">
          <div class="scene-board-header">
            <div class="scene-board-index">第 ${index + 1} 幕</div>
            ${choiceCount ? `<span class="scene-board-choices">${choiceCount} 分支</span>` : ""}
          </div>
          <div class="scene-board-title">${escapeHtml(step.label)}</div>
          <div class="scene-board-copy">${escapeHtml(stage?.objective || stage?.title || pack.synopsis)}</div>
          <div class="scene-board-tags">
            ${(stage?.eventTags || []).map((t) => `<span class="scene-tag">${escapeHtml(t)}</span>`).join("")}
          </div>
        </div>`;
      }
    )
    .join("");

  elements.studioChecklist.innerHTML = [
    { text: "角色身份是否足够鲜明", done: true },
    { text: "开场冲突是否能在 30 秒内建立", done: true },
    { text: "中段反转是否和人物关系相关", done: false },
    { text: "所有结局条件是否可被玩家理解", done: false },
    { text: "自由输入是否有明确兜底文本", done: false },
    { text: "角色对话是否有情绪层次", done: false },
    { text: "分支节点是否有清晰的后果预示", done: true }
  ]
    .map(
      (item) => `<div class="checklist-item ${item.done ? "checked" : ""}">
        <span class="checklist-icon">${item.done ? svg("check", 16) : svg("circle", 16)}</span>
        <span>${escapeHtml(item.text)}</span>
      </div>`
    )
    .join("");

  /* ── Templates view ── */
  renderTemplateGallery(elements);
  bindTemplateGallery(elements, meta, savedState, selectedStoryId);

  /* ── Bind draft interactions ── */
  bindDraftInteractions(elements, meta, savedState, selectedStoryId);

  /* ── Tools view ── */
  elements.studioToolsGrid.innerHTML = [
    { id: "character-editor", icon: svg("character-editor", 28), title: "角色卡编辑器", desc: "设定角色的身份、背景、性格特征与关系网络。支持属性数值可视化。", action: "打开工具" },
    { id: "branch-map", icon: svg("branch-map", 28), title: "分支图谱", desc: "以可视化方式管理故事节点、选择分支和结局触发条件。", action: "打开工具" },
    { id: "dialogue-writer", icon: svg("dialogue-writer", 28), title: "对话写作台", desc: "专注模式的对话编辑器，支持情绪标签、语气提示和角色切换。", action: "打开工具" },
    { id: "ending-config", icon: svg("ending-config", 28), title: "结局条件配置", desc: "设定好感、信任、线索等变量组合与最终结局的映射关系。", action: "打开工具" },
    { id: "script-tester", icon: svg("script-tester", 28), title: "剧本测试器", desc: "模拟玩家路径，快速预览不同选择下的剧情走向和变量变化。", action: "打开工具" },
    { id: "data-dashboard", icon: svg("data-dashboard", 28), title: "数据看板", desc: "分析玩家行为数据，查看各分支选择率、平均游戏时长和结局分布。", action: "打开工具" }
  ]
    .map(
      (t) => `<article class="tool-card site-panel" data-tool-id="${t.id}">
        <div class="tool-icon">${t.icon}</div>
        <div class="tool-body">
          <h3 class="tool-title">${escapeHtml(t.title)}</h3>
          <p class="tool-desc">${escapeHtml(t.desc)}</p>
        </div>
        <button class="tool-action-btn" type="button" data-open-tool="${t.id}">${escapeHtml(t.action)}</button>
      </article>`
    )
    .join("");

  /* ── Tab switching & tool panel ── */
  bindStudioTabs(elements);
  bindToolPanel(elements, pack);
}

export function renderRankingScreen(elements, meta) {
  const TREND_ICONS = { up: svg("arrow-up", 14), down: svg("arrow-down", 14), same: "—" };
  const TREND_CLASS = { up: "trend-up", down: "trend-down", same: "trend-same" };

  const rankedStories = getStoryList()
    .map((pack, index) => {
      const display = getStoryDisplay(pack.id);
      const endingsUnlocked = getUnlockedEndingsForStory(meta, pack.id).length;
      const completionRate = Math.round((endingsUnlocked / ENDING_ORDER.length) * 100);
      return {
        ...pack,
        display,
        score: 9.8 - index * 0.2,
        endingsUnlocked,
        completionRate,
        trend: index === 0 ? "same" : index === 1 ? "up" : index < 3 ? "down" : "up",
        lastWeekRank: index === 0 ? 1 : index === 1 ? 3 : index === 2 ? 2 : index + 2
      };
    })
    .sort((left, right) => right.score - left.score);

  /* ── Stats strip ── */
  elements.rankingStats.innerHTML = `
    <div class="utility-stat">
      <span class="utility-stat-label">参与剧本</span>
      <strong>${rankedStories.length}</strong>
    </div>
    <div class="utility-stat">
      <span class="utility-stat-label">总玩家参与</span>
      <strong>12.9万</strong>
    </div>
    <div class="utility-stat">
      <span class="utility-stat-label">榜单周期</span>
      <strong>每周更新</strong>
    </div>
  `;

  /* ── Main ranking list ── */
  elements.rankingTopList.innerHTML = rankedStories
    .map(
      (pack, index) => {
        const medalClass = index < 3 ? `ranking-medal-${index + 1}` : "";
        return `<article class="ranking-item ${medalClass}">
          <div class="ranking-index-col">
            <div class="ranking-index">${index + 1}</div>
            <div class="ranking-trend ${TREND_CLASS[pack.trend]}">
              <span>${TREND_ICONS[pack.trend]}</span>
              ${pack.trend !== "same" ? `<span class="ranking-trend-num">${Math.abs(pack.lastWeekRank - (index + 1))}</span>` : ""}
            </div>
          </div>
          <div class="ranking-cover" data-story-theme="${escapeHtml(pack.uiTheme || pack.id)}"></div>
          <div class="ranking-main">
            <div class="ranking-title">${escapeHtml(pack.title)}</div>
            <div class="ranking-subtitle">${escapeHtml(pack.subtitle)}</div>
            <div class="ranking-tag-row">
              ${pack.display.tags.map((tag) => `<span class="ranking-tag">${escapeHtml(tag)}</span>`).join("")}
            </div>
            <div class="ranking-metrics">
              <span>${svg("fire", 14)} ${escapeHtml(pack.display.playCount)}</span>
              <span>${svg("timer", 14)} ${escapeHtml(pack.display.duration)}</span>
              <span>${svg("data-dashboard", 14)} 完成率 ${pack.completionRate}%</span>
            </div>
          </div>
          <div class="ranking-score-col">
            <div class="ranking-score">${pack.score.toFixed(1)}</div>
            <div class="ranking-score-label">综合评分</div>
          </div>
        </article>`;
      }
    )
    .join("");

  /* ── Spotlight ── */
  const spotlight = rankedStories[0];
  elements.rankingSpotlight.innerHTML = `
    <div class="spotlight-cover" data-story-theme="${escapeHtml(spotlight.uiTheme || spotlight.id)}"></div>
    <div class="spotlight-body">
      <div class="spotlight-badge">${svg("trophy", 16)} 本周冠军</div>
      <div class="spotlight-title">${escapeHtml(spotlight.title)}</div>
      <p class="spotlight-copy">${escapeHtml(spotlight.storyPromise || spotlight.synopsis)}</p>
      <div class="spotlight-stats">
        <span>评分 ${spotlight.score.toFixed(1)}</span>
        <span>热度 ${escapeHtml(spotlight.display.playCount)}</span>
        <span>${escapeHtml(spotlight.display.difficulty)}</span>
      </div>
    </div>
  `;

  /* ── Creator list ── */
  elements.rankingCreatorList.innerHTML = rankedStories
    .slice(0, 4)
    .map(
      (pack, index) => `<div class="creator-item">
        <div class="creator-avatar" data-story-theme="${escapeHtml(pack.uiTheme || pack.id)}">
          <span>${CREATOR_NAMES[pack.id]?.[0] || "谜"}</span>
        </div>
        <div class="creator-body">
          <div class="creator-name">${escapeHtml(CREATOR_NAMES[pack.id] || "谜语工作室")}</div>
          <div class="creator-meta">${escapeHtml(pack.title)} · 评分 ${pack.score.toFixed(1)}</div>
        </div>
        <div class="creator-rank">TOP ${index + 1}</div>
      </div>`
    )
    .join("");

  /* ── Rising stars ── */
  elements.rankingRisingList.innerHTML = rankedStories
    .slice()
    .reverse()
    .slice(0, 3)
    .map(
      (pack, index) => `<div class="rising-item">
        <div class="rising-index">${index + 1}</div>
        <div class="rising-body">
          <div class="rising-title">${escapeHtml(pack.title)}</div>
          <div class="rising-meta">${escapeHtml(pack.themeLabel)} · 热度 +${(Math.random() * 30 + 10).toFixed(0)}%</div>
        </div>
        <div class="rising-trend trend-up">${svg("arrow-up", 14)}</div>
      </div>`
    )
    .join("");

  /* ── Tab switching ── */
  bindRankingTabs(elements);
}

export function renderCommunityScreen(elements, meta, savedState, selectedStoryId) {
  const pack = getStoryPack(selectedStoryId);
  const alias = savedState?.player?.alias || "一位旅人";
  const unlocked = getUnlockedEndingsForStory(meta, selectedStoryId);
  const allStories = getStoryList();

  /* ── Stats strip ── */
  elements.communityStats.innerHTML = `
    <div class="utility-stat">
      <span class="utility-stat-label">活跃玩家</span>
      <strong>8,642</strong>
    </div>
    <div class="utility-stat">
      <span class="utility-stat-label">今日讨论</span>
      <strong>326</strong>
    </div>
    <div class="utility-stat">
      <span class="utility-stat-label">精选攻略</span>
      <strong>89</strong>
    </div>
  `;

  /* ── Feed ── */
  const feedItems = [
    {
      author: "星辰猎人",
      avatar: "星",
      time: "10 分钟前",
      text: `刚刚在《${pack.title}》里走出了另一条线，${pack.themeLabel}这条支线的情绪铺垫太狠了。最后那段对白直接把我看呆了。`,
      likes: 42,
      comments: 8,
      tags: [pack.themeLabel]
    },
    {
      author: alias,
      avatar: alias[0],
      time: "28 分钟前",
      text: unlocked.length
        ? `已经解锁了 ${unlocked.length} 个结局，但总觉得有条隐藏路线还没触发。有没有人发现第二幕那个选择会影响最终结局？`
        : `今天刚开始玩《${pack.title}》，第一幕的气氛已经把我完全带进去了。这个开场太会了。`,
      likes: 27,
      comments: 13,
      tags: ["路线讨论"]
    },
    {
      author: "夜行书生",
      avatar: "夜",
      time: "1 小时前",
      text: "有没有人愿意分享一下自己是怎么把人物信任值稳住的？我每次到第三幕信任就崩了，选什么都不对。",
      likes: 56,
      comments: 21,
      tags: ["攻略求助"]
    },
    {
      author: "雾中画师",
      avatar: "雾",
      time: "2 小时前",
      text: `分享一张基于《${allStories[0]?.title || pack.title}》的同人插画。画的是雨夜窗前的那段独白场景，希望大家喜欢。`,
      likes: 128,
      comments: 34,
      tags: ["同人创作"]
    },
    {
      author: "推理控老K",
      avatar: "K",
      time: "3 小时前",
      text: "整理了一份全结局条件对照表。四条结局线的关键变量已经全部标注出来了，周末放出完整版攻略。",
      likes: 93,
      comments: 47,
      tags: ["攻略", "结局"]
    },
    {
      author: "深夜编辑部",
      avatar: "编",
      time: "5 小时前",
      text: "创作者视角分享：在设计分支选项的时候，最重要的不是选项本身，而是让玩家感受到选择的重量。每个分支背后都要有情感代价。",
      likes: 71,
      comments: 19,
      tags: ["创作心得"]
    }
  ];

  elements.communityFeed.innerHTML = feedItems
    .map(
      (item) => `<article class="feed-item">
        <div class="feed-avatar" data-initial="${escapeHtml(item.avatar)}">${escapeHtml(item.avatar)}</div>
        <div class="feed-content">
          <div class="feed-header">
            <span class="feed-author">${escapeHtml(item.author)}</span>
            <span class="feed-time">${escapeHtml(item.time)}</span>
          </div>
          <div class="feed-copy">${escapeHtml(item.text)}</div>
          <div class="feed-footer">
            <div class="feed-tags">${item.tags.map((t) => `<span class="feed-tag">${escapeHtml(t)}</span>`).join("")}</div>
            <div class="feed-actions">
              <button class="feed-action-btn" type="button">${svg("heart-outline", 14)} ${item.likes}</button>
              <button class="feed-action-btn" type="button">${svg("comment", 14)} ${item.comments}</button>
              <button class="feed-action-btn" type="button">${svg("arrow-up-right", 14)} 分享</button>
            </div>
          </div>
        </div>
      </article>`
    )
    .join("");

  /* ── Topics ── */
  const topics = [
    { title: "你最喜欢的结局是哪一个？", replies: 156, heat: "热门" },
    { title: "哪条分支最值得二周目重玩", replies: 89, heat: "活跃" },
    { title: `${pack.title} 的隐藏条件推测`, replies: 234, heat: "热门" },
    { title: "角色关系线深度讨论", replies: 67, heat: "活跃" },
    { title: "新手入坑指南 · 选择向玩家必读", replies: 312, heat: "精华" }
  ];

  elements.communityTopics.innerHTML = topics
    .map(
      (item) => `<div class="topic-item">
        <div class="topic-body">
          <div class="topic-title">${escapeHtml(item.title)}</div>
          <div class="topic-meta">${item.replies} 回复</div>
        </div>
        <span class="topic-heat topic-heat-${item.heat === "热门" ? "hot" : item.heat === "精华" ? "best" : "active"}">${escapeHtml(item.heat)}</span>
      </div>`
    )
    .join("");

  /* ── Events ── */
  elements.communityEvents.innerHTML = [
    { title: "本周话题：如何让 NPC 更有真实感", date: "4月14日 — 4月20日", status: "进行中" },
    { title: "创作挑战：用 3 个选择写出反转结局", date: "4月21日 — 4月27日", status: "即将开始" },
    { title: "路线征集：你愿意公开自己的完美攻略吗", date: "4月7日 — 4月13日", status: "已结束" }
  ]
    .map(
      (item) => `<div class="event-list-item">
        <div class="event-body">
          <div class="event-title">${escapeHtml(item.title)}</div>
          <div class="event-date">${escapeHtml(item.date)}</div>
        </div>
        <span class="event-status event-status-${item.status === "进行中" ? "active" : item.status === "即将开始" ? "upcoming" : "ended"}">${escapeHtml(item.status)}</span>
      </div>`
    )
    .join("");

  /* ── Guides ── */
  elements.communityGuides.innerHTML = [
    { title: `《${pack.title}》全结局攻略`, author: "推理控老K", likes: 423 },
    { title: "信任值系统完全解析", author: "夜行书生", likes: 287 },
    { title: "隐藏结局触发条件汇总", author: "星辰猎人", likes: 198 }
  ]
    .map(
      (item) => `<article class="guide-item">
        <div class="guide-body">
          <div class="guide-title">${escapeHtml(item.title)}</div>
          <div class="guide-meta">by ${escapeHtml(item.author)} · ${svg("heart-outline", 14)} ${item.likes}</div>
        </div>
      </article>`
    )
    .join("");

  /* ── Tab switching ── */
  bindCommunityTabs(elements);
}

/* ── Tab binding helpers ── */

/* ══════════════════════════════════════════════════
   Tool Panel System
   ══════════════════════════════════════════════════ */

const TOOL_META = {
  "character-editor": { icon: svg("character-editor", 24), title: "角色卡编辑器" },
  "branch-map": { icon: svg("branch-map", 24), title: "分支图谱" },
  "dialogue-writer": { icon: svg("dialogue-writer", 24), title: "对话写作台" },
  "ending-config": { icon: svg("ending-config", 24), title: "结局条件配置" },
  "script-tester": { icon: svg("script-tester", 24), title: "剧本测试器" },
  "data-dashboard": { icon: svg("data-dashboard", 24), title: "数据看板" }
};

function openToolPanel(elements, toolId, pack) {
  const meta = TOOL_META[toolId];
  if (!meta) return;
  elements.toolPanelIcon.innerHTML = meta.icon;
  elements.toolPanelTitle.textContent = meta.title;

  const builders = {
    "character-editor": () => buildCharacterEditor(pack),
    "branch-map": () => buildBranchMap(pack),
    "dialogue-writer": () => buildDialogueWriter(pack),
    "ending-config": () => buildEndingConfig(pack),
    "script-tester": () => buildScriptTester(pack),
    "data-dashboard": () => buildDataDashboard(pack)
  };

  elements.toolPanelBody.innerHTML = builders[toolId]?.() || "";
  elements.toolPanelOverlay.classList.add("open");
  document.body.style.overflow = "hidden";

  // Bind interactivity after render
  requestAnimationFrame(() => bindToolInteractions(elements, toolId, pack));
}

function closeToolPanel(elements) {
  elements.toolPanelOverlay.classList.remove("open");
  document.body.style.overflow = "";
}

function bindToolPanel(elements, pack) {
  if (!elements.studioToolsGrid || elements.studioToolsGrid._toolBound) return;
  elements.studioToolsGrid._toolBound = true;

  elements.studioToolsGrid.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-open-tool]");
    if (!btn) return;
    openToolPanel(elements, btn.dataset.openTool, pack);
  });

  elements.toolPanelClose.addEventListener("click", () => closeToolPanel(elements));
  elements.toolPanelOverlay.addEventListener("click", (e) => {
    if (e.target === elements.toolPanelOverlay) closeToolPanel(elements);
  });
}

/* ── 1. Character Editor ── */
function buildCharacterEditor(pack) {
  const chars = Object.values(pack.initialCharacters || {});
  const playerChar = {
    characterId: "player",
    name: "主角（玩家）",
    role: pack.playerRole || "探索者",
    affinity: 50,
    trust: 50,
    alertness: 30,
    mood: "未知",
    relationshipStage: "—",
    revealed: true
  };
  const allChars = [playerChar, ...chars];

  return `
    <div class="tp-char-tabs">
      ${allChars.map((c, i) => `<button class="tp-char-tab ${i === 0 ? "active" : ""}" data-char-idx="${i}">${escapeHtml(c.name)}</button>`).join("")}
      <button class="tp-char-tab tp-char-add">+ 新角色</button>
    </div>
    ${allChars.map((c, i) => `
      <div class="tp-char-panel ${i === 0 ? "active" : ""}" data-char-panel="${i}">
        <div class="tp-char-grid">
          <div class="tp-char-portrait">
            <div class="tp-portrait-circle">${escapeHtml(c.name[0])}</div>
            <div class="tp-portrait-id">${escapeHtml(c.characterId)}</div>
          </div>
          <div class="tp-char-fields">
            <label class="tp-field">
              <span class="tp-field-label">角色名称</span>
              <input class="tp-input" type="text" value="${escapeHtml(c.name)}" />
            </label>
            <label class="tp-field">
              <span class="tp-field-label">角色定位</span>
              <input class="tp-input" type="text" value="${escapeHtml(c.role)}" />
            </label>
            <label class="tp-field">
              <span class="tp-field-label">情绪状态</span>
              <input class="tp-input" type="text" value="${escapeHtml(c.mood)}" />
            </label>
            <label class="tp-field">
              <span class="tp-field-label">关系阶段</span>
              <select class="tp-select">
                ${["未接触", "试探期", "信任建立", "深度绑定", "决裂", "共鸣"].map((s) => `<option ${s === c.relationshipStage ? "selected" : ""}>${s}</option>`).join("")}
              </select>
            </label>
            <div class="tp-field-row">
              <label class="tp-field">
                <span class="tp-field-label">可见性</span>
                <select class="tp-select">
                  <option ${c.revealed ? "selected" : ""}>已揭示</option>
                  <option ${!c.revealed ? "selected" : ""}>隐藏</option>
                </select>
              </label>
            </div>
          </div>
        </div>
        <div class="tp-char-stats">
          <h4 class="tp-section-title">属性数值</h4>
          <div class="tp-stat-sliders">
            ${buildStatSlider("好感度", "affinity", c.affinity, "#e8a87c")}
            ${buildStatSlider("信任值", "trust", c.trust, "#85cdca")}
            ${buildStatSlider("警觉度", "alertness", c.alertness, "#d291bc")}
          </div>
        </div>
        <div class="tp-char-relations">
          <h4 class="tp-section-title">关系网络</h4>
          <div class="tp-relation-map">
            ${allChars.filter((o) => o.characterId !== c.characterId).map((o) => `
              <div class="tp-relation-line">
                <span class="tp-relation-node">${escapeHtml(c.name[0])}</span>
                <span class="tp-relation-edge">
                  <select class="tp-select tp-select-sm">
                    <option>信任</option><option>猜忌</option><option>合作</option><option>对抗</option><option>暧昧</option><option>未知</option>
                  </select>
                </span>
                <span class="tp-relation-node">${escapeHtml(o.name[0])}</span>
                <span class="tp-relation-name">${escapeHtml(o.name)}</span>
              </div>
            `).join("")}
          </div>
        </div>
      </div>
    `).join("")}
  `;
}

function buildStatSlider(label, key, value, color) {
  return `<div class="tp-slider-row">
    <span class="tp-slider-label">${label}</span>
    <input class="tp-slider" type="range" min="0" max="100" value="${value}" style="--slider-color: ${color}" />
    <span class="tp-slider-value" data-slider-key="${key}">${value}</span>
  </div>`;
}

/* ── 2. Branch Map ── */
function buildBranchMap(pack) {
  const stages = Object.entries(pack.stages || {});
  const stageKeys = Object.keys(pack.stages || {});

  return `
    <div class="tp-branch-legend">
      <span class="tp-legend-item"><span class="tp-legend-dot tp-dot-stage"></span>叙事节点</span>
      <span class="tp-legend-item"><span class="tp-legend-dot tp-dot-choice"></span>选择分支</span>
      <span class="tp-legend-item"><span class="tp-legend-dot tp-dot-ending"></span>结局触发</span>
      <span class="tp-legend-item"><span class="tp-legend-dot tp-dot-checkpoint"></span>关键存档点</span>
    </div>
    <div class="tp-branch-flow">
      ${stages.map(([stageId, stage], idx) => {
        const choices = stage.choices || [];
        const isCheckpoint = stage.isCheckpoint;
        const isLast = idx === stages.length - 1;
        return `
          <div class="tp-branch-node ${isCheckpoint ? "checkpoint" : ""}">
            <div class="tp-branch-node-head">
              <span class="tp-branch-idx">${idx + 1}</span>
              <div>
                <div class="tp-branch-stage-title">${escapeHtml(stage.title || stageId)}</div>
                <div class="tp-branch-stage-tag">${escapeHtml(stage.chapterTag || "")} ${escapeHtml(stage.sceneTag || "")}</div>
              </div>
              ${isCheckpoint ? '<span class="tp-branch-checkpoint-badge">存档点</span>' : ""}
            </div>
            ${stage.objective ? `<div class="tp-branch-objective">${escapeHtml(stage.objective)}</div>` : ""}
            ${choices.length ? `
              <div class="tp-branch-choices">
                ${choices.map((ch) => {
                  const effectKeys = Object.keys(ch.effects || {});
                  const hasEnding = ch.ending;
                  return `<div class="tp-branch-choice ${hasEnding ? "ending-trigger" : ""}">
                    <div class="tp-branch-choice-label">${escapeHtml(ch.label)}</div>
                    <div class="tp-branch-choice-meta">
                      <span class="tp-choice-intent">${escapeHtml(ch.intent || ch.id)}</span>
                      ${ch.nextStageId ? `<span class="tp-choice-arrow">→ ${escapeHtml(ch.nextStageId)}</span>` : ""}
                      ${hasEnding ? `<span class="tp-choice-ending">${svg("flag", 12)} 触发结局</span>` : ""}
                    </div>
                    ${effectKeys.length ? `<div class="tp-branch-effects">
                      ${effectKeys.map((ck) => {
                        const eff = ch.effects[ck];
                        return Object.entries(eff).map(([attr, val]) => `<span class="tp-effect-tag ${val > 0 ? "positive" : "negative"}">${escapeHtml(ck)}.${attr} ${val > 0 ? "+" : ""}${val}</span>`).join("");
                      }).join("")}
                    </div>` : ""}
                  </div>`;
                }).join("")}
              </div>
            ` : ""}
          </div>
          ${!isLast ? '<div class="tp-branch-connector"><div class="tp-connector-line"></div></div>' : ""}
        `;
      }).join("")}
    </div>
  `;
}

/* ── 3. Dialogue Writer ── */
function buildDialogueWriter(pack) {
  const chars = Object.values(pack.initialCharacters || {});
  const allChars = [
    { characterId: "narrator", name: "旁白", mood: "中性" },
    { characterId: "player", name: "主角", mood: "—" },
    ...chars
  ];

  const sampleDialogues = Object.values(pack.stages || {}).slice(0, 3).map((stage) => {
    const lines = [];
    if (stage.storyText) {
      const text = typeof stage.storyText === "string" ? stage.storyText : Object.values(stage.storyText)[0] || "";
      if (text) lines.push({ speaker: "narrator", text: text.slice(0, 120) });
    }
    if (stage.npcDialogue) {
      lines.push({ speaker: pack.primaryCharacterId || "npc", text: stage.npcDialogue.slice(0, 120) });
    }
    return { stageTitle: stage.title || stage.id, lines };
  });

  return `
    <div class="tp-dialogue-layout">
      <aside class="tp-dialogue-sidebar">
        <div class="tp-section-title">角色列表</div>
        <div class="tp-dialogue-char-list">
          ${allChars.map((c) => `<div class="tp-dialogue-char-item" data-char="${c.characterId}">
            <span class="tp-dialogue-char-dot"></span>
            <span>${escapeHtml(c.name)}</span>
          </div>`).join("")}
        </div>
        <div class="tp-section-title" style="margin-top:16px">情绪标签</div>
        <div class="tp-mood-tags">
          ${["中性", "紧张", "温柔", "愤怒", "悲伤", "兴奋", "冷漠", "恐惧", "挑衅", "讽刺"].map((m) => `<button class="tp-mood-tag" type="button">${m}</button>`).join("")}
        </div>
        <div class="tp-section-title" style="margin-top:16px">语气提示</div>
        <div class="tp-tone-list">
          ${["低声说", "冷冷地", "犹豫着", "斩钉截铁地", "意味深长地", "漫不经心地"].map((t) => `<button class="tp-tone-tag" type="button">${escapeHtml(t)}</button>`).join("")}
        </div>
      </aside>
      <section class="tp-dialogue-main">
        <div class="tp-dialogue-toolbar">
          <select class="tp-select" id="tpDialogueSpeaker">
            ${allChars.map((c) => `<option value="${c.characterId}">${escapeHtml(c.name)}</option>`).join("")}
          </select>
          <select class="tp-select" id="tpDialogueMood">
            <option value="">选择情绪…</option>
            ${["中性", "紧张", "温柔", "愤怒", "悲伤", "兴奋", "冷漠"].map((m) => `<option>${m}</option>`).join("")}
          </select>
          <button class="tp-btn tp-btn-secondary" id="tpAddLine" type="button">+ 添加对白</button>
        </div>
        <div class="tp-dialogue-canvas" id="tpDialogueCanvas">
          ${sampleDialogues.map((sd) => `
            <div class="tp-dialogue-scene-divider">${escapeHtml(sd.stageTitle)}</div>
            ${sd.lines.map((line) => {
              const charName = allChars.find((c) => c.characterId === line.speaker)?.name || line.speaker;
              const isNarrator = line.speaker === "narrator";
              return `<div class="tp-dialogue-bubble ${isNarrator ? "narrator" : "character"}">
                <div class="tp-bubble-speaker">${escapeHtml(charName)}</div>
                <div class="tp-bubble-text" contenteditable="true">${escapeHtml(line.text)}</div>
                <div class="tp-bubble-actions">
                  <button class="tp-bubble-btn" type="button" title="删除">${svg("close", 14)}</button>
                  <button class="tp-bubble-btn" type="button" title="上移">${svg("arrow-up", 14)}</button>
                  <button class="tp-bubble-btn" type="button" title="下移">${svg("arrow-down", 14)}</button>
                </div>
              </div>`;
            }).join("")}
          `).join("")}
        </div>
        <div class="tp-dialogue-input-row">
          <textarea class="tp-textarea" id="tpDialogueInput" placeholder="在这里输入对白内容…" rows="2"></textarea>
          <button class="tp-btn" id="tpInsertLine" type="button">插入</button>
        </div>
      </section>
    </div>
  `;
}

/* ── 4. Ending Config ── */
function buildEndingConfig(pack) {
  const endings = pack.endings || {};
  const ENDING_STYLES = {
    good: { color: "#5cb85c", label: "好结局" },
    normal: { color: "#5bc0de", label: "普通结局" },
    bad: { color: "#e74c3c", label: "坏结局" },
    hidden: { color: "#f0ad4e", label: "隐藏结局" }
  };
  const clues = Object.values(pack.clueLibrary || {});

  return `
    <div class="tp-ending-grid">
      ${ENDING_ORDER.map((eid) => {
        const ending = endings[eid];
        if (!ending) return "";
        const style = ENDING_STYLES[eid] || { color: "#999", label: eid };
        return `<article class="tp-ending-card" style="--ending-color: ${style.color}">
          <div class="tp-ending-header">
            <span class="tp-ending-badge">${escapeHtml(style.label)}</span>
            <span class="tp-ending-code">${escapeHtml(ending.code)}</span>
          </div>
          <h3 class="tp-ending-title">${escapeHtml(ending.title)}</h3>
          <p class="tp-ending-subtitle">${escapeHtml(ending.subtitle)}</p>
          <div class="tp-ending-conditions">
            <div class="tp-section-title">触发条件</div>
            ${(ending.conditions || []).map((cond) => `
              <div class="tp-condition-row">
                <input class="tp-input tp-input-sm" type="text" value="${escapeHtml(cond.label)}" />
                <input class="tp-input tp-input-sm" type="text" value="${escapeHtml(cond.value)}" />
                <button class="tp-btn-icon" type="button" title="删除">${svg("close", 14)}</button>
              </div>
            `).join("")}
            <button class="tp-btn tp-btn-secondary tp-btn-sm" type="button">+ 添加条件</button>
          </div>
          <div class="tp-ending-flags">
            <div class="tp-section-title">关联线索</div>
            <div class="tp-flag-chips">
              ${clues.map((c) => `<label class="tp-flag-chip">
                <input type="checkbox" ${Math.random() > 0.5 ? "checked" : ""} />
                <span>${escapeHtml(c.title)}</span>
              </label>`).join("")}
            </div>
          </div>
        </article>`;
      }).join("")}
    </div>
    <div class="tp-ending-variables">
      <h4 class="tp-section-title">全局变量阈值</h4>
      <div class="tp-var-grid">
        ${[
          { key: "affinity", label: "好感度", thresholds: ["< 30 → 坏结局", "30-67 → 普通", "≥ 68 → 好结局"] },
          { key: "trust", label: "信任值", thresholds: ["< 25 → 坏结局", "25-61 → 普通", "≥ 62 → 好结局"] },
          { key: "alertness", label: "警觉度", thresholds: ["> 80 → 坏结局", "40-80 → 中立", "< 40 → 安全"] }
        ].map((v) => `<div class="tp-var-card">
          <div class="tp-var-title">${v.label}</div>
          <div class="tp-var-rules">
            ${v.thresholds.map((t) => `<div class="tp-var-rule">${escapeHtml(t)}</div>`).join("")}
          </div>
          <div class="tp-var-slider-row">
            <input class="tp-slider" type="range" min="0" max="100" value="50" style="--slider-color: var(--gold-main)" />
            <span class="tp-slider-value">50</span>
          </div>
        </div>`).join("")}
      </div>
    </div>
  `;
}

/* ── 5. Script Tester ── */
function buildScriptTester(pack) {
  const stages = Object.entries(pack.stages || {});
  const chars = Object.values(pack.initialCharacters || {});

  return `
    <div class="tp-tester-layout">
      <aside class="tp-tester-sidebar">
        <div class="tp-section-title">模拟状态</div>
        <div class="tp-tester-state" id="tpTesterState">
          ${chars.map((c) => `<div class="tp-tester-char-stat">
            <div class="tp-tester-char-name">${escapeHtml(c.name)}</div>
            <div class="tp-mini-bars">
              <div class="tp-mini-bar"><span class="tp-mini-label">好感</span><div class="tp-mini-track"><div class="tp-mini-fill" style="width:${c.affinity}%; background:#e8a87c"></div></div><span class="tp-mini-val" data-stat="${c.characterId}-affinity">${c.affinity}</span></div>
              <div class="tp-mini-bar"><span class="tp-mini-label">信任</span><div class="tp-mini-track"><div class="tp-mini-fill" style="width:${c.trust}%; background:#85cdca"></div></div><span class="tp-mini-val" data-stat="${c.characterId}-trust">${c.trust}</span></div>
              <div class="tp-mini-bar"><span class="tp-mini-label">警觉</span><div class="tp-mini-track"><div class="tp-mini-fill" style="width:${c.alertness}%; background:#d291bc"></div></div><span class="tp-mini-val" data-stat="${c.characterId}-alertness">${c.alertness}</span></div>
            </div>
          </div>`).join("")}
          <div class="tp-tester-flags">
            <div class="tp-section-title" style="margin-top:12px">已触发标记</div>
            <div class="tp-flag-list" id="tpFlagList"><span class="tp-flag-empty">尚未触发任何标记</span></div>
          </div>
          <div class="tp-tester-clues">
            <div class="tp-section-title" style="margin-top:12px">已解锁线索</div>
            <div class="tp-clue-list" id="tpClueList"><span class="tp-flag-empty">尚未解锁线索</span></div>
          </div>
        </div>
        <button class="tp-btn tp-btn-secondary" id="tpResetTest" type="button" style="margin-top:12px;width:100%">重置测试</button>
      </aside>
      <section class="tp-tester-main">
        <div class="tp-tester-log" id="tpTesterLog">
          <div class="tp-tester-entry tp-entry-system">测试模式已就绪 — 选择下方节点开始模拟</div>
        </div>
        <div class="tp-tester-stages">
          ${stages.map(([stageId, stage], idx) => `
            <div class="tp-tester-stage" data-test-stage="${stageId}">
              <div class="tp-tester-stage-header">
                <span class="tp-tester-stage-idx">${idx + 1}</span>
                <span class="tp-tester-stage-title">${escapeHtml(stage.title || stageId)}</span>
                ${stage.isCheckpoint ? '<span class="tp-branch-checkpoint-badge">存档</span>' : ""}
              </div>
              ${(stage.choices || []).length ? `
                <div class="tp-tester-choices">
                  ${stage.choices.map((ch) => `<button class="tp-tester-choice-btn" type="button" data-test-stage="${stageId}" data-test-choice="${ch.id}">
                    <span class="tp-choice-label">${escapeHtml(ch.label)}</span>
                    <span class="tp-choice-hint">${escapeHtml(ch.intent || "")}</span>
                  </button>`).join("")}
                </div>
              ` : ""}
            </div>
          `).join("")}
        </div>
      </section>
    </div>
  `;
}

/* ── 6. Data Dashboard ── */
function buildDataDashboard(pack) {
  const stages = Object.entries(pack.stages || {});
  const endingNames = { good: "好结局", normal: "普通结局", bad: "坏结局", hidden: "隐藏结局" };

  // Generate mock analytics data
  const totalPlays = 48200;
  const avgDuration = "4h 12m";
  const completionRate = 67;
  const endingDistribution = { good: 34, normal: 28, bad: 22, hidden: 16 };
  const choiceDistribution = stages.map(([stageId, stage]) => ({
    stageTitle: stage.title || stageId,
    choices: (stage.choices || []).map((ch) => ({
      label: ch.label,
      percentage: Math.round(Math.random() * 40 + 15)
    }))
  }));

  return `
    <div class="tp-dash-stats">
      <div class="tp-dash-stat-card">
        <div class="tp-dash-stat-value">${totalPlays.toLocaleString()}</div>
        <div class="tp-dash-stat-label">总游玩次数</div>
        <div class="tp-dash-stat-trend trend-up">${svg("arrow-up", 14)} 12.3% 较上周</div>
      </div>
      <div class="tp-dash-stat-card">
        <div class="tp-dash-stat-value">${avgDuration}</div>
        <div class="tp-dash-stat-label">平均游戏时长</div>
        <div class="tp-dash-stat-trend trend-same">— 持平</div>
      </div>
      <div class="tp-dash-stat-card">
        <div class="tp-dash-stat-value">${completionRate}%</div>
        <div class="tp-dash-stat-label">通关完成率</div>
        <div class="tp-dash-stat-trend trend-up">${svg("arrow-up", 14)} 3.1%</div>
      </div>
      <div class="tp-dash-stat-card">
        <div class="tp-dash-stat-value">${Object.keys(pack.endings || {}).length}</div>
        <div class="tp-dash-stat-label">可达结局数</div>
        <div class="tp-dash-stat-trend trend-same">—</div>
      </div>
    </div>

    <div class="tp-dash-panels">
      <section class="tp-dash-panel">
        <h4 class="tp-section-title">结局分布</h4>
        <div class="tp-dash-ending-bars">
          ${ENDING_ORDER.map((eid) => {
            const pct = endingDistribution[eid] || 0;
            const colors = { good: "#5cb85c", normal: "#5bc0de", bad: "#e74c3c", hidden: "#f0ad4e" };
            return `<div class="tp-dash-bar-row">
              <span class="tp-dash-bar-label">${escapeHtml(endingNames[eid] || eid)}</span>
              <div class="tp-dash-bar-track">
                <div class="tp-dash-bar-fill" style="width:${pct}%; background:${colors[eid] || "#999"}"></div>
              </div>
              <span class="tp-dash-bar-value">${pct}%</span>
            </div>`;
          }).join("")}
        </div>
      </section>

      <section class="tp-dash-panel">
        <h4 class="tp-section-title">各节点选择倾向</h4>
        <div class="tp-dash-choice-stats">
          ${choiceDistribution.map((stage) => `
            <div class="tp-dash-stage-row">
              <div class="tp-dash-stage-name">${escapeHtml(stage.stageTitle)}</div>
              <div class="tp-dash-choice-bars">
                ${stage.choices.map((ch) => `<div class="tp-dash-choice-row">
                  <span class="tp-dash-choice-label">${escapeHtml(ch.label)}</span>
                  <div class="tp-dash-bar-track small">
                    <div class="tp-dash-bar-fill" style="width:${ch.percentage}%; background:var(--gold-main)"></div>
                  </div>
                  <span class="tp-dash-bar-value">${ch.percentage}%</span>
                </div>`).join("")}
              </div>
            </div>
          `).join("")}
        </div>
      </section>
    </div>

    <div class="tp-dash-panels">
      <section class="tp-dash-panel">
        <h4 class="tp-section-title">玩家留存曲线</h4>
        <div class="tp-dash-retention">
          ${["第1幕", "第2幕", "第3幕", "第4幕", "第5幕"].map((label, i) => {
            const pct = [100, 87, 72, 65, 58][i];
            return `<div class="tp-dash-retention-step">
              <div class="tp-retention-bar-col">
                <div class="tp-retention-bar" style="height:${pct}%"></div>
              </div>
              <span class="tp-retention-label">${label}</span>
              <span class="tp-retention-value">${pct}%</span>
            </div>`;
          }).join("")}
        </div>
      </section>

      <section class="tp-dash-panel">
        <h4 class="tp-section-title">热门路径</h4>
        <div class="tp-dash-paths">
          ${[
            { path: "诚实 → 合作 → 坦白 → 保护 → 誓约", ending: "好结局", pct: 34 },
            { path: "诚实 → 守备 → 回避 → 真相 → 漫游", ending: "普通结局", pct: 28 },
            { path: "回避 → 施压 → 交出 → 离开 → 背叛", ending: "坏结局", pct: 22 },
            { path: "追问 → 合作 → 坦白 → 真相 → 漫游", ending: "隐藏结局", pct: 16 }
          ].map((p, i) => `<div class="tp-dash-path-row">
            <span class="tp-dash-path-rank">#${i + 1}</span>
            <div class="tp-dash-path-body">
              <div class="tp-dash-path-trail">${escapeHtml(p.path)}</div>
              <div class="tp-dash-path-ending">${escapeHtml(p.ending)} · ${p.pct}% 玩家</div>
            </div>
          </div>`).join("")}
        </div>
      </section>
    </div>
  `;
}

/* ── Tool interactions ── */
function bindToolInteractions(elements, toolId, pack) {
  const body = elements.toolPanelBody;

  // Character tab switching
  if (toolId === "character-editor") {
    body.addEventListener("click", (e) => {
      const tab = e.target.closest(".tp-char-tab:not(.tp-char-add)");
      if (tab) {
        body.querySelectorAll(".tp-char-tab").forEach((t) => t.classList.remove("active"));
        body.querySelectorAll(".tp-char-panel").forEach((p) => p.classList.remove("active"));
        tab.classList.add("active");
        const panel = body.querySelector(`[data-char-panel="${tab.dataset.charIdx}"]`);
        if (panel) panel.classList.add("active");
      }
    });
    // Slider live update
    body.addEventListener("input", (e) => {
      if (e.target.classList.contains("tp-slider")) {
        const row = e.target.closest(".tp-slider-row");
        const valueEl = row?.querySelector(".tp-slider-value");
        if (valueEl) valueEl.textContent = e.target.value;
      }
    });
  }

  // Dialogue writer
  if (toolId === "dialogue-writer") {
    const canvas = body.querySelector("#tpDialogueCanvas");
    const input = body.querySelector("#tpDialogueInput");
    const speakerSel = body.querySelector("#tpDialogueSpeaker");
    const moodSel = body.querySelector("#tpDialogueMood");
    const insertBtn = body.querySelector("#tpInsertLine");
    const addLineBtn = body.querySelector("#tpAddLine");

    const insertLine = () => {
      const text = input?.value?.trim();
      if (!text || !canvas) return;
      const speaker = speakerSel?.value || "narrator";
      const mood = moodSel?.value || "";
      const chars = Object.values(pack.initialCharacters || {});
      const allChars = [
        { characterId: "narrator", name: "旁白" },
        { characterId: "player", name: "主角" },
        ...chars
      ];
      const charName = allChars.find((c) => c.characterId === speaker)?.name || speaker;
      const isNarrator = speaker === "narrator";
      const moodTag = mood ? ` [${mood}]` : "";
      const bubble = document.createElement("div");
      bubble.className = `tp-dialogue-bubble ${isNarrator ? "narrator" : "character"}`;
      bubble.innerHTML = `
        <div class="tp-bubble-speaker">${escapeHtml(charName)}${escapeHtml(moodTag)}</div>
        <div class="tp-bubble-text" contenteditable="true">${escapeHtml(text)}</div>
        <div class="tp-bubble-actions">
          <button class="tp-bubble-btn" type="button" title="删除">${svg("close", 14)}</button>
          <button class="tp-bubble-btn" type="button" title="上移">${svg("arrow-up", 14)}</button>
          <button class="tp-bubble-btn" type="button" title="下移">${svg("arrow-down", 14)}</button>
        </div>`;
      canvas.appendChild(bubble);
      input.value = "";
      canvas.scrollTop = canvas.scrollHeight;
    };

    insertBtn?.addEventListener("click", insertLine);
    addLineBtn?.addEventListener("click", insertLine);

    // Mood tag click
    body.querySelectorAll(".tp-mood-tag").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (moodSel) moodSel.value = btn.textContent;
      });
    });

    // Tone tag click
    body.querySelectorAll(".tp-tone-tag").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (input) input.value += `（${btn.textContent}）`;
        input?.focus();
      });
    });

    // Bubble actions
    canvas?.addEventListener("click", (e) => {
      const btn = e.target.closest(".tp-bubble-btn");
      if (!btn) return;
      const bubble = btn.closest(".tp-dialogue-bubble");
      if (!bubble) return;
      if (btn.title === "删除") bubble.remove();
      if (btn.title === "上移" && bubble.previousElementSibling) {
        bubble.parentNode.insertBefore(bubble, bubble.previousElementSibling);
      }
      if (btn.title === "下移" && bubble.nextElementSibling) {
        bubble.parentNode.insertBefore(bubble.nextElementSibling, bubble);
      }
    });
  }

  // Script tester
  if (toolId === "script-tester") {
    const log = body.querySelector("#tpTesterLog");
    const flagList = body.querySelector("#tpFlagList");
    const clueList = body.querySelector("#tpClueList");

    // Deep copy initial character stats
    const simState = {
      chars: {},
      flags: new Set(),
      clues: new Set()
    };
    for (const c of Object.values(pack.initialCharacters || {})) {
      simState.chars[c.characterId] = { affinity: c.affinity, trust: c.trust, alertness: c.alertness };
    }

    function updateStatDisplay() {
      for (const [cid, stats] of Object.entries(simState.chars)) {
        for (const [attr, val] of Object.entries(stats)) {
          const el = body.querySelector(`[data-stat="${cid}-${attr}"]`);
          if (el) {
            el.textContent = val;
            const fill = el.closest(".tp-mini-bar")?.querySelector(".tp-mini-fill");
            if (fill) fill.style.width = val + "%";
          }
        }
      }
      flagList.innerHTML = simState.flags.size
        ? [...simState.flags].map((f) => `<span class="tp-flag-tag">${escapeHtml(f)}</span>`).join("")
        : '<span class="tp-flag-empty">尚未触发任何标记</span>';
      clueList.innerHTML = simState.clues.size
        ? [...simState.clues].map((c) => {
            const clue = pack.clueLibrary?.[c];
            return `<span class="tp-clue-tag">${escapeHtml(clue?.title || c)}</span>`;
          }).join("")
        : '<span class="tp-flag-empty">尚未解锁线索</span>';
    }

    body.addEventListener("click", (e) => {
      const choiceBtn = e.target.closest(".tp-tester-choice-btn");
      if (!choiceBtn) return;
      const stageId = choiceBtn.dataset.testStage;
      const choiceId = choiceBtn.dataset.testChoice;
      const stage = pack.stages?.[stageId];
      if (!stage) return;
      const choice = stage.choices?.find((c) => c.id === choiceId);
      if (!choice) return;

      // Apply effects
      if (choice.effects) {
        for (const [cid, eff] of Object.entries(choice.effects)) {
          if (!simState.chars[cid]) continue;
          for (const [attr, delta] of Object.entries(eff)) {
            simState.chars[cid][attr] = Math.max(0, Math.min(100, (simState.chars[cid][attr] || 0) + delta));
          }
        }
      }
      if (choice.flagsOn) choice.flagsOn.forEach((f) => simState.flags.add(f));
      if (choice.unlockClues) choice.unlockClues.forEach((c) => simState.clues.add(c));

      // Log entry
      const entry = document.createElement("div");
      entry.className = "tp-tester-entry tp-entry-choice";
      const effectSummary = choice.effects
        ? Object.entries(choice.effects).flatMap(([cid, eff]) => Object.entries(eff).map(([attr, val]) => `${cid}.${attr} ${val > 0 ? "+" : ""}${val}`)).join(", ")
        : "";
      entry.innerHTML = `
        <div class="tp-entry-label">阶段: ${escapeHtml(stage.title || stageId)} → 选择: ${escapeHtml(choice.label)}</div>
        ${choice.summary ? `<div class="tp-entry-summary">${escapeHtml(choice.summary)}</div>` : ""}
        ${effectSummary ? `<div class="tp-entry-effects">${escapeHtml(effectSummary)}</div>` : ""}
        ${choice.ending ? `<div class="tp-entry-ending">${svg("flag", 14)} 触发结局判定</div>` : ""}
        ${choice.nextStageId ? `<div class="tp-entry-next">→ 下一阶段: ${escapeHtml(choice.nextStageId)}</div>` : ""}
      `;
      log.appendChild(entry);
      log.scrollTop = log.scrollHeight;

      updateStatDisplay();
    });

    // Reset
    body.querySelector("#tpResetTest")?.addEventListener("click", () => {
      for (const c of Object.values(pack.initialCharacters || {})) {
        simState.chars[c.characterId] = { affinity: c.affinity, trust: c.trust, alertness: c.alertness };
      }
      simState.flags.clear();
      simState.clues.clear();
      updateStatDisplay();
      log.innerHTML = '<div class="tp-tester-entry tp-entry-system">测试已重置 — 所有状态恢复至初始值</div>';
    });
  }

  // Ending config & data dashboard sliders
  if (toolId === "ending-config" || toolId === "data-dashboard") {
    body.addEventListener("input", (e) => {
      if (e.target.classList.contains("tp-slider")) {
        const row = e.target.closest(".tp-var-slider-row") || e.target.closest(".tp-slider-row");
        const valueEl = row?.querySelector(".tp-slider-value");
        if (valueEl) valueEl.textContent = e.target.value;
      }
    });
  }
}

/* ══════════════════════════════════════════════════
   Draft Interactions
   ══════════════════════════════════════════════════ */

function timeAgo(dateStr) {
  if (!dateStr) return "刚刚";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "刚刚";
  if (mins < 60) return mins + " 分钟前";
  const hours = Math.floor(mins / 60);
  if (hours < 24) return hours + " 小时前";
  const days = Math.floor(hours / 24);
  if (days < 30) return days + " 天前";
  return new Date(dateStr).toLocaleDateString("zh-CN");
}

function showNewDraftModal(elements, meta, savedState, selectedStoryId, prefill = {}) {
  /* remove old modal if exists */
  document.querySelector(".draft-modal-overlay")?.remove();

  const overlay = document.createElement("div");
  overlay.className = "draft-modal-overlay open";
  overlay.innerHTML = `
    <div class="draft-modal">
      <div class="draft-modal-header">
        <h2 class="draft-modal-title">${prefill.templateId ? svg("clipboard", 20) + " 基于模板创建" : svg("character-editor", 20) + " 新建草稿"}</h2>
        <button class="tool-panel-close draft-modal-close-btn" type="button" aria-label="关闭">${svg("close", 18)}</button>
      </div>
      <div class="draft-modal-body">
        ${prefill.templateId ? `<div class="draft-modal-tpl-badge">模板: ${escapeHtml(prefill.templateTitle || "")}</div>` : ""}
        <label class="draft-modal-label">
          项目名称
          <input class="draft-modal-input" id="draftModalTitle" type="text" value="${escapeHtml(prefill.title || "")}" placeholder="给你的故事起个名字…" maxlength="50" autofocus />
        </label>
        <label class="draft-modal-label">
          类型
          <select class="draft-modal-select" id="draftModalGenre">
            ${["原创", "悬疑", "恋爱", "都市", "科幻", "奇幻", "惊悚", "其他"].map((g) => `<option value="${g}" ${g === (prefill.genre || "原创") ? "selected" : ""}>${g}</option>`).join("")}
          </select>
        </label>
        <label class="draft-modal-label">
          简介 <span class="draft-modal-hint">(可选)</span>
          <textarea class="draft-modal-textarea" id="draftModalDesc" placeholder="简单描述你的故事构想…" rows="3" maxlength="200">${escapeHtml(prefill.desc || "")}</textarea>
        </label>
        ${prefill.chapters ? `
        <div class="draft-modal-preview">
          <div class="draft-modal-preview-title">模板预设内容</div>
          <div class="draft-modal-preview-stats">
            <span>${svg("book", 14)} ${prefill.chapters.length} 章节</span>
            <span>${svg("user", 14)} ${(prefill.characters || []).length} 角色</span>
            <span>${svg("target", 14)} ${(prefill.endings || []).length} 结局</span>
            <span>${svg("settings", 14)} ${(prefill.mechanics || []).length} 机制</span>
          </div>
        </div>` : ""}
      </div>
      <div class="draft-modal-footer">
        <button class="draft-modal-cancel-btn" type="button">取消</button>
        <button class="draft-modal-confirm-btn" type="button">${svg("check", 16)} 创建项目</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  document.body.style.overflow = "hidden";

  const titleInput = overlay.querySelector("#draftModalTitle");
  const genreSelect = overlay.querySelector("#draftModalGenre");
  const descArea = overlay.querySelector("#draftModalDesc");

  requestAnimationFrame(() => titleInput?.focus());

  const close = () => { overlay.classList.remove("open"); document.body.style.overflow = ""; setTimeout(() => overlay.remove(), 300); };

  overlay.querySelector(".draft-modal-close-btn").addEventListener("click", close);
  overlay.querySelector(".draft-modal-cancel-btn").addEventListener("click", close);
  overlay.addEventListener("click", (e) => { if (e.target === overlay) close(); });

  overlay.querySelector(".draft-modal-confirm-btn").addEventListener("click", () => {
    const title = titleInput.value.trim() || "未命名草稿";
    const genre = genreSelect.value;
    const desc = descArea.value.trim();
    createDraft({
      title,
      genre,
      desc,
      templateId: prefill.templateId || null,
      templateTitle: prefill.templateTitle || null,
      chapters: prefill.chapters || [],
      characters: prefill.characters || [],
      endings: prefill.endings || [],
      mechanics: prefill.mechanics || []
    });
    close();
    showStudioToast(`${svg("check", 16)} 已创建项目「${escapeHtml(title)}」`);
    renderStudioScreen(elements, meta, savedState, selectedStoryId);
  });
}

function showDraftDetailModal(elements, draft, meta, savedState, selectedStoryId) {
  document.querySelector(".draft-modal-overlay")?.remove();

  const overlay = document.createElement("div");
  overlay.className = "draft-modal-overlay open";
  overlay.innerHTML = `
    <div class="draft-modal draft-modal-lg">
      <div class="draft-modal-header">
        <h2 class="draft-modal-title">${svg("file", 20)} ${escapeHtml(draft.title)}</h2>
        <button class="tool-panel-close draft-modal-close-btn" type="button" aria-label="关闭">${svg("close", 18)}</button>
      </div>
      <div class="draft-modal-body">
        <div class="draft-detail-meta">
          <span class="draft-detail-genre">${escapeHtml(draft.genre)}</span>
          ${draft.templateTitle ? `<span class="draft-detail-from">基于 ${escapeHtml(draft.templateTitle)}</span>` : ""}
          <span class="draft-detail-time">创建于 ${new Date(draft.createdAt).toLocaleDateString("zh-CN")} · 更新 ${timeAgo(draft.updatedAt)}</span>
        </div>
        ${draft.desc ? `<p class="draft-detail-desc">${escapeHtml(draft.desc)}</p>` : ""}

        <div class="draft-detail-sections">
          <div class="draft-detail-section">
            <h3 class="draft-detail-section-title">${svg("book", 16)} 章节结构 <span class="draft-detail-count">${draft.chapters.length}</span></h3>
            ${draft.chapters.length > 0
              ? `<div class="draft-detail-chapter-list">${draft.chapters.map((ch, i) => `
                  <div class="draft-detail-chapter">
                    <span class="draft-detail-ch-num">第 ${i + 1} 章</span>
                    <span class="draft-detail-ch-title">${escapeHtml(ch.title)}</span>
                    <span class="draft-detail-ch-type">${escapeHtml(ch.type || "")}</span>
                  </div>`).join("")}</div>`
              : '<div class="draft-detail-empty">尚未添加章节</div>'}
          </div>

          <div class="draft-detail-section">
            <h3 class="draft-detail-section-title">${svg("user", 16)} 角色 <span class="draft-detail-count">${draft.characters.length}</span></h3>
            ${draft.characters.length > 0
              ? `<div class="draft-detail-char-list">${draft.characters.map((c) => `
                  <div class="draft-detail-char">
                    <div class="draft-detail-char-avatar">${escapeHtml(c.name[0])}</div>
                    <div>
                      <div class="draft-detail-char-name">${escapeHtml(c.name)}</div>
                      <div class="draft-detail-char-role">${escapeHtml(c.role || "")}</div>
                    </div>
                  </div>`).join("")}</div>`
              : '<div class="draft-detail-empty">尚未添加角色</div>'}
          </div>

          <div class="draft-detail-section">
            <h3 class="draft-detail-section-title">${svg("target", 16)} 结局 <span class="draft-detail-count">${draft.endings.length}</span></h3>
            ${draft.endings.length > 0
              ? `<div class="draft-detail-ending-list">${draft.endings.map((e) => `
                  <div class="draft-detail-ending">
                    <span class="draft-detail-ending-type" style="color:${{"good":"#5cb85c","normal":"#f0ad4e","bad":"#e74c3c","hidden":"#9b59b6"}[e.type] || "#d0aa7a"}">${escapeHtml({"good":"好结局","normal":"普通结局","bad":"坏结局","hidden":"隐藏结局"}[e.type] || e.type)}</span>
                    <span class="draft-detail-ending-title">${escapeHtml(e.title)}</span>
                  </div>`).join("")}</div>`
              : '<div class="draft-detail-empty">尚未设计结局</div>'}
          </div>

          ${draft.mechanics.length > 0 ? `
          <div class="draft-detail-section">
            <h3 class="draft-detail-section-title">${svg("settings", 16)} 核心机制 <span class="draft-detail-count">${draft.mechanics.length}</span></h3>
            <div class="draft-detail-mech-list">${draft.mechanics.map((m) => `
              <div class="draft-detail-mech">
                <span class="draft-detail-mech-icon">${m.icon || svg("settings", 16)}</span>
                <div>
                  <div class="draft-detail-mech-name">${escapeHtml(m.name)}</div>
                  <div class="draft-detail-mech-desc">${escapeHtml(m.desc)}</div>
                </div>
              </div>`).join("")}</div>
          </div>` : ""}
        </div>

        <div class="draft-detail-edit-section">
          <label class="draft-modal-label">
            项目名称
            <input class="draft-modal-input" id="draftEditTitle" type="text" value="${escapeHtml(draft.title)}" maxlength="50" />
          </label>
          <label class="draft-modal-label">
            简介
            <textarea class="draft-modal-textarea" id="draftEditDesc" rows="2" maxlength="200">${escapeHtml(draft.desc || "")}</textarea>
          </label>
        </div>
      </div>
      <div class="draft-modal-footer">
        <button class="draft-modal-delete-btn" type="button" data-draft-del="${draft.id}">${svg("trash", 14)} 删除草稿</button>
        <div style="flex:1"></div>
        <button class="draft-modal-cancel-btn" type="button">关闭</button>
        <button class="draft-modal-confirm-btn" type="button">${svg("save", 16)} 保存修改</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  document.body.style.overflow = "hidden";

  const close = () => { overlay.classList.remove("open"); document.body.style.overflow = ""; setTimeout(() => overlay.remove(), 300); };

  overlay.querySelector(".draft-modal-close-btn").addEventListener("click", close);
  overlay.querySelector(".draft-modal-cancel-btn").addEventListener("click", close);
  overlay.addEventListener("click", (e) => { if (e.target === overlay) close(); });

  overlay.querySelector(".draft-modal-confirm-btn").addEventListener("click", () => {
    const newTitle = overlay.querySelector("#draftEditTitle").value.trim();
    const newDesc = overlay.querySelector("#draftEditDesc").value.trim();
    if (newTitle) renameDraft(draft.id, newTitle);
    const drafts = loadUserDrafts();
    const d = drafts.find((x) => x.id === draft.id);
    if (d) { d.desc = newDesc; d.updatedAt = new Date().toISOString(); saveUserDrafts(drafts); }
    close();
    showStudioToast(`${svg("save", 16)} 已保存修改`);
    renderStudioScreen(elements, meta, savedState, selectedStoryId);
  });

  overlay.querySelector(".draft-modal-delete-btn").addEventListener("click", () => {
    if (!confirm("确定要删除草稿「" + draft.title + "」吗？此操作不可撤销。")) return;
    deleteDraft(draft.id);
    close();
    showStudioToast(`${svg("trash", 16)} 已删除草稿`);
    renderStudioScreen(elements, meta, savedState, selectedStoryId);
  });
}

function showStudioToast(msg) {
  const toast = document.createElement("div");
  toast.className = "tpl-toast";
  toast.innerHTML = msg;
  document.body.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add("show"));
  setTimeout(() => { toast.classList.remove("show"); setTimeout(() => toast.remove(), 300); }, 2800);
}

function bindDraftInteractions(elements, meta, savedState, selectedStoryId) {
  const list = elements.studioDraftList;
  const newBtn = list?.parentElement?.querySelector(".studio-new-draft-btn");

  /* New draft button */
  if (newBtn && !newBtn._bound) {
    newBtn._bound = true;
    newBtn.addEventListener("click", () => {
      showNewDraftModal(elements, meta, savedState, selectedStoryId);
    });
  }

  /* Draft card clicks */
  if (list && !list._draftBound) {
    list._draftBound = true;
    list.addEventListener("click", (e) => {
      /* action buttons */
      const actionBtn = e.target.closest("[data-draft-action]");
      if (actionBtn) {
        const action = actionBtn.dataset.draftAction;
        const id = actionBtn.dataset.draftTarget;
        const draft = loadUserDrafts().find((d) => d.id === id);
        if (!draft) return;
        if (action === "delete") {
          if (!confirm("确定要删除草稿「" + draft.title + "」吗？")) return;
          deleteDraft(id);
          showStudioToast(`${svg("trash", 16)} 已删除草稿`);
          renderStudioScreen(elements, meta, savedState, selectedStoryId);
        } else if (action === "edit") {
          showDraftDetailModal(elements, draft, meta, savedState, selectedStoryId);
        }
        return;
      }

      /* click on card → open detail for user drafts */
      const card = e.target.closest(".draft-card");
      if (!card) return;
      const isBuiltin = card.dataset.builtin === "true";
      if (!isBuiltin) {
        const draft = loadUserDrafts().find((d) => d.id === card.dataset.draftId);
        if (draft) showDraftDetailModal(elements, draft, meta, savedState, selectedStoryId);
      }
    });
  }
}

/* ══════════════════════════════════════════════════
   Template Gallery — Data & Rendering
   ══════════════════════════════════════════════════ */

const TEMPLATE_DATA = [
  {
    id: "mystery",
    icon: svg("mystery", 48),
    title: "悬疑推理模板",
    category: "悬疑",
    difficulty: 4,
    popularity: 9200,
    updated: "2026-03-28",
    author: "谜语官方",
    authorAvatar: "谜",
    uses: 3420,
    rating: 4.8,
    desc: "适合线索导向、多重真相揭露的叙事结构。包含信任/怀疑双轴系统。",
    tags: ["悬疑", "推理", "线索"],
    cover: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
    synopsis: "玩家扮演调查者，在迷雾中追查真相。通过收集线索、审问证人、分析矛盾来揭开隐藏的秘密。信任与怀疑的天平将决定最终走向。",
    features: ["线索收集系统", "信任/怀疑双轴", "多重真相分支", "证据锁定机制", "NPC 记忆联动"],
    structure: {
      chapters: 5,
      endings: 4,
      characters: 3,
      branches: 12,
      outline: [
        { ch: 1, title: "迷雾降临", type: "intro", desc: "建立场景与初始人物关系" },
        { ch: 2, title: "线索浮现", type: "explore", desc: "自由收集线索，建立信任" },
        { ch: 3, title: "真假交错", type: "conflict", desc: "第一次重大抉择，分支产生" },
        { ch: 4, title: "深渊凝视", type: "climax", desc: "核心秘密揭露，信任考验" },
        { ch: 5, title: "终局审判", type: "resolution", desc: "根据积累走向四种结局" }
      ]
    },
    sampleCharacters: [
      { name: "调查者（玩家）", role: "protagonist", traits: "理性 · 警觉 · 正义感" },
      { name: "关键 NPC · 线人", role: "ally", traits: "神秘 · 多疑 · 知情者" },
      { name: "幕后主谋", role: "antagonist", traits: "冷静 · 伪善 · 操控欲" }
    ],
    sampleEndings: [
      { type: "good", title: "真相之光", condition: "信任 ≥ 68, 关键线索齐全" },
      { type: "normal", title: "携秘而去", condition: "信任 ≥ 42, 部分线索" },
      { type: "bad", title: "迷雾吞噬", condition: "怀疑 ≥ 78 或 信任 ≤ 28" },
      { type: "hidden", title: "第二层真相", condition: "全线索 + 隐藏旗标" }
    ],
    mechanics: [
      { name: "线索系统", icon: svg("search-plus", 20), desc: "5 条核心线索，收集进度影响对话选项和结局路径" },
      { name: "信任/怀疑双轴", icon: svg("scale", 20), desc: "独立追踪信任值与警觉值，两者并非简单反比关系" },
      { name: "记忆联动", icon: svg("brain", 20), desc: "NPC 记住玩家过去的选择，影响后续对话态度" }
    ]
  },
  {
    id: "romance",
    icon: svg("romance", 48),
    title: "校园恋爱模板",
    category: "恋爱",
    difficulty: 2,
    popularity: 12500,
    updated: "2026-04-05",
    author: "谜语官方",
    authorAvatar: "谜",
    uses: 5180,
    rating: 4.9,
    desc: "以好感度和事件触发为核心，适合轻量级情感向剧本。",
    tags: ["恋爱", "校园", "日常"],
    cover: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 50%, #f8a4c8 100%)",
    synopsis: "在校园日常中，通过对话、事件选择和陪伴逐步提升好感度。不同的选择路径将通向截然不同的情感结局——告白、暧昧、错过或意外发现。",
    features: ["好感度追踪", "日常事件系统", "约会场景", "告白时机判定", "多角色可攻略"],
    structure: {
      chapters: 5,
      endings: 4,
      characters: 4,
      branches: 15,
      outline: [
        { ch: 1, title: "偶然相遇", type: "intro", desc: "校园场景建立，角色初登场" },
        { ch: 2, title: "渐渐熟悉", type: "explore", desc: "日常互动，好感度积累" },
        { ch: 3, title: "心意动摇", type: "conflict", desc: "误会或竞争者出现" },
        { ch: 4, title: "雨中真心", type: "climax", desc: "关键告白/错过时刻" },
        { ch: 5, title: "未来之约", type: "resolution", desc: "收束感情线，走向结局" }
      ]
    },
    sampleCharacters: [
      { name: "主角（玩家）", role: "protagonist", traits: "温柔 · 犹豫 · 善良" },
      { name: "学长 / 学姐", role: "love-interest", traits: "开朗 · 体贴 · 有秘密" },
      { name: "青梅竹马", role: "rival", traits: "率直 · 不坦诚 · 占有欲" },
      { name: "转校生", role: "wildcard", traits: "神秘 · 冷淡 · 温柔反差" }
    ],
    sampleEndings: [
      { type: "good", title: "双向奔赴", condition: "好感 ≥ 80, 告白成功" },
      { type: "normal", title: "暧昧未满", condition: "好感 50–79, 未告白" },
      { type: "bad", title: "渐行渐远", condition: "好感 ≤ 30 或关键事件失败" },
      { type: "hidden", title: "命运的重逢", condition: "全事件触发 + 隐藏线索" }
    ],
    mechanics: [
      { name: "好感度系统", icon: svg("heart", 20), desc: "每位角色独立好感追踪，影响可触发事件与对话" },
      { name: "日常事件", icon: svg("calendar", 20), desc: "每章随机触发 2-3 个日常事件，选择决定好感变化" },
      { name: "告白判定", icon: svg("mail", 20), desc: "第四章解锁告白选项，需满足好感阈值和前置条件" }
    ]
  },
  {
    id: "urban",
    icon: svg("urban", 48),
    title: "都市博弈模板",
    category: "都市",
    difficulty: 5,
    popularity: 6800,
    updated: "2026-03-15",
    author: "剧作坊",
    authorAvatar: "剧",
    uses: 1890,
    rating: 4.6,
    desc: "围绕利益博弈展开，适合多方势力交织的商战或政治叙事。",
    tags: ["商战", "谈判", "人脉"],
    cover: "linear-gradient(135deg, #141E30 0%, #243B55 50%, #2c5364 100%)",
    synopsis: "在资本与权力的角力场中，玩家需要在多方势力间周旋。谈判桌上的每一句话、每一次站队都可能改变格局。利用人脉、情报和筹码来博弈最终的胜局。",
    features: ["多方势力系统", "谈判回合制", "人脉网络", "情报交易", "资源筹码管理"],
    structure: {
      chapters: 5,
      endings: 4,
      characters: 5,
      branches: 18,
      outline: [
        { ch: 1, title: "入局", type: "intro", desc: "进入博弈场，了解各方势力" },
        { ch: 2, title: "布局", type: "explore", desc: "建立人脉，收集情报" },
        { ch: 3, title: "对局", type: "conflict", desc: "第一轮正面博弈，站队抉择" },
        { ch: 4, title: "破局", type: "climax", desc: "核心利益冲突爆发" },
        { ch: 5, title: "终局", type: "resolution", desc: "最终谈判，决定胜负" }
      ]
    },
    sampleCharacters: [
      { name: "新晋玩家（主角）", role: "protagonist", traits: "机敏 · 野心 · 灵活" },
      { name: "老牌财阀", role: "antagonist", traits: "阴沉 · 老练 · 不择手段" },
      { name: "政界新星", role: "ally", traits: "理想主义 · 有底线 · 可利用" },
      { name: "情报掮客", role: "wildcard", traits: "中立 · 唯利益论 · 信息网" },
      { name: "内部线人", role: "spy", traits: "双面 · 不稳定 · 关键信息" }
    ],
    sampleEndings: [
      { type: "good", title: "新秩序缔造者", condition: "人脉 ≥ 70, 关键谈判全胜" },
      { type: "normal", title: "各取所需", condition: "平衡所有势力" },
      { type: "bad", title: "棋子的末路", condition: "被所有势力抛弃" },
      { type: "hidden", title: "幕后操盘手", condition: "全情报 + 双面操作成功" }
    ],
    mechanics: [
      { name: "势力系统", icon: svg("building", 20), desc: "3-4 个独立势力，每个有独立好感与利益关系" },
      { name: "谈判引擎", icon: svg("handshake", 20), desc: "回合制对话谈判，筹码和情报决定可用选项" },
      { name: "人脉网络", icon: svg("network", 20), desc: "可视化人脉图谱，解锁隐藏路线和情报" }
    ]
  },
  {
    id: "cyberpunk",
    icon: svg("cyberpunk", 48),
    title: "赛博朋克模板",
    category: "科幻",
    difficulty: 4,
    popularity: 8100,
    updated: "2026-04-10",
    author: "谜语官方",
    authorAvatar: "谜",
    uses: 2760,
    rating: 4.7,
    desc: "高科技低生活，身份伪装与记忆篡改的科幻悬疑框架。",
    tags: ["科幻", "黑客", "潜行"],
    cover: "linear-gradient(135deg, #0c0c1d 0%, #1a0a2e 50%, #2d1b69 100%)",
    synopsis: "在霓虹与数据的洪流中，你的记忆可能并非真实。通过黑客入侵、身份伪装和地下交易，在巨型企业与反抗军之间找到属于自己的真相。",
    features: ["记忆篡改系统", "黑客入侵小游戏", "身份伪装", "义体改造", "多层叙事"],
    structure: {
      chapters: 5,
      endings: 4,
      characters: 4,
      branches: 14,
      outline: [
        { ch: 1, title: "数据苏醒", type: "intro", desc: "记忆碎片中苏醒，身份成谜" },
        { ch: 2, title: "霓虹暗巷", type: "explore", desc: "底层世界探索，收集记忆碎片" },
        { ch: 3, title: "镜像裂痕", type: "conflict", desc: "身份冲突爆发，多重自我" },
        { ch: 4, title: "核心入侵", type: "climax", desc: "潜入企业核心，发现真相" },
        { ch: 5, title: "重写人生", type: "resolution", desc: "选择保留或覆写记忆" }
      ]
    },
    sampleCharacters: [
      { name: "无名者（玩家）", role: "protagonist", traits: "失忆 · 适应性强 · 怀疑一切" },
      { name: "黑客搭档", role: "ally", traits: "天才 · 偏执 · 忠诚" },
      { name: "企业高管", role: "antagonist", traits: "冷酷 · 効率至上 · 有苦衷" },
      { name: "AI 向导", role: "wildcard", traits: "理性 · 可能自主 · 暗藏目的" }
    ],
    sampleEndings: [
      { type: "good", title: "真我觉醒", condition: "记忆完整 + 拒绝覆写" },
      { type: "normal", title: "数据漂流", condition: "部分记忆 + 中立选择" },
      { type: "bad", title: "系统格式化", condition: "被企业捕获或AI背叛" },
      { type: "hidden", title: "超越人类", condition: "全碎片 + AI融合路线" }
    ],
    mechanics: [
      { name: "记忆碎片", icon: svg("puzzle", 20), desc: "收集散落的记忆碎片，拼凑真实身份" },
      { name: "黑客入侵", icon: svg("terminal", 20), desc: "选择型入侵序列，成功解锁隐藏信息" },
      { name: "身份系统", icon: svg("masks", 20), desc: "可在多重身份间切换，影响NPC反应" }
    ]
  },
  {
    id: "fantasy",
    icon: svg("fantasy", 48),
    title: "奇幻冒险模板",
    category: "奇幻",
    difficulty: 3,
    popularity: 10300,
    updated: "2026-04-01",
    author: "冒险工会",
    authorAvatar: "冒",
    uses: 4090,
    rating: 4.8,
    desc: "经典英雄之旅结构，支持队伍系统与阵营声望。",
    tags: ["奇幻", "冒险", "RPG"],
    cover: "linear-gradient(135deg, #1a3a1a 0%, #2d5016 50%, #4a6741 100%)",
    synopsis: "从默默无闻的少年到改变世界的英雄。招募同伴、探索未知之地、在光与暗的阵营间做出选择，书写属于你的史诗传说。",
    features: ["队伍系统", "阵营声望", "技能树", "装备系统", "世界地图探索"],
    structure: {
      chapters: 5,
      endings: 4,
      characters: 5,
      branches: 16,
      outline: [
        { ch: 1, title: "命运的号角", type: "intro", desc: "平凡日常被打破，踏上旅途" },
        { ch: 2, title: "结伴同行", type: "explore", desc: "招募同伴，建立队伍" },
        { ch: 3, title: "阵营抉择", type: "conflict", desc: "光暗势力对峙，必须站队" },
        { ch: 4, title: "深渊试炼", type: "climax", desc: "核心战役，同伴信任考验" },
        { ch: 5, title: "传说终章", type: "resolution", desc: "决战与结局" }
      ]
    },
    sampleCharacters: [
      { name: "年轻冒险者（玩家）", role: "protagonist", traits: "勇气 · 成长 · 善良" },
      { name: "精灵贤者", role: "ally", traits: "睿智 · 古老 · 有秘密" },
      { name: "游侠战士", role: "ally", traits: "豪爽 · 重情义 · 粗心" },
      { name: "暗影法师", role: "wildcard", traits: "孤僻 · 强大 · 阵营可变" },
      { name: "魔王使者", role: "antagonist", traits: "威严 · 有理由 · 可说服" }
    ],
    sampleEndings: [
      { type: "good", title: "英雄凯旋", condition: "队伍信任 ≥ 75, 阵营声望平衡" },
      { type: "normal", title: "代价之胜", condition: "胜利但有牺牲" },
      { type: "bad", title: "英雄陨落", condition: "队伍崩溃或阵营对立" },
      { type: "hidden", title: "第三条路", condition: "说服魔王 + 全同伴存活" }
    ],
    mechanics: [
      { name: "队伍系统", icon: svg("users", 20), desc: "最多 4 人同行，同伴关系影响战斗和剧情" },
      { name: "阵营声望", icon: svg("scale", 20), desc: "光明/暗影/中立三阵营，声望决定可用任务" },
      { name: "世界地图", icon: svg("map-pin", 20), desc: "可探索的区域逐步解锁，隐藏支线" }
    ]
  },
  {
    id: "thriller",
    icon: svg("thriller", 48),
    title: "心理惊悚模板",
    category: "惊悚",
    difficulty: 5,
    popularity: 7400,
    updated: "2026-03-22",
    author: "剧作坊",
    authorAvatar: "剧",
    uses: 2150,
    rating: 4.7,
    desc: "以不可靠叙述者为核心，真相随玩家选择逐步偏移。",
    tags: ["惊悚", "心理", "反转"],
    cover: "linear-gradient(135deg, #1a0a0a 0%, #2d1a1a 50%, #4a2020 100%)",
    synopsis: "你所看到的一切可能都不是真实的。作为一个不可靠的叙述者，你的每一次选择都在微妙地改变现实本身。当所有人都声称记得不同的过去，真相在哪里？",
    features: ["不可靠叙述", "现实扭曲", "心理档案", "多重时间线", "回溯修正"],
    structure: {
      chapters: 5,
      endings: 4,
      characters: 3,
      branches: 10,
      outline: [
        { ch: 1, title: "破碎的早晨", type: "intro", desc: "日常中发现不对劲的细节" },
        { ch: 2, title: "记忆缝隙", type: "explore", desc: "收集矛盾信息，质疑现实" },
        { ch: 3, title: "镜中的陌生人", type: "conflict", desc: "自我认知崩塌，叙述分裂" },
        { ch: 4, title: "深层意识", type: "climax", desc: "进入内心世界，面对真实" },
        { ch: 5, title: "最终叙述", type: "resolution", desc: "选择接受或重构现实" }
      ]
    },
    sampleCharacters: [
      { name: "叙述者（玩家）", role: "protagonist", traits: "不可靠 · 内疚 · 逃避" },
      { name: "心理医生", role: "ally", traits: "冷静 · 引导 · 可能不存在" },
      { name: "镜中倒影", role: "antagonist", traits: "真实的自己 · 对立 · 审判" }
    ],
    sampleEndings: [
      { type: "good", title: "与真相和解", condition: "接受全部记忆 + 心理值恢复" },
      { type: "normal", title: "选择性遗忘", condition: "部分接受 + 重构记忆" },
      { type: "bad", title: "永恒迷宫", condition: "拒绝真相 + 心理值崩溃" },
      { type: "hidden", title: "叙述者的觉醒", condition: "识破第四面墙 + 全线索" }
    ],
    mechanics: [
      { name: "叙述可靠度", icon: svg("book", 20), desc: "可靠度越低，场景描述越会出现偏差和矛盾" },
      { name: "现实层", icon: svg("spiral", 20), desc: "现实/记忆/幻觉三层叙事空间，随选择切换" },
      { name: "回溯系统", icon: svg("rewind", 20), desc: "允许重新选择过去的对话，但会降低叙述可靠度" }
    ]
  }
];

const ENDING_COLORS = { good: "#5cb85c", normal: "#f0ad4e", bad: "#e74c3c", hidden: "#9b59b6" };
const ENDING_LABELS = { good: "好结局", normal: "普通结局", bad: "坏结局", hidden: "隐藏结局" };
const DIFFICULTY_LABELS = ["", svgStars(1), svgStars(2), svgStars(3), svgStars(4), svgStars(5)];
const CHAPTER_TYPE_COLORS = { intro: "#85cdca", explore: "#5bc0de", conflict: "#f0ad4e", climax: "#e74c3c", resolution: "#9b59b6" };
const CHAPTER_TYPE_LABELS = { intro: "开端", explore: "探索", conflict: "冲突", climax: "高潮", resolution: "收束" };

function renderTemplateGallery(elements, filter = { category: "all", search: "", sort: "popular" }) {
  if (!elements.studioTemplateGrid) return;

  let list = [...TEMPLATE_DATA];

  if (filter.category !== "all") {
    list = list.filter((t) => t.category === filter.category || t.tags.includes(filter.category));
  }
  if (filter.search) {
    const q = filter.search.toLowerCase();
    list = list.filter((t) => t.title.toLowerCase().includes(q) || t.tags.some((tag) => tag.includes(q)) || t.desc.toLowerCase().includes(q));
  }
  if (filter.sort === "popular") list.sort((a, b) => b.popularity - a.popularity);
  else if (filter.sort === "newest") list.sort((a, b) => b.updated.localeCompare(a.updated));
  else if (filter.sort === "difficulty") list.sort((a, b) => a.difficulty - b.difficulty);

  elements.studioTemplateGrid.innerHTML = list.length === 0
    ? `<div class="tpl-empty">没有找到匹配的模板，试试其他关键词？</div>`
    : list.map((t) => `<article class="tpl-card site-panel" data-tpl-id="${t.id}">
        <div class="tpl-card-cover" style="background:${t.cover}">
          <span class="tpl-card-cover-icon">${t.icon}</span>
          <div class="tpl-card-badges">
            <span class="tpl-badge tpl-badge-uses">${svg("fire", 14)} ${t.uses.toLocaleString()} 次使用</span>
            <span class="tpl-badge tpl-badge-rating">${svg("star-fill", 14)} ${t.rating}</span>
          </div>
        </div>
        <div class="tpl-card-body">
          <div class="tpl-card-meta">
            <span class="tpl-card-author"><span class="tpl-card-avatar">${escapeHtml(t.authorAvatar)}</span>${escapeHtml(t.author)}</span>
            <span class="tpl-card-difficulty" title="难度">${DIFFICULTY_LABELS[t.difficulty]}</span>
          </div>
          <h3 class="tpl-card-title">${escapeHtml(t.title)}</h3>
          <p class="tpl-card-desc">${escapeHtml(t.desc)}</p>
          <div class="tpl-card-tags">${t.tags.map((tag) => `<span class="tpl-tag">${escapeHtml(tag)}</span>`).join("")}</div>
          <div class="tpl-card-stats">
            <span title="章节数">${svg("book", 14)} ${t.structure.chapters} 章</span>
            <span title="结局数">${svg("target", 14)} ${t.structure.endings} 结局</span>
            <span title="角色数">${svg("user", 14)} ${t.structure.characters} 角色</span>
            <span title="分支数">${svg("shuffle", 14)} ${t.structure.branches} 分支</span>
          </div>
          <div class="tpl-card-actions">
            <button class="tpl-preview-btn" type="button" data-tpl-preview="${t.id}">预览详情</button>
            <button class="tpl-use-btn" type="button" data-tpl-use="${t.id}">使用模板</button>
          </div>
        </div>
      </article>`).join("");
}

function buildTemplateDetail(tpl) {
  const chapterTypeIcon = (type) => ({ intro: svg("sunrise", 16), explore: svg("search", 16), conflict: svg("lightning", 16), climax: svg("fire", 16), resolution: svg("flag", 16) }[type] || svg("file", 16));

  return `
    <div class="tpl-d-overview">
      <div class="tpl-d-cover" style="background:${tpl.cover}">
        <span class="tpl-d-cover-icon">${tpl.icon}</span>
      </div>
      <div class="tpl-d-info">
        <div class="tpl-d-meta-row">
          <span class="tpl-d-author"><span class="tpl-card-avatar">${escapeHtml(tpl.authorAvatar)}</span>${escapeHtml(tpl.author)}</span>
          <span class="tpl-d-meta-sep">·</span>
          <span>难度 ${DIFFICULTY_LABELS[tpl.difficulty]}</span>
          <span class="tpl-d-meta-sep">·</span>
          <span>${svg("star-fill", 14)} ${tpl.rating}</span>
          <span class="tpl-d-meta-sep">·</span>
          <span>${svg("fire", 14)} ${tpl.uses.toLocaleString()} 次使用</span>
          <span class="tpl-d-meta-sep">·</span>
          <span>更新于 ${tpl.updated}</span>
        </div>
        <p class="tpl-d-synopsis">${escapeHtml(tpl.synopsis)}</p>
        <div class="tpl-d-features">
          ${tpl.features.map((f) => `<span class="tpl-d-feature-tag">${escapeHtml(f)}</span>`).join("")}
        </div>
      </div>
    </div>

    <div class="tpl-d-tabs" id="tplDTabs">
      <button class="tpl-d-tab active" data-tpl-dtab="structure">${svg("ruler", 16)} 章节结构</button>
      <button class="tpl-d-tab" data-tpl-dtab="characters">${svg("users", 16)} 预设角色</button>
      <button class="tpl-d-tab" data-tpl-dtab="endings">${svg("target", 16)} 结局设计</button>
      <button class="tpl-d-tab" data-tpl-dtab="mechanics">${svg("settings", 16)} 核心机制</button>
    </div>

    <div class="tpl-d-tabview" data-tpl-dview="structure">
      <div class="tpl-d-chapter-flow">
        ${tpl.structure.outline.map((ch, i) => `
          <div class="tpl-d-chapter-node">
            <div class="tpl-d-ch-connector">${i < tpl.structure.outline.length - 1 ? '<div class="tpl-d-ch-line"></div>' : ""}</div>
            <div class="tpl-d-ch-dot" style="background:${CHAPTER_TYPE_COLORS[ch.type]}">
              ${chapterTypeIcon(ch.type)}
            </div>
            <div class="tpl-d-ch-body">
              <div class="tpl-d-ch-head">
                <span class="tpl-d-ch-num">第 ${ch.ch} 章</span>
                <span class="tpl-d-ch-type" style="color:${CHAPTER_TYPE_COLORS[ch.type]}">${CHAPTER_TYPE_LABELS[ch.type]}</span>
              </div>
              <h4 class="tpl-d-ch-title">${escapeHtml(ch.title)}</h4>
              <p class="tpl-d-ch-desc">${escapeHtml(ch.desc)}</p>
            </div>
          </div>
        `).join("")}
      </div>
      <div class="tpl-d-structure-summary">
        <div class="tpl-d-summary-card">
          <div class="tpl-d-summary-value">${tpl.structure.chapters}</div>
          <div class="tpl-d-summary-label">章节</div>
        </div>
        <div class="tpl-d-summary-card">
          <div class="tpl-d-summary-value">${tpl.structure.branches}</div>
          <div class="tpl-d-summary-label">分支</div>
        </div>
        <div class="tpl-d-summary-card">
          <div class="tpl-d-summary-value">${tpl.structure.endings}</div>
          <div class="tpl-d-summary-label">结局</div>
        </div>
        <div class="tpl-d-summary-card">
          <div class="tpl-d-summary-value">${tpl.structure.characters}</div>
          <div class="tpl-d-summary-label">角色</div>
        </div>
      </div>
    </div>

    <div class="tpl-d-tabview" data-tpl-dview="characters" style="display:none">
      <div class="tpl-d-char-grid">
        ${tpl.sampleCharacters.map((c) => {
          const roleLabels = { protagonist: "主角", ally: "同盟", antagonist: "对手", rival: "竞争者", wildcard: "变数", "love-interest": "恋爱对象", spy: "间谍" };
          const roleColors = { protagonist: "#d0aa7a", ally: "#5cb85c", antagonist: "#e74c3c", rival: "#f0ad4e", wildcard: "#9b59b6", "love-interest": "#f8a4c8", spy: "#5bc0de" };
          return `<div class="tpl-d-char-card">
            <div class="tpl-d-char-avatar" style="border-color:${roleColors[c.role] || "#d0aa7a"}">${escapeHtml(c.name[0])}</div>
            <h4 class="tpl-d-char-name">${escapeHtml(c.name)}</h4>
            <span class="tpl-d-char-role" style="color:${roleColors[c.role] || "#d0aa7a"};border-color:${roleColors[c.role] || "#d0aa7a"}">${roleLabels[c.role] || c.role}</span>
            <p class="tpl-d-char-traits">${escapeHtml(c.traits)}</p>
          </div>`;
        }).join("")}
      </div>
    </div>

    <div class="tpl-d-tabview" data-tpl-dview="endings" style="display:none">
      <div class="tpl-d-ending-grid">
        ${tpl.sampleEndings.map((e) => `
          <div class="tpl-d-ending-card" style="--ec:${ENDING_COLORS[e.type]}">
            <div class="tpl-d-ending-type" style="color:${ENDING_COLORS[e.type]}">${ENDING_LABELS[e.type]}</div>
            <h4 class="tpl-d-ending-title">${escapeHtml(e.title)}</h4>
            <p class="tpl-d-ending-cond">${escapeHtml(e.condition)}</p>
          </div>
        `).join("")}
      </div>
    </div>

    <div class="tpl-d-tabview" data-tpl-dview="mechanics" style="display:none">
      <div class="tpl-d-mech-grid">
        ${tpl.mechanics.map((m) => `
          <div class="tpl-d-mech-card">
            <div class="tpl-d-mech-icon">${m.icon}</div>
            <div class="tpl-d-mech-body">
              <h4 class="tpl-d-mech-name">${escapeHtml(m.name)}</h4>
              <p class="tpl-d-mech-desc">${escapeHtml(m.desc)}</p>
            </div>
          </div>
        `).join("")}
      </div>
    </div>

    <div class="tpl-d-footer">
      <button class="tpl-d-use-btn" type="button" data-tpl-use="${tpl.id}">${svg("rocket", 16)} 使用此模板创建项目</button>
    </div>
  `;
}

function openTemplateDetail(elements, tplId) {
  const tpl = TEMPLATE_DATA.find((t) => t.id === tplId);
  if (!tpl) return;

  elements.tplDetailIcon.innerHTML = tpl.icon;
  elements.tplDetailTitle.textContent = tpl.title;
  elements.tplDetailSubtitle.textContent = tpl.category + " · " + DIFFICULTY_LABELS[tpl.difficulty] + " · " + tpl.structure.chapters + " 章 " + tpl.structure.endings + " 结局";
  elements.tplDetailBody.innerHTML = buildTemplateDetail(tpl);

  elements.tplDetailOverlay.classList.add("open");
  document.body.style.overflow = "hidden";

  /* detail tab switching */
  const tabs = elements.tplDetailBody.querySelector("#tplDTabs");
  if (tabs) {
    tabs.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-tpl-dtab]");
      if (!btn) return;
      tabs.querySelectorAll(".tpl-d-tab").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      elements.tplDetailBody.querySelectorAll("[data-tpl-dview]").forEach((v) => (v.style.display = "none"));
      const view = elements.tplDetailBody.querySelector(`[data-tpl-dview="${btn.dataset.tplDtab}"]`);
      if (view) view.style.display = "";
    });
  }
}

function closeTemplateDetail(elements) {
  elements.tplDetailOverlay.classList.remove("open");
  document.body.style.overflow = "";
}

function showTemplateUseToast(tpl) {
  showStudioToast(`<span class="tpl-toast-icon">${svg("check", 16)}</span> 已基于「${escapeHtml(tpl.title)}」创建新项目草稿`);
}

function useTemplateAsDraft(elements, tpl, meta, savedState, selectedStoryId) {
  const prefill = {
    title: tpl.title.replace("模板", "") + " — 我的版本",
    genre: tpl.category,
    desc: tpl.synopsis || tpl.desc,
    templateId: tpl.id,
    templateTitle: tpl.title,
    chapters: (tpl.structure?.outline || []).map((ch) => ({ title: ch.title, type: ch.type, desc: ch.desc })),
    characters: (tpl.sampleCharacters || []).map((c) => ({ name: c.name, role: c.role, traits: c.traits })),
    endings: (tpl.sampleEndings || []).map((e) => ({ type: e.type, title: e.title, condition: e.condition })),
    mechanics: (tpl.mechanics || []).map((m) => ({ icon: m.icon, name: m.name, desc: m.desc }))
  };
  closeTemplateDetail(elements);
  showNewDraftModal(elements, meta, savedState, selectedStoryId, prefill);
}

function bindTemplateGallery(elements, meta, savedState, selectedStoryId) {
  if (!elements.studioTemplateGrid || elements.studioTemplateGrid._tplBound) return;
  elements.studioTemplateGrid._tplBound = true;

  const getFilter = () => ({
    category: elements.tplCategoryTabs?.querySelector(".tpl-cat-btn.active")?.dataset.tplCat || "all",
    search: elements.tplSearchInput?.value || "",
    sort: elements.tplSortSelect?.value || "popular"
  });

  /* category tabs */
  elements.tplCategoryTabs?.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-tpl-cat]");
    if (!btn) return;
    elements.tplCategoryTabs.querySelectorAll(".tpl-cat-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    renderTemplateGallery(elements, getFilter());
  });

  /* search */
  let searchTimer;
  elements.tplSearchInput?.addEventListener("input", () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => renderTemplateGallery(elements, getFilter()), 250);
  });

  /* sort */
  elements.tplSortSelect?.addEventListener("change", () => {
    renderTemplateGallery(elements, getFilter());
  });

  /* card clicks: preview & use */
  elements.studioTemplateGrid.addEventListener("click", (e) => {
    const previewBtn = e.target.closest("[data-tpl-preview]");
    if (previewBtn) {
      openTemplateDetail(elements, previewBtn.dataset.tplPreview);
      return;
    }
    const useBtn = e.target.closest("[data-tpl-use]");
    if (useBtn) {
      const tpl = TEMPLATE_DATA.find((t) => t.id === useBtn.dataset.tplUse);
      if (tpl) {
        useTemplateAsDraft(elements, tpl, meta, savedState, selectedStoryId);
      }
      return;
    }
    /* click on card body → open preview */
    const card = e.target.closest(".tpl-card");
    if (card && !e.target.closest("button")) {
      openTemplateDetail(elements, card.dataset.tplId);
    }
  });

  /* close detail */
  elements.tplDetailClose?.addEventListener("click", () => closeTemplateDetail(elements));
  elements.tplDetailOverlay?.addEventListener("click", (e) => {
    if (e.target === elements.tplDetailOverlay) closeTemplateDetail(elements);
  });

  /* use from detail panel */
  elements.tplDetailBody?.addEventListener("click", (e) => {
    const useBtn = e.target.closest("[data-tpl-use]");
    if (useBtn) {
      const tpl = TEMPLATE_DATA.find((t) => t.id === useBtn.dataset.tplUse);
      if (tpl) {
        useTemplateAsDraft(elements, tpl, meta, savedState, selectedStoryId);
      }
    }
  });
}

function bindStudioTabs(elements) {
  if (!elements.studioTabs || elements.studioTabs._bound) return;
  elements.studioTabs._bound = true;
  elements.studioTabs.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-studio-tab]");
    if (!btn) return;
    const tab = btn.dataset.studioTab;
    elements.studioTabs.querySelectorAll(".studio-tab").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    const projectsGrid = document.querySelector("[data-studio-view='projects']");
    const templateSection = elements.studioTemplateSection;
    const toolsGrid = elements.studioToolsGrid;
    [projectsGrid, templateSection, toolsGrid].forEach((el) => { if (el) el.style.display = "none"; });
    if (tab === "projects" && projectsGrid) projectsGrid.style.display = "";
    if (tab === "templates" && templateSection) templateSection.style.display = "";
    if (tab === "tools" && toolsGrid) toolsGrid.style.display = "";
  });
}

function bindRankingTabs(elements) {
  if (!elements.rankingTabs || elements.rankingTabs._bound) return;
  elements.rankingTabs._bound = true;
  elements.rankingTabs.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-ranking-tab]");
    if (!btn) return;
    elements.rankingTabs.querySelectorAll(".ranking-tab").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
  });
}

function bindCommunityTabs(elements) {
  if (!elements.communityTabs || elements.communityTabs._bound) return;
  elements.communityTabs._bound = true;
  elements.communityTabs.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-community-tab]");
    if (!btn) return;
    elements.communityTabs.querySelectorAll(".community-tab").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
  });
}

export function renderProfileScreen(elements, meta, savedState) {
  const user = getLocalUser();
  const alias = user?.alias || savedState?.player?.alias || "旅行者";
  const accountType = user?.type === "guest" ? "访客账号" : user ? "已登录" : "未登录";
  const allStories = getStoryList();
  const totalUnlocked = allStories.reduce(
    (count, pack) => count + getUnlockedEndingsForStory(meta, pack.id).length,
    0
  );

  elements.profileAlias.textContent = alias;
  elements.profileProgress.textContent = `Lv.${Math.max(1, totalUnlocked * 2 + 6)} · ${accountType} · 已解锁 ${totalUnlocked} 个结局`;
  elements.profileStats.innerHTML = `
    <div class="utility-stat">
      <span class="utility-stat-label">累计结局</span>
      <strong>${totalUnlocked}</strong>
    </div>
    <div class="utility-stat">
      <span class="utility-stat-label">探索剧本</span>
      <strong>${allStories.length}</strong>
    </div>
    <div class="utility-stat">
      <span class="utility-stat-label">最近旅程</span>
      <strong>${escapeHtml(savedState?.story?.title || "尚未开始")}</strong>
    </div>
  `;

  elements.profileRecentJourneys.innerHTML = allStories
    .map((pack) => {
      const unlocked = getUnlockedEndingsForStory(meta, pack.id).length;
      return `<article class="recent-story-item">
        <div class="recent-story-cover" data-story-theme="${escapeHtml(pack.uiTheme || pack.id)}"></div>
        <div>
          <div class="recent-story-title">${escapeHtml(pack.title)}</div>
          <div class="recent-story-meta">${escapeHtml(pack.themeLabel)} · 进度 ${unlocked} / ${ENDING_ORDER.length}</div>
        </div>
      </article>`;
    })
    .join("");

  elements.profileBadges.innerHTML = [
    { title: "真相探索者", copy: "累计解锁 3 个以上结局" },
    { title: "多结局体验者", copy: "在不同题材里留下分支足迹" },
    { title: "剧情创作者", copy: "持续整理自己的路线与角色理解" }
  ]
    .map(
      (item) => `<div class="badge-item">
        <div class="badge-medal"></div>
        <div class="badge-title">${escapeHtml(item.title)}</div>
        <div class="badge-copy">${escapeHtml(item.copy)}</div>
      </div>`
    )
    .join("");

  elements.profileFeed.innerHTML = [
    `${alias} 继续了《${savedState?.story?.title || "命运的抉择"}》的旅程。`,
    `${alias} 解锁了新的剧情图鉴。`,
    `${alias} 保存了一个关键节点。`
  ]
    .map((item) => `<div class="feed-item compact"><div class="feed-copy">${escapeHtml(item)}</div></div>`)
    .join("");

  elements.profileDiscussions.innerHTML = [
    "你最难忘的结局是哪一个",
    "哪位角色最值得写番外",
    "如果能重写一幕，你会改哪一幕"
  ]
    .map((item) => `<div class="topic-item compact">${escapeHtml(item)}</div>`)
    .join("");
}
