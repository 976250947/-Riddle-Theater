import { LLM_CONFIG, SYSTEM_PROMPT } from "../config/llm-runtime.js";

let configOverrides = {};

export function configureLLM(overrides = {}) {
  configOverrides = {
    ...configOverrides,
    ...Object.fromEntries(
      Object.entries(overrides).filter(([, value]) => value !== undefined)
    )
  };
}

export function resetLLMConfig() {
  configOverrides = {};
}

export function getLLMConfig() {
  const cfg = { ...LLM_CONFIG, ...configOverrides };

  return {
    ...cfg,
    enabled: Boolean(cfg.enabled),
    baseURL: String(cfg.baseURL || "").trim(),
    apiKey: String(cfg.apiKey || "").trim(),
    model: String(cfg.model || "").trim(),
    timeout: Number.isFinite(Number(cfg.timeout)) ? Number(cfg.timeout) : 30000,
    temperature: Number.isFinite(Number(cfg.temperature)) ? Number(cfg.temperature) : 0.85,
    maxTokens: Number.isFinite(Number(cfg.maxTokens)) ? Number(cfg.maxTokens) : 800,
    stream: Boolean(cfg.stream)
  };
}

export async function chatCompletion(messages, opts = {}) {
  const cfg = validateConfig({ ...getLLMConfig(), ...opts });
  const data = await postChatCompletion(cfg, false, messages);
  return extractAssistantText(data);
}

export async function chatCompletionStream(messages, onChunk, opts = {}) {
  const cfg = validateConfig({ ...getLLMConfig(), ...opts });
  const response = await postChatCompletion(cfg, true, messages, { rawResponse: true });
  return readSSEStream(response.body, onChunk);
}

async function postChatCompletion(cfg, stream, messages, opts = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), cfg.timeout);
  const url = `${cfg.baseURL.replace(/\/+$/, "")}/chat/completions`;

  const body = {
    model: cfg.model,
    messages,
    temperature: cfg.temperature,
    max_tokens: cfg.maxTokens,
    stream
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cfg.apiKey}`
      },
      body: JSON.stringify(body),
      signal: controller.signal
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => "");
      throw new LLMApiError(response.status, errorBody);
    }

    if (opts.rawResponse) return response;
    return response.json();
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new LLMTimeoutError(cfg.timeout);
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

async function readSSEStream(body, onChunk) {
  if (!body) return "";

  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let fullText = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split(/\r?\n/);
    buffer = lines.pop() || "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data:")) continue;

      const payload = trimmed.slice(5).trim();
      if (!payload || payload === "[DONE]") continue;

      try {
        const json = JSON.parse(payload);
        const delta = extractDeltaText(json);
        if (!delta) continue;
        fullText += delta;
        onChunk?.(delta);
      } catch {
        // Ignore malformed SSE frames and keep reading.
      }
    }
  }

  return fullText.trim();
}

function extractAssistantText(data) {
  const choice = data?.choices?.[0];
  if (!choice) return "";

  const message = choice.message || {};
  const fromContent = normalizeContent(message.content);
  if (fromContent) return fromContent;

  const fromReasoning = normalizeContent(message.reasoning_content ?? choice.reasoning_content);
  if (fromReasoning) return fromReasoning;

  return "";
}

function extractDeltaText(data) {
  const delta = data?.choices?.[0]?.delta || {};
  return normalizeContent(delta.content ?? delta.reasoning_content);
}

function normalizeContent(content) {
  if (!content) return "";
  if (typeof content === "string") return content.trim();

  if (Array.isArray(content)) {
    return content
      .map((item) => {
        if (typeof item === "string") return item;
        if (item?.type === "text") return item.text || "";
        return item?.text || item?.content || "";
      })
      .join("")
      .trim();
  }

  if (typeof content === "object") {
    return String(content.text || content.content || "").trim();
  }

  return String(content).trim();
}

function validateConfig(cfg) {
  if (!cfg.enabled) {
    throw new LLMDisabledError();
  }

  if (!cfg.apiKey) {
    throw new LLMConfigError("未配置 API Key，请先填写模型密钥。");
  }

  if (!cfg.baseURL) {
    throw new LLMConfigError("未配置 API Base URL，请先填写接口地址。");
  }

  if (!cfg.model) {
    throw new LLMConfigError("未配置模型名称，请先填写 model。");
  }

  return cfg;
}

export function buildMessages(userPrompt, systemPrompt = SYSTEM_PROMPT) {
  return [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt }
  ];
}

export class LLMDisabledError extends Error {
  constructor() {
    super("LLM 功能未启用");
    this.name = "LLMDisabledError";
  }
}

export class LLMConfigError extends Error {
  constructor(message) {
    super(message);
    this.name = "LLMConfigError";
  }
}

export class LLMTimeoutError extends Error {
  constructor(timeout) {
    super(`LLM 请求超时（>${timeout}ms）`);
    this.name = "LLMTimeoutError";
  }
}

export class LLMApiError extends Error {
  constructor(status, body) {
    let message = `LLM API 错误 (${status})`;
    try {
      const parsed = JSON.parse(body);
      if (parsed?.error?.message) {
        message += `: ${parsed.error.message}`;
      }
    } catch {
      if (body) {
        message += `: ${String(body).slice(0, 200)}`;
      }
    }

    super(message);
    this.name = "LLMApiError";
    this.status = status;
  }
}

export function isLLMEnabled() {
  const cfg = getLLMConfig();
  return cfg.enabled && Boolean(cfg.apiKey);
}
