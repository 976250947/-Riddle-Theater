import {
  applyEndingMeta,
  createInitialState,
  getCurrentNode,
  getCurrentStage,
  inferChoiceFromText,
  enhancedInferChoice,
  normalizeState,
  resolveEndingData,
  rollbackToCheckpoint,
  submitChoice,
  submitExploreAction,
  submitDialogue,
  generateDynamicOptions,
  generateEndingRecap,
  getWorldState,
  resetStageInteraction
} from "./core/story-engine.js";
import { createPerformController } from "./core/perform-controller.js";
import { loadMeta, loadSession, saveMeta, saveSession, getSaveSlots, saveToSlot, loadFromSlot, deleteSlot } from "./core/story-storage.js";
import { DEFAULT_STORY_ID, getStoryPack } from "./config/story-packs.js";
import {
  crossfadeBackground,
  initTopbarAutoHide,
  playCurrentNodeReveal,
  playStreamTransition,
  resetTopbarAutoHide,
  setBgCameraEffect,
  setInteractionDisabled,
  startVnTypewriter,
  stopStreamTransition,
  transitionToScreen
} from "./ui/animations.js";
import { getElements } from "./ui/dom.js";
import {
  renderCatalogScreen,
  renderAtlasScreen,
  renderCommunityScreen,
  renderProfileScreen,
  renderRankingScreen,
  renderStudioScreen
} from "./ui/site-pages.js";
import {
  renderEndingScreen,
  renderGameScreen,
  renderLibraryScreen,
  renderRollbackModal,
  renderSaveModal,
  renderStartScreen,
  renderExploreResult,
  renderDialogueResult,
  renderVnLine,
  renderVnLineComplete,
  renderVnChoices,
  renderBacklog,
  renderEndingRecapScreen,
  showToast
} from "./ui/story-renderers.js";
import { loadLLMSettings, renderLLMSettingsPanel } from "./ui/llm-settings.js";
import { isLoggedIn, getLocalUser, clearAuth, login, register, loginAsGuest } from "./core/api-client.js";

const DRAFT_PROFILE_KEY = "ai-narrative-game-draft-profile";
const elements = getElements();
const appShell = document.querySelector(".app-shell");

let selectedArchetypeId = "witness";
let selectedStoryId = DEFAULT_STORY_ID;
let catalogCategory = "all";
let catalogSort = "recommended";
let catalogQuery = "";
let startScreenMode = "info";
let state = null;
let isBusy = false;
let currentSaveMode = "save";
let vnTypewriterCtrl = null;
let authMode = "login"; // "login" | "register"

// Create the VN perform controller
const performCtrl = createPerformController();
performCtrl.setCallbacks({
  onLine(line, _idx) {
    renderVnLine(elements, line, state);
    vnTypewriterCtrl = startVnTypewriter(elements, () => {
      performCtrl.notifyTypingComplete();
    });
  },
  onChoices() {
    renderVnChoices(elements, state);
    renderVnDynamicOptions();
    bindVnChoiceEvents();
  },
  onCueCallback(cue) {
    if (cue.bg) crossfadeBackground(elements.gameBgLayer, cue.bg);
    if (cue.camera) setBgCameraEffect(elements.gameBgLayer, cue.camera);
  },
  onTypeDone() {
    renderVnLineComplete(elements);
  },
  onDone() {
    // All lines exhausted — shouldn't normally happen since last line is "choices"
  }
});

init();

function init() {
  loadLLMSettings();
  bindStaticEvents();
  bindAuthEvents();
  bindNavToggle();
  hydrateStartInputs();
  refreshLibrary();
  refreshNavUser();

  // WebGAL-inspired: topbar auto-hide when in game
  const gameTopbar = document.querySelector(".game-topbar");
  const gameScreen = elements.screens.game;
  initTopbarAutoHide(gameTopbar, gameScreen);

}

