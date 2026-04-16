import {
  applyEndingMeta,
  createInitialState,
  getCurrentNode,
  getCurrentStage,
  inferChoiceFromText,
  normalizeState,
  resolveEndingData,
  rollbackToCheckpoint,
  submitChoice
} from "./core/engine.js";
import { loadMeta, loadSession, saveMeta, saveSession } from "./core/storage.js";
import { getElements } from "./ui/dom.js";
import {
  playCurrentNodeReveal,
  playStreamTransition,
  setInteractionDisabled,
  stopStreamTransition,
  transitionToScreen
} from "./ui/animations.js";
import {
  renderEndingScreen,
  renderGameScreen,
  renderRollbackModal,
  renderStartScreen,
  showToast
} from "./ui/renderers.js";

const elements = getElements();

let selectedArchetypeId = "witness";
let state = null;
let isBusy = false;

init();

function init() {
  bindStaticEvents();
  hydrateStartInputs();
  refreshStart();
}

function bindStaticEvents() {
  elements.startNewGameBtn.addEventListener("click", handleStartNewGame);
  elements.continueGameBtn.addEventListener("click", handleContinueGame);
  elements.showGalleryBtn.addEventListener("click", handleGalleryPreview);
  elements.playerAliasInput.addEventListener("input", persistDraftProfile);
  elements.freeInputForm.addEventListener("submit", handleFreeInputSubmit);
  elements.rollbackBtn.addEventListener("click", openRollbackModal);
  elements.closeRollbackBtn.addEventListener("click", closeRollbackModal);
  elements.saveBtn.addEventListener("click", handleManualSave);
  elements.backToMenuBtn.addEventListener("click", () => {
    closeRollbackModal();
    refreshStart();
  });
  elements.rollbackFromEndingBtn.addEventListener("click", () => {
    renderGameScreen(elements, state);
    openRollbackModal();
  });
  elements.restartBtn.addEventListener("click", handleStartNewGame);
  elements.endingBackToMenuBtn.addEventListener("click", refreshStart);
  elements.rollbackModal.addEventListener("click", (event) => {
    const target = event.target;
    if (target instanceof HTMLElement && target.dataset.closeModal === "true") {
      closeRollbackModal();
    }
  });
}

function hydrateStartInputs() {
  const saved = loadSession();
  elements.playerAliasInput.value = saved?.player?.alias || "无名旅人";
  selectedArchetypeId = saved?.player?.archetypeId || "witness";
}

function refreshStart() {
  const meta = loadMeta();
  const saved = loadSession();
  renderStartScreen(elements, meta, saved, selectedArchetypeId);
  bindArchetypeButtons();
  transitionToScreen(elements, "start");
}

function bindArchetypeButtons() {
  elements.archetypeButtons.querySelectorAll("[data-archetype-id]").forEach((button) => {
    button.addEventListener("click", () => {
      selectedArchetypeId = button.dataset.archetypeId;
      persistDraftProfile();
      refreshStart();
    });
  });
}

function persistDraftProfile() {
  const alias = elements.playerAliasInput.value.trim() || "无名旅人";
  localStorage.setItem(
    "ai-narrative-game-draft-profile",
    JSON.stringify({ alias, archetypeId: selectedArchetypeId })
  );
}

async function handleStartNewGame() {
  const alias = elements.playerAliasInput.value.trim() || "无名旅人";
  state = createInitialState(loadMeta(), { alias, archetypeId: selectedArchetypeId });
  saveSession(state);
  renderGameScreen(elements, state);
  await transitionToScreen(elements, "game");
  bindDynamicGameEvents();
  setInteractionDisabled(elements, true);
  await playCurrentNodeReveal(elements);
  setInteractionDisabled(elements, false);
  showToast(elements, `新的旅程已经开始。你正以“${alias}”的身份进入迷城。`);
}

async function handleContinueGame() {
  const saved = loadSession();
  if (!saved) {
    showToast(elements, "没有找到可继续的存档，先开启一段新的旅程吧。");
    return;
  }
  state = normalizeState(saved);
  selectedArchetypeId = state.player.archetypeId;
  elements.playerAliasInput.value = state.player.alias;
  if (state.currentEnding && state.session.status === "completed") {
    renderEndingScreen(elements, state);
    await transitionToScreen(elements, "ending");
    showToast(elements, `已回到“${resolveEndingData(state).title}”的结局页面。`);
    return;
  }
  renderGameScreen(elements, state);
  await transitionToScreen(elements, "game");
  bindDynamicGameEvents();
  setInteractionDisabled(elements, true);
  await playCurrentNodeReveal(elements);
  setInteractionDisabled(elements, false);
  showToast(elements, `已恢复“${state.player.alias}”的旅程。`);
}

function handleGalleryPreview() {
  const meta = loadMeta();
  if (!meta.unlockedEndings.length) {
    showToast(elements, "你还没有解锁任何结局，先完成一段旅程吧。");
    return;
  }
  const names = meta.unlockedEndings.map((endingId) => resolveEndingData({ currentEnding: { endingId } }).title);
  showToast(elements, `已解锁结局：${names.join("、")}`);
}

function handleFreeInputSubmit(event) {
  event.preventDefault();
  if (!state || isBusy) return;
  const text = elements.freeInput.value.trim();
  if (!text) {
    showToast(elements, "先写下你的回应，再让剧情继续。");
    return;
  }
  const inferredChoice = inferChoiceFromText(getCurrentStage(state), text);
  commitChoice({
    choiceType: "freeText",
    choiceValue: text,
    parsedIntent: inferredChoice.intent,
    matchedChoiceId: inferredChoice.id
  });
  elements.freeInput.value = "";
}

async function commitChoice(payload) {
  if (isBusy) return;
  isBusy = true;
  setInteractionDisabled(elements, true);
  await playStreamTransition(elements, payload.choiceValue);

  const outcome = submitChoice(state, payload);
  stopStreamTransition(elements);

  if (state.currentEnding) {
    const meta = loadMeta();
    applyEndingMeta(state, meta);
    saveMeta(meta);
    saveSession(state);
    renderEndingScreen(elements, state);
    await transitionToScreen(elements, "ending");
    showToast(elements, `已达成：${resolveEndingData(state).title}`);
    isBusy = false;
    return;
  }

  saveSession(state);
  renderGameScreen(elements, state);
  await transitionToScreen(elements, "game");
  bindDynamicGameEvents();
  await playCurrentNodeReveal(elements);
  setInteractionDisabled(elements, false);
  showToast(elements, outcome.summary);
  isBusy = false;
}

function bindDynamicGameEvents() {
  const currentNode = getCurrentNode(state);
  elements.choiceList.querySelectorAll("[data-choice-id]").forEach((button) => {
    button.addEventListener("click", () => {
      if (isBusy) return;
      const choice = currentNode.choiceOptions.find((item) => item.id === button.dataset.choiceId);
      commitChoice({
        choiceType: "preset",
        choiceValue: choice.label,
        parsedIntent: choice.intent,
        matchedChoiceId: choice.id
      });
    });
  });
}

function handleManualSave() {
  if (!state) return;
  saveSession(state);
  showToast(elements, "当前旅程已手动存档。");
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
      await transitionToScreen(elements, "game");
      bindDynamicGameEvents();
      setInteractionDisabled(elements, true);
      await playCurrentNodeReveal(elements);
      setInteractionDisabled(elements, false);
      showToast(elements, "已回到关键节点，你可以重新改写这段关系。");
    });
  });
}

function closeRollbackModal() {
  elements.rollbackModal.classList.add("hidden");
  elements.rollbackModal.setAttribute("aria-hidden", "true");
}
