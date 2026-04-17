/**
 * LLM 叙事层 — 将 worldState 翻译为 LLM 提示词，
 * 为 explore / dialogue / narrate / recap 提供高层接口
 *
 * 设计原则：
 * - LLM 不可用时（未启用 / key 错误 / 超时）自动降级到引擎内置文本
 * - 外部只需关心 success + text，不必感知 LLM 实现细节
 */

import {
  chatCompletion,
  chatCompletionStream,
  buildMessages,
  isLLMEnabled,
  LLMDisabledError
} from "./llm-driver.js";

import {
  buildExplorePrompt,
  buildDialoguePrompt,
  buildNarratePrompt,
  buildRecapPrompt
} from "../config/llm-runtime.js";

// ---------- 公开接口 ----------

/**
 * 用 LLM 生成探索反馈
 *
 * @param {object} worldState  - 由 getWorldState() 产出
 * @param {string} actionText  - 玩家输入的探索行动
 * @param {object} [opts]
 * @param {(chunk:string)=>void} [opts.onChunk] - 流式回调
 * @returns {Promise<{ok:boolean, text:string}>}
 */
export async function llmExplore(worldState, actionText, opts = {}) {
  if (!isLLMEnabled()) return { ok: false, text: "" };

  const prompt = buildExplorePrompt(worldState, actionText);
  return _generate(prompt, opts);
}

/**
 * 用 LLM 生成 NPC 对话回复
 *
 * @param {object} worldState
 * @param {string} characterId  - NPC 标识
 * @param {object} characterState - { name, role, mood, affinity, trust, alertness, relationshipStage }
 * @param {string} messageText  - 玩家说的话
 * @param {object} [opts]
 * @returns {Promise<{ok:boolean, text:string}>}
 */
export async function llmDialogue(worldState, characterId, characterState, messageText, opts = {}) {
  if (!isLLMEnabled()) return { ok: false, text: "" };

  const prompt = buildDialoguePrompt(worldState, characterId, characterState, messageText);
  return _generate(prompt, opts);
}

/**
 * 用 LLM 生成场景叙事 / 过渡文本
 *
 * @param {object} worldState
 * @param {string} context - 自定义上下文描述（如"玩家刚做出 X 选择后"）
 * @param {object} [opts]
 * @returns {Promise<{ok:boolean, text:string}>}
 */
export async function llmNarrate(worldState, context, opts = {}) {
  if (!isLLMEnabled()) return { ok: false, text: "" };

  const prompt = buildNarratePrompt(worldState, context);
  return _generate(prompt, opts);
}

/**
 * 用 LLM 生成结局回顾
 *
 * @param {object} worldState
 * @param {object} endingData   - { id, title, description }
 * @param {object} journeyFlags - 玩家旅程中的关键标记
 * @param {object} [opts]
 * @returns {Promise<{ok:boolean, text:string}>}
 */
export async function llmRecap(worldState, endingData, journeyFlags, opts = {}) {
  if (!isLLMEnabled()) return { ok: false, text: "" };

  const prompt = buildRecapPrompt(worldState, endingData, journeyFlags);
  return _generate(prompt, opts);
}

// ---------- 内部 ----------

/**
 * 通用生成方法：尝试调用 LLM，失败则降级
 */
async function _generate(userPrompt, opts = {}) {
  try {
    const messages = buildMessages(userPrompt);
    let text;

    if (opts.onChunk) {
      text = await chatCompletionStream(messages, opts.onChunk, opts);
    } else {
      text = await chatCompletion(messages, opts);
    }

    const normalizedText = String(text || "").trim();
    if (!normalizedText) {
      return { ok: false, text: "", error: "empty_content" };
    }

    return { ok: true, text: normalizedText };
  } catch (err) {
    if (err instanceof LLMDisabledError) {
      return { ok: false, text: "" };
    }
    console.warn("[LLM Narrator] 生成失败，降级到内置文本:", err.message);
    return { ok: false, text: "", error: err.message };
  }
}