function bindStaticEvents() {
  elements.navButtons.forEach((button) => {
    button.addEventListener("click", () => {
      handleNavSelection(button.dataset.navTarget);
    });
  });
  // profileEntryBtn click is handled in bindAuthEvents
  elements.enterStoryBtn.addEventListener("click", openStorySetup);
  elements.openCatalogBtn?.addEventListener("click", () => {
    catalogCategory = "all";
    openCatalogScreen();
  });
  elements.libraryContinueBtn.addEventListener("click", handleContinueGame);
  elements.libraryShowGalleryBtn.addEventListener("click", openAtlasScreen);
  elements.homeFilterTabs?.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    const button = target.closest("[data-home-catalog-category]");
    if (!(button instanceof HTMLElement)) return;
    catalogCategory = button.dataset.homeCatalogCategory;
    openCatalogScreen();
  });
  elements.catalogSearchInput?.addEventListener("input", (event) => {
    catalogQuery = event.target.value;
    openCatalogScreen();
  });
  elements.catalogFilterTabs?.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    const button = target.closest("[data-catalog-category]");
    if (!(button instanceof HTMLElement)) return;
    catalogCategory = button.dataset.catalogCategory;
    openCatalogScreen();
  });
  elements.catalogSortSelect?.addEventListener("change", (event) => {
    catalogSort = event.target.value;
    openCatalogScreen();
  });
  elements.startNewGameBtn.addEventListener("click", handleStartNewGame);
  elements.continueGameBtn.addEventListener("click", handleContinueGame);
  elements.backToLibraryBtn.addEventListener("click", openCatalogScreen);
  elements.detailInfoTab?.addEventListener("click", () => openStorySetup("info"));
  elements.detailSetupTab?.addEventListener("click", openStorySetupAndFocus);
  elements.detailAtlasTab?.addEventListener("click", openAtlasScreen);
  elements.atlasBackBtn?.addEventListener("click", openStorySetup);
  elements.atlasInfoTab?.addEventListener("click", () => openStorySetup("info"));
  elements.atlasSetupTab?.addEventListener("click", openStorySetupAndFocus);
  elements.showGalleryBtn.addEventListener("click", openAtlasScreen);
  elements.playerAliasInput.addEventListener("input", persistDraftProfile);
  elements.freeInputForm.addEventListener("submit", handleFreeInputSubmit);
  elements.rollbackBtn.addEventListener("click", openRollbackModal);
  elements.closeRollbackBtn.addEventListener("click", closeRollbackModal);
  elements.saveBtn.addEventListener("click", () => openSaveModal("save"));
  elements.loadBtn.addEventListener("click", () => openSaveModal("load"));
  elements.closeSaveModalBtn.addEventListener("click", closeSaveModal);

  // Info drawer toggle
  elements.clueRecordBtn?.addEventListener("click", () => {
    elements.gameInfoDrawer?.classList.remove("hidden");
  });
  elements.closeDrawerBtn?.addEventListener("click", () => {
    elements.gameInfoDrawer?.classList.add("hidden");
  });
  elements.gameInfoDrawer?.addEventListener("click", (event) => {
    const target = event.target;
    if (target instanceof HTMLElement && target.dataset.closeDrawer === "true") {
      elements.gameInfoDrawer.classList.add("hidden");
    }
  });

  // VN click-to-advance: clicking the textbox or click area advances dialogue
  elements.vnClickArea?.addEventListener("click", () => {
    if (isBusy) return;
    // If typewriter is running, skip it; otherwise advance to next line
    if (vnTypewriterCtrl && performCtrl.getState() === "typing") {
      vnTypewriterCtrl.skip();
      vnTypewriterCtrl = null;
    } else {
      performCtrl.advance();
    }
  });
  elements.vnTextbox?.addEventListener("click", () => {
    if (isBusy) return;
    if (vnTypewriterCtrl && performCtrl.getState() === "typing") {
      vnTypewriterCtrl.skip();
      vnTypewriterCtrl = null;
    } else {
      performCtrl.advance();
    }
  });

  // ── VN Control Panel: LOG button → open backlog ──
  elements.vnLogBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    if (elements.vnBacklogOverlay) {
      renderBacklog(elements, performCtrl.getHistory());
      elements.vnBacklogOverlay.classList.remove("hidden");
    }
  });

  // ── VN Backlog: close ──
  elements.vnBacklogClose?.addEventListener("click", () => {
    if (elements.vnBacklogOverlay) {
      elements.vnBacklogOverlay.classList.add("hidden");
    }
  });

  // ── VN Keyboard Shortcuts ──
  document.addEventListener("keydown", (e) => {
    // Auth modal ESC — works even when focused on inputs
    const authOpen = elements.authModal && !elements.authModal.classList.contains("hidden");
    if (e.key === "Escape" && authOpen) { closeAuthModal(); return; }

    // Skip if typing in an input/textarea
    if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;

    const backlogOpen = elements.vnBacklogOverlay && !elements.vnBacklogOverlay.classList.contains("hidden");
    const saveModalOpen = elements.saveModal && !elements.saveModal.classList.contains("hidden");

    // ESC: close any open overlay, cascading priority
    if (e.key === "Escape") {
      if (backlogOpen) { elements.vnBacklogOverlay.classList.add("hidden"); return; }
      if (saveModalOpen) { closeSaveModal(); return; }
      const rollbackOpen = elements.rollbackModal && !elements.rollbackModal.classList.contains("hidden");
      if (rollbackOpen) { closeRollbackModal(); return; }
      const drawerOpen = elements.gameInfoDrawer && !elements.gameInfoDrawer.classList.contains("hidden");
      if (drawerOpen) { elements.gameInfoDrawer.classList.add("hidden"); return; }
      return;
    }

    // Don't process game shortcuts if overlay is open
    if (backlogOpen || saveModalOpen) return;

    // Only handle game shortcuts when performCtrl is active (not idle)
    const pState = performCtrl.getState();
    if (pState === "idle") return;

    switch (e.key) {
      case " ": // Space — advance / skip typewriter
      case "Enter":
        e.preventDefault();
        if (isBusy) return;
        if (vnTypewriterCtrl && pState === "typing") {
          vnTypewriterCtrl.skip();
          vnTypewriterCtrl = null;
        } else {
          performCtrl.advance();
        }
        break;
      case "h":
      case "H":
        // H — open backlog
        if (elements.vnBacklogOverlay) {
          renderBacklog(elements, performCtrl.getHistory());
          elements.vnBacklogOverlay.classList.remove("hidden");
        }
        break;
      case "s":
      case "S":
        // S — save
        if (!e.ctrlKey && !e.metaKey) {
          e.preventDefault();
          openSaveModal("save");
        }
        break;
      case "l":
      case "L":
        // L — load
        if (!e.ctrlKey && !e.metaKey) {
          e.preventDefault();
          openSaveModal("load");
        }
        break;
    }
  });

  // ── VN Control Panel: AUTO / SKIP (placeholder — show toast) ──
  elements.vnAutoBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    showToast(elements, "自动播放功能即将推出");
  });
  elements.vnSkipBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    showToast(elements, "快进功能即将推出");
  });

  elements.saveModal.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    if (target.dataset.closeModal === "true" || target.dataset.closeSaveModal === "true") {
      closeSaveModal();
      return;
    }
    if (target.dataset.slotDelete !== undefined) {
      const idx = parseInt(target.dataset.slotDelete, 10);
      deleteSlot(idx);
      showToast(elements, `槽位 ${idx + 1} 已清空。`);
      renderSaveModal(elements, getSaveSlots(), currentSaveMode);
      bindSaveSlotEvents();
      return;
    }
    const slot = target.closest("[data-slot-action][data-slot-index]");
    if (slot instanceof HTMLElement && slot.dataset.slotAction) {
      const idx = parseInt(slot.dataset.slotIndex, 10);
      if (slot.dataset.slotAction === "save") {
        handleSaveToSlot(idx);
      } else if (slot.dataset.slotAction === "load") {
        handleLoadFromSlot(idx);
      }
    }
  });
  elements.backToMenuBtn.addEventListener("click", () => {
    closeRollbackModal();
    refreshLibrary();
  });
  elements.rollbackFromEndingBtn.addEventListener("click", () => {
    renderGameScreen(elements, state);
    openRollbackModal();
  });
  elements.restartBtn.addEventListener("click", handleStartNewGame);
  elements.endingBackToMenuBtn.addEventListener("click", refreshLibrary);
  elements.rollbackModal.addEventListener("click", (event) => {
    const target = event.target;
    if (target instanceof HTMLElement && target.dataset.closeModal === "true") {
      closeRollbackModal();
    }
  });
}

