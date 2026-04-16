/**
 * LLM 设置面板 — 嵌入式 UI 组件
 *
 * 提供 API 配置界面（供 profile 页面嵌入），
 * 以及 localStorage 持久化
 */

import { LLM_CONFIG } from "../config/llm-config.js";
import { configureLLM, isLLMEnabled } from "../core/llm-client.js";
import { svg } from "./icons.js";

const STORAGE_KEY = "riddle_theatre_llm_settings";

// ---------- 持久化 ----------

export function loadLLMSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const saved = JSON.parse(raw);
    configureLLM(saved);
  } catch {
    // 损坏的数据不影响功能
  }
}

function saveLLMSettings(overrides) {
  configureLLM(overrides);
  // 只存需要覆写的字段
  const cur = { ...LLM_CONFIG, ...overrides };
  const toSave = {};
  if (cur.enabled !== LLM_CONFIG.enabled) toSave.enabled = cur.enabled;
  if (cur.baseURL !== LLM_CONFIG.baseURL) toSave.baseURL = cur.baseURL;
  if (cur.apiKey) toSave.apiKey = cur.apiKey;
  if (cur.model !== LLM_CONFIG.model) toSave.model = cur.model;
  if (cur.temperature !== LLM_CONFIG.temperature) toSave.temperature = cur.temperature;
  if (cur.maxTokens !== LLM_CONFIG.maxTokens) toSave.maxTokens = cur.maxTokens;
  if (cur.stream !== LLM_CONFIG.stream) toSave.stream = cur.stream;
  // 始终标记 enabled，避免歧义
  toSave.enabled = cur.enabled;

  localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
}

// ---------- 面板渲染 ----------

/**
 * 渲染 LLM 设置面板 HTML
 * @param {HTMLElement} container  目标容器元素
 */
export function renderLLMSettingsPanel(container) {
  // 读取当前运行时配置
  const cfg = { ...LLM_CONFIG };
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    Object.assign(cfg, saved);
  } catch { /* ignore */ }

  container.innerHTML = `
    <div class="llm-settings-panel">
      <h3 class="llm-settings-title">${svg("brain", 18)} AI 叙事引擎</h3>
      <p class="llm-settings-desc">
        启用后，探索和对话中的动态回复将由大语言模型生成，带来更丰富的互动体验。
        未启用时使用内置模板文本。
      </p>

      <label class="llm-toggle-row">
        <span>启用 AI 生成</span>
        <input type="checkbox" id="llmEnabled" ${cfg.enabled ? "checked" : ""}>
        <span class="llm-toggle-slider"></span>
      </label>

      <div class="llm-fields" id="llmFields" style="${cfg.enabled ? "" : "display:none"}">
        <label class="llm-field">
          <span>API 地址</span>
          <input type="url" id="llmBaseURL" value="${escapeAttr(cfg.baseURL)}"
                 placeholder="https://api.openai.com/v1">
        </label>

        <label class="llm-field">
          <span>API Key</span>
          <input type="password" id="llmApiKey" value="${escapeAttr(cfg.apiKey)}"
                 placeholder="sk-...">
          <small>仅存储在本地浏览器，不会上传到任何服务器</small>
        </label>

        <label class="llm-field">
          <span>模型</span>
          <input type="text" id="llmModel" value="${escapeAttr(cfg.model)}"
                 placeholder="gpt-4o-mini">
        </label>

        <div class="llm-field-row">
          <label class="llm-field llm-field-half">
            <span>Temperature</span>
            <input type="number" id="llmTemp" value="${cfg.temperature}"
                   min="0" max="2" step="0.05">
          </label>
          <label class="llm-field llm-field-half">
            <span>Max Tokens</span>
            <input type="number" id="llmMaxTokens" value="${cfg.maxTokens}"
                   min="100" max="4096" step="50">
          </label>
        </div>

        <label class="llm-toggle-row">
          <span>流式输出（逐字显示）</span>
          <input type="checkbox" id="llmStream" ${cfg.stream ? "checked" : ""}>
          <span class="llm-toggle-slider"></span>
        </label>

        <div class="llm-actions">
          <button type="button" id="llmTestBtn" class="llm-btn llm-btn-outline">测试连接</button>
          <button type="button" id="llmSaveBtn" class="llm-btn llm-btn-primary">保存配置</button>
        </div>
        <div id="llmTestResult" class="llm-test-result"></div>
      </div>
    </div>
  `;

  // 绑定事件
  const enabledCb = container.querySelector("#llmEnabled");
  const fieldsDiv = container.querySelector("#llmFields");
  enabledCb.addEventListener("change", () => {
    fieldsDiv.style.display = enabledCb.checked ? "" : "none";
  });

  container.querySelector("#llmSaveBtn").addEventListener("click", () => {
    const overrides = gatherFormValues(container);
    saveLLMSettings(overrides);
    showTestResult(container, "✓ 配置已保存", "success");
  });

  container.querySelector("#llmTestBtn").addEventListener("click", async () => {
    const overrides = gatherFormValues(container);
    configureLLM(overrides);
    showTestResult(container, "正在测试…", "info");
    try {
      const { chatCompletion } = await import("../core/llm-client.js");
      const text = await chatCompletion(
        [{ role: "user", content: "用一句话描述「谜语剧场」" }],
        { enabled: true, maxTokens: 60 }
      );
      showTestResult(container, `✓ 连接成功：${text.slice(0, 80)}`, "success");
    } catch (err) {
      showTestResult(container, `✗ ${err.message}`, "error");
    }
  });
}

function gatherFormValues(container) {
  return {
    enabled: container.querySelector("#llmEnabled").checked,
    baseURL: container.querySelector("#llmBaseURL").value.trim(),
    apiKey: container.querySelector("#llmApiKey").value.trim(),
    model: container.querySelector("#llmModel").value.trim(),
    temperature: parseFloat(container.querySelector("#llmTemp").value) || 0.85,
    maxTokens: parseInt(container.querySelector("#llmMaxTokens").value) || 800,
    stream: container.querySelector("#llmStream").checked
  };
}

function showTestResult(container, msg, type) {
  const el = container.querySelector("#llmTestResult");
  el.textContent = msg;
  el.className = `llm-test-result llm-test-${type}`;
}

function escapeAttr(s) {
  return String(s || "").replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}
