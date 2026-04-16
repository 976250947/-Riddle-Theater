/**
 * 后端 API 客户端 — 用户认证、云存档、LLM 代理
 *
 * 所有请求使用相对路径 /api/...，与静态文件共用同一 origin
 */

const TOKEN_KEY = "riddle_theatre_auth_token";
const USER_KEY = "riddle_theatre_auth_user";

// ---------- Token 管理 ----------

function getToken() {
  return localStorage.getItem(TOKEN_KEY) || "";
}

function setAuth(token, user) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getLocalUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY));
  } catch {
    return null;
  }
}

export function isLoggedIn() {
  return !!getToken();
}

// ---------- 通用请求 ----------

async function request(method, path, body = null) {
  const headers = { "Content-Type": "application/json" };
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const opts = { method, headers };
  if (body) opts.body = JSON.stringify(body);

  const res = await fetch(path, opts);
  const data = await res.json();

  if (!res.ok) {
    throw new ApiError(res.status, data.error || "请求失败");
  }
  return data;
}

export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

// ---------- Auth ----------

export async function register(username, password, alias) {
  const data = await request("POST", "/api/auth/register", { username, password, alias });
  setAuth(data.token, { userId: data.userId, alias: data.alias, type: "registered" });
  return data;
}

export async function login(username, password) {
  const data = await request("POST", "/api/auth/login", { username, password });
  setAuth(data.token, { userId: data.userId, alias: data.alias, type: "registered" });
  return data;
}

export async function loginAsGuest() {
  const data = await request("POST", "/api/auth/guest", {});
  setAuth(data.token, { userId: data.userId, alias: data.alias, type: "guest" });
  return data;
}

export async function fetchMe() {
  return request("GET", "/api/auth/me");
}

// ---------- Cloud Saves ----------

export async function fetchSaves() {
  const data = await request("GET", "/api/saves");
  return data.saves || [];
}

export async function uploadSave(slotId, saveData) {
  return request("POST", "/api/saves", { slotId, data: saveData });
}

export async function deleteSave(slotId) {
  return request("DELETE", `/api/saves/${encodeURIComponent(slotId)}`);
}

// ---------- LLM Proxy ----------

/**
 * 通过后端代理调用 LLM（API Key 存储在服务端）
 *
 * @param {Array<{role:string, content:string}>} messages
 * @param {object} [opts]  temperature, max_tokens, model
 * @returns {Promise<string>} 生成的文本
 */
export async function proxyLLMChat(messages, opts = {}) {
  const body = {
    messages,
    temperature: opts.temperature,
    max_tokens: opts.maxTokens,
    model: opts.model
  };
  const data = await request("POST", "/api/llm/chat", body);
  return data.choices?.[0]?.message?.content?.trim() ?? "";
}