function bindNavToggle() {
  const toggle = document.getElementById("navToggle");
  const navLinks = document.getElementById("navLinks");
  if (!toggle || !navLinks) return;
  toggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("nav-open");
    toggle.classList.toggle("is-open", isOpen);
    toggle.setAttribute("aria-expanded", String(isOpen));
  });
  navLinks.addEventListener("click", () => {
    navLinks.classList.remove("nav-open");
    toggle.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
  });
}

function hydrateStartInputs() {
  const draft = readDraftProfile();
  const saved = loadSession();

  elements.playerAliasInput.value = draft.alias || saved?.player?.alias || "无名旅人";
  selectedArchetypeId = draft.archetypeId || saved?.player?.archetypeId || "witness";
  selectedStoryId = draft.storyId || saved?.story?.id || DEFAULT_STORY_ID;
}

function refreshLibrary() {
  const meta = loadMeta();
  const saved = loadSession();

  applyStoryTheme(selectedStoryId);
  renderLibraryScreen(elements, meta, saved, selectedStoryId);
  bindStoryShelf();
  bindLibraryPreview();
  syncHomeFilters();
  setNavActive("library");
  transitionToScreen(elements, "library");
}

function openStorySetup(mode = startScreenMode) {
  const meta = loadMeta();
  const saved = loadSession();
  startScreenMode = mode;

  applyStoryTheme(selectedStoryId);
  renderStartScreen(elements, meta, saved, selectedArchetypeId, selectedStoryId, startScreenMode);
  bindArchetypeButtons();
  setNavActive("catalog");
  transitionToScreen(elements, "start");
}

async function openCatalogScreen() {
  const meta = loadMeta();
  applyStoryTheme(selectedStoryId);
  renderCatalogScreen(elements, meta, {
    query: catalogQuery,
    category: catalogCategory,
    sort: catalogSort
  });
  bindCatalogControls();
  bindCatalogGrid();
  setNavActive("catalog");
  await transitionToScreen(elements, "catalog");
}

function openStorySetupAndFocus() {
  openStorySetup("setup");
  window.setTimeout(() => {
    elements.playerAliasInput?.focus();
  }, 120);
}

async function openAtlasScreen() {
  const meta = loadMeta();
  applyStoryTheme(selectedStoryId);
  renderAtlasScreen(elements, meta, selectedStoryId);
  setNavActive("catalog");
  await transitionToScreen(elements, "atlas");
}

