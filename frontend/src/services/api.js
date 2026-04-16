const BASE = "/api";

async function request(path, options = {}) {
  const token = localStorage.getItem("token");
  const headers = { "Content-Type": "application/json", ...options.headers };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw { status: res.status, message: data?.error || res.statusText };
  return data;
}

/* ---- Auth ---- */
export const authApi = {
  register: (username, password, alias) =>
    request("/auth/register", { method: "POST", body: JSON.stringify({ username, password, alias }) }),
  login: (username, password) =>
    request("/auth/login", { method: "POST", body: JSON.stringify({ username, password }) }),
  guest: () => request("/auth/guest", { method: "POST" }),
  me: () => request("/auth/me"),
};

/* ---- Stories ---- */
export const storyApi = {
  list: () => request("/stories"),
  detail: (id) => request(`/stories/${encodeURIComponent(id)}`),
};

/* ---- Saves ---- */
export const saveApi = {
  list: () => request("/saves"),
  save: (slotId, data, title) =>
    request("/saves", { method: "POST", body: JSON.stringify({ slotId, data, title }) }),
  remove: (slotId) =>
    request(`/saves/${encodeURIComponent(slotId)}`, { method: "DELETE" }),
};

/* ---- Comments ---- */
export const commentApi = {
  list: (storyId) => request(`/stories/${encodeURIComponent(storyId)}/comments`),
  create: (storyId, content) =>
    request(`/stories/${encodeURIComponent(storyId)}/comments`, {
      method: "POST",
      body: JSON.stringify({ content }),
    }),
};
