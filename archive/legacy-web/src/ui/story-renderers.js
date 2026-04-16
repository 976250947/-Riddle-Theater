import { ENDING_ORDER, PLAYER_ARCHETYPES, INTERACTION_MODES } from "../config/constants.js";
import { getStoryDisplay } from "../config/story-display.js";
import { svg } from "./icons.js";
import {
  getJourneyConfig,
  getJourneyPreset,
  getStoryList,
  getStoryPack,
  getUnlockedEndingsForStory
} from "../config/story-packs.js";
import { generateDynamicOptions } from "../core/story-engine.js";
import { escapeHtml, formatDelta, getAvatarText } from "../core/utils.js";
import { crossfadeBackground, setBgCameraEffect } from "./animations.js";

function createExcerpt(text, maxLength = 90) {
  const normalized = String(text || "").replace(/\s+/g, " ").trim();
  if (!normalized) return "";
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, maxLength).trimEnd()}...`;
}

const DETAIL_META = {
  mistycity: { author: "迷城叙事组", publishDate: "2024.08.12", wordCount: "18.7万" },
  campuslove: { author: "夏夜广播社", publishDate: "2024.06.21", wordCount: "12.4万" },
  boardroom: { author: "第七编辑室", publishDate: "2024.09.03", wordCount: "15.2万" },
  cyberpunk: { author: "零域回声", publishDate: "2024.10.18", wordCount: "16.8万" },
  tingwan: { author: "临川夜话", publishDate: "2026.04.15", wordCount: "4章连载" }
};

function buildFeatureItems(pack, display) {
  return [
    `多线章节推进，${display.featuredCategory || pack.themeLabel}氛围明确。`,
    `关键回应会改变角色关系、线索掌握与结局走向。`,
    `适合用约 ${display.duration || "3-4h"} 的完整时长沉浸进入这段故事。`
  ];
}

function buildReviewRows(ratingText) {
  const rating = Number(ratingText || 9);
  const five = Math.min(92, Math.max(68, Math.round(rating * 8.6)));
  const four = Math.max(4, Math.round((100 - five) * 0.55));
  const three = Math.max(2, Math.round((100 - five - four) * 0.5));
  const two = Math.max(1, 100 - five - four - three - 1);
  return [
    { label: "5星", value: five },
    { label: "4星", value: four },
    { label: "3星", value: three },
    { label: "2星", value: Math.max(1, two) },
    { label: "1星", value: 1 }
  ];
}

export function renderLibraryScreen(elements, meta, savedState, selectedStoryId) {
  const selectedPack = getStoryPack(selectedStoryId);
  const preview = getStoryDisplay(selectedPack.id);

  setScreenTheme(elements, selectedPack.id);
  elements.libraryContinueBtn.disabled = !savedState;
  elements.enterStoryBtn.textContent = "开始探索";
  elements.storyShelfGrid.innerHTML = getStoryList()
    .map((pack) => {
      const display = getStoryDisplay(pack.id);

      return `<button
        class="card story-shelf-card ${pack.id === selectedStoryId ? "active" : ""}"
        type="button"
        data-story-id="${pack.id}"
        data-story-theme="${escapeHtml(pack.uiTheme || pack.id)}"
        aria-label="查看剧本《${escapeHtml(pack.title)}》详情"
      >
        <span class="card-img story-shelf-poster" aria-hidden="true">
          ${display.badge ? `<span class="badge ${escapeHtml(display.badgeClass)}">${escapeHtml(display.badge)}</span>` : ""}
        </span>
        <span class="card-content">
          <span class="card-title story-shelf-title">${escapeHtml(pack.title)}</span>
          <span class="tags">
            ${display.tags
              .slice(0, 2)
              .map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`)
              .join("")}
          </span>
          <span class="card-footer">
            <span>${escapeHtml(display.duration)}</span>
            <span>${escapeHtml(display.playCount)}</span>
            <span class="rating">${escapeHtml(display.rating)}</span>
          </span>
        </span>
      </button>`;
    })
    .join("");

  elements.libraryPreviewCard.dataset.storyTheme = selectedPack.uiTheme || selectedPack.id;
  const recommendCard = elements.libraryPreviewCard.closest(".recommend-card");
  if (recommendCard instanceof HTMLElement) {
    recommendCard.style.removeProperty("background");
  }
  elements.libraryPreviewCard.innerHTML = `
    <div class="rc-header-shell">
      <h3 class="rc-title">${escapeHtml(selectedPack.title)}</h3>
      <div class="rc-subtitle">${escapeHtml(selectedPack.subtitle)}</div>
    </div>
    <p class="rc-desc">${escapeHtml(preview.logline)}</p>
    <button class="btn-outline-wrapper" type="button" data-open-story-preview="true" aria-label="查看推荐剧本《${escapeHtml(selectedPack.title)}》详情">
      <svg class="btn-svg-bg" preserveAspectRatio="none" viewBox="0 0 150 38">
        <polygon class="btn-svg-polygon" points="14,1 136,1 149,19 136,37 14,37 1,19"></polygon>
      </svg>
      <span class="btn-text">进入故事</span>
    </button>
    <div class="pagination">
      ${getStoryList()
        .map(
          (pack) =>
            `<button class="dot ${pack.id === selectedStoryId ? "active" : ""}" type="button" data-preview-story-id="${pack.id}" aria-label="切换到推荐剧本《${escapeHtml(pack.title)}》" aria-pressed="${String(pack.id === selectedStoryId)}"></button>`
        )
        .join("")}
    </div>
  `;

  elements.librarySaveSummary.textContent = buildSaveSummary(savedState);
}

