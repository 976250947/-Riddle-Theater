export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function createId(prefix) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

export function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function getAvatarText(name) {
  return String(name || "旅").slice(0, 1);
}

export function deepClone(value) {
  return structuredClone(value);
}

export function formatDelta(value) {
  if (!value) return "0";
  return value > 0 ? `+${value}` : String(value);
}
