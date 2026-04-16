import { ENDINGS, PROGRESS_STEPS } from "../config/content.js";
import { ENDING_ORDER, PLAYER_ARCHETYPES } from "../config/constants.js";
import { escapeHtml, formatDelta, getAvatarText } from "../core/utils.js";

export function renderStartScreen(elements, meta, savedState, selectedArchetypeId) {
  elements.continueGameBtn.disabled = !savedState;
  elements.unlockedEndingCount.textContent = `${meta.unlockedEndings.length} / 4`;
  renderEndingGallery(elements.startGallery, meta.unlockedEndings, null, true);
  renderArchetypes(elements, selectedArchetypeId);
  elements.saveSummary.textContent = savedState
    ? savedState.currentEnding
      ? `上次你以“${savedState.player.alias}”完成了「${ENDINGS[savedState.currentEnding.endingId].title}」，可继续回溯探索其他路线。`
      : `上次你以“${savedState.player.alias}”的身份停留在「${getLatestNode(savedState)?.title || "未知节点"}」，目前为第 ${getLatestNode(savedState)?.roundIndex || 0} 轮。`
    : "还没有保存过旅程。";
}

export function renderGameScreen(elements, state) {
  const currentNode = getLatestNode(state);
  const leya = state.characters.leya;

  elements.chapterTag.textContent = currentNode.chapterTag;
  elements.roundTag.textContent = `第 ${currentNode.roundIndex} 轮`;
  elements.npcAvatar.textContent = getAvatarText(leya.name);
  elements.npcName.textContent = leya.name;
  elements.npcMood.textContent = `情绪：${leya.mood}`;
  elements.storyScroll.innerHTML = state.nodes.map((node) => renderStoryNode(state, node)).join("");
  elements.playerProfileCard.innerHTML = `
    <div class="profile-name">${escapeHtml(state.player.alias)}</div>
    <div class="profile-meta">身份取向：${escapeHtml(state.player.archetypeTitle)}</div>
    <div class="note-body">${escapeHtml(state.player.archetypeDescription)}</div>
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
  elements.progressList.innerHTML = renderProgress(currentNode.progressKey);
  elements.clueList.innerHTML = renderClues(state);
  elements.impactList.innerHTML = renderImpact(state.lastOutcome);
  elements.choiceList.innerHTML = currentNode.choiceOptions
    .map(
      (choice, index) => `<button class="choice-btn awaiting-reveal" data-choice-id="${choice.id}">
        <span class="choice-num">${index + 1}</span>
        <span>${escapeHtml(choice.label)}</span>
      </button>`
    )
    .join("");
}

export function renderEndingScreen(elements, state) {
  const ending = ENDINGS[state.currentEnding.endingId];
  elements.endingBadge.textContent = ending.badge;
  elements.endingCode.textContent = ending.code;
  elements.endingTitle.textContent = ending.title;
  elements.endingSubtitle.textContent = ending.subtitle;
  elements.endingDescription.textContent = ending.description;
  elements.endingConditions.innerHTML = ending.conditions
    .map(
      (condition) => `<div class="cond-item met">
        <div class="cond-icon">◆</div>
        <div class="cond-label">${escapeHtml(condition.label)}</div>
        <div class="cond-val">${escapeHtml(condition.value)}</div>
      </div>`
    )
    .join("");
  renderEndingGallery(elements.endingGallery, state.meta.unlockedEndings, ending.id, false);
}

export function renderRollbackModal(elements, state) {
  const currentNode = getLatestNode(state);
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
                  <div class="choice-preview-text">你当时的选择：${escapeHtml(checkpoint.choicePreview)}</div>
                </div>`
              : ""
          }
          ${
            isCurrent
              ? ""
              : `<button class="rollback-btn" data-checkpoint-id="${checkpoint.checkpointId}">回溯至此</button>`
          }
        </div>
      </div>`;
    })
    .join("");
  elements.rollbackCount.textContent = `共 ${state.checkpoints.length} 个可回溯节点`;
  elements.rollbackRound.textContent = `第 ${currentNode.roundIndex} 轮`;
  elements.rollbackEndingSummary.textContent = `${state.meta.unlockedEndings.length} / 4`;
}

export function showToast(elements, message) {
  elements.toast.textContent = message;
  elements.toast.classList.remove("hidden");
  window.clearTimeout(elements.toastTimer);
  elements.toastTimer = window.setTimeout(() => {
    elements.toast.classList.add("hidden");
  }, 2400);
}

function renderArchetypes(elements, selectedArchetypeId) {
  elements.archetypeButtons.innerHTML = Object.values(PLAYER_ARCHETYPES)
    .map(
      (archetype) => `<button class="archetype-btn ${selectedArchetypeId === archetype.id ? "active" : ""}" data-archetype-id="${archetype.id}">
        <span class="archetype-title">${escapeHtml(archetype.title)}</span>
        <span class="archetype-note">${escapeHtml(archetype.short)}</span>
      </button>`
    )
    .join("");
  elements.archetypeDescription.textContent =
    PLAYER_ARCHETYPES[selectedArchetypeId]?.description || "";
}

function renderStoryNode(state, node) {
  const isCurrent = node.nodeId === state.session.currentNodeId;
  const choiceBlock = node.incomingChoiceLabel
    ? `<div class="node-choice-preview">
        <div class="event-dot"></div>
        <div class="choice-preview-text">你的回应：${escapeHtml(node.incomingChoiceLabel)}</div>
      </div>`
    : "";

  return `<article class="story-node ${isCurrent ? "current" : ""}">
    <div class="scene-tag">${escapeHtml(node.sceneTag)}</div>
    <h3 class="node-title">${escapeHtml(node.title)}</h3>
    <p class="story-text ${isCurrent ? "typewriter-target pending-type" : ""}" data-typewriter="${isCurrent ? "story" : ""}">${escapeHtml(node.storyText)}</p>
    <div class="npc-dialogue">
      <div class="dialogue-speaker">${escapeHtml(state.characters.leya.name)}</div>
      <div class="dialogue-text ${isCurrent ? "typewriter-target pending-type" : ""}" data-typewriter="${isCurrent ? "dialogue" : ""}">${escapeHtml(node.npcDialogue)}</div>
    </div>
    ${choiceBlock}
    <div class="event-hint">
      <div class="event-dot"></div>
      <div class="event-hint-text">${escapeHtml(node.eventHint)}</div>
    </div>
  </article>`;
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
              ? `<div class="stage-badge">状态：未接触</div>`
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
                <div class="stage-badge">阶段：${escapeHtml(character.relationshipStage)}</div>`
          }
        </div>
      </div>`;
    })
    .join("");
}

function renderProgress(currentKey) {
  const currentIndex = PROGRESS_STEPS.findIndex((step) => step.key === currentKey);
  return PROGRESS_STEPS.map((step, index) => {
    const status = index < currentIndex ? "done" : index === currentIndex ? "cur" : "fut";
    return `<div class="prog-step">
      <div class="pdot ${status}"></div>
      <div class="plbl ${status}">${escapeHtml(step.label)}</div>
    </div>`;
  }).join("");
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
        ? `<div class="impact-label">新增线索：${escapeHtml(
            lastOutcome.unlockedClues.map((clue) => clue.title).join("、")
          )}</div>`
        : ""
    }
  </div>`;
}

function renderEndingGallery(target, unlockedEndings, currentEndingId, compact) {
  target.classList.toggle("compact", Boolean(compact));
  target.innerHTML = ENDING_ORDER.map((endingId) => {
    const ending = ENDINGS[endingId];
    const unlocked = unlockedEndings.includes(endingId);
    const current = currentEndingId === endingId;
    const classes = ["ending-slot"];
    if (unlocked) classes.push("unlocked");
    if (current) classes.push("current");
    return `<div class="${classes.join(" ")}">
      <span class="slot-icon">${unlocked ? "◆" : "◌"}</span>
      <div class="${unlocked ? "slot-name" : "slot-name slot-name-locked"}">${escapeHtml(
        unlocked ? ending.title : "未解锁"
      )}</div>
    </div>`;
  }).join("");
}

function getLatestNode(state) {
  return state.nodes.find((node) => node.nodeId === state.session.currentNodeId) || state.nodes.at(-1);
}