export function renderStartScreen(elements, meta, savedState, selectedArchetypeId, selectedStoryId, viewMode = "info") {
  const selectedPack = getStoryPack(selectedStoryId);
  const selectedDisplay = getStoryDisplay(selectedPack.id);
  const journeyConfig = getJourneyConfig(selectedStoryId);
  const journeyPreset = getJourneyPreset(selectedStoryId, selectedArchetypeId);
  const unlockedForStory = getUnlockedEndingsForStory(meta, selectedPack.id);
  const metaInfo = DETAIL_META[selectedPack.id] || { author: "谜语工作室", publishDate: "2024.01.01", wordCount: "10.0万" };
  const openingText = createExcerpt(selectedPack.openingFrame || selectedPack.cinematicLead || "", 40);
  const synopsisText = createExcerpt(selectedPack.synopsis || selectedPack.description || "", 86);
  const promiseText = createExcerpt(selectedPack.storyPromise || selectedPack.description || selectedPack.synopsis || "", 96);
  const roleText = createExcerpt(selectedPack.playerRole || "你将直接从故事中心进入这段旅程。", 82);
  const worldText = createExcerpt(selectedPack.worldGuide || selectedPack.storyPromise || "", 112);
  const roleCount = Object.keys(selectedPack.initialCharacters || {}).length + 1;
  const branchCount = Math.max((selectedPack.progressSteps?.length || 0) * 4, Object.keys(selectedPack.endings || {}).length);
  const reviewRows = buildReviewRows(selectedDisplay.rating);
  const infoCardTitle = elements.storyPromiseLead.closest(".detail-side-card")?.querySelector(".side-card-title");
  const scoreCardTitle = elements.storyRoleSummary.closest(".detail-side-card")?.querySelector(".side-card-title");
  const setupCardTitle = elements.journeySetupPrompt.closest(".detail-side-card")?.querySelector(".side-card-title");
  const startScreen = elements.screens.start;

  setScreenTheme(elements, selectedPack.id);
  if (startScreen) {
    startScreen.dataset.detailMode = viewMode;
  }
  elements.detailInfoTab?.classList.toggle("active", viewMode === "info");
  elements.detailSetupTab?.classList.toggle("active", viewMode === "setup");
  elements.detailAtlasTab?.classList.remove("active");
  elements.continueGameBtn.disabled = !savedState;
  elements.startNewGameBtn.textContent = viewMode === "setup" ? "确认并开始" : "开始故事";
  elements.continueGameBtn.textContent = viewMode === "setup" ? "读取存档" : "继续旅程";
  elements.showGalleryBtn.classList.toggle("hidden", viewMode === "setup");
  elements.storyGenre.textContent = selectedPack.genre;
  elements.gameTitle.textContent = selectedPack.title;
  elements.storySubtitle.textContent = selectedPack.subtitle;
  elements.storySynopsis.textContent = viewMode === "setup" ? createExcerpt(journeyConfig.setupPrompt || journeyPreset.description || synopsisText, 54) : synopsisText;
  elements.storyOpeningShot.textContent = viewMode === "setup" ? "进入设置" : openingText;
  elements.storyThemeLabel.textContent = selectedPack.themeLabel;
  elements.unlockedEndingCount.textContent = `${unlockedForStory.length} / ${ENDING_ORDER.length}`;

  if (infoCardTitle) infoCardTitle.textContent = "剧本信息";
  if (scoreCardTitle) scoreCardTitle.textContent = "玩家评分";
  if (setupCardTitle) setupCardTitle.textContent = "进入设置";

  elements.storyPromiseLead.innerHTML = `
    <div class="detail-stat-list">
      <div class="detail-stat-row"><span>作者</span><strong>${escapeHtml(metaInfo.author)}</strong></div>
      <div class="detail-stat-row"><span>发布时间</span><strong>${escapeHtml(metaInfo.publishDate)}</strong></div>
      <div class="detail-stat-row"><span>角色</span><strong>${roleCount}</strong></div>
      <div class="detail-stat-row"><span>字数</span><strong>${escapeHtml(metaInfo.wordCount)}</strong></div>
      <div class="detail-stat-row"><span>分支</span><strong>${branchCount}</strong></div>
      <div class="detail-stat-row"><span>结局</span><strong>${Object.keys(selectedPack.endings || {}).length}</strong></div>
    </div>
  `;

  elements.storyRoleSummary.innerHTML = `
    <div class="detail-score-shell">
      <div class="detail-score-value">${escapeHtml(selectedDisplay.rating)}</div>
      <div class="detail-score-meta">${escapeHtml(selectedDisplay.playCount)} 人评分</div>
      <div class="detail-score-bars">
        ${reviewRows
          .map(
            (row) => `<div class="detail-score-row">
              <span class="detail-score-label">${escapeHtml(row.label)}</span>
              <span class="detail-score-track"><span class="detail-score-fill" style="width: ${row.value}%;"></span></span>
              <span class="detail-score-percent">${row.value}%</span>
            </div>`
          )
          .join("")}
      </div>
    </div>
  `;

  elements.storyPackDescription.innerHTML = `
    <div class="story-overview-lead">${escapeHtml(viewMode === "setup" ? createExcerpt(journeyPreset.description || promiseText, 72) : promiseText)}</div>
    ${
      viewMode === "setup"
        ? ""
        : `<div class="detail-feature-title">剧本特色</div>
    <ul class="detail-feature-list">
      ${buildFeatureItems(selectedPack, selectedDisplay)
        .map((item) => `<li>${escapeHtml(item)}</li>`)
        .join("")}
    </ul>`
    }
  `;

  elements.storyDetailFacts.innerHTML = `
    ${selectedDisplay.tags
      .slice(0, 3)
      .map((tag) => `<span class="detail-tag">${escapeHtml(tag)}</span>`)
      .join("")}
    <span class="detail-rating-pill">${svg("star-fill", 14)} ${escapeHtml(selectedDisplay.rating)}</span>
  `;

  elements.storyOpeningShot.textContent = selectedPack.genre;
  elements.storySynopsis.textContent = createExcerpt(selectedPack.synopsis || promiseText, 88);
  elements.storyThemeLabel.textContent = selectedPack.themeLabel;

  const metaBits = viewMode === "setup"
    ? [`推荐 ${selectedDisplay.duration}`, `难度 ${selectedDisplay.difficulty}`]
    : [
        `时长 ${selectedDisplay.duration}`,
        `${selectedDisplay.playCount} 游玩`,
        `难度 ${selectedDisplay.difficulty}`,
        `结局 ${unlockedForStory.length} / ${ENDING_ORDER.length}`
      ];
  elements.storyPromiseLead.closest(".detail-side-card")?.classList.toggle("is-hidden", viewMode === "setup");
  elements.storyRoleSummary.closest(".detail-side-card")?.classList.toggle("is-hidden", viewMode === "setup");
  elements.journeySetupPrompt.closest(".detail-side-card")?.classList.toggle("is-hidden", viewMode === "info");

  const detailMetaRow = elements.storySynopsis.parentElement?.querySelector(".detail-meta-row");
  if (detailMetaRow) {
    detailMetaRow.innerHTML = metaBits.map((item) => `<span>${escapeHtml(item)}</span>`).join("");
  }

  elements.storyWorldGuide.innerHTML = `
    <div class="world-guide-stack detail-overview-grid">
      <div class="world-guide-block">
        <div class="world-guide-label">一句话前提</div>
        <p class="world-guide-copy">${escapeHtml(createExcerpt(selectedPack.cinematicLead || selectedPack.openingFrame || "", 90))}</p>
      </div>
      <div class="world-guide-block">
        <div class="world-guide-label">背景</div>
        <p class="world-guide-copy">${escapeHtml(worldText)}</p>
      </div>
    </div>
  `;

  elements.storyCastGuide.innerHTML = (selectedPack.castGuide || [])
    .slice(0, 3)
    .map(
      (item) => `<div class="cast-guide-item">
        <div class="cast-guide-name">${escapeHtml(item.name)}</div>
        <div class="cast-guide-role">${escapeHtml(item.role)}</div>
        <div class="cast-guide-note">${escapeHtml(createExcerpt(item.note, 46))}</div>
      </div>`
    )
    .join("");

  elements.journeySetupPrompt.textContent = createExcerpt(journeyConfig.setupPrompt || "", 82);
  elements.playerAliasLabel.textContent = journeyConfig.aliasLabel || "旅程署名";
  elements.playerAliasInput.placeholder = journeyConfig.aliasPlaceholder || "例如：无名旅人";
  elements.playerAliasHint.textContent = journeyConfig.setupHint || "";
  elements.journeySummary.innerHTML = `
    <div class="journey-summary-title">${escapeHtml(journeyPreset.title)}</div>
    <div class="journey-summary-copy">${escapeHtml(createExcerpt(journeyPreset.description, 88))}</div>
  `;
  elements.journeyEffectList.innerHTML = [journeyPreset.lens, journeyPreset.statSummary]
    .filter(Boolean)
    .slice(0, 2)
    .map((item) => `<span class="journey-chip">${escapeHtml(item)}</span>`)
    .join("");

  renderEndingGallery(elements.startGallery, selectedPack, unlockedForStory, null, true);
  renderArchetypes(elements, selectedArchetypeId, selectedStoryId);
  elements.saveSummary.textContent = buildSaveSummary(savedState);
}

