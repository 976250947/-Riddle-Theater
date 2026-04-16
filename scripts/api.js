/**
 * 后端 API 路由 — 用户身份、云存档、LLM 代理
 *
 * 纯 Node.js 实现，无外部依赖
 * 数据存储在 data/ 目录的 JSON 文件中
 */

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const https = require("https");
const http = require("http");

const DATA_DIR = path.resolve(__dirname, "..", "data");
const USERS_FILE = path.join(DATA_DIR, "users.json");
const SAVES_DIR = path.join(DATA_DIR, "saves");

// 确保数据目录存在
[DATA_DIR, SAVES_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// ---------- 数据持久化 ----------

function readJSON(filePath, fallback = []) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch {
    return fallback;
  }
}

function writeJSON(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
}

// ---------- 密码哈希（使用 crypto，无外部依赖） ----------

function hashPassword(password, salt) {
  salt = salt || crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, "sha512").toString("hex");
  return { salt, hash };
}

function verifyPassword(password, salt, expectedHash) {
  const { hash } = hashPassword(password, salt);
  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(expectedHash));
}

// ---------- Token ----------

function generateToken() {
  return crypto.randomBytes(32).toString("hex");
}

function findUserByToken(token) {
  if (!token) return null;
  const users = readJSON(USERS_FILE, []);
  return users.find((u) => u.token === token) || null;
}

// ---------- 请求解析 ----------

function parseBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > 2 * 1024 * 1024) {
        reject(new Error("Body too large"));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => {
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString()));
      } catch {
        resolve(null);
      }
    });
    req.on("error", reject);
  });
}

function getToken(req) {
  const auth = req.headers["authorization"] || "";
  if (auth.startsWith("Bearer ")) return auth.slice(7);
  return null;
}

function sendJSON(res, status, data) {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*"
  });
  res.end(body);
}

// ---------- API 路由 ----------

/**
 * 处理 API 请求，成功返回 true
 */
async function handleAPI(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  // CORS preflight
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Max-Age": "86400"
    });
    res.end();
    return true;
  }

  // 只处理 /api/ 路径
  if (!pathname.startsWith("/api/")) return false;

  try {
    // ── Auth ──
    if (pathname === "/api/auth/register" && req.method === "POST") {
      return await handleRegister(req, res);
    }
    if (pathname === "/api/auth/login" && req.method === "POST") {
      return await handleLogin(req, res);
    }
    if (pathname === "/api/auth/guest" && req.method === "POST") {
      return await handleGuestLogin(req, res);
    }
    if (pathname === "/api/auth/me" && req.method === "GET") {
      return handleMe(req, res);
    }

    // ── Saves ──
    if (pathname === "/api/saves" && req.method === "GET") {
      return handleGetSaves(req, res);
    }
    if (pathname === "/api/saves" && req.method === "POST") {
      return await handleSaveSave(req, res);
    }
    if (pathname.match(/^\/api\/saves\/[\w-]+$/) && req.method === "DELETE") {
      return handleDeleteSave(req, res, pathname);
    }

    // ── LLM Proxy ──
    if (pathname === "/api/llm/chat" && req.method === "POST") {
      return await handleLLMProxy(req, res);
    }

    sendJSON(res, 404, { error: "API endpoint not found" });
    return true;
  } catch (err) {
    console.error("[API Error]", err);
    sendJSON(res, 500, { error: "Internal server error" });
    return true;
  }
}

// ── Auth Handlers ──

async function handleRegister(req, res) {
  const body = await parseBody(req);
  if (!body?.username || !body?.password) {
    return sendJSON(res, 400, { error: "username 和 password 为必填" }), true;
  }

  const username = String(body.username).trim().slice(0, 50);
  const alias = String(body.alias || username).trim().slice(0, 30);

  if (username.length < 2 || body.password.length < 6) {
    return sendJSON(res, 400, { error: "用户名至少 2 字符，密码至少 6 字符" }), true;
  }

  const users = readJSON(USERS_FILE, []);
  if (users.find((u) => u.username === username)) {
    return sendJSON(res, 409, { error: "用户名已存在" }), true;
  }

  const { salt, hash } = hashPassword(body.password);
  const token = generateToken();
  const user = {
    id: crypto.randomUUID(),
    username,
    alias,
    salt,
    hash,
    token,
    type: "registered",
    createdAt: new Date().toISOString()
  };

  users.push(user);
  writeJSON(USERS_FILE, users);

  sendJSON(res, 201, { token, userId: user.id, alias: user.alias });
  return true;
}

async function handleLogin(req, res) {
  const body = await parseBody(req);
  if (!body?.username || !body?.password) {
    return sendJSON(res, 400, { error: "username 和 password 为必填" }), true;
  }

  const users = readJSON(USERS_FILE, []);
  const user = users.find((u) => u.username === body.username && u.type === "registered");

  if (!user || !verifyPassword(body.password, user.salt, user.hash)) {
    return sendJSON(res, 401, { error: "用户名或密码错误" }), true;
  }

  // 刷新 token
  user.token = generateToken();
  writeJSON(USERS_FILE, users);

  sendJSON(res, 200, { token: user.token, userId: user.id, alias: user.alias });
  return true;
}