async function openStudioScreen() {
  const meta = loadMeta();
  const saved = loadSession();
  applyStoryTheme(selectedStoryId);
  renderStudioScreen(elements, meta, saved, selectedStoryId);
  setNavActive("studio");
  await transitionToScreen(elements, "studio");
}

async function openRankingScreen() {
  const meta = loadMeta();
  applyStoryTheme(selectedStoryId);
  renderRankingScreen(elements, meta);
  setNavActive("ranking");
  await transitionToScreen(elements, "ranking");
}

async function openCommunityScreen() {
  const meta = loadMeta();
  const saved = loadSession();
  applyStoryTheme(selectedStoryId);
  renderCommunityScreen(elements, meta, saved, selectedStoryId);
  setNavActive("community");
  await transitionToScreen(elements, "community");
}

async function openProfileScreen() {
  const meta = loadMeta();
  const saved = loadSession();
  applyStoryTheme(selectedStoryId);
  renderProfileScreen(elements, meta, saved);
  if (elements.llmSettingsContainer) {
    renderLLMSettingsPanel(elements.llmSettingsContainer);
  }
  setNavActive(null, true);
  await transitionToScreen(elements, "profile");
}

function handleNavSelection(target) {
  switch (target) {
    case "library":
      refreshLibrary();
      return;
    case "catalog":
      openCatalogScreen();
      return;
    case "studio":
      openStudioScreen();
      return;
    case "ranking":
      openRankingScreen();
      return;
    case "community":
      openCommunityScreen();
      return;
    default:
      refreshLibrary();
  }
}

function bindArchetypeButtons() {
  elements.archetypeButtons.querySelectorAll("[data-archetype-id]").forEach((button) => {
    button.addEventListener("click", () => {
      selectedArchetypeId = button.dataset.archetypeId;
      persistDraftProfile();
      openStorySetup();
    });
  });
}

function bindStoryShelf() {
  elements.storyShelfGrid.querySelectorAll("[data-story-id]").forEach((button) => {
    button.addEventListener("click", () => {
      selectedStoryId = button.dataset.storyId;
      persistDraftProfile();
      openStorySetup("info");
    });
  });
}

function bindLibraryPreview() {
  elements.libraryPreviewCard.querySelectorAll("[data-preview-story-id]").forEach((button) => {
    button.addEventListener("click", () => {
      selectedStoryId = button.dataset.previewStoryId;
      persistDraftProfile();
      refreshLibrary();
    });
  });

  elements.libraryPreviewCard.querySelector("[data-open-story-preview='true']")?.addEventListener("click", () => {
    openStorySetup("info");
  });
}

function bindCatalogControls() {
  elements.catalogFilterTabs?.querySelectorAll("[data-catalog-category]").forEach((button) => {
    button.classList.toggle("active", button.dataset.catalogCategory === catalogCategory);
  });
  if (elements.catalogSortSelect) {
    elements.catalogSortSelect.value = catalogSort;
  }
}