export function renderGameScreen(elements, state) {
  const currentNode = getLatestNode(state);
  const primaryCharacter =
    state.characters[state.story.primaryCharacterId] || Object.values(state.characters).find((item) => item.revealed);

  setScreenTheme(elements, state.story.id);
  elements.chapterTag.textContent = `${state.story.title} / ${currentNode.chapterTag}`;
  elements.roundTag.textContent = `第 ${currentNode.roundIndex} 轮`;

  // VN textbox: clear for fresh performance
  if (elements.vnSpeakerName) elements.vnSpeakerName.textContent = "";
  if (elements.vnSpeakerMood) elements.vnSpeakerMood.textContent = "";
  if (elements.vnTextContent) elements.vnTextContent.textContent = "";
  if (elements.vnAdvanceHint) elements.vnAdvanceHint.classList.add("hidden");

  // Hide choice overlay for now
  if (elements.vnChoiceOverlay) elements.vnChoiceOverlay.classList.add("hidden");

  // Show textbox
  if (elements.vnTextbox) elements.vnTextbox.classList.remove("vn-hidden");

  // Drawer data
  elements.playerProfileCard.innerHTML = `
    <div class="profile-name">${escapeHtml(state.player.alias)}</div>
    <div class="profile-meta">${escapeHtml(state.player.archetypeTitle)} / ${escapeHtml(state.story.themeLabel)}</div>
    <div class="note-body">${escapeHtml(state.player.archetypeDescription)}</div>
    ${
      state.player.archetypeLens
        ? `<div class="note-label">进入方式</div><div class="note-body">${escapeHtml(state.player.archetypeLens)}</div>`
        : ""
    }
    <div class="note-label">当前身份</div>
    <div class="note-body">${escapeHtml(state.story.playerRole || "你已经身处故事正中央。")}</div>
  `;

  elements.storyContextCard.innerHTML = `
    <div class="note-title">${escapeHtml(state.story.title)}</div>
    <div class="note-label">开场镜头</div>
    <div class="note-body">${escapeHtml(state.story.openingFrame || "")}</div>
    <div class="note-label">世界背景</div>
    <div class="note-body">${escapeHtml(state.story.worldGuide || "")}</div>
  `;

  elements.objectiveCard.innerHTML = `
    <div class="note-title">${escapeHtml(currentNode.title)}</div>
    <div class="note-label">当前目标</div>
    <div class="note-body">${escapeHtml(currentNode.objective)}</div>
    <div class="note-label">本轮风险</div>
    <div class="note-body">${escapeHtml(currentNode.stakes)}</div>
  `;

  elements.characterCards.innerHTML = renderCharacters(state);
  elements.eventList.innerHTML = state.events
    .map(
      (event) => `<div class="ev-item ${event.hot ? "hot" : ""}">
        <div class="ev-dot"></div>
        <div>${escapeHtml(event.text)}</div>
      </div>`
    )
    .join("");
  elements.progressList.innerHTML = renderProgress(state.story.progressSteps, currentNode.progressKey);
  elements.clueList.innerHTML = renderClues(state);
  elements.impactList.innerHTML = renderImpact(state.lastOutcome);
}