async function handleGuestLogin(req, res) {
  const token = generateToken();
  const user = {
    id: crypto.randomUUID(),
    username: `guest_${Date.now()}`,
    alias: "旅人",
    token,
    type: "guest",
    createdAt: new Date().toISOString()
  };

  const users = readJSON(USERS_FILE, []);
  users.push(user);
  writeJSON(USERS_FILE, users);

  sendJSON(res, 201, { token, userId: user.id, alias: user.alias, isGuest: true });
  return true;
}

function handleMe(req, res) {
  const user = findUserByToken(getToken(req));
  if (!user) return sendJSON(res, 401, { error: "未登录" }), true;

  sendJSON(res, 200, {
    userId: user.id,
    username: user.username,
    alias: user.alias,
    type: user.type,
    createdAt: user.createdAt
  });
  return true;
}

// ── Save Handlers ──

function getUserSavePath(userId) {
  // 防止目录遍历
  const safe = userId.replace(/[^a-zA-Z0-9_-]/g, "");
  return path.join(SAVES_DIR, `${safe}.json`);
}

function handleGetSaves(req, res) {
  const user = findUserByToken(getToken(req));
  if (!user) return sendJSON(res, 401, { error: "未登录" }), true;

  const saves = readJSON(getUserSavePath(user.id), []);
  sendJSON(res, 200, { saves });
  return true;
}

async function handleSaveSave(req, res) {
  const user = findUserByToken(getToken(req));
  if (!user) return sendJSON(res, 401, { error: "未登录" }), true;

  const body = await parseBody(req);
  if (!body?.slotId || !body?.data) {
    return sendJSON(res, 400, { error: "slotId 和 data 为必填" }), true;
  }

  const savePath = getUserSavePath(user.id);
  const saves = readJSON(savePath, []);

  const idx = saves.findIndex((s) => s.slotId === body.slotId);
  const entry = {
    slotId: String(body.slotId).slice(0, 30),
    data: body.data,
    updatedAt: new Date().toISOString()
  };

  if (idx >= 0) {
    saves[idx] = entry;
  } else {
    if (saves.length >= 20) {
      return sendJSON(res, 400, { error: "存档数量已达上限 (20)" }), true;
    }
    saves.push(entry);
  }

  writeJSON(savePath, saves);
  sendJSON(res, 200, { ok: true, slotId: entry.slotId });
  return true;
}

function handleDeleteSave(req, res, pathname) {
  const user = findUserByToken(getToken(req));
  if (!user) return sendJSON(res, 401, { error: "未登录" }), true;

  const slotId = pathname.split("/").pop();
  const savePath = getUserSavePath(user.id);
  const saves = readJSON(savePath, []);
  const filtered = saves.filter((s) => s.slotId !== slotId);

  if (filtered.length === saves.length) {
    return sendJSON(res, 404, { error: "存档不存在" }), true;
  }

  writeJSON(savePath, filtered);
  sendJSON(res, 200, { ok: true });
  return true;
}

// ── LLM Proxy ──

async function handleLLMProxy(req, res) {
  const user = findUserByToken(getToken(req));
  if (!user) return sendJSON(res, 401, { error: "未登录" }), true;

  const body = await parseBody(req);
  if (!body?.messages || !Array.isArray(body.messages)) {
    return sendJSON(res, 400, { error: "messages 为必填数组" }), true;
  }

  // 从环境变量读取 LLM 配置
  const llmBaseURL = process.env.LLM_BASE_URL || "https://api.openai.com/v1";
  const llmApiKey = process.env.LLM_API_KEY;
  const llmModel = process.env.LLM_MODEL || "gpt-4o-mini";

  if (!llmApiKey) {
    return sendJSON(res, 503, { error: "服务端未配置 LLM API Key" }), true;
  }

  const llmUrl = new URL(`${llmBaseURL.replace(/\/+$/, "")}/chat/completions`);
  const llmBody = JSON.stringify({
    model: body.model || llmModel,
    messages: body.messages,
    temperature: Math.min(Math.max(body.temperature || 0.85, 0), 2),
    max_tokens: Math.min(body.max_tokens || 800, 4096),
    stream: false
  });

  const transport = llmUrl.protocol === "https:" ? https : http;

  return new Promise((resolve) => {
    const llmReq = transport.request(
      llmUrl,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${llmApiKey}`,
          "Content-Length": Buffer.byteLength(llmBody)
        },
        timeout: 60000
      },
      (llmRes) => {
        const chunks = [];
        llmRes.on("data", (c) => chunks.push(c));
        llmRes.on("end", () => {
          const raw = Buffer.concat(chunks).toString();
          try {
            const parsed = JSON.parse(raw);
            sendJSON(res, llmRes.statusCode, parsed);
          } catch {
            sendJSON(res, 502, { error: "LLM 返回了无法解析的响应" });
          }
          resolve(true);
        });
      }
    );

    llmReq.on("error", (err) => {
      sendJSON(res, 502, { error: `LLM 请求失败: ${err.message}` });
      resolve(true);
    });

    llmReq.on("timeout", () => {
      llmReq.destroy();
      sendJSON(res, 504, { error: "LLM 请求超时" });
      resolve(true);
    });

    llmReq.write(llmBody);
    llmReq.end();
  });
}

module.exports = { handleAPI };
