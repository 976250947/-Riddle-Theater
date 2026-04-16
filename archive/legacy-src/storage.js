import { STORAGE_KEYS } from "../config/constants.js";

export function loadSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.session);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.warn("Failed to parse saved session", error);
    return null;
  }
}

export function saveSession(state) {
  localStorage.setItem(STORAGE_KEYS.session, JSON.stringify(state));
}

export function loadMeta() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.meta);
    if (!raw) return { unlockedEndings: [] };
    const parsed = JSON.parse(raw);
    parsed.unlockedEndings = Array.isArray(parsed.unlockedEndings) ? parsed.unlockedEndings : [];
    return parsed;
  } catch (error) {
    console.warn("Failed to parse meta", error);
    return { unlockedEndings: [] };
  }
}

export function saveMeta(meta) {
  localStorage.setItem(STORAGE_KEYS.meta, JSON.stringify(meta));
}