/** Render a single VN dialogue line into the textbox */
export function renderVnLine(elements, line, state) {
  if (!line || line.type === "choices") return;

  const speaker = line.speaker;
  const character = speaker ? (state.characters[speaker] || null) : null;

  if (elements.vnSpeakerName) {
    elements.vnSpeakerName.textContent = speaker
      ? (character?.name || speaker)
      : "";
  }
  if (elements.vnSpeakerMood) {
    elements.vnSpeakerMood.textContent = line.mood
      ? `情绪：${line.mood}`
      : (character?.mood ? `情绪：${character.mood}` : "");
  }
  if (elements.vnTextContent) {
    // Text will be filled by typewriter in animations.js; store full text
    elements.vnTextContent.dataset.fullText = line.text || "";
    elements.vnTextContent.textContent = "";
    elements.vnTextContent.classList.add("typing");
  }
  if (elements.vnAdvanceHint) {
    elements.vnAdvanceHint.classList.add("hidden");
  }
}

/** Show the full text immediately (skip typewriter) */
export function renderVnLineComplete(elements) {
  if (!elements.vnTextContent) return;
  const full = elements.vnTextContent.dataset.fullText || "";
  elements.vnTextContent.textContent = full;
  elements.vnTextContent.classList.remove("typing");
  if (elements.vnAdvanceHint) {
    elements.vnAdvanceHint.classList.remove("hidden");
  }
}

/** Render backlog (history) overlay content */
export function renderBacklog(elements, history) {
  if (!elements.vnBacklogContent) return;
  if (!history || !history.length) {
    elements.vnBacklogContent.innerHTML = `<div style="color:rgba(214,180,151,0.4); text-align:center; padding:40px 0; font-size:14px;">尚无对话记录</div>`;
    return;
  }
  elements.vnBacklogContent.innerHTML = history
    .map((item, i) => `<div class="backlog-item" style="--i:${i % 30}">
      <div class="backlog-item-name">${item.speaker ? escapeHtml(item.speaker) : ""}</div>
      <div class="backlog-item-text">${escapeHtml(item.text)}</div>
    </div>`)
    .join("");
  // Scroll to bottom (latest)
  elements.vnBacklogContent.scrollTop = elements.vnBacklogContent.scrollHeight;
}

/** Render choices in the VN choice overlay */
export function renderVnChoices(elements, state) {
  const currentNode = getLatestNode(state);
  if (!currentNode || !elements.vnChoiceOverlay) return;

  const currentModes = currentNode.availableModes || ["fixed"];
  const modeIndicator = currentModes.length > 1
    ? `<div class="mode-indicator">
        ${currentModes.map((m) => {
          const mode = INTERACTION_MODES[m];
          return mode ? `<span class="mode-chip">${escapeHtml(mode.label)}</span>` : "";
        }).join("")}
      </div>`
    : "";

  elements.vnChoiceList.innerHTML = `${modeIndicator}${currentNode.choiceOptions
    .map(
      (choice, index) => `<button class="choice-btn" style="--i:${index}" data-choice-id="${choice.id}">
        <span class="choice-num">${index + 1}</span>
        <span>${escapeHtml(choice.label)}</span>
      </button>`
    )
    .join("")}`;

  // Hide textbox, show choice overlay
  if (elements.vnTextbox) elements.vnTextbox.classList.add("vn-hidden");
  elements.vnChoiceOverlay.classList.remove("hidden");
}

