import { CLUE_LIBRARY, ENDINGS, STAGES } from "../config/content.js";
import { MAX_EVENTS, PLAYER_ARCHETYPES } from "../config/constants.js";
import { clamp, createId, deepClone } from "./utils.js";

export function createInitialState(meta, options) {
  const archetype = PLAYER_ARCHETYPES[options.archetypeId] || PLAYER_ARCHETYPES.witness;
  const baseLeya = {
    characterId: "leya",
    name: "莱雅 · 格雷",
    role: "守夜人 · 向导",
    affinity: 46 + archetype.statModifiers.affinity,
    trust: 32 + archetype.statModifiers.trust,
    alertness: 58 + archetype.statModifiers.alertness,
    mood: "好奇而警惕",
    relationshipStage: "试探期",
    revealed: true
  };

  const state = {
    session: {
      sessionId: createId("session"),
      currentNodeId: null,
      currentStageId: null,
      chapterId: "arrival",
      status: "in_progress",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    player: {
      alias: options.alias || "无名旅人",
      archetypeId: archetype.id,
      archetypeTitle: archetype.title,
      archetypeDescription: archetype.description
    },
    nodes: [],
    choices: [],
    checkpoints: [],
    currentEnding: null,
    flags: {},
    events: [{ text: "新的会话已经创建，迷城正等待你的第一句回答。", hot: false }],
    journal: {
      clues: [],
      latestClueIds: []
    },
    lastOutcome: {
      summary: "旅程尚未开始。",
      statChanges: { affinity: 0, trust: 0, alertness: 0 },
      unlockedClues: []
    },
    characters: {
      leya: baseLeya,
      archivist: {
        characterId: "archivist",
        name: "老档案保管者",
        role: "旧档案的影子",
        affinity: 0,
        trust: 0,
        alertness: 0,
        mood: "沉默",
        relationshipStage: "未接触",
        revealed: false
      }
    },
    meta
  };

  updateDerivedCharacterState(baseLeya);
  enterStage(state, "opening");
  return state;
}

export function normalizeState(state) {
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

  Object.values(state.characters || {}).forEach((character) => updateDerivedCharacterState(character));
  return state;
}

export function getCurrentNode(state) {
  return state.nodes.find((node) => node.nodeId === state.session.currentNodeId) || null;
}

export function getCurrentStage(state) {
  return STAGES[state.session.currentStageId] || null;
}

export function inferChoiceFromText(stage, text) {
  const normalized = text.toLowerCase();
  let bestChoice = stage.choices[0];
  let bestScore = -1;

  stage.choices.forEach((choice) => {
    const score = choice.keywords.reduce((total, keyword) => {
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
  const currentStage = getCurrentStage(state);
  const currentNode = getCurrentNode(state);
  const leyaBefore = snapshotRelationship(state.characters.leya);

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
  const outcome = advanceStage(state, currentStage.id, choiceRecord);
  const statChanges = diffRelationship(leyaBefore, state.characters.leya);
  const unlockedClues = state.journal.latestClueIds.map((clueId) => CLUE_LIBRARY[clueId]);

  state.lastOutcome = {
    summary: outcome.summary,
    statChanges,
    unlockedClues
  };

  if (outcome.endingId) {
    state.session.status = "completed";
    state.currentEnding = {
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
  const { endingId } = state.currentEnding;
  if (!meta.unlockedEndings.includes(endingId)) {
    meta.unlockedEndings.push(endingId);
  }
  state.meta = meta;
}

export function resolveEndingData(state) {
  return ENDINGS[state.currentEnding?.endingId] || null;
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
  return rolled;
}

function enterStage(state, stageId, incomingChoice = null) {
  const stage = STAGES[stageId];
  const generated = stage.build(state, incomingChoice);
  unlockClues(state, stage.entryClues || []);

  const node = {
    nodeId: createId("node"),
    sessionId: state.session.sessionId,
    parentNodeId: state.nodes.length ? state.nodes[state.nodes.length - 1].nodeId : null,
    stageId: stage.id,
    roundIndex: state.nodes.length + 1,
    chapterTag: stage.chapterTag,
    sceneTag: stage.sceneTag,
    title: stage.title,
    objective: stage.objective,
    stakes: stage.stakes,
    storyText: generated.storyText,
    npcDialogue: generated.npcDialogue,
    eventHint: generated.eventHint,
    eventTags: generated.eventTags,
    choiceOptions: stage.choices,
    isCheckpoint: stage.isCheckpoint,
    progressKey: stage.progressKey,
    incomingChoiceLabel: incomingChoice ? incomingChoice.choiceValue : null,
    createdAt: new Date().toISOString()
  };

  state.nodes.push(node);
  state.session.currentNodeId = node.nodeId;
  state.session.currentStageId = stage.id;
  state.session.chapterId = stage.progressKey;

  if (stage.isCheckpoint) {
    upsertCheckpoint(state, node);
  }
}

function advanceStage(state, stageId, choiceRecord) {
  const handlers = {
    opening() {
      const leya = state.characters.leya;
      if (choiceRecord.parsedIntent === "honest") {
        leya.trust += 10;
        leya.affinity += 4;
        leya.alertness -= 6;
        state.flags.honestStart = true;
        addEvent(state, "你在初见时选择坦白来意，莱雅暂时压下怀疑。", true);
        return { nextStageId: "watchfire", summary: "坦白让你赢得了第一份脆弱的信任。" };
      }
      if (choiceRecord.parsedIntent === "evasive") {
        leya.trust -= 6;
        leya.alertness += 12;
        state.flags.evasiveStart = true;
        addEvent(state, "你回避了真实目的，莱雅对你的身份更加敏感。", true);
        return { nextStageId: "watchfire", summary: "你保住了秘密，却也拉高了她的戒备。" };
      }
      leya.trust += 2;
      leya.affinity += 3;
      leya.alertness += 2;
      state.flags.inquisitiveStart = true;
      addEvent(state, "你主动打探迷城异动，莱雅开始重新评估你的意图。", false);
      return { nextStageId: "watchfire", summary: "你的探询没有冒犯她，但也没有真正消除怀疑。" };
    },
    watchfire() {
      const leya = state.characters.leya;
      if (choiceRecord.parsedIntent === "cooperate") {
        leya.affinity += 10;
        leya.trust += 8;
        leya.alertness -= 4;
        state.flags.sharedMemory = true;
        addEvent(state, "你主动分享来此目的，莱雅首次接受与你并肩推进。", true);
        return { nextStageId: "crest", summary: "合作让你们的节奏第一次真正同步。" };
      }
      if (choiceRecord.parsedIntent === "push") {
        leya.trust -= 2;
        leya.alertness += 8;
        state.flags.archiveFocus = true;
        addEvent(state, "你坚持先见档案保管者，触发了更强的任务推进节奏。", false);
        return { nextStageId: "crest", summary: "你推进得更快，但也显得不够让人安心。" };
      }
      leya.trust -= 4;
      leya.alertness += 5;
      state.flags.keptDistance = true;
      addEvent(state, "你保留距离并暗中观察，迷城对你的回应变得更冷。", false);
      if (leya.trust >= 46) {
        state.characters.archivist.revealed = true;
      }
      return { nextStageId: "crest", summary: "你的谨慎保护了自己，也让距离更难缩短。" };
    },
    crest() {
      const leya = state.characters.leya;
      state.characters.archivist.revealed = true;
      if (choiceRecord.parsedIntent === "confess") {
        leya.trust += 14;
        leya.alertness -= 8;
        state.flags.confessedCrest = true;
        addEvent(state, "你坦白了徽记来历，莱雅开始把你当成可对话的见证者。", true);
        return { nextStageId: "archive", summary: "最危险的坦白，反而让你们第一次站到了同一侧。" };
      }
      if (choiceRecord.parsedIntent === "deflect") {
        leya.trust -= 8;
        leya.alertness += 10;
        state.flags.deflectedCrest = true;
        addEvent(state, "你选择回避徽记来历，莱雅对你的戒心明显上升。", true);
        return { nextStageId: "archive", summary: "你把问题推迟了，但她已经记住了这次回避。" };
      }
      leya.affinity += 8;
      leya.trust += 10;
      leya.alertness -= 2;
      state.flags.gaveCrest = true;
      addEvent(state, "你将徽记交给莱雅保管，交换来一次更深的共同行动。", true);
      return { nextStageId: "archive", summary: "你交出的不只是徽记，也是一次主动示弱的信任。" };
    },
    archive() {
      const leya = state.characters.leya;
      if (choiceRecord.parsedIntent === "protect") {
        leya.affinity += 12;
        leya.trust += 6;
        leya.alertness -= 10;
        state.flags.protectChoice = true;
        addEvent(state, "你把守护莱雅与城民放在首位，关系进入更稳固阶段。", true);
        return { nextStageId: "finale", summary: "你的立场从求生转向守护，莱雅明显记住了这一点。" };
      }
      if (choiceRecord.parsedIntent === "truth") {
        leya.trust += 8;
        leya.alertness += 4;
        state.flags.truthChoice = true;
        state.flags.learnedCoreSecret = true;
        addEvent(state, "你坚持追索真相，推动迷城进入更激烈的剧情分支。", true);
        return { nextStageId: "finale", summary: "你选择把真相放在风险之前，故事因此走向更锋利的边缘。" };
      }
      leya.affinity -= 6;
      leya.trust -= 4;
      leya.alertness += 8;
      state.flags.leaveChoice = true;
      addEvent(state, "你开始考虑带着秘密离开，这让莱雅感到失落与迟疑。", false);
      return { nextStageId: "finale", summary: "离开的念头让你更安全，也让你们更远。 " };
    },
    finale() {
      const leya = state.characters.leya;
      if (choiceRecord.parsedIntent === "vow") {
        leya.affinity += 10;
        leya.trust += 12;
        leya.alertness -= 8;
        state.flags.finalVow = true;
        addEvent(state, "你决定与莱雅共同守护迷城。", true);
        return { endingId: resolveEnding(state), summary: "你把未来押在了共同承担之上。" };
      }
      if (choiceRecord.parsedIntent === "wander") {
        leya.affinity += 4;
        leya.trust -= 2;
        state.flags.finalLeave = true;
        addEvent(state, "你选择把选择权还给迷城，然后离开。", false);
        return { endingId: resolveEnding(state), summary: "你留下了余地，也留下了未竟的关系。" };
      }
      leya.affinity -= 15;
      leya.trust -= 20;
      leya.alertness += 20;
      state.flags.finalBetrayal = true;
      addEvent(state, "你切断核心自保撤离，迷城因此陷入失序。", true);
      return { endingId: resolveEnding(state), summary: "你保住了自己，却放弃了这座城与你们之间的可能。" };
    }
  };

  const result = handlers[stageId]();
  updateDerivedCharacterState(state.characters.leya);
  return result;
}

function resolveEnding(state) {
  const leya = state.characters.leya;
  if (state.flags.finalBetrayal || leya.alertness >= 78 || leya.trust <= 28) {
    return "bad";
  }
  if (
    state.flags.finalVow &&
    state.flags.truthChoice &&
    (state.flags.gaveCrest || state.flags.confessedCrest) &&
    leya.affinity >= 80 &&
    leya.trust >= 78 &&
    leya.alertness <= 52
  ) {
    return "hidden";
  }
  if (state.flags.finalVow && leya.affinity >= 68 && leya.trust >= 62) {
    return "good";
  }
  return "normal";
}

function updateDerivedCharacterState(character) {
  character.affinity = clamp(character.affinity || 0, 0, 100);
  character.trust = clamp(character.trust || 0, 0, 100);
  character.alertness = clamp(character.alertness || 0, 0, 100);

  if (character.characterId !== "leya") return;

  if (character.trust >= 75 && character.affinity >= 75) {
    character.mood = "坚定而靠近";
    character.relationshipStage = "并肩期";
  } else if (character.trust >= 55) {
    character.mood = "谨慎中的信任";
    character.relationshipStage = "靠近期";
  } else if (character.alertness >= 70) {
    character.mood = "戒备与压抑";
    character.relationshipStage = "对峙期";
  } else {
    character.mood = "好奇而警惕";
    character.relationshipStage = "试探期";
  }
}

function unlockClues(state, clueIds) {
  const added = [];
  clueIds.forEach((clueId) => {
    if (!CLUE_LIBRARY[clueId]) return;
    if (state.journal.clues.some((item) => item.id === clueId)) return;
    state.journal.clues.unshift(CLUE_LIBRARY[clueId]);
    added.push(clueId);
  });
  state.journal.latestClueIds = added;
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
