import { defineStore } from "pinia";
import { ref, computed, shallowRef } from "vue";
import {
  createInitialState,
  getCurrentNode,
  getCurrentStage,
  getWorldState,
  submitChoice,
  submitExploreAction,
  submitDialogue,
  generateDynamicOptions,
  resolveEndingData,
  normalizeState,
  applyEndingMeta,
  rollbackToCheckpoint,
} from "@runtime/core/story-engine.js";
import {
  getStoryPack,
  buildStagePayload,
} from "@runtime/config/story-packs.js";
import { createPerformController } from "@runtime/core/perform-controller.js";
import { saveSession, loadSession, loadSessionForStory, saveToSlot, loadFromSlot, loadMeta, saveMeta } from "@runtime/core/story-storage.js";

export const useGameStore = defineStore("game", () => {
  /* ---- reactive state ---- */
  const state = ref(null);
  const storyId = ref("");
  const currentLine = ref(null);       // {speaker, text, mood, cue, type}
  const choices = ref([]);
  const performState = ref("idle");    // typing | waiting_click | choice_gate | idle
  const backlog = ref([]);
  const isEnded = ref(false);
  const endingData = ref(null);

  /* non-reactive perf controller instance */
  let perf = null;

  /* ---- computed ---- */
  const stage = computed(() => state.value ? getCurrentStage(state.value) : null);
  const worldState = computed(() => state.value ? getWorldState(state.value) : null);
  const characters = computed(() => state.value?.characters || {});
  const journal = computed(() => state.value?.journal || []);
  const playerStats = computed(() => state.value?.player || null);

  /* ---- actions ---- */

  function initGame(id, archetype, playerAlias) {
    storyId.value = id;
    const pack = getStoryPack(id);
    if (!pack) throw new Error(`Story pack "${id}" not found`);
    state.value = createInitialState(loadMeta(), {
      storyId: id,
      archetypeId: archetype,
      alias: playerAlias,
    });
    isEnded.value = false;
    endingData.value = null;
    _enterCurrentStage();
  }

  function resumeGame(expectedStoryId = null) {
    const saved = expectedStoryId ? loadSessionForStory(expectedStoryId) : loadSession();
    if (!saved) return false;
    state.value = normalizeState(saved);
    storyId.value = saved.story?.id || "";
    isEnded.value = false;
    endingData.value = null;
    _enterCurrentStage();
    return true;
  }

  /** build performance lines from current stage and start VN playback */
  function _enterCurrentStage() {
    const st = getCurrentStage(state.value);
    if (!st) { _handleEnding(); return; }

    /* Prefer the pre-built dialogueLines from the engine node — these respect
       incomingChoice variants, public_script paragraph splits, and stage.dialogueLines() */
    const node = getCurrentNode(state.value);
    let lines = null;

    if (node?.dialogueLines?.length) {
      lines = node.dialogueLines.map((line) => {
        /* Enrich bare {type:"choices"} markers with actual choice data from stage */
        if (line.type === "choices" && !line.choices && st.choices?.length) {
          return { type: "choices", choices: st.choices };
        }
        return line;
      });
    } else {
      /* Fallback: build from payload (legacy / edge cases) */
      const payload = buildStagePayload(st, state.value);
      lines = [];
      if (payload.storyText) {
        lines.push({ speaker: null, text: payload.storyText, mood: "neutral", type: "narration" });
      }
      if (payload.npcDialogue) {
        const speakerId = payload.npcSpeakerId;
        lines.push({
          speaker: speakerId,
          text: payload.npcDialogue,
          mood: null,
          type: "dialogue",
        });
      }
      if (st.choices?.length) {
        lines.push({ type: "choices", choices: st.choices });
      }
    }

    _startPerformance(lines);
  }

  function _startPerformance(lines) {
    perf = createPerformController();
    perf.setCallbacks({
      onLine(line) {
        currentLine.value = line;
        performState.value = "typing";
      },
      onTypeDone() {
        performState.value = "waiting_click";
      },
      onChoices(ch) {
        choices.value = ch.choices || ch;
        performState.value = "choice_gate";
      },
      onDone() {
        performState.value = "idle";
      },
    });
    perf.startPerformance(lines);
    backlog.value = [];
  }

  function advance() {
    if (!perf) return;
    perf.advance();
    backlog.value = perf.getHistory ? perf.getHistory() : backlog.value;
  }

  function completeTyping() {
    if (!perf) return;
    perf.notifyTypingComplete();
    backlog.value = perf.getHistory ? perf.getHistory() : backlog.value;
  }

  function selectChoice(choice) {
    const payload = {
      choiceType: "fixed",
      choiceValue: choice.label,
      matchedChoiceId: choice.id,
    };
    /* submitChoice mutates state in-place and returns an outcome summary —
       we must NOT overwrite state.value with the return value.
       Trigger Vue reactivity by re-assigning the same object. */
    submitChoice(state.value, payload);
    state.value = { ...state.value };
    choices.value = [];
    saveSession(state.value);
    _enterCurrentStage();
  }

  async function doExplore(actionText) {
    const result = await submitExploreAction(state.value, actionText);
    state.value = result.state || state.value;
    saveSession(state.value);
    if (result.narrativeText || result.feedback) {
      _startPerformance(
        [
          result.narrativeText
            ? { speaker: "旁白", text: result.narrativeText, mood: "neutral", type: "narration" }
            : null,
          result.feedback
            ? { speaker: "系统", text: result.feedback, mood: "neutral", type: "narration" }
            : null,
        ].filter(Boolean)
      );
    }
    return result;
  }

  async function doDialogue(characterId, messageText) {
    const result = await submitDialogue(state.value, characterId, messageText);
    state.value = result.state || state.value;
    saveSession(state.value);
    if (result.response) {
      _startPerformance([
        {
          speaker: result.speaker || characterId,
          text: result.response,
          mood: result.mood || "neutral",
          type: "dialogue"
        }
      ]);
    }
    return result;
  }

  function getDynamicOptions() {
    return generateDynamicOptions(state.value);
  }

  function doRollback(idx) {
    state.value = rollbackToCheckpoint(state.value, idx);
    _enterCurrentStage();
  }

  function _handleEnding() {
    isEnded.value = true;
    endingData.value = resolveEndingData(state.value);
    const meta = loadMeta();
    applyEndingMeta(state.value, meta);
    saveMeta(meta);
  }

  function saveSlot(index, name) {
    saveToSlot(index, state.value, name);
  }

  function loadSlot(index) {
    const saved = loadFromSlot(index);
    if (!saved) return false;
    state.value = normalizeState(saved);
    storyId.value = saved.story?.id || storyId.value;
    isEnded.value = false;
    endingData.value = null;
    saveSession(state.value);
    _enterCurrentStage();
    return true;
  }

  function cleanup() {
    perf = null;
    state.value = null;
    storyId.value = "";
    currentLine.value = null;
    choices.value = [];
    performState.value = "idle";
  }

  return {
    state, storyId, currentLine, choices, performState, backlog,
    isEnded, endingData,
    stage, worldState, characters, journal, playerStats,
    initGame, resumeGame, advance, completeTyping, selectChoice,
    doExplore, doDialogue, getDynamicOptions, doRollback,
    saveSlot, loadSlot, cleanup,
  };
});