export function renderEndingScreen(elements, state) {
  const pack = getStoryPack(state.story.id);
  const ending = pack.endings[state.currentEnding.endingId];
  const unlockedForStory = getUnlockedEndingsForStory(state.meta, state.story.id);

  setScreenTheme(elements, state.story.id);
  elements.endingBadge.textContent = ending.badge;
  elements.endingCode.textContent = ending.code;
  elements.endingTitle.textContent = ending.title;
  elements.endingSubtitle.textContent = ending.subtitle;
  elements.endingDescription.textContent = ending.description;
  elements.endingConditions.innerHTML = ending.conditions
    .map(
      (condition) => `<div class="cond-item met">
        <div class="cond-icon">●</div>
        <div class="cond-label">${escapeHtml(condition.label)}</div>
        <div class="cond-val">${escapeHtml(condition.value)}</div>
      </div>`
    )
    .join("");

  renderEndingGallery(elements.endingGallery, pack, unlockedForStory, ending.id, false);
}

export function renderRollbackModal(elements, state) {
  const currentNode = getLatestNode(state);
  const unlockedForStory = getUnlockedEndingsForStory(state.meta, state.story.id);

  elements.rollbackTimeline.innerHTML = state.checkpoints
    .map((checkpoint, index) => {
      const isCurrent = checkpoint.nodeId === currentNode.nodeId;

      return `<div class="timeline-node">
        <div class="node-spine">
          <div class="node-dot ${isCurrent ? "current-pos" : "checkpoint"}"></div>
          ${index === state.checkpoints.length - 1 ? "" : '<div class="node-line"></div>'}
        </div>
        <div class="node-content">
          <div class="node-meta">
            <div class="node-round">第 ${checkpoint.roundIndex} 轮</div>
            <div class="node-checkpoint-tag">关键节点</div>
            ${isCurrent ? '<div class="node-current-tag">当前位置</div>' : ""}
          </div>
          <div class="node-title">${escapeHtml(checkpoint.title)}</div>
          <div class="node-summary">${escapeHtml(checkpoint.snapshotSummary)}</div>
          ${
            checkpoint.choicePreview
              ? `<div class="node-choice-preview">
                  <div class="event-dot"></div>
                  <div class="choice-preview-text">当时你的回应：${escapeHtml(checkpoint.choicePreview)}</div>
                </div>`
              : ""
          }
          ${
            isCurrent
              ? ""
              : `<button class="rollback-btn" data-checkpoint-id="${checkpoint.checkpointId}">回到这里</button>`
          }
        </div>
      </div>`;
    })
    .join("");

  elements.rollbackCount.textContent = `共 ${state.checkpoints.length} 个可回溯节点`;
  elements.rollbackRound.textContent = `第 ${currentNode.roundIndex} 轮`;
  elements.rollbackEndingSummary.textContent = `${unlockedForStory.length} / ${ENDING_ORDER.length}`;
}

export function renderSaveModal(elements, slots, mode) {
  const isSave = mode === "save";
  elements.saveModalSup.textContent = isSave ? "存档管理" : "读档管理";
  elements.saveModalTitle.textContent = isSave ? "存档 · Save" : "读档 · Load";

  elements.saveSlotList.innerHTML = slots
    .map((slot) => {
      if (slot.empty) {
        return `<div class="save-slot save-slot--empty" data-slot-index="${slot.index}" data-slot-action="${isSave ? "save" : ""}">
          <div class="save-slot-label">槽位 ${slot.index + 1}</div>
          <div class="save-slot-hint">${isSave ? "点击保存到此槽位" : "空"}</div>
        </div>`;
      }
      const time = slot.savedAt ? new Date(slot.savedAt).toLocaleString("zh-CN") : "";
      return `<div class="save-slot save-slot--filled" data-slot-index="${slot.index}" data-slot-action="${isSave ? "save" : "load"}">
        <div class="save-slot-top">
          <div class="save-slot-name">${escapeHtml(slot.name)}</div>
          <button class="save-slot-delete" data-slot-delete="${slot.index}" title="删除存档">&times;</button>
        </div>
        <div class="save-slot-info">${escapeHtml(slot.storyTitle)} · ${escapeHtml(slot.alias)} · 第${slot.nodeCount}节</div>
        <div class="save-slot-time">${time}</div>
      </div>`;
    })
    .join("");
}

export function showToast(elements, message) {
  elements.toast.textContent = message;
  elements.toast.classList.remove("hidden");
  window.clearTimeout(elements.toastTimer);
  elements.toastTimer = window.setTimeout(() => {
    elements.toast.classList.add("hidden");
  }, 2400);
}

function renderArchetypes(elements, selectedArchetypeId, selectedStoryId) {
  elements.archetypeButtons.innerHTML = Object.values(PLAYER_ARCHETYPES)
    .map((archetype) => {
      const preset = getJourneyPreset(selectedStoryId, archetype.id);

      return `<button class="archetype-btn ${selectedArchetypeId === archetype.id ? "active" : ""}" data-archetype-id="${archetype.id}">
        <span class="archetype-title">${escapeHtml(preset.title)}</span>
        <span class="archetype-note">${escapeHtml(preset.short)}</span>
      </button>`;
    })
    .join("");
}

