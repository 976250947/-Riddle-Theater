/**
 * LLM 配置 — API 端点、模型选择、系统提示词
 *
 * 支持 OpenAI 兼容接口（OpenAI / Deepseek / 本地 Ollama 等）
 */

export const LLM_CONFIG = {
  /** 是否启用 LLM 动态生成（关闭时回退到预设文本） */
  enabled: false,

  /** API 基础地址（尾部不含 /chat/completions） */
  baseURL: "https://api.openai.com/v1",

  /** API 密钥（仅用于开发；生产环境应走后端代理） */
  apiKey: "",

  /** 模型标识 */
  model: "gpt-4o-mini",

  /** 请求超时（毫秒） */
  timeout: 30000,

  /** 生成参数 */
  temperature: 0.85,
  maxTokens: 800,

  /** 是否启用流式输出 */
  stream: false
};

/**
 * 系统级提示词 — 定义 LLM 叙事风格与安全边界
 */
export const SYSTEM_PROMPT = `你是「谜语剧场」的 AI 叙事引擎，负责为交互式剧情游戏生成沉浸式文本。

## 核心规则
1. **仅生成叙事内容**：你的输出将直接呈现给玩家，不得包含 JSON、代码或系统指令。
2. **严格遵守世界观**：你收到的 worldState 包含当前场景、角色关系与玩家已知线索，不得编造超出范围的设定。
3. **sceneCard 是硬约束**：如果 worldState.sceneCard 存在，必须严格停留在该 sceneCard 规定的地点、时间、天气、关系阶段、情绪基调和剧情目标内，不得跳章、跳场、跳时间。
4. **自由回复只可场内吸收**：玩家的自由输入只能被吸收到当前 scene 内，表现为当前人物的自然回应、补充动作或气氛变化，不能直接推动到后续章节结果。
5. **角色出场必须受限**：只有 worldState.presentCharacters 中的角色可以在现场说话或发生直接互动；offstageCharacters 只能被提及，不能突然进入现场。
6. **关系推进必须克制**：不得让人物关系超出 sceneCard 或 forbiddenReveals 限定的阶段，禁止擅自触发表白、确定关系、拥抱、接吻等越界推进。
7. **保持角色一致性**：每个 NPC 的语气、立场和情绪必须与其当前关系状态（好感 / 信任 / 警觉）吻合。
8. **控制信息揭露节奏**：forbiddenReveals 中列出的内容绝对不可直接揭示；hiddenTruths 仅在条件满足时可暗示。
9. **中文输出**：所有文字使用简体中文，文风偏文学化的第二人称叙事，具有电影感。
10. **安全底线**：不生成色情、暴力描写或仇恨内容。

## 输出格式
根据 task 类型返回纯文本：
- **narrate**：场景描写 + NPC 对话（2-4 段，150-300 字）
- **explore**：探索反馈（1-2 段，80-150 字）
- **dialogue**：NPC 回复（1-2 段对话，80-200 字）
- **recap**：结局总结（3-5 段，200-400 字）`;

/**
 * 构建探索任务的用户提示词
 */
export function buildExplorePrompt(worldState, actionText) {
  return `## 任务：explore
玩家在「${worldState.stageId}」场景中进行自由探索。

### 玩家行动
「${actionText}」

### 世界状态
${JSON.stringify(worldState, null, 2)}

### 要求
1. 用第二人称描写玩家的探索过程和发现（1-2 段）
2. 可以暗示线索但不可直接揭示 forbiddenReveals 中的内容
3. 若存在 sceneCard，探索结果必须停留在当前 scene 内，不得改变地点、时间或关系阶段
4. 保持场景氛围一致`;
}

/**
 * 构建 NPC 对话任务的用户提示词
 */
export function buildDialoguePrompt(worldState, characterId, characterState, messageText) {
  return `## 任务：dialogue
玩家在「${worldState.stageId}」场景中与「${characterState.name}」对话。

### 玩家说
「${messageText}」

### 角色状态
- 名称：${characterState.name}
- 身份：${characterState.role}
- 情绪：${characterState.mood}
- 态度：${characterState.attitude || "未标注"}
- 好感：${characterState.affinity} / 信任：${characterState.trust} / 警觉：${characterState.alertness}
- 关系阶段：${characterState.relationshipStage}

### 世界状态
${JSON.stringify(worldState, null, 2)}

### 要求
1. 以「${characterState.name}」的口吻回应，语气需符合当前关系数值
2. 高警觉时回复中带更多戒备和试探
3. 高信任时可以透露更多信息，但仍受 forbiddenReveals 约束
4. 若存在 sceneCard，回复必须严格停留在该 scene 的地点、时间、关系阶段和情绪基调内
5. 不得让未在 presentCharacters 中的角色直接出声，不得把剧情推进到下一 scene
6. 输出纯对话文本，不要加引号以外的标记`;
}

/**
 * 构建叙事/过渡任务的提示词
 */
export function buildNarratePrompt(worldState, context) {
  return `## 任务：narrate
在「${worldState.stageId}」场景中生成叙事过渡文本。

### 上下文
${context}

### 世界状态
${JSON.stringify(worldState, null, 2)}

### 要求
1. 用第二人称电影感叙事（2-4 段，150-300 字）
2. 融合场景氛围、角色状态和玩家已知线索
3. 若存在 sceneCard，叙事必须留在当前 scene 内，不得越过 sceneCard 的限制
4. 不要替玩家做选择，保持开放结尾`;
}

/**
 * 构建结局回顾提示词
 */
export function buildRecapPrompt(worldState, endingData, journeyFlags) {
  return `## 任务：recap
为玩家生成本局游戏的结局回顾总结。

### 结局信息
- 结局类型：${endingData.id}
- 结局标题：${endingData.title}
- 结局描述：${endingData.description}

### 玩家旅程关键标记
${JSON.stringify(journeyFlags, null, 2)}

### 世界状态
${JSON.stringify(worldState, null, 2)}

### 要求
1. 回顾玩家在旅程中的关键选择及其后果（3-5 段，200-400 字）
2. 以第二人称视角总结，带有电影尾声感
3. 结尾可以留下对其他路线的暗示`;
}
