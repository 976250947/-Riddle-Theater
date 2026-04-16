export const STORAGE_KEYS = {
  session: "ai-narrative-game-session",
  meta: "ai-narrative-game-meta",
  slots: "ai-narrative-game-slots"
};

export const MAX_SAVE_SLOTS = 6;

export const MAX_EVENTS = 6;

export const MAX_EXPLORE_ACTIONS = 3;

export const MAX_DIALOGUE_TURNS = 5;

export const ENDING_ORDER = ["good", "normal", "bad", "hidden"];

export const INTERACTION_MODES = {
  fixed: { id: "fixed", label: "固定选项", description: "从预设选项中选择" },
  semiOpen: { id: "semiOpen", label: "半开放选择", description: "在结构化选项中自定义方式" },
  freeInput: { id: "freeInput", label: "自由行动", description: "输入你想做的任何事" },
  explore: { id: "explore", label: "自由探索", description: "在场景中自由调查和观察" },
  dialogue: { id: "dialogue", label: "NPC 对话", description: "与角色进行多轮对话" }
};

export const PLAYER_ARCHETYPES = {
  witness: {
    id: "witness",
    title: "见证者",
    short: "偏向信任与观察，适合稳步推进关系线。",
    description:
      "你更擅长倾听、记录和理解他人的迟疑。以见证者身份开始时，莱雅对你会多一分谨慎中的耐心。",
    statModifiers: {
      affinity: 4,
      trust: 6,
      alertness: -4
    }
  },
  truthseeker: {
    id: "truthseeker",
    title: "求真者",
    short: "偏向追索真相，容易更快进入深层剧情。",
    description:
      "你对隐藏历史和权力真相有天然执念。以求真者身份开始时，会更容易触发深层线索，但也更容易引发戒备。",
    statModifiers: {
      affinity: 0,
      trust: 2,
      alertness: 6
    }
  },
  guardian: {
    id: "guardian",
    title: "守护者",
    short: "偏向守护角色与城民，更容易走向温暖结局。",
    description:
      "你更在意人是否会因此受伤，而不是秘密是否被完整揭开。以守护者身份开始时，好感基础更高，终局更适合走共同守护路线。",
    statModifiers: {
      affinity: 8,
      trust: 0,
      alertness: -2
    }
  }
};
