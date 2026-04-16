import { STORAGE_KEYS, MAX_SAVE_SLOTS } from "../config/constants.js";
import { DEFAULT_STORY_ID, toEndingKey } from "../config/story-packs.js";

/* ── Active session (auto-save) ── */

export function loadSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.session);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (parsed?.meta?.unlockedEndings) {
      parsed.meta.unlockedEndings = parsed.meta.unlockedEndings.map((value) => {
        return typeof value === "string" && value.includes(":") ? value : toEndingKey(DEFAULT_STORY_ID, value);
      });
    }
    return parsed;
  } catch (error) {
    console.warn("Failed to parse saved session", error);
    return null;
  }
}

export function loadSessionForStory(storyId) {
  const session = loadSession();
  return session?.story?.id === storyId ? session : null;
}

export function hasSessionForStory(storyId) {
  return Boolean(loadSessionForStory(storyId));
}

export function saveSession(state) {
  localStorage.setItem(STORAGE_KEYS.session, JSON.stringify(state));
}

/* ── Meta (unlocked endings etc.) ── */

export function loadMeta() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.meta);
    if (!raw) return { unlockedEndings: [] };

    const parsed = JSON.parse(raw);
    const endings = Array.isArray(parsed.unlockedEndings) ? parsed.unlockedEndings : [];
    parsed.unlockedEndings = endings.map((value) => {
      return typeof value === "string" && value.includes(":") ? value : toEndingKey(DEFAULT_STORY_ID, value);
    });
    return parsed;
  } catch (error) {
    console.warn("Failed to parse meta", error);
    return { unlockedEndings: [] };
  }
}

export function saveMeta(meta) {
  localStorage.setItem(STORAGE_KEYS.meta, JSON.stringify(meta));
}

/* ── Multi-slot save system ── */

function loadSlots() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.slots);
    return raw ? JSON.parse(raw) : new Array(MAX_SAVE_SLOTS).fill(null);
  } catch {
    return new Array(MAX_SAVE_SLOTS).fill(null);
  }
}

function persistSlots(slots) {
  localStorage.setItem(STORAGE_KEYS.slots, JSON.stringify(slots));
}

export function getSaveSlots() {
  const slots = loadSlots();
  return slots.map((slot, index) => {
    if (!slot) return { index, empty: true };
    return {
      index,
      empty: false,
      name: slot.name || `存档 ${index + 1}`,
      storyTitle: slot.state?.story?.title || "未知故事",
      storyId: slot.state?.story?.id || DEFAULT_STORY_ID,
      alias: slot.state?.player?.alias || "",
      nodeCount: slot.state?.nodes?.length || 0,
      savedAt: slot.savedAt || null
    };
  });
}

export function saveToSlot(index, state, name) {
  if (index < 0 || index >= MAX_SAVE_SLOTS) return;
  const slots = loadSlots();
  slots[index] = {
    name: name || `存档 ${index + 1}`,
    state: JSON.parse(JSON.stringify(state)),
    savedAt: new Date().toISOString()
  };
  persistSlots(slots);
}

export function loadFromSlot(index) {
  const slots = loadSlots();
  const slot = slots[index];
  if (!slot?.state) return null;
  if (slot.state?.meta?.unlockedEndings) {
    slot.state.meta.unlockedEndings = slot.state.meta.unlockedEndings.map((value) => {
      return typeof value === "string" && value.includes(":") ? value : toEndingKey(DEFAULT_STORY_ID, value);
    });
  }
  return slot.state;
}

export function deleteSlot(index) {
  if (index < 0 || index >= MAX_SAVE_SLOTS) return;
  const slots = loadSlots();
  slots[index] = null;
  persistSlots(slots);
}
