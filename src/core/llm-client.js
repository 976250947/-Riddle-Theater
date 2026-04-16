/**
 * LLM API 客户端 — 封装 OpenAI 兼容接口调用
 *
 * 支持：OpenAI, Deepseek, OpenRouter, 本地 Ollama, Azure OpenAI 等
 * 不依赖任何第三方库，仅使用浏览器原生 fetch
 */

import { LLM_CONFIG, SYSTEM_PROMPT } from "../config/llm-config.js";

// ---------- 内部状态 ----------

let _configOverrides = {};

/**
 * 运行时覆写配置（合并到 LLM_CONFIG 之上）
 */
export function configureLLM(overrides) {
  _configOverrides = { ..._configOverrides, ...overrides };
}

function getConfig() {
  return { ...LLM_CONFIG, ..._configOverrides };
}

// ---------- 核心请求 ----------

/**
 * 发出 chat completion 请求，返回纯文本结果
 *
 * @param {Array<{role:string, content:string}>} messages
 * @param {object} [opts]  覆写 temperature / maxTokens / stream 等
 * @returns {Promise<string>} 生成的文本
 */
export async function chatCompletion(messages, opts = {}) {
  const cfg = { ...getConfig(), ...opts };

  if (!cfg.enabled) {
    throw new LLMDisabledError();
  }
  if (!cfg.apiKey) {
    throw new LLMConfigError("未配置 API Key，请在设置面板填入密钥。");
  }

  const url = `${cfg.baseURL.replace(/\/+$/, "")}/chat/completions`;

  const body = {
    model: cfg.model,
    messages,
    temperature: cfg.temperature,
    max_tokens: cfg.maxTokens,
    stream: false // 非流式总入口
  };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), cfg.timeout);

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cfg.apiKey}`
      },
      body: JSON.stringify(body),
      signal: controller.signal
    });

    if (!res.ok) {
      const errorBody = await res.text().catch(() => "");
      throw new LLMApiError(res.status, errorBody);
    }

    const data = await res.json();
    return data.choices?.[0]?.message?.content?.trim() ?? "";
  } finally {
    clearTimeout(timer);
  }
}

/**
 * 流式 chat completion，通过回调逐 token 输出
 *
 * @param {Array<{role:string, content:string}>} messages
 * @param {(chunk: string) => void} onChunk
 * @param {object} [opts]
 * @returns {Promise<string>} 完整生成文本
 */
export async function chatCompletionStream(messages, onChunk, opts = {}) {
  const cfg = { ...getConfig(), ...opts };

  if (!cfg.enabled) {
    throw new LLMDisabledError();
  }
  if (!cfg.apiKey) {
    throw new LLMConfigError("未配置 API Key，请在设置面板填入密钥。");
  }

  const url = `${cfg.baseURL.replace(/\/+$/, "")}/chat/completions`;

  const body = {
    model: cfg.model,
    messages,
    temperature: cfg.temperature,
    max_tokens: cfg.maxTokens,
    stream: true
  };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), cfg.timeout);

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cfg.apiKey}`
      },
      body: JSON.stringify(body),
      signal: controller.signal
    });

    if (!res.ok) {
      const errorBody = await res.text().catch(() => "");
      throw new LLMApiError(res.status, errorBody);
    }

    return await readSSEStream(res.body, onChunk);
  } finally {
    clearTimeout(timer);
  }
}

// ---------- SSE 流解析 ----------

async function readSSEStream(body, onChunk) {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let fullText = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop(); // 保留未完成行

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || !trimmed.startsWith("data:")) continue;

      const payload = trimmed.slice(5).trim();
      if (payload === "[DONE]") return fullText;

      try {
        const json = JSON.parse(payload);
        const delta = json.choices?.[0]?.delta?.content;
        if (delta) {
          fullText += delta;
          onChunk(delta);
        }
      } catch {
        // 跳过格式异常行
      }
    }
  }

  return fullText;
}

// ———————— 辅助构建 messages —————————

/**
 * 创建标准 messages 数组（system + user）
 */
export function buildMessages(userPrompt, systemPrompt = SYSTEM_PROMPT) {
  return [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt }
  ];
}

// ---------- 错误类型 ----------

export class LLMDisabledError extends Error {
  constructor() {
    super("LLM 功能未启用");
    this.name = "LLMDisabledError";
  }
}

export class LLMConfigError extends Error {
  constructor(msg) {
    super(msg);
    this.name = "LLMConfigError";
  }
}

export class LLMApiError extends Error {
  constructor(status, body) {
    let msg = `LLM API 错误 (${status})`;
    try {
      const parsed = JSON.parse(body);
      if (parsed.error?.message) msg += `: ${parsed.error.message}`;
    } catch {
      if (body) msg += `: ${body.slice(0, 200)}`;
    }
    super(msg);
    this.name = "LLMApiError";
    this.status = status;
  }
}

// ---------- 状态检查 ----------

export function isLLMEnabled() {
  return getConfig().enabled && !!getConfig().apiKey;
}