function renderStoryNode(state, node) {
  const isCurrent = node.nodeId === state.session.currentNodeId;
  const speaker =
    state.characters[node.npcSpeakerId] ||
    state.characters[state.story.primaryCharacterId] ||
    Object.values(state.characters)[0];
  const nodeIndex = state.nodes.findIndex((item) => item.nodeId === node.nodeId);
  const previousNode = nodeIndex > 0 ? state.nodes[nodeIndex - 1] : null;
  const chapterBlock =
    !previousNode || previousNode.chapterTag !== node.chapterTag
      ? renderChapterDivider(node.chapterTag, node.chapterLead || node.sceneTag)
      : "";

  const choiceBlock = node.incomingChoiceLabel
    ? `<div class="node-choice-preview">
        <div class="event-dot"></div>
        <div class="choice-preview-text">你的回应：${escapeHtml(node.incomingChoiceLabel)}</div>
      </div>`
    : "";

  return `${chapterBlock}<article class="story-node ${isCurrent ? "current" : ""}">
    <div class="scene-tag">${escapeHtml(node.sceneTag)}</div>
    <h3 class="node-title">${escapeHtml(node.title)}</h3>
    <p class="story-text ${isCurrent ? "typewriter-target pending-type" : ""}" data-typewriter="${isCurrent ? "story" : ""}">${escapeHtml(node.storyText)}</p>
    ${node.npcDialogue ? `<div class="npc-dialogue">
      <div class="dialogue-speaker">${escapeHtml(speaker?.name || "叙事角色")}</div>
      <div class="dialogue-text ${isCurrent ? "typewriter-target pending-type" : ""}" data-typewriter="${isCurrent ? "dialogue" : ""}">${escapeHtml(node.npcDialogue)}</div>
    </div>` : ""}
    ${choiceBlock}
    <div class="event-hint">
      <div class="event-dot"></div>
      <div class="event-hint-text">${escapeHtml(node.eventHint)}</div>
    </div>
  </article>`;
}

function renderChapterDivider(chapterTag, chapterLead) {
  return `<section class="chapter-divider">
    <div class="chapter-divider-tag">${escapeHtml(chapterTag)}</div>
    <div class="chapter-divider-line"></div>
    <p class="chapter-divider-copy">${escapeHtml(chapterLead || "")}</p>
  </section>`;
}

function renderStoryPrelude(state) {
  const primaryCharacter =
    state.characters[state.story.primaryCharacterId] || Object.values(state.characters).find((item) => item.revealed);
  const castCopy = (state.story.castGuide || [])
    .slice(0, 2)
    .map((item) => `${item.name}：${item.note}`)
    .join(" / ");

  return `<section class="story-prelude">
    <div class="prelude-title">故事导入</div>
    <div class="story-quote">${escapeHtml(state.story.cinematicLead || "")}</div>
    <div class="prelude-copy">${escapeHtml(
      `你将以“${state.player.alias}”的身份进入《${state.story.title}》。随着剧情推进，你与他人的关系和掌握的信息都会慢慢变化。`
    )}</div>
    <div class="prelude-grid">
      <div class="prelude-chip">
        <span class="prelude-label">基调</span>
        <span class="prelude-value">${escapeHtml(state.story.storyPromise || "")}</span>
      </div>
      <div class="prelude-chip">
        <span class="prelude-label">处境</span>
        <span class="prelude-value">${escapeHtml(state.story.playerRole || "你已经置身故事正中央。")}</span>
      </div>
      <div class="prelude-chip">
        <span class="prelude-label">背景</span>
        <span class="prelude-value">${escapeHtml(state.story.worldGuide || "")}</span>
      </div>
      <div class="prelude-chip">
        <span class="prelude-label">人物</span>
        <span class="prelude-value">${escapeHtml(
          primaryCharacter ? `${primaryCharacter.name}：${primaryCharacter.role}。${castCopy}` : castCopy
        )}</span>
      </div>
    </div>
  </section>`;
}

function renderCharacters(state) {
  return Object.values(state.characters)
    .map((character) => {
      const isHidden = !character.revealed;

      return `<div class="char-card ${isHidden ? "dim" : ""}">
        <div class="char-av">${escapeHtml(getAvatarText(character.name))}</div>
        <div>
          <div class="char-name">${escapeHtml(character.name)}</div>
          <div class="char-role">${escapeHtml(character.role)}</div>
          ${
            isHidden
              ? `<div class="stage-badge">状态：尚未真正接触</div>`
              : `<div class="stat-row">
                  <div class="stat-lbl">好感</div>
                  <div class="stat-track"><div class="stat-fill aff" style="width:${character.affinity}%"></div></div>
                  <div class="stat-val">${Math.round(character.affinity)}</div>
                </div>
                <div class="stat-row">
                  <div class="stat-lbl">信任</div>
                  <div class="stat-track"><div class="stat-fill tru" style="width:${character.trust}%"></div></div>
                  <div class="stat-val">${Math.round(character.trust)}</div>
                </div>
                <div class="stat-row">
                  <div class="stat-lbl">警觉</div>
                  <div class="stat-track"><div class="stat-fill ale" style="width:${character.alertness}%"></div></div>
                  <div class="stat-val">${Math.round(character.alertness)}</div>
                </div>
                <div class="stage-badge">关系阶段：${escapeHtml(character.relationshipStage)}</div>`
          }
        </div>
      </div>`;
    })
    .join("");
}

