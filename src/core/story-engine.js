import { MAX_EVENTS, MAX_EXPLORE_ACTIONS, MAX_DIALOGUE_TURNS, PLAYER_ARCHETYPES, ENDING_ORDER } from "../config/constants.js";
import {
  DEFAULT_STORY_ID,
  buildStagePayload,
  buildStoryStateMeta,
  getJourneyPreset,
  getStoryPack,
  toEndingKey
} from "../config/story-packs.js";
import { clamp, createId, deepClone } from "./utils.js";
import { llmExplore, llmDialogue } from "./llm-narrator.js";

export function createInitialState(meta, options) {
  const pack = getStoryPack(options.storyId);
  const archetype = PLAYER_ARCHETYPES[options.archetypeId] || PLAYER_ARCHETYPES.witness;
  const journeyPreset = getJourneyPreset(pack.id, archetype.id);
  const characters = deepClone(pack.initialCharacters);
  const primaryCharacter = characters[pack.primaryCharacterId];

  if (primaryCharacter) {
    primaryCharacter.affinity += archetype.statModifiers.affinity;
    primaryCharacter.trust += archetype.statModifiers.trust;
    primaryCharacter.alertness += archetype.statModifiers.alertness;
  }

  const state = {
    session: {
      sessionId: createId("session"),
      currentNodeId: null,
      currentStageId: null,
      chapterId: pack.progressSteps[0]?.key || pack.initialStageId,
      status: "in_progress",
      exploreActionsUsed: 0,
      dialogueTurnsUsed: 0,
      tempOptions: null,
      exploreHistory: [],
      dialogueHistory: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    story: buildStoryStateMeta(pack),
    player: {
      alias: options.alias || "无名旅人",
      archetypeId: archetype.id,
      archetypeTitle: journeyPreset.title,
      archetypeShort: journeyPreset.short,
      archetypeDescription: journeyPreset.description,
      archetypeLens: journeyPreset.lens,
      archetypeStatSummary: journeyPreset.statSummary
    },
    nodes: [],
    choices: [],
    checkpoints: [],
    currentEnding: null,
    flags: {},
    events: [{ text: pack.initialEventText, hot: false }],
    journal: {
      clues: [],
      latestClueIds: []
    },
    lastOutcome: {
      summary: "旅程尚未开始。",
      statChanges: { affinity: 0, trust: 0, alertness: 0 },
      unlockedClues: []
    },
    characters,
    meta
  };

  Object.values(state.characters).forEach((character) => updateDerivedCharacterState(character));
  enterStage(state, pack.initialStageId);
  return state;
}

export function normalizeState(state) {
  const pack = getStoryPack(state.story?.id || DEFAULT_STORY_ID);
  const archetypeId = state.player?.archetypeId || "witness";
  const journeyPreset = getJourneyPreset(pack.id, archetypeId);
  state.story = {
    ...buildStoryStateMeta(pack),
    ...(state.story || {})
  };
  state.player = {
    alias: state.player?.alias || "无名旅人",
    archetypeId,
    archetypeTitle: journeyPreset.title,
    archetypeShort: journeyPreset.short,
    archetypeDescription: journeyPreset.description,
    archetypeLens: journeyPreset.lens,
    archetypeStatSummary: journeyPreset.statSummary
  };
  state.session = state.session || {
    sessionId: createId("session"),
    currentNodeId: null,
    currentStageId: pack.initialStageId,
    chapterId: pack.progressSteps[0]?.key || pack.initialStageId,
    status: "in_progress",
    exploreActionsUsed: 0,
    dialogueTurnsUsed: 0,
    tempOptions: null,
    exploreHistory: [],
    dialogueHistory: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  state.session.exploreActionsUsed = state.session.exploreActionsUsed || 0;
  state.session.dialogueTurnsUsed = state.session.dialogueTurnsUsed || 0;
  state.session.exploreHistory = state.session.exploreHistory || [];
  state.session.dialogueHistory = state.session.dialogueHistory || [];
  state.events = state.events || [];
  state.nodes = state.nodes || [];
  state.choices = state.choices || [];
  state.checkpoints = state.checkpoints || [];
  state.flags = state.flags || {};
  state.journal = state.journal || { clues: [], latestClueIds: [] };
  state.lastOutcome = state.lastOutcome || {
    summary: "已恢复旅程。",
    statChanges: { affinity: 0, trust: 0, alertness: 0 },
    unlockedClues: []
  };
  state.characters = state.characters || deepClone(pack.initialCharacters);
  state.meta = state.meta || { unlockedEndings: [] };

  if (state.currentEnding && !state.currentEnding.storyId) {
    state.currentEnding.storyId = state.story.id;
  }

  Object.values(state.characters).forEach((character) => updateDerivedCharacterState(character));
  return state;
}

export function getCurrentNode(state) {
  return state.nodes.find((node) => node.nodeId === state.session.currentNodeId) || state.nodes.at(-1) || null;
}

export function getCurrentStage(state) {
  const pack = getStoryPack(state.story?.id);
  return pack.stages[state.session.currentStageId] || null;
}

export function inferChoiceFromText(stage, text) {
  const normalized = text.toLowerCase();
  let bestChoice = stage.choices[0];
  let bestScore = -1;

  stage.choices.forEach((choice) => {
    const score = (choice.keywords || []).reduce((total, keyword) => {
      return total + (normalized.includes(keyword.toLowerCase()) ? 1 : 0);
    }, 0);

    if (score > bestScore) {
      bestChoice = choice;
      bestScore = score;
    }
  });

  return bestChoice;
}

export function submitChoice(state, payload) {
  const pack = getStoryPack(state.story.id);
  const currentStage = getCurrentStage(state);
  const currentNode = getCurrentNode(state);
  const primaryCharacter = state.characters[state.story.primaryCharacterId];
  const primaryBefore = primaryCharacter ? snapshotRelationship(primaryCharacter) : null;

  const choiceRecord = {
    choiceId: createId("choice"),
    sessionId: state.session.sessionId,
    nodeId: currentNode.nodeId,
    choiceType: payload.choiceType,
    choiceValue: payload.choiceValue,
    parsedIntent: payload.parsedIntent,
    matchedChoiceId: payload.matchedChoiceId || null,
    createdAt: new Date().toISOString()
  };

  state.choices.push(choiceRecord);
  state.journal.latestClueIds = [];
  const outcome = advanceStage(state, pack, currentStage, choiceRecord);
  const primaryAfter = state.characters[state.story.primaryCharacterId];
  const statChanges =
    primaryBefore && primaryAfter
      ? diffRelationship(primaryBefore, primaryAfter)
      : { affinity: 0, trust: 0, alertness: 0 };
  const unlockedClues = state.journal.latestClueIds
    .map((clueId) => pack.clueLibrary[clueId])
    .filter(Boolean);

  state.lastOutcome = {
    summary: outcome.summary,
    statChanges,
    unlockedClues
  };

  if (outcome.endingId) {
    state.session.status = "completed";
    state.currentEnding = {
      storyId: state.story.id,
      endingId: outcome.endingId,
      unlockedAt: new Date().toISOString()
    };
  } else {
    enterStage(state, outcome.nextStageId, choiceRecord);
  }

  state.session.updatedAt = new Date().toISOString();
  return outcome;
}

export function applyEndingMeta(state, meta) {
  if (!state.currentEnding) return;
  const endingKey = toEndingKey(state.story.id, state.currentEnding.endingId);
  if (!meta.unlockedEndings.includes(endingKey)) {
    meta.unlockedEndings.push(endingKey);
  }
  state.meta = meta;
}

export function resolveEndingData(state) {
  const storyId = state.currentEnding?.storyId || state.story?.id || DEFAULT_STORY_ID;
  const pack = getStoryPack(storyId);
  return pack.endings[state.currentEnding?.endingId] || null;
}

/* ── World State Model ── */

export function getWorldState(state) {
  const pack = getStoryPack(state.story?.id);
  const stage = getCurrentStage(state);
  const knownFacts = state.journal.clues.map((c) => c.title);
  const revealedCharacters = Object.values(state.characters).filter((c) => c.revealed);
  const hiddenCharacters = Object.values(state.characters).filter((c) => !c.revealed);
  const presentCharacterIds = stage?.presentCharacterIds || revealedCharacters.map((c) => c.characterId);
  const presentCharacters = presentCharacterIds
    .map((characterId) => state.characters[characterId])
    .filter((character) => character?.revealed);
  const offstageCharacters = revealedCharacters.filter((character) => !presentCharacterIds.includes(character.characterId));

  return {
    storyId: state.story.id,
    stageId: state.session.currentStageId,
    chapterId: state.session.chapterId,
    sceneTitle: stage?.title || "",
    sceneTag: stage?.sceneTag || "",
    sceneCard: stage?.scene_card || null,
    visualState: stage?.visual_state || null,
    currentObjective: stage?.objective || "",
    currentStakes: stage?.stakes || "",
    sceneTags: stage?.eventTags || [],
    playerKnowledge: {
      clues: knownFacts,
      flags: Object.keys(state.flags),
      events: state.events.map((e) => e.text)
    },
    characterKnowledge: revealedCharacters.reduce((map, c) => {
      map[c.characterId] = {
        name: c.name,
        role: c.role,
        attitude: deriveAttitude(c),
        willReveal: deriveWillingness(c),
        knownTopics: deriveKnownTopics(state, c.characterId, pack)
      };
      return map;
    }, {}),
    hiddenTruths: (stage?.hiddenTruths || pack.hiddenTruths || []),
    forbiddenReveals: (stage?.forbiddenReveals || pack.forbiddenReveals || []),
    presentCharacters: presentCharacters.map((c) => c.characterId),
    offstageCharacters: offstageCharacters.map((c) => c.characterId),
    unrevealedCharacters: hiddenCharacters.map((c) => c.characterId),
    availableModes: getAvailableModes(stage),
    exploreRemaining: getExploreRemaining(state),
    dialogueRemaining: getDialogueRemaining(state)
  };
}

function deriveAttitude(character) {
  if (character.alertness >= 70) return "hostile";
  if (character.trust >= 60 && character.affinity >= 60) return "ally";
  if (character.trust >= 45) return "cautious_trust";
  if (character.affinity >= 50) return "warm_but_guarded";
  return "neutral";
}

function deriveWillingness(character) {
  const base = character.trust * 0.6 + character.affinity * 0.3 - character.alertness * 0.4;
  if (base >= 40) return "open";
  if (base >= 15) return "selective";
  return "guarded";
}

function deriveKnownTopics(state, characterId, pack) {
  const topics = [];
  const stage = getCurrentStage(state);
  if (stage?.characterTopics?.[characterId]) {
    topics.push(...stage.characterTopics[characterId]);
  }
  if (pack.characterTopics?.[characterId]) {
    const baseTopics = pack.characterTopics[characterId]
      .filter((t) => !t.requireFlag || state.flags[t.requireFlag])
      .map((t) => t.topic);
    topics.push(...baseTopics);
  }
  return topics;
}

function getAvailableModes(stage) {
  if (!stage) return ["fixed"];
  const modes = ["fixed"];
  if (stage.allowFreeInput !== false) modes.push("freeInput");
  if (stage.allowExplore) modes.push("explore");
  if (stage.allowDialogue) modes.push("dialogue");
  if (stage.semiOpenConfig) modes.push("semiOpen");
  return modes;
}

function getExploreRemaining(state) {
  const used = state.session.exploreActionsUsed || 0;
  return Math.max(0, MAX_EXPLORE_ACTIONS - used);
}

function getDialogueRemaining(state) {
  const used = state.session.dialogueTurnsUsed || 0;
  return Math.max(0, MAX_DIALOGUE_TURNS - used);
}

/* ── Exploration / Investigation System ── */

export async function submitExploreAction(state, actionText) {
  const pack = getStoryPack(state.story.id);
  const stage = getCurrentStage(state);
  if (!stage?.allowExplore) return { success: false, feedback: "当前场景不支持自由探索。" };

  const remaining = getExploreRemaining(state);
  if (remaining <= 0) return { success: false, feedback: "本场景的探索次数已用尽，请做出选择推进剧情。" };

  state.session.exploreActionsUsed = (state.session.exploreActionsUsed || 0) + 1;
  const result = await resolveExploreAction(state, pack, stage, actionText);

  if (result.clueId) {
    unlockClues(state, pack, [result.clueId]);
    state.lastOutcome.unlockedClues = [pack.clueLibrary[result.clueId]].filter(Boolean);
  }
  if (result.effects) {
    applyEffects(state, result.effects);
    Object.values(state.characters).forEach((c) => updateDerivedCharacterState(c));
  }
  if (result.flagsOn) {
    result.flagsOn.forEach((f) => { state.flags[f] = true; });
  }
  if (result.event) {
    addEvent(state, result.event, result.eventHot || false);
  }
  if (result.revealCharacter && state.characters[result.revealCharacter]) {
    state.characters[result.revealCharacter].revealed = true;
  }

  state.session.updatedAt = new Date().toISOString();
  saveExploreRecord(state, actionText, result);

  return {
    success: true,
    feedback: result.feedback,
    narrativeText: result.narrativeText || "",
    remaining: getExploreRemaining(state),
    newClue: result.clueId ? pack.clueLibrary[result.clueId] : null,
    dynamicOptions: result.dynamicOptions || null
  };
}

async function resolveExploreAction(state, pack, stage, actionText) {
  const normalized = actionText.toLowerCase();
  const exploreTargets = stage.exploreTargets || [];

  for (const target of exploreTargets) {
    const matched = (target.keywords || []).some((kw) => normalized.includes(kw.toLowerCase()));
    if (matched) return target.resolve(state, actionText);
  }

  if (typeof stage.resolveExplore === "function") {
    return stage.resolveExplore(state, actionText);
  }

  return generateFallbackExplore(state, stage, actionText);
}

async function generateFallbackExplore(state, stage, actionText) {
  // 尝试 LLM 生成
  const worldState = getWorldState(state);
  const llmResult = await llmExplore(worldState, actionText);
  if (llmResult.ok && llmResult.text) {
    return {
      feedback: llmResult.text,
      narrativeText: `你在${stage.sceneTag || "当前场景"}中搜寻着：「${actionText}」`
    };
  }

  // LLM 不可用时降级到内置模板
  const scene = stage.sceneTag || "当前场景";
  const templates = [
    `你仔细观察了${scene}的周围环境，但没有发现特别值得注意的线索。也许换个方向会有不同的发现。`,
    `你的调查暂时没有产生新的突破，不过这个行动让你对${scene}有了更深的感受。`,
    `在${scene}里，你尝试了这个方向，但目前没有找到直接关联的信息。故事仍在等待你的下一步决定。`
  ];
  return {
    feedback: templates[Math.floor(Math.random() * templates.length)],
    narrativeText: `你在${scene}中搜寻着：「${actionText}」`
  };
}

function saveExploreRecord(state, actionText, result) {
  if (!state.session.exploreHistory) state.session.exploreHistory = [];
  state.session.exploreHistory.push({
    stageId: state.session.currentStageId,
    action: actionText,
    feedback: result.feedback,
    timestamp: new Date().toISOString()
  });
}

/* ── NPC Dialogue System ── */

export async function submitDialogue(state, targetCharacterId, messageText) {
  const pack = getStoryPack(state.story.id);
  const stage = getCurrentStage(state);
  const character = state.characters[targetCharacterId];

  if (!character || !character.revealed) {
    return { success: false, response: "你还没有接触到这个角色。" };
  }
  if (!stage?.allowDialogue) {
    return { success: false, response: "当前场景不支持与角色进行对话。" };
  }

  const remaining = getDialogueRemaining(state);
  if (remaining <= 0) {
    return { success: false, response: "本场景的对话次数已用尽，请做出选择推进剧情。" };
  }

  state.session.dialogueTurnsUsed = (state.session.dialogueTurnsUsed || 0) + 1;
  const result = await resolveDialogue(state, pack, stage, character, messageText);

  if (result.effects) {
    applyEffects(state, result.effects);
    Object.values(state.characters).forEach((c) => updateDerivedCharacterState(c));
  }
  if (result.clueId) {
    unlockClues(state, pack, [result.clueId]);
  }
  if (result.flagsOn) {
    result.flagsOn.forEach((f) => { state.flags[f] = true; });
  }
  if (result.event) {
    addEvent(state, result.event, result.eventHot || false);
  }

  state.session.updatedAt = new Date().toISOString();
  saveDialogueRecord(state, targetCharacterId, messageText, result);

  return {
    success: true,
    speaker: character.name,
    response: result.response,
    mood: result.mood || character.mood,
    remaining: getDialogueRemaining(state),
    newClue: result.clueId ? pack.clueLibrary[result.clueId] : null,
    dynamicOptions: result.dynamicOptions || null,
    attitudeShift: result.attitudeShift || null
  };
}

async function resolveDialogue(state, pack, stage, character, messageText) {
  const normalized = messageText.toLowerCase();
  const dialogueRules = stage.dialogueRules?.[character.characterId] || [];

  for (const rule of dialogueRules) {
    const matched = (rule.keywords || []).some((kw) => normalized.includes(kw.toLowerCase()));
    if (!matched) continue;
    if (rule.requireFlag && !state.flags[rule.requireFlag]) continue;
    if (rule.requireClue && !state.journal.clues.some((c) => c.id === rule.requireClue)) continue;
    return rule.resolve(state, character, messageText);
  }

  if (typeof stage.resolveDialogue === "function") {
    return stage.resolveDialogue(state, character, messageText);
  }

  return generateRelationshipDialogue(state, character, messageText);
}

async function generateRelationshipDialogue(state, character, messageText) {
  const attitude = deriveAttitude(character);
  const willingness = deriveWillingness(character);

  // 尝试 LLM 生成
  const worldState = getWorldState(state);
  const characterState = {
    name: character.name,
    role: character.role,
    mood: character.mood,
    affinity: character.affinity,
    trust: character.trust,
    alertness: character.alertness,
    relationshipStage: character.relationshipStage,
    attitude
  };
  const llmResult = await llmDialogue(worldState, character.characterId, characterState, messageText);
  if (llmResult.ok && llmResult.text) {
    return {
      response: llmResult.text,
      mood: character.mood,
      attitudeShift: willingness === "guarded" ? "对你仍保持距离" : willingness === "open" ? "对你有了更多信任" : "态度没有明显变化"
    };
  }

  // LLM 不可用时降级到内置模板
  const toneMap = {
    hostile: ["冷淡", "抵触", "警惕", "回避"],
    neutral: ["平静", "保留", "试探", "观察"],
    cautious_trust: ["谨慎", "思索", "有所保留地回应", "略带善意"],
    warm_but_guarded: ["温和但克制", "友善但不完全敞开", "带着分寸的亲近"],
    ally: ["坦诚", "信任", "愿意分享", "真诚"]
  };

  const tones = toneMap[attitude] || toneMap.neutral;
  const tone = tones[Math.floor(Math.random() * tones.length)];

  const responses = {
    hostile: [
      `${character.name}的目光变得更冷: "我没有义务回答你的问题。"`,
      `${character.name}微微侧过身，语气比之前更硬: "你的好奇心不会让我对你放松哪怕一点。"`,
      `"这不是你该问的。"${character.name}的声音没有任何温度。`
    ],
    neutral: [
      `${character.name}看着你，像在衡量这个问题值不值得认真回答: "你想知道什么，取决于你先告诉我什么。"`,
      `${character.name}没有立刻回答，只是把视线移开片刻: "我需要再想想该怎么回你这句话。"`,
      `"也许吧。"${character.name}给出一个不算承诺也不算拒绝的回应。`
    ],
    cautious_trust: [
      `${character.name}停了一拍，随后压低声音: "我可以告诉你一些，但你要先保证这只留在我们之间。"`,
      `${character.name}看了你一眼，像是在做最后确认: "你真的想知道？那你准备好了吗？"`,
      `"行，既然你问了。"${character.name}终于放软了语气，"但我只说一次。"`
    ],
    warm_but_guarded: [
      `${character.name}微微笑了一下，但笑意没有完全抵达眼底: "你总是会问到最让我为难的地方。"`,
      `"你这个人啊。"${character.name}叹了口气，"好吧，我告诉你我知道的部分。"`,
      `${character.name}靠近了半步，声音变得轻柔: "如果你真的想了解，我可以说——但别让其他人知道。"`
    ],
    ally: [
      `${character.name}的目光变得温和: "你问的时机很对。我本来也打算告诉你。"`,
      `"既然你开口了。"${character.name}直视着你，"我相信你能听懂这些话的分量。"`,
      `${character.name}没有任何犹豫: "你现在已经有资格知道这些了。我全都告诉你。"`
    ]
  };

  const pool = responses[attitude] || responses.neutral;
  const response = pool[Math.floor(Math.random() * pool.length)];

  return {
    response,
    mood: tone,
    attitudeShift: willingness === "guarded" ? "对你仍保持距离" : willingness === "open" ? "对你有了更多信任" : "态度没有明显变化"
  };
}

function saveDialogueRecord(state, characterId, messageText, result) {
  if (!state.session.dialogueHistory) state.session.dialogueHistory = [];
  state.session.dialogueHistory.push({
    stageId: state.session.currentStageId,
    characterId,
    playerMessage: messageText,
    npcResponse: result.response,
    timestamp: new Date().toISOString()
  });
}

/* ── Dynamic Options Generation ── */

export function generateDynamicOptions(state) {
  const stage = getCurrentStage(state);
  if (!stage) return [];

  const dynamic = [];

  if (stage.allowExplore && getExploreRemaining(state) > 0) {
    dynamic.push({
      id: "dynamic_explore",
      label: `自由探索（剩余 ${getExploreRemaining(state)} 次）`,
      type: "explore",
      description: "观察场景细节，搜寻线索"
    });
  }

  if (stage.allowDialogue && getDialogueRemaining(state) > 0) {
    const speakers = Object.values(state.characters)
      .filter((c) => c.revealed)
      .map((c) => c.name);
    dynamic.push({
      id: "dynamic_dialogue",
      label: `与角色对话（剩余 ${getDialogueRemaining(state)} 轮）`,
      type: "dialogue",
      description: speakers.length ? `可对话：${speakers.join("、")}` : "与在场角色交谈"
    });
  }

  if (state.session.tempOptions) {
    dynamic.push(...state.session.tempOptions);
  }

  return dynamic;
}

/* ── Semi-Open Choice Resolution ── */

export function submitSemiOpenChoice(state, payload) {
  const pack = getStoryPack(state.story.id);
  const stage = getCurrentStage(state);
  if (!stage?.semiOpenConfig) return null;

  const { target, approach } = payload;
  const config = stage.semiOpenConfig;
  const targetDef = config.targets?.find((t) => t.id === target);
  const approachDef = config.approaches?.find((a) => a.id === approach);

  if (!targetDef || !approachDef) return null;

  const combinedIntent = `${target}_${approach}`;
  const bestChoice = stage.choices.reduce((best, choice) => {
    const intentMatch = choice.intent === combinedIntent || choice.intent === target || choice.intent === approach;
    return intentMatch ? choice : best;
  }, stage.choices[0]);

  return commitSemiOpenOutcome(state, pack, stage, bestChoice, targetDef, approachDef);
}

function commitSemiOpenOutcome(state, pack, stage, matchedChoice, targetDef, approachDef) {
  const label = `${targetDef.label}（${approachDef.label}）`;

  return {
    choiceType: "semiOpen",
    choiceValue: label,
    parsedIntent: matchedChoice.intent,
    matchedChoiceId: matchedChoice.id
  };
}

/* ── Enhanced Free-Text with Context ── */

export function enhancedInferChoice(state, stage, text) {
  const normalized = text.toLowerCase();
  let bestChoice = stage.choices[0];
  let bestScore = -1;

  stage.choices.forEach((choice) => {
    let score = 0;
    (choice.keywords || []).forEach((keyword) => {
      if (normalized.includes(keyword.toLowerCase())) score += 2;
    });
    if (choice.intent && normalized.includes(choice.intent.toLowerCase())) score += 1;
    if (score > bestScore) {
      bestChoice = choice;
      bestScore = score;
    }
  });

  const confidence = bestScore >= 2 ? "high" : bestScore >= 1 ? "medium" : "low";

  return {
    choice: bestChoice,
    confidence,
    matchedKeywords: bestScore,
    suggestedFeedback: confidence === "low"
      ? `你的行动"${text}"被理解为接近「${bestChoice.label}」的意图。`
      : null
  };
}

/* ── Generative Recap for Endings ── */

export function generateEndingRecap(state) {
  const pack = getStoryPack(state.story.id);
  const ending = pack.endings[state.currentEnding?.endingId];
  if (!ending) return null;

  const primaryChar = state.characters[state.story.primaryCharacterId];
  const keyChoices = state.choices.slice(-5).map((c) => c.choiceValue).filter(Boolean);
  const clueCount = state.journal.clues.length;
  const totalClues = Object.keys(pack.clueLibrary || {}).length;
  const nodeCount = state.nodes.length;
  const relationship = primaryChar
    ? `${primaryChar.name}：好感 ${primaryChar.affinity} / 信任 ${primaryChar.trust} / 警觉 ${primaryChar.alertness}`
    : "";

  const turningSummaries = [];
  state.checkpoints.forEach((cp) => {
    if (cp.choicePreview) {
      turningSummaries.push(`${cp.title}：${cp.choicePreview}`);
    }
  });

  const missedEndings = ENDING_ORDER
    .filter((eId) => eId !== state.currentEnding.endingId && pack.endings[eId])
    .map((eId) => ({
      id: eId,
      title: pack.endings[eId].title,
      hint: pack.endings[eId].conditions?.[0]?.label
        ? `关键条件：${pack.endings[eId].conditions[0].label} ${pack.endings[eId].conditions[0].value}`
        : ""
    }));

  const dialogueHistory = state.session.dialogueHistory || [];
  const exploreHistory = state.session.exploreHistory || [];

  return {
    endingTitle: ending.title,
    endingBadge: ending.badge,
    endingDescription: ending.description,
    playerAlias: state.player.alias,
    archetypeTitle: state.player.archetypeTitle,
    storyTitle: state.story.title,
    relationship,
    nodeCount,
    cluesFound: `${clueCount} / ${totalClues}`,
    keyChoices,
    turningPoints: turningSummaries,
    missedEndings,
    dialogueCount: dialogueHistory.length,
    exploreCount: exploreHistory.length,
    journeySummary: buildJourneySummary(state, pack, ending),
    characterEpilogue: buildCharacterEpilogue(state, primaryChar, ending)
  };
}

function buildJourneySummary(state, pack, ending) {
  const alias = state.player.alias;
  const title = state.story.title;
  const nodes = state.nodes;
  const openingTitle = nodes[0]?.title || "序幕";
  const finalTitle = nodes[nodes.length - 1]?.title || "终章";

  return `在《${title}》的旅程中，${alias}从"${openingTitle}"一路走到了"${finalTitle}"。`
    + ` 这段故事跨越了 ${nodes.length} 个章节节点，最终以"${ending.title}"作为收束。`
    + ` ${alias}在这条路线中做出了 ${state.choices.length} 次关键回应，`
    + `获得了 ${state.journal.clues.length} 条线索。`;
}

function buildCharacterEpilogue(state, primaryChar, ending) {
  if (!primaryChar) return "";
  const stage = primaryChar.relationshipStage;
  const name = primaryChar.name;

  if (ending.id === "good" || ending.id === "hidden") {
    return `${name}最终与你站到了同一边。这段关系从${stage}走到了更深的联结。`;
  }
  if (ending.id === "bad") {
    return `${name}与你之间的距离没能真正缩短。也许在另一条路线里，结局会完全不同。`;
  }
  return `${name}与你的故事停留在了一个不算完美也不算遗憾的位置——这就是"${ending.title}"的含义。`;
}

/* ── Session Mode Tracking ── */

export function resetStageInteraction(state) {
  state.session.exploreActionsUsed = 0;
  state.session.dialogueTurnsUsed = 0;
  state.session.tempOptions = null;
}

export function addTempOption(state, option) {
  if (!state.session.tempOptions) state.session.tempOptions = [];
  state.session.tempOptions.push({
    id: `temp_${createId("opt")}`,
    label: option.label,
    type: "temp",
    intent: option.intent || "custom",
    description: option.description || "",
    effects: option.effects || {},
    flagsOn: option.flagsOn || []
  });
}

export function rollbackToCheckpoint(state, checkpointId, meta) {
  const checkpoint = state.checkpoints.find((item) => item.checkpointId === checkpointId);
  if (!checkpoint) return null;

  const rolled = deepClone(checkpoint.snapshot);
  rolled.meta = meta;
  rolled.checkpoints = state.checkpoints
    .filter((item) => item.roundIndex <= checkpoint.roundIndex)
    .map((item) => deepClone(item));
  rolled.session.status = "in_progress";
  rolled.currentEnding = null;
  return normalizeState(rolled);
}

function enterStage(state, stageId, incomingChoice = null) {
  const pack = getStoryPack(state.story.id);
  const stage = pack.stages[stageId];
  const generated =
    typeof stage.build === "function" ? stage.build(state, incomingChoice) : buildStagePayload(stage, state, incomingChoice);

  unlockClues(state, pack, stage.entryClues || []);

  state.session.exploreActionsUsed = 0;
  state.session.dialogueTurnsUsed = 0;
  state.session.tempOptions = null;

  // Build dialogueLines — prefer explicit, fallback to auto-split
  const dialogueLines = buildDialogueLines(stage, generated, state);

  const node = {
    nodeId: createId("node"),
    sessionId: state.session.sessionId,
    parentNodeId: state.nodes.length ? state.nodes[state.nodes.length - 1].nodeId : null,
    stageId: stage.id,
    roundIndex: state.nodes.length + 1,
    chapterTag: stage.chapterTag,
    chapterLead: stage.chapterLead || generated.chapterLead || "",
    sceneTag: stage.sceneTag,
    title: stage.title,
    objective: stage.objective,
    stakes: stage.stakes,
    storyText: generated.storyText,
    npcDialogue: generated.npcDialogue,
    npcSpeakerId: generated.npcSpeakerId || state.story.primaryCharacterId,
    publicScript: generated.publicScript || stage.public_script || "",
    sceneCard: generated.sceneCard || stage.scene_card || null,
    visualState: generated.visualState || stage.visual_state || null,
    dialogueLines,
    eventHint: generated.eventHint,
    eventTags: generated.eventTags,
    choiceOptions: stage.choices,
    isCheckpoint: stage.isCheckpoint,
    progressKey: stage.progressKey,
    allowExplore: Boolean(stage.allowExplore),
    allowDialogue: Boolean(stage.allowDialogue),
    allowFreeInput: stage.allowFreeInput !== false,
    semiOpenConfig: stage.semiOpenConfig || null,
    availableModes: getAvailableModes(stage),
    incomingChoiceLabel: incomingChoice ? incomingChoice.choiceValue : null,
    createdAt: new Date().toISOString()
  };

  state.nodes.push(node);
  state.session.currentNodeId = node.nodeId;
  state.session.currentStageId = stage.id;
  state.session.chapterId = stage.progressKey;
  state.session.vnLineIndex = 0;

  if (stage.isCheckpoint) {
    upsertCheckpoint(state, node);
  }
}

/**
 * Build dialogueLines array for VN-style sequential presentation.
 * Priority: stage.dialogueLines (explicit) > auto-split from storyText + npcDialogue
 */
function buildDialogueLines(stage, generated, state) {
  // If stage provides explicit dialogueLines, use them
  if (stage.dialogueLines) {
    const raw = typeof stage.dialogueLines === "function"
      ? stage.dialogueLines(state)
      : stage.dialogueLines;
    // Append a choices marker if not already present
    if (!raw.some((l) => l.type === "choices")) {
      raw.push({ type: "choices" });
    }
    return raw;
  }

  // Auto-split fallback: break storyText and npcDialogue into lines by sentence
  const lines = [];
  const storyText = generated.storyText || "";
  const npcDialogue = generated.npcDialogue || "";
  const speakerId = generated.npcSpeakerId || state.story.primaryCharacterId;

  // Split narration by Chinese sentence terminators
  splitBySentence(storyText).forEach((sentence) => {
    lines.push({ speaker: null, text: sentence });
  });

  // Split NPC dialogue
  splitBySentence(npcDialogue).forEach((sentence, idx) => {
    lines.push({
      speaker: speakerId,
      text: sentence,
      mood: idx === 0 ? undefined : undefined
    });
  });

  // Append choices marker
  lines.push({ type: "choices" });
  return lines;
}

/** Split text into sentences by Chinese/Latin sentence-ending punctuation */
function splitBySentence(text) {
  if (!text || !text.trim()) return [];
  // Split on sentence-ending punctuation, keeping the punctuation attached
  const parts = text.match(/[^。！？.!?\n]+[。！？.!?\n]*/g) || [text];
  return parts.map((s) => s.trim()).filter(Boolean);
}

function advanceStage(state, pack, stage, choiceRecord) {
  if (typeof pack.resolveChoiceOutcome === "function") {
    const result = pack.resolveChoiceOutcome(state, stage.id, choiceRecord, { addEvent });
    Object.values(state.characters).forEach((character) => updateDerivedCharacterState(character));
    return result;
  }

  const choice =
    stage.choices.find((item) => item.id === choiceRecord.matchedChoiceId) ||
    stage.choices.find((item) => item.intent === choiceRecord.parsedIntent) ||
    stage.choices[0];

  applyEffects(state, choice.effects);
  (choice.flagsOn || []).forEach((flag) => {
    state.flags[flag] = true;
  });
  (choice.revealCharacters || []).forEach((characterId) => {
    if (state.characters[characterId]) {
      state.characters[characterId].revealed = true;
    }
  });
  unlockClues(state, pack, choice.unlockClues || []);
  addEvent(state, choice.eventText || "剧情发生了新的变化。", Boolean(choice.eventHot));
  Object.values(state.characters).forEach((character) => updateDerivedCharacterState(character));

  if (choice.ending) {
    return {
      endingId: pack.resolveEnding(state, choice, stage),
      summary: choice.summary || "你做出了最终决定。"
    };
  }

  return {
    nextStageId: choice.nextStageId,
    summary: choice.summary || "剧情向前推进了一步。"
  };
}

function applyEffects(state, effects = {}) {
  Object.entries(effects).forEach(([characterId, delta]) => {
    const character = state.characters[characterId];
    if (!character) return;
    character.affinity += delta.affinity || 0;
    character.trust += delta.trust || 0;
    character.alertness += delta.alertness || 0;
  });
}

function updateDerivedCharacterState(character) {
  character.affinity = clamp(character.affinity || 0, 0, 100);
  character.trust = clamp(character.trust || 0, 0, 100);
  character.alertness = clamp(character.alertness || 0, 0, 100);

  if (!character.revealed) {
    character.mood = character.mood || "未知";
    character.relationshipStage = character.relationshipStage || "未接触";
    return;
  }

  if (character.trust >= 75 && character.affinity >= 75) {
    character.mood = "坚定而靠近";
    character.relationshipStage = "并肩同行";
  } else if (character.trust >= 58) {
    character.mood = "谨慎中的信任";
    character.relationshipStage = "逐渐靠近";
  } else if (character.alertness >= 70) {
    character.mood = "克制而防备";
    character.relationshipStage = "拉开距离";
  } else {
    character.mood = "观察与试探";
    character.relationshipStage = "试探阶段";
  }
}

function unlockClues(state, pack, clueIds) {
  const added = [];
  clueIds.forEach((clueId) => {
    if (!pack.clueLibrary[clueId]) return;
    if (state.journal.clues.some((item) => item.id === clueId)) return;
    state.journal.clues.unshift(pack.clueLibrary[clueId]);
    added.push(clueId);
  });
  state.journal.latestClueIds = [...state.journal.latestClueIds, ...added];
}

function addEvent(state, text, hot) {
  state.events.unshift({ text, hot });
  state.events = state.events.slice(0, MAX_EVENTS);
}

function upsertCheckpoint(state, node) {
  const snapshot = createCheckpointSnapshot(state);
  const existingIndex = state.checkpoints.findIndex((item) => item.nodeId === node.nodeId);
  const checkpoint = {
    checkpointId: createId("cp"),
    sessionId: state.session.sessionId,
    nodeId: node.nodeId,
    roundIndex: node.roundIndex,
    title: node.title,
    snapshotSummary: node.storyText.slice(0, 62) + (node.storyText.length > 62 ? "…" : ""),
    choicePreview: node.incomingChoiceLabel || null,
    snapshot,
    createdAt: node.createdAt
  };

  if (existingIndex >= 0) {
    state.checkpoints.splice(existingIndex, 1, checkpoint);
  } else {
    state.checkpoints.push(checkpoint);
  }
}

function createCheckpointSnapshot(state) {
  const clone = deepClone(state);
  clone.checkpoints = clone.checkpoints.map(({ snapshot, ...rest }) => rest);
  return clone;
}

function snapshotRelationship(character) {
  return {
    affinity: character.affinity,
    trust: character.trust,
    alertness: character.alertness
  };
}

function diffRelationship(before, after) {
  return {
    affinity: after.affinity - before.affinity,
    trust: after.trust - before.trust,
    alertness: after.alertness - before.alertness
  };
}