function syncHomeFilters() {
  elements.homeFilterTabs?.querySelectorAll("[data-home-catalog-category]").forEach((button) => {
    const isActive =
      (button.dataset.homeCatalogCategory || "all") === (catalogCategory || "all");
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
}

function bindCatalogGrid() {
  elements.catalogGrid?.querySelectorAll("[data-catalog-story-id]").forEach((button) => {
    button.addEventListener("click", () => {
      selectedStoryId = button.dataset.catalogStoryId;
      persistDraftProfile();
      openStorySetup();
    });
  });
}

function readDraftProfile() {
  try {
    return JSON.parse(localStorage.getItem(DRAFT_PROFILE_KEY) || "{}");
  } catch {
    return {};
  }
}

function persistDraftProfile() {
  const alias = elements.playerAliasInput.value.trim() || "无名旅人";
  localStorage.setItem(
    DRAFT_PROFILE_KEY,
    JSON.stringify({ alias, archetypeId: selectedArchetypeId, storyId: selectedStoryId })
  );
}

async function handleStartNewGame() {
  const alias = elements.playerAliasInput.value.trim() || "无名旅人";
  const pack = getStoryPack(selectedStoryId);
  applyStoryTheme(selectedStoryId);

  state = createInitialState(loadMeta(), {
    alias,
    archetypeId: selectedArchetypeId,
    storyId: selectedStoryId
  });
  performCtrl.clearHistory();
  saveSession(state);
  renderGameScreen(elements, state);
  setNavActive("catalog");

  // Prepare intro overlay before screen transition so there's no flash
  prepareStoryIntro(pack);
  await transitionToScreen(elements, "game");

  // Cinematic intro → then start VN
  activateStoryIntro(() => {
    startVnPerformance();
    showToast(elements, `新的旅程已经开始：《${pack.title}》`);
  });
}

async function handleContinueGame() {
  const saved = loadSession();
  if (!saved) {
    showToast(elements, "没有找到可继续的存档，先开启一段新的旅程吧。")
    return;
  }

  state = normalizeState(saved);
  selectedArchetypeId = state.player.archetypeId;
  selectedStoryId = state.story.id;
  applyStoryTheme(selectedStoryId);
  elements.playerAliasInput.value = state.player.alias;
  persistDraftProfile();

  if (state.currentEnding && state.session.status === "completed") {
    renderEndingScreen(elements, state);
    setNavActive("catalog");
    await transitionToScreen(elements, "ending");
    showToast(elements, `已回到《${state.story.title}》的“${resolveEndingData(state).title}”结局页。`);
    return;
  }

  renderGameScreen(elements, state);
  setNavActive("catalog");
  await transitionToScreen(elements, "game");
  startVnPerformance();
  showToast(elements, `已恢复《${state.story.title}》的旅程。`);
}

function handleFreeInputSubmit(event) {
  event.preventDefault();
  if (!state || isBusy) return;

  const text = elements.freeInput.value.trim();
  if (!text) {
    showToast(elements, "先写下你的回应，再让剧情继续。");
    return;
  }

  const currentMode = state.session.activeInteractionMode || "freeInput";

  if (currentMode === "explore") {
    // Hide overlay, show textbox for feedback
    if (elements.vnChoiceOverlay) elements.vnChoiceOverlay.classList.add("hidden");
    if (elements.vnTextbox) elements.vnTextbox.classList.remove("vn-hidden");
    handleExploreInput(text);
    elements.freeInput.value = "";
    return;
  }

  if (currentMode === "dialogue") {
    if (elements.vnChoiceOverlay) elements.vnChoiceOverlay.classList.add("hidden");
    if (elements.vnTextbox) elements.vnTextbox.classList.remove("vn-hidden");
    handleDialogueInput(text);
    elements.freeInput.value = "";
    return;
  }

  const stage = getCurrentStage(state);
  const result = enhancedInferChoice(state, stage, text);

  if (result.suggestedFeedback) {
    showToast(elements, result.suggestedFeedback);
  }

  commitChoice({
    choiceType: "freeText",
    choiceValue: text,
    parsedIntent: result.choice.intent,
    matchedChoiceId: result.choice.id
  });
  elements.freeInput.value = "";
}

async function handleExploreInput(text) {
  if (isBusy) return;
  isBusy = true;
  setInteractionDisabled(elements, true);

  const result = await submitExploreAction(state, text);

  if (!result.success) {
    showToast(elements, result.feedback);
    setInteractionDisabled(elements, false);
    isBusy = false;
    return;
  }

  saveSession(state);

  // Insert explore result as VN dialogue lines
  const exploreLines = [];
  if (result.narrativeText) {
    exploreLines.push({ speaker: null, text: result.narrativeText });
  }
  exploreLines.push({ speaker: null, text: result.feedback });
  if (result.newClue) {
    exploreLines.push({ speaker: null, text: `发现线索：${result.newClue.title}` });
  }
  exploreLines.push({ type: "choices" });
  performCtrl.insertLines(exploreLines);
  // Return to VN flow — advance past current waiting state
  performCtrl.advance();
  setInteractionDisabled(elements, false);

  if (result.newClue) {
    showToast(elements, `发现新线索：${result.newClue.title}`);
  } else {
    showToast(elements, result.feedback.slice(0, 40));
  }
  isBusy = false;
}

async function handleDialogueInput(text) {
  if (isBusy) return;
  isBusy = true;
  setInteractionDisabled(elements, true);

  const targetId = state.session.dialogueTarget || state.story.primaryCharacterId;
  const result = await submitDialogue(state, targetId, text);

  if (!result.success) {
    showToast(elements, result.response);
    setInteractionDisabled(elements, false);
    isBusy = false;
    return;
  }

  saveSession(state);

  // Insert dialogue result as VN lines
  const dialogueLines = [];
  dialogueLines.push({ speaker: result.speaker, text: result.response, mood: result.mood });
  if (result.attitudeShift) {
    dialogueLines.push({ speaker: null, text: result.attitudeShift });
  }
  if (result.newClue) {
    dialogueLines.push({ speaker: null, text: `获得线索：${result.newClue.title}` });
  }
  dialogueLines.push({ type: "choices" });
  performCtrl.insertLines(dialogueLines);
  performCtrl.advance();
  setInteractionDisabled(elements, false);
  showToast(elements, `${result.speaker}回应了你的话。`);
  isBusy = false;
}

function switchInteractionMode(mode) {
  state.session.activeInteractionMode = mode;
  const placeholders = {
    freeInput: "输入你的自然语言回应，例如：我愿意告诉你真相",
    explore: "描述你想调查的内容，例如：检查桌面上的旧信件",
    dialogue: "输入你想对角色说的话，例如：你昨晚在哪里"
  };
  elements.freeInput.placeholder = placeholders[mode] || placeholders.freeInput;
  elements.freeInput.maxLength = mode === "freeInput" ? 60 : 120;

  const modeLabel = elements.freeInputForm.querySelector(".input-mode-label");
  if (modeLabel) {
    const labels = { freeInput: "自由行动", explore: "探索模式", dialogue: "对话模式" };
    modeLabel.textContent = labels[mode] || "自由行动";
  }
}

async function commitChoice(payload) {
  if (isBusy) return;

  isBusy = true;
  setInteractionDisabled(elements, true);

  // Hide choice overlay while processing
  if (elements.vnChoiceOverlay) elements.vnChoiceOverlay.classList.add("hidden");
  if (elements.vnTextbox) elements.vnTextbox.classList.remove("vn-hidden");

  await playStreamTransition(elements, payload.choiceValue);

  const outcome = submitChoice(state, payload);
  stopStreamTransition(elements);

  if (state.currentEnding) {
    const meta = loadMeta();
    applyEndingMeta(state, meta);
    saveMeta(meta);
    saveSession(state);
    const recap = generateEndingRecap(state);
    renderEndingScreen(elements, state);
    renderEndingRecapScreen(elements, recap);
    setNavActive("catalog");
    await transitionToScreen(elements, "ending");
    showToast(elements, `已达成：《${state.story.title}》的“${resolveEndingData(state).title}”`);
    isBusy = false;
    return;
  }

  saveSession(state);
  renderGameScreen(elements, state);
  setNavActive("catalog");
  await transitionToScreen(elements, "game");
  startVnPerformance();
  showToast(elements, outcome.summary);
  isBusy = false;
}

/* ── VN Core Functions ── */

/** Start the VN performance for the current node's dialogueLines */
function startVnPerformance() {
  const currentNode = getCurrentNode(state);
  if (!currentNode || !currentNode.dialogueLines) return;

  // Resume from saved line index if present
  const startIdx = state.session.vnLineIndex || 0;
  const lines = currentNode.dialogueLines.slice(startIdx);
  performCtrl.startPerformance(lines);
}

/** Bind VN choice button events (called when choice overlay appears) */
function bindVnChoiceEvents() {
  const currentNode = getCurrentNode(state);
  if (!currentNode) return;

  elements.vnChoiceList.querySelectorAll("[data-choice-id]").forEach((button) => {
    button.addEventListener("click", () => {
      if (isBusy) return;

      const choice = currentNode.choiceOptions.find((item) => item.id === button.dataset.choiceId);
      if (!choice) return;

      commitChoice({
        choiceType: "preset",
        choiceValue: choice.label,
        parsedIntent: choice.intent,
        matchedChoiceId: choice.id
      });
    });
  });

  // Dynamic options in VN overlay
  const dynContainer = elements.vnDynamicOptions;
  if (dynContainer) {
    dynContainer.querySelectorAll("[data-dynamic-type]").forEach((button) => {
      button.addEventListener("click", () => {
        if (isBusy) return;
        const type = button.dataset.dynamicType;
        if (type === "explore") {
          switchInteractionMode("explore");
          elements.freeInput.focus();
        } else if (type === "dialogue") {
          state.session.dialogueTarget = state.story.primaryCharacterId;
          switchInteractionMode("dialogue");
          elements.freeInput.focus();
        } else if (type === "temp") {
          const tempId = button.dataset.dynamicId;
          const tempOpt = (state.session.tempOptions || []).find((o) => o.id === tempId);
          if (tempOpt) {
            commitChoice({
              choiceType: "dynamic",
              choiceValue: tempOpt.label,
              parsedIntent: tempOpt.intent,
              matchedChoiceId: null
            });
          }
        }
      });
    });
  }
}

/** Render VN dynamic options into the overlay container */
function renderVnDynamicOptions() {
  const container = elements.vnDynamicOptions;
  if (!container) return;
  const dynamicOpts = generateDynamicOptions(state);
  if (!dynamicOpts.length) {
    container.innerHTML = "";
    return;
  }
  container.innerHTML = dynamicOpts.map((opt) => {
    return `<button class="dynamic-opt-btn choice-btn awaiting-reveal visible" data-dynamic-type="${opt.type}" data-dynamic-id="${opt.id}">
      <span class="choice-num">${opt.type === "explore" ? "🔍" : opt.type === "dialogue" ? "💬" : "✨"}</span>
      <span>${opt.label}</span>
    </button>`;
  }).join("");
}

function handleManualSave() {
  if (!state) return;
  saveSession(state);
  showToast(elements, "当前旅程已自动存档。");
}

function openSaveModal(mode) {
  if (!state && mode === "save") {
    showToast(elements, "还没有正在进行的旅程。");
    return;
  }
  currentSaveMode = mode;
  renderSaveModal(elements, getSaveSlots(), mode);
  bindSaveSlotEvents();
  elements.saveModal.classList.remove("hidden");
  elements.saveModal.setAttribute("aria-hidden", "false");
}

function closeSaveModal() {
  elements.saveModal.classList.add("hidden");
  elements.saveModal.setAttribute("aria-hidden", "true");
}

function bindSaveSlotEvents() {
  /* events are delegated via saveModal click handler */
}

function handleSaveToSlot(index) {
  if (!state) return;
  const name = state.story?.title
    ? `${state.story.title} · ${state.player?.alias || ""}`
    : `存档 ${index + 1}`;
  saveToSlot(index, state, name);
  saveSession(state);
  showToast(elements, `已保存到槽位 ${index + 1}。`);
  renderSaveModal(elements, getSaveSlots(), currentSaveMode);
}

async function handleLoadFromSlot(index) {
  const loaded = loadFromSlot(index);
  if (!loaded) {
    showToast(elements, "该槽位没有存档数据。");
    return;
  }
  closeSaveModal();
  state = normalizeState(loaded);
  selectedArchetypeId = state.player.archetypeId;
  selectedStoryId = state.story.id;
  applyStoryTheme(selectedStoryId);
  elements.playerAliasInput.value = state.player.alias;
  persistDraftProfile();
  saveSession(state);

  if (state.currentEnding && state.session.status === "completed") {
    renderEndingScreen(elements, state);
    setNavActive("catalog");
    await transitionToScreen(elements, "ending");
    showToast(elements, `已加载槽位 ${index + 1} 的结局存档。`);
    return;
  }

  renderGameScreen(elements, state);
  setNavActive("catalog");
  await transitionToScreen(elements, "game");
  startVnPerformance();
  showToast(elements, `已从槽位 ${index + 1} 加载旅程。`);
}

function openRollbackModal() {
  if (!state || !state.checkpoints.length || isBusy) {
    showToast(elements, "当前还没有可回溯的关键节点。");
    return;
  }

  renderRollbackModal(elements, state);
  elements.rollbackModal.classList.remove("hidden");
  elements.rollbackModal.setAttribute("aria-hidden", "false");
  elements.rollbackTimeline.querySelectorAll("[data-checkpoint-id]").forEach((button) => {
    button.addEventListener("click", async () => {
      const rolled = rollbackToCheckpoint(state, button.dataset.checkpointId, loadMeta());
      if (!rolled) return;

      state = rolled;
      saveSession(state);
      closeRollbackModal();
      renderGameScreen(elements, state);
      setNavActive("catalog");
      await transitionToScreen(elements, "game");
      startVnPerformance();
      showToast(elements, "已回到关键节点，你可以重新改写这段旅程。");
    });
  });
}

function closeRollbackModal() {
  elements.rollbackModal.classList.add("hidden");
  elements.rollbackModal.setAttribute("aria-hidden", "true");
}

/**
 * Cinematic story intro sequence (two-phase for seamless transition).
 * All animations are pure CSS @keyframes — no JS class toggles for key reveal.
 * prepareStoryIntro: populate & show overlay (call BEFORE screen transition)
 * activateStoryIntro: bind dismiss events (call AFTER transition)
 */
let _introOverlay = null;

function prepareStoryIntro(pack) {
  _introOverlay = document.getElementById("storyIntroOverlay");
  if (!_introOverlay) return;

  // Populate text
  document.getElementById("introGenre").textContent = pack.themeLabel || pack.genre || "";
  document.getElementById("introTitle").textContent = pack.title || "";
  document.getElementById("introSubtitle").textContent = pack.subtitle || "";
  document.getElementById("introSynopsis").textContent = pack.synopsis || "";

  // Reset: force re-trigger all CSS animations by cloning content
  _introOverlay.classList.remove("fade-out", "skip-to-keys");
  _introOverlay.classList.add("hidden");
  void _introOverlay.offsetHeight; // force reflow
  _introOverlay.classList.remove("hidden");
}

function activateStoryIntro(onDone) {
  if (!_introOverlay) { onDone?.(); return; }
  const overlay = _introOverlay;
  let keysVisible = false;

  // Track when keys section becomes visible (~3.8s from start)
  const keysReadyTimer = setTimeout(() => { keysVisible = true; }, 3200);

  function dismiss() {
    clearTimeout(keysReadyTimer);
    overlay.removeEventListener("click", dismiss);
    document.removeEventListener("keydown", onKey);
    overlay.classList.add("fade-out");
    setTimeout(() => {
      overlay.classList.add("hidden");
      overlay.classList.remove("fade-out", "skip-to-keys");
      _introOverlay = null;
      onDone?.();
    }, 800);
  }

  function onKey(e) {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      // First press: if keys not yet visible, skip animations to show them
      if (!keysVisible) {
        clearTimeout(keysReadyTimer);
        overlay.classList.add("skip-to-keys");
        keysVisible = true;
        return;
      }
      dismiss();
    } else if (e.key === "Escape") {
      dismiss();
    }
  }

  overlay.addEventListener("click", dismiss);
  document.addEventListener("keydown", onKey);
}

function setNavActive(target, profileActive = false) {
  elements.navButtons.forEach((button) => {
    const isActive = button.dataset.navTarget === target;
    button.classList.toggle("active", isActive);
    if (isActive) {
      button.setAttribute("aria-current", "page");
    } else {
      button.removeAttribute("aria-current");
    }
  });
  if (elements.profileEntryBtn) {
    elements.profileEntryBtn.classList.toggle("active", profileActive);
    if (profileActive) {
      elements.profileEntryBtn.setAttribute("aria-current", "page");
    } else {
      elements.profileEntryBtn.removeAttribute("aria-current");
    }
  }
}

function applyStoryTheme(storyId) {
  const pack = getStoryPack(storyId);
  if (!appShell) return;
  appShell.dataset.storyTheme = pack.uiTheme || pack.id;
  document.title = `${pack.title} | AI 交互叙事游戏`;
}

// ── Auth ──

function bindAuthEvents() {
  elements.authForm?.addEventListener("submit", handleAuthSubmit);
  elements.authSwitchBtn?.addEventListener("click", toggleAuthMode);
  elements.authGuestBtn?.addEventListener("click", handleGuestLogin);
  elements.authModalClose?.addEventListener("click", closeAuthModal);
  elements.authModalBackdrop?.addEventListener("click", closeAuthModal);
  elements.logoutBtn?.addEventListener("click", handleLogout);

  elements.profileEntryBtn?.addEventListener("click", () => {
    if (isLoggedIn()) {
      openProfileScreen();
    } else {
      openAuthModal();
    }
  });
}

function openAuthModal() {
  authMode = "login";
  syncAuthModalUI();
  elements.authModal?.classList.remove("hidden");
  elements.authUsername?.focus();
}

function closeAuthModal() {
  elements.authModal?.classList.add("hidden");
  resetAuthForm();
}

function toggleAuthMode() {
  authMode = authMode === "login" ? "register" : "login";
  syncAuthModalUI();
}

function syncAuthModalUI() {
  const isReg = authMode === "register";
  if (elements.authModalTitle) elements.authModalTitle.textContent = isReg ? "注册" : "登录";
  if (elements.authSubmitBtn) elements.authSubmitBtn.textContent = isReg ? "注册" : "登录";
  if (elements.authSwitchBtn) elements.authSwitchBtn.textContent = isReg ? "已有账号？去登录" : "还没有账号？去注册";
  if (elements.authAliasField) elements.authAliasField.style.display = isReg ? "" : "none";
  if (elements.authPassword) elements.authPassword.setAttribute("autocomplete", isReg ? "new-password" : "current-password");
  hideAuthError();
}

function resetAuthForm() {
  if (elements.authUsername) elements.authUsername.value = "";
  if (elements.authPassword) elements.authPassword.value = "";
  if (elements.authAlias) elements.authAlias.value = "";
  hideAuthError();
}

function showAuthError(msg) {
  if (!elements.authError) return;
  elements.authError.textContent = msg;
  elements.authError.classList.remove("hidden");
}

function hideAuthError() {
  elements.authError?.classList.add("hidden");
}

async function handleAuthSubmit(e) {
  e.preventDefault();
  const username = elements.authUsername?.value.trim();
  const password = elements.authPassword?.value;

  if (!username || !password) {
    showAuthError("请填写用户名和密码");
    return;
  }
  if (password.length < 6) {
    showAuthError("密码至少需要 6 个字符");
    return;
  }

  elements.authSubmitBtn.disabled = true;
  elements.authSubmitBtn.textContent = "请稍候…";

  try {
    if (authMode === "register") {
      const alias = elements.authAlias?.value.trim() || username;
      await register(username, password, alias);
      showToast(elements, "注册成功，欢迎加入！");
    } else {
      await login(username, password);
      showToast(elements, "登录成功");
    }
    closeAuthModal();
    refreshNavUser();
  } catch (err) {
    showAuthError(err.message || "操作失败，请重试");
  } finally {
    elements.authSubmitBtn.disabled = false;
    syncAuthModalUI();
  }
}

async function handleGuestLogin() {
  elements.authGuestBtn.disabled = true;
  try {
    await loginAsGuest();
    closeAuthModal();
    refreshNavUser();
    showToast(elements, "以访客身份继续，数据仅保存在本地");
  } catch (err) {
    showAuthError(err.message || "访客登录失败");
  } finally {
    elements.authGuestBtn.disabled = false;
  }
}

function handleLogout() {
  clearAuth();
  refreshNavUser();
  handleNavSelection("library");
  showToast(elements, "已退出登录");
}

function refreshNavUser() {
  const user = getLocalUser();
  const chevron = '<svg class="svg-icon" style="font-size:14px" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"></polyline></svg>';

  if (user) {
    const displayName = user.alias || "旅行者";
    const initial = displayName.charAt(0).toUpperCase();
    if (elements.navAvatar) elements.navAvatar.innerHTML = `<span class="nav-avatar-initial">${initial}</span>`;
    if (elements.navUserName) elements.navUserName.innerHTML = `${displayName} ${chevron}`;
    if (elements.navUserLevel) {
      elements.navUserLevel.textContent = user.type === "guest" ? "访客" : "已登录";
    }
  } else {
    if (elements.navAvatar) elements.navAvatar.innerHTML = "";
    if (elements.navUserName) elements.navUserName.innerHTML = `未登录 ${chevron}`;
    if (elements.navUserLevel) elements.navUserLevel.textContent = "点击登录";
  }
}