function renderProgress(progressSteps, currentKey) {
  const currentIndex = progressSteps.findIndex((step) => step.key === currentKey);

  return progressSteps
    .map((step, index) => {
      const status = index < currentIndex ? "done" : index === currentIndex ? "cur" : "fut";

      return `<div class="prog-step">
        <div class="pdot ${status}"></div>
        <div class="plbl ${status}">${escapeHtml(step.label)}</div>
      </div>`;
    })
    .join("");
}

function renderClues(state) {
  if (!state.journal.clues.length) {
    return `<div class="clue-item"><div class="clue-body">线索会随着剧情推进逐步记录在这里。</div></div>`;
  }

  return state.journal.clues
    .slice(0, 4)
    .map(
      (clue) => `<div class="clue-item">
        <div class="clue-title">${escapeHtml(clue.title)}</div>
        <div class="clue-body">${escapeHtml(clue.detail)}</div>
      </div>`
    )
    .join("");
}

function renderImpact(lastOutcome) {
  const stats = [
    { label: "好感", key: "affinity" },
    { label: "信任", key: "trust" },
    { label: "警觉", key: "alertness" }
  ];
  const impactClass =
    lastOutcome.statChanges.trust > 0 || lastOutcome.statChanges.affinity > 0 ? "positive" : "warning";

  return `<div class="impact-item ${impactClass}">
    <div class="impact-label">结果总结</div>
    <div class="impact-value">${escapeHtml(lastOutcome.summary)}</div>
    <div class="impact-statline">
      ${stats
        .map((item) => {
          const delta = lastOutcome.statChanges[item.key];
          const chipClass = delta > 0 ? "up" : delta < 0 ? "down" : "";

          return `<span class="impact-chip ${chipClass}">${item.label} ${formatDelta(delta)}</span>`;
        })
        .join("")}
    </div>
    ${
      lastOutcome.unlockedClues.length
        ? `<div class="impact-label">新增线索：${escapeHtml(lastOutcome.unlockedClues.map((clue) => clue.title).join("、"))}</div>`
        : ""
    }
  </div>`;
}

function renderEndingGallery(target, pack, unlockedEndings, currentEndingId, compact) {
  target.classList.toggle("compact", Boolean(compact));
  target.innerHTML = ENDING_ORDER.map((endingId) => {
    const ending = pack.endings[endingId];
    const unlocked = unlockedEndings.includes(endingId);
    const current = currentEndingId === endingId;
    const classes = ["ending-slot"];

    if (unlocked) classes.push("unlocked");
    if (current) classes.push("current");

    return `<div class="${classes.join(" ")}">
      <span class="slot-icon">${unlocked ? "●" : "○"}</span>
      <div class="${unlocked ? "slot-name" : "slot-name slot-name-locked"}">${escapeHtml(
        unlocked ? ending.title : "尚未解锁"
      )}</div>
    </div>`;
  }).join("");
}

function buildSaveSummary(savedState) {
  if (!savedState) return "还没有保存过旅程。";

  const pack = getStoryPack(savedState.story?.id);
  const latestNode = getLatestNode(savedState);

  if (savedState.currentEnding) {
    const ending = pack.endings[savedState.currentEnding.endingId];
    return `上一次，你以“${savedState.player.alias}”的身份完成了《${pack.title}》的“${ending.title}”。`;
  }

  return `上一次，你停留在《${pack.title}》的“${latestNode?.title || "未知节点"}”，目前进行到第 ${latestNode?.roundIndex || 0} 轮。`;
}

function getLatestNode(state) {
  return state.nodes.find((node) => node.nodeId === state.session.currentNodeId) || state.nodes.at(-1);
}

let currentTheme = null;

function setScreenTheme(elements, storyId) {
  const theme = getStoryPack(storyId).uiTheme || storyId;
  const appShell = document.querySelector(".app-shell");

  // WebGAL-inspired crossfade: when theme changes, old bg fades out, new bg fades in
  if (currentTheme !== null && currentTheme !== theme) {
    crossfadeBackground(elements.gameBgLayer);
  }
  currentTheme = theme;

  if (appShell) {
    appShell.dataset.storyTheme = theme;
  }

  Object.values(elements.screens || {}).forEach((screen) => {
    if (screen) {
      screen.dataset.storyTheme = theme;
    }
  });

  // Set a gentle background camera effect based on theme
  const cameraEffects = {
    mistycity: "bg-breathe",
    campuslove: "bg-drift-right",
    boardroom: "bg-drift-left",
    cyberpunk: "bg-breathe",
    tingwan: "bg-drift-right"
  };
  setBgCameraEffect(elements.gameBgLayer, cameraEffects[theme] || "bg-breathe");
}

/* ── Dynamic Options & Interaction Modes ── */

