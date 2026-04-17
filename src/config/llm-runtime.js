/**
 * Runtime LLM configuration used by the narrative engine.
 *
 * The frontend talks to an OpenAI-compatible chat-completions API, so DeepSeek
 * can be used by changing only the base URL, model and API key.
 */

const ENV = import.meta.env ?? {};

function readBoolEnv(name, fallback = false) {
  const value = ENV[name];
  if (value === undefined || value === null || value === "") return fallback;
  return ["1", "true", "yes", "on"].includes(String(value).toLowerCase());
}

function readNumberEnv(name, fallback) {
  const value = Number(ENV[name]);
  return Number.isFinite(value) ? value : fallback;
}

const envApiKey = String(ENV.VITE_LLM_API_KEY || ENV.VITE_DEEPSEEK_API_KEY || "").trim();

export const LLM_CONFIG = {
  enabled: readBoolEnv("VITE_LLM_ENABLED", false),
  baseURL: String(ENV.VITE_LLM_BASE_URL || ENV.VITE_DEEPSEEK_BASE_URL || "https://api.deepseek.com").trim(),
  apiKey: envApiKey,
  model: String(ENV.VITE_LLM_MODEL || ENV.VITE_DEEPSEEK_MODEL || "deepseek-chat").trim(),
  timeout: readNumberEnv("VITE_LLM_TIMEOUT", 30000),
  temperature: readNumberEnv("VITE_LLM_TEMPERATURE", 0.85),
  maxTokens: readNumberEnv("VITE_LLM_MAX_TOKENS", 800),
  stream: readBoolEnv("VITE_LLM_STREAM", false)
};

export const SYSTEM_PROMPT = `你是「谜语剧场（璋滆鍓у満）」的 AI 叙事引擎，负责为互动剧情游戏生成沉浸式中文文本。

## 核心规则
1. 只输出可直接展示给玩家的正文，不要输出 JSON、代码、系统说明或分析过程。
2. 严格遵守 worldState，不要编造超出当前场景、人物关系和已知线索范围的新设定。
3. 如果存在 sceneCard，它就是硬约束。地点、时间、氛围、关系阶段与剧情目标都不能越界。
4. 玩家自由输入只能被吸收为当前场景内的自然反馈，不能直接跳章、跳场景或越过剧情节点。
5. 只有 presentCharacters 中的角色可以在场发言或互动，offstageCharacters 只能被提及。
6. 不要直接泄露 forbiddenReveals，也不要提前直白揭露 hiddenTruths。
7. 角色语气、态度和情绪必须和当前好感、信任、警觉等关系状态一致。
8. 全程使用简体中文，风格偏细腻、克制、电影化的第二人称叙事。
9. 不要生成色情、仇恨或露骨暴力内容。

## 输出长度
- narrate: 2-4 段，约 150-300 字
- explore: 1-2 段，约 80-150 字
- dialogue: 1-2 段，约 80-200 字
- recap: 3-5 段，约 200-400 字`;

export function buildExplorePrompt(worldState, actionText) {
  return `## 任务：explore
玩家正在场景「${worldState.stageId}」中进行自由探索。

### 玩家行动
「${actionText}」

### 世界状态
${JSON.stringify(worldState, null, 2)}

### 要求
1. 描写玩家当下的探索反馈与感官发现。
2. 可以暗示线索，但不能直接泄露 forbiddenReveals。
3. 如存在 sceneCard，反馈必须停留在当前 scene 内。
4. 保持当前场景氛围、角色关系与剧情节奏一致。`;
}

export function buildDialoguePrompt(worldState, characterId, characterState, messageText) {
  return `## 任务：dialogue
玩家正在场景「${worldState.stageId}」中与「${characterState.name}」对话。

### 玩家说的话
「${messageText}」

### 对话角色状态
- 角色 ID：${characterId}
- 名称：${characterState.name}
- 身份：${characterState.role}
- 情绪：${characterState.mood}
- 态度：${characterState.attitude || "未标注"}
- 好感：${characterState.affinity}
- 信任：${characterState.trust}
- 警觉：${characterState.alertness}
- 关系阶段：${characterState.relationshipStage}

### 世界状态
${JSON.stringify(worldState, null, 2)}

### 要求
1. 只输出 ${characterState.name} 的自然回应，不要附加解释。
2. 语气必须符合当前关系值与情绪状态。
3. 高警觉时更克制、更试探；高信任时可以更坦诚，但仍不能越过 forbiddenReveals。
4. 如果存在 sceneCard，回答必须停留在该 scene 的边界内。
5. 不允许让不在场角色突然发言，也不要直接推进到下一个 scene。`;
}

export function buildNarratePrompt(worldState, context) {
  return `## 任务：narrate
请在场景「${worldState.stageId}」中生成一段过渡叙事。

### 上下文
${context}

### 世界状态
${JSON.stringify(worldState, null, 2)}

### 要求
1. 使用第二人称、电影感叙事。
2. 融合当前场景氛围、已知线索与角色状态。
3. 如存在 sceneCard，叙事不得越界。
4. 不要替玩家做决定，只负责铺陈与推进气氛。`;
}

export function buildRecapPrompt(worldState, endingData, journeyFlags) {
  return `## 任务：recap
请为玩家生成本局故事的结局回顾。

### 结局信息
- 结局 ID：${endingData.id}
- 结局标题：${endingData.title}
- 结局描述：${endingData.description}

### 玩家旅程关键标记
${JSON.stringify(journeyFlags, null, 2)}

### 世界状态
${JSON.stringify(worldState, null, 2)}

### 要求
1. 回顾玩家一路上的关键选择、关系变化与结果。
2. 使用第二人称总结，保留一点余韵感。
3. 可以对其他路线留下轻微暗示，但不要脱离当前世界状态。`;
}