export function renderDynamicOptions(elements, state) {
  const dynamicOpts = generateDynamicOptions(state);
  const container = document.getElementById("dynamicOptions");
  if (!container) return;

  if (!dynamicOpts.length) {
    container.innerHTML = "";
    return;
  }

  container.innerHTML = `
    <div class="dynamic-options-label">扩展操作</div>
    ${dynamicOpts.map((opt) => {
      const icon = opt.type === "explore" ? svg("search", 16) : opt.type === "dialogue" ? svg("chat", 16) : svg("sparkle", 16);
      return `<button class="dynamic-opt-btn" data-dynamic-type="${escapeHtml(opt.type)}" data-dynamic-id="${escapeHtml(opt.id)}">
        <span class="dynamic-opt-icon">${icon}</span>
        <span class="dynamic-opt-content">
          <span class="dynamic-opt-label">${escapeHtml(opt.label)}</span>
          ${opt.description ? `<span class="dynamic-opt-desc">${escapeHtml(opt.description)}</span>` : ""}
        </span>
      </button>`;
    }).join("")}
  `;
}

/* ── Explore Result Rendering ── */

export function renderExploreResult(elements, result) {
  const container = document.getElementById("interactionFeedback");
  if (!container) return;

  container.innerHTML = `
    <div class="interaction-feedback explore-feedback">
      <div class="feedback-header">
        <span class="feedback-icon">${svg("search", 16)}</span>
        <span class="feedback-title">探索反馈</span>
        <span class="feedback-remaining">剩余 ${result.remaining} 次</span>
      </div>
      ${result.narrativeText ? `<div class="feedback-narrative">${escapeHtml(result.narrativeText)}</div>` : ""}
      <div class="feedback-text">${escapeHtml(result.feedback)}</div>
      ${result.newClue ? `<div class="feedback-clue">
        <span class="feedback-clue-icon">${svg("key", 14)}</span>
        <span>发现线索：<strong>${escapeHtml(result.newClue.title)}</strong></span>
      </div>` : ""}
    </div>
  `;

  container.scrollIntoView({ behavior: "smooth", block: "end" });
}

/* ── Dialogue Result Rendering ── */

export function renderDialogueResult(elements, result) {
  const container = document.getElementById("interactionFeedback");
  if (!container) return;

  container.innerHTML = `
    <div class="interaction-feedback dialogue-feedback">
      <div class="feedback-header">
        <span class="feedback-icon">${svg("chat", 16)}</span>
        <span class="feedback-title">${escapeHtml(result.speaker)}的回应</span>
        <span class="feedback-remaining">剩余 ${result.remaining} 轮</span>
      </div>
      <div class="dialogue-response">
        <div class="dialogue-mood">${escapeHtml(result.mood)}</div>
        <div class="dialogue-text">${escapeHtml(result.response)}</div>
      </div>
      ${result.attitudeShift ? `<div class="feedback-attitude">${escapeHtml(result.attitudeShift)}</div>` : ""}
      ${result.newClue ? `<div class="feedback-clue">
        <span class="feedback-clue-icon">${svg("key", 14)}</span>
        <span>获得线索：<strong>${escapeHtml(result.newClue.title)}</strong></span>
      </div>` : ""}
    </div>
  `;

  container.scrollIntoView({ behavior: "smooth", block: "end" });
}

/* ── Ending Recap Screen ── */

export function renderEndingRecapScreen(elements, recap) {
  const container = document.getElementById("endingRecap");
  if (!container || !recap) return;

  container.innerHTML = `
    <div class="recap-section">
      <div class="recap-title">旅程回顾</div>
      <div class="recap-summary">${escapeHtml(recap.journeySummary)}</div>
    </div>

    <div class="recap-section">
      <div class="recap-subtitle">关键数据</div>
      <div class="recap-stats">
        <div class="recap-stat">
          <span class="recap-stat-label">章节节点</span>
          <span class="recap-stat-value">${recap.nodeCount}</span>
        </div>
        <div class="recap-stat">
          <span class="recap-stat-label">线索收集</span>
          <span class="recap-stat-value">${escapeHtml(recap.cluesFound)}</span>
        </div>
        <div class="recap-stat">
          <span class="recap-stat-label">探索次数</span>
          <span class="recap-stat-value">${recap.exploreCount}</span>
        </div>
        <div class="recap-stat">
          <span class="recap-stat-label">对话次数</span>
          <span class="recap-stat-value">${recap.dialogueCount}</span>
        </div>
      </div>
    </div>

    ${recap.relationship ? `
    <div class="recap-section">
      <div class="recap-subtitle">最终关系</div>
      <div class="recap-relationship">${escapeHtml(recap.relationship)}</div>
      ${recap.characterEpilogue ? `<div class="recap-epilogue">${escapeHtml(recap.characterEpilogue)}</div>` : ""}
    </div>
    ` : ""}

    ${recap.turningPoints.length ? `
    <div class="recap-section">
      <div class="recap-subtitle">关键转折</div>
      <div class="recap-turnings">
        ${recap.turningPoints.map((tp) => `
          <div class="recap-turning">
            <span class="recap-turning-dot"></span>
            <span>${escapeHtml(tp)}</span>
          </div>
        `).join("")}
      </div>
    </div>
    ` : ""}

    ${recap.missedEndings.length ? `
    <div class="recap-section">
      <div class="recap-subtitle">未解锁结局</div>
      <div class="recap-missed">
        ${recap.missedEndings.map((e) => `
          <div class="recap-missed-item">
            <span class="recap-missed-title">${escapeHtml(e.title || "???")}</span>
            ${e.hint ? `<span class="recap-missed-hint">${escapeHtml(e.hint)}</span>` : ""}
          </div>
        `).join("")}
      </div>
    </div>
    ` : ""}
  `;
}
