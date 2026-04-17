export const DRAFT_STORAGE_KEY = "ai-narrative-game-user-drafts";
export const STUDIO_SELECTED_STORY_KEY = "ai-narrative-game-studio-selected-story";

export const STUDIO_TABS = [
  { key: "projects", label: "我的项目" },
  { key: "templates", label: "模板库" },
  { key: "tools", label: "写作工具" }
];

export const GENRE_OPTIONS = ["原创", "悬疑", "恋爱", "都市", "科幻", "奇幻", "惊悚", "其他"];
export const TEMPLATE_CATEGORIES = ["all", "悬疑", "恋爱", "都市", "科幻", "奇幻", "惊悚"];
export const MOOD_TAGS = ["中性", "紧张", "温柔", "愤怒", "悲伤", "兴奋", "冷漠", "恐惧", "挑衅", "讽刺"];
export const TONE_TAGS = ["低声说", "冷冷地", "犹豫着", "斩钉截铁地", "意味深长地", "漫不经心地"];
export const RELATIONSHIP_STAGES = ["未接触", "试探期", "信任建立", "深度绑定", "决裂", "共鸣"];

export const STUDIO_CHECKLIST_ITEMS = [
  { text: "角色身份是否足够鲜明", done: true },
  { text: "开场冲突是否能在 30 秒内建立", done: true },
  { text: "中段反转是否和人物关系相关", done: false },
  { text: "所有结局条件是否可被玩家理解", done: false },
  { text: "自由输入是否有明确兜底文本", done: false },
  { text: "角色对话是否有情绪层次", done: false },
  { text: "分支节点是否有清晰的后果预示", done: true }
];

export const STUDIO_TOOLS = [
  {
    id: "character-editor",
    icon: "character-editor",
    title: "角色卡编辑器",
    desc: "设定角色的身份、背景、性格特征与关系网络。支持属性数值可视化。"
  },
  {
    id: "branch-map",
    icon: "branch-map",
    title: "分支图谱",
    desc: "以可视化方式管理故事节点、选择分支和结局触发条件。"
  },
  {
    id: "dialogue-writer",
    icon: "dialogue-writer",
    title: "对话写作台",
    desc: "专注模式的对话编辑器，支持情绪标签、语气提示和角色切换。"
  },
  {
    id: "ending-config",
    icon: "ending-config",
    title: "结局条件配置",
    desc: "设定好感、信任、线索等变量组合与最终结局的映射关系。"
  },
  {
    id: "script-tester",
    icon: "script-tester",
    title: "剧本测试器",
    desc: "模拟玩家路径，快速预览不同选择下的剧情走向和变量变化。"
  },
  {
    id: "data-dashboard",
    icon: "data-dashboard",
    title: "数据看板",
    desc: "分析玩家行为数据，查看各分支选择率、平均游戏时长和结局分布。"
  }
];

export const ENDING_LABELS = {
  good: "好结局",
  normal: "普通结局",
  bad: "坏结局",
  hidden: "隐藏结局"
};

export const ENDING_COLORS = {
  good: "#5cb85c",
  normal: "#5bc0de",
  bad: "#e74c3c",
  hidden: "#f0ad4e"
};

export const CHAPTER_TYPE_LABELS = {
  intro: "开端",
  explore: "探索",
  conflict: "冲突",
  climax: "高潮",
  resolution: "收束"
};

export const CHAPTER_TYPE_COLORS = {
  intro: "#85cdca",
  explore: "#5bc0de",
  conflict: "#f0ad4e",
  climax: "#e74c3c",
  resolution: "#9b59b6"
};

export const ROLE_LABELS = {
  protagonist: "主角",
  ally: "同盟",
  antagonist: "对手",
  rival: "竞争者",
  wildcard: "变数",
  "love-interest": "恋爱对象",
  spy: "间谍"
};

export const ROLE_COLORS = {
  protagonist: "#d0aa7a",
  ally: "#5cb85c",
  antagonist: "#e74c3c",
  rival: "#f0ad4e",
  wildcard: "#9b59b6",
  "love-interest": "#f8a4c8",
  spy: "#5bc0de"
};

export function difficultyStars(level = 0) {
  return `${"★".repeat(level)}${"☆".repeat(Math.max(0, 5 - level))}`;
}

export const TEMPLATE_LIBRARY = [
  {
    id: "mystery",
    icon: "mystery",
    title: "悬疑推理模板",
    category: "悬疑",
    difficulty: 4,
    popularity: 9200,
    updated: "2026-03-28",
    author: "谜语官方",
    authorAvatar: "谜",
    uses: 3420,
    rating: 4.8,
    desc: "适合线索导向、多重真相揭露的叙事结构。包含信任/怀疑双轴系统。",
    tags: ["悬疑", "推理", "线索"],
    cover: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
    synopsis: "玩家扮演调查者，在迷雾中追查真相。通过收集线索、审问证人、分析矛盾来揭开隐藏的秘密。信任与怀疑的天平将决定最终走向。",
    features: ["线索收集系统", "信任/怀疑双轴", "多重真相分支", "证据锁定机制", "NPC 记忆联动"],
    structure: {
      chapters: 5,
      endings: 4,
      characters: 3,
      branches: 12,
      outline: [
        { ch: 1, title: "迷雾降临", type: "intro", desc: "建立场景与初始人物关系" },
        { ch: 2, title: "线索浮现", type: "explore", desc: "自由收集线索，建立信任" },
        { ch: 3, title: "真假交错", type: "conflict", desc: "第一次重大抉择，分支产生" },
        { ch: 4, title: "深渊凝视", type: "climax", desc: "核心秘密揭露，信任考验" },
        { ch: 5, title: "终局审判", type: "resolution", desc: "根据积累走向四种结局" }
      ]
    },
    sampleCharacters: [
      { name: "调查者（玩家）", role: "protagonist", traits: "理性 · 警觉 · 正义感" },
      { name: "关键 NPC · 线人", role: "ally", traits: "神秘 · 多疑 · 知情者" },
      { name: "幕后主谋", role: "antagonist", traits: "冷静 · 伪善 · 操控欲" }
    ],
    sampleEndings: [
      { type: "good", title: "真相之光", condition: "信任 ≥ 68，关键线索齐全" },
      { type: "normal", title: "携秘而去", condition: "信任 ≥ 42，部分线索" },
      { type: "bad", title: "迷雾吞噬", condition: "怀疑 ≥ 78 或 信任 ≤ 28" },
      { type: "hidden", title: "第二层真相", condition: "全线索 + 隐藏旗标" }
    ],
    mechanics: [
      { name: "线索系统", icon: "search-plus", desc: "5 条核心线索，收集进度影响对话选项和结局路径" },
      { name: "信任/怀疑双轴", icon: "scale", desc: "独立追踪信任值与警觉值，两者并非简单反比关系" },
      { name: "记忆联动", icon: "brain", desc: "NPC 记住玩家过去的选择，影响后续对话态度" }
    ]
  },
  {
    id: "romance",
    icon: "romance",
    title: "校园恋爱模板",
    category: "恋爱",
    difficulty: 2,
    popularity: 12500,
    updated: "2026-04-05",
    author: "谜语官方",
    authorAvatar: "谜",
    uses: 5180,
    rating: 4.9,
    desc: "以好感度和事件触发为核心，适合轻量级情感向剧本。",
    tags: ["恋爱", "校园", "日常"],
    cover: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 50%, #f8a4c8 100%)",
    synopsis: "在校园日常中，通过对话、事件选择和陪伴逐步提升好感度。不同的选择路径将通向截然不同的情感结局。",
    features: ["好感度追踪", "日常事件系统", "约会场景", "告白时机判定", "多角色可攻略"],
    structure: {
      chapters: 5,
      endings: 4,
      characters: 4,
      branches: 15,
      outline: [
        { ch: 1, title: "偶然相遇", type: "intro", desc: "校园场景建立，角色初登场" },
        { ch: 2, title: "渐渐熟悉", type: "explore", desc: "日常互动，好感度积累" },
        { ch: 3, title: "心意动摇", type: "conflict", desc: "误会或竞争者出现" },
        { ch: 4, title: "雨中真心", type: "climax", desc: "关键告白或错过时刻" },
        { ch: 5, title: "未来之约", type: "resolution", desc: "收束感情线，走向结局" }
      ]
    },
    sampleCharacters: [
      { name: "主角（玩家）", role: "protagonist", traits: "温柔 · 犹豫 · 善良" },
      { name: "学长 / 学姐", role: "love-interest", traits: "开朗 · 体贴 · 有秘密" },
      { name: "青梅竹马", role: "rival", traits: "率直 · 不坦诚 · 占有欲" },
      { name: "转校生", role: "wildcard", traits: "神秘 · 冷淡 · 温柔反差" }
    ],
    sampleEndings: [
      { type: "good", title: "双向奔赴", condition: "好感 ≥ 80，告白成功" },
      { type: "normal", title: "暧昧未满", condition: "好感 50-79，未告白" },
      { type: "bad", title: "渐行渐远", condition: "好感 ≤ 30 或关键事件失败" },
      { type: "hidden", title: "命运的重逢", condition: "全事件触发 + 隐藏线索" }
    ],
    mechanics: [
      { name: "好感度系统", icon: "heart", desc: "每位角色独立好感追踪，影响可触发事件与对话" },
      { name: "日常事件", icon: "calendar", desc: "每章随机触发 2-3 个日常事件，选择决定好感变化" },
      { name: "告白判定", icon: "mail", desc: "第四章解锁告白选项，需满足好感阈值和前置条件" }
    ]
  },
  {
    id: "urban",
    icon: "urban",
    title: "都市博弈模板",
    category: "都市",
    difficulty: 5,
    popularity: 6800,
    updated: "2026-03-15",
    author: "剧作坊",
    authorAvatar: "剧",
    uses: 1890,
    rating: 4.6,
    desc: "围绕利益博弈展开，适合多方势力交织的商战或政治叙事。",
    tags: ["商战", "谈判", "人脉"],
    cover: "linear-gradient(135deg, #141E30 0%, #243B55 50%, #2c5364 100%)",
    synopsis: "在资本与权力的角力场中，玩家需要在多方势力间周旋。谈判桌上的每一句话、每一次站队都可能改变格局。",
    features: ["多方势力系统", "谈判回合制", "人脉网络", "情报交易", "资源筹码管理"],
    structure: {
      chapters: 5,
      endings: 4,
      characters: 5,
      branches: 18,
      outline: [
        { ch: 1, title: "入局", type: "intro", desc: "进入博弈场，了解各方势力" },
        { ch: 2, title: "布局", type: "explore", desc: "建立人脉，收集情报" },
        { ch: 3, title: "对局", type: "conflict", desc: "第一轮正面博弈，站队抉择" },
        { ch: 4, title: "破局", type: "climax", desc: "核心利益冲突爆发" },
        { ch: 5, title: "终局", type: "resolution", desc: "最终谈判，决定胜负" }
      ]
    },
    sampleCharacters: [
      { name: "新晋玩家（主角）", role: "protagonist", traits: "机敏 · 野心 · 灵活" },
      { name: "老牌财阀", role: "antagonist", traits: "阴沉 · 老练 · 不择手段" },
      { name: "政界新星", role: "ally", traits: "理想主义 · 有底线 · 可利用" },
      { name: "情报掮客", role: "wildcard", traits: "中立 · 唯利益论 · 信息网" }
    ],
    sampleEndings: [
      { type: "good", title: "新秩序缔造者", condition: "人脉 ≥ 70，关键谈判全胜" },
      { type: "normal", title: "各取所需", condition: "平衡所有势力" },
      { type: "bad", title: "棋子的末路", condition: "被所有势力抛弃" },
      { type: "hidden", title: "幕后操盘手", condition: "全情报 + 双面操作成功" }
    ],
    mechanics: [
      { name: "势力系统", icon: "building", desc: "3-4 个独立势力，每个有独立好感与利益关系" },
      { name: "谈判引擎", icon: "handshake", desc: "回合制对话谈判，筹码和情报决定可用选项" },
      { name: "人脉网络", icon: "network", desc: "可视化人脉图谱，解锁隐藏路线和情报" }
    ]
  },
  {
    id: "cyberpunk",
    icon: "cyberpunk",
    title: "赛博朋克模板",
    category: "科幻",
    difficulty: 4,
    popularity: 8100,
    updated: "2026-04-10",
    author: "谜语官方",
    authorAvatar: "谜",
    uses: 2760,
    rating: 4.7,
    desc: "高科技低生活，身份伪装与记忆篡改的科幻悬疑框架。",
    tags: ["科幻", "黑客", "潜行"],
    cover: "linear-gradient(135deg, #0c0c1d 0%, #1a0a2e 50%, #2d1b69 100%)",
    synopsis: "在霓虹与数据的洪流中，你的记忆可能并非真实。通过黑客入侵、身份伪装和地下交易，在巨型企业与反抗军之间找到属于自己的真相。",
    features: ["记忆篡改系统", "黑客入侵小游戏", "身份伪装", "义体改造", "多层叙事"],
    structure: {
      chapters: 5,
      endings: 4,
      characters: 4,
      branches: 14,
      outline: [
        { ch: 1, title: "数据苏醒", type: "intro", desc: "记忆碎片中苏醒，身份成谜" },
        { ch: 2, title: "霓虹暗巷", type: "explore", desc: "底层世界探索，收集记忆碎片" },
        { ch: 3, title: "镜像裂痕", type: "conflict", desc: "身份冲突爆发，多重自我" },
        { ch: 4, title: "核心入侵", type: "climax", desc: "潜入企业核心，发现真相" },
        { ch: 5, title: "重写人生", type: "resolution", desc: "选择保留或覆写记忆" }
      ]
    },
    sampleCharacters: [
      { name: "无名者（玩家）", role: "protagonist", traits: "失忆 · 适应性强 · 怀疑一切" },
      { name: "黑客搭档", role: "ally", traits: "天才 · 偏执 · 忠诚" },
      { name: "企业高管", role: "antagonist", traits: "冷酷 · 效率至上 · 有苦衷" },
      { name: "AI 向导", role: "wildcard", traits: "理性 · 可能自主 · 暗藏目的" }
    ],
    sampleEndings: [
      { type: "good", title: "真我觉醒", condition: "记忆完整 + 拒绝覆写" },
      { type: "normal", title: "数据漂流", condition: "部分记忆 + 中立选择" },
      { type: "bad", title: "系统格式化", condition: "被企业捕获或 AI 背叛" },
      { type: "hidden", title: "超越人类", condition: "全碎片 + AI 融合路线" }
    ],
    mechanics: [
      { name: "记忆碎片", icon: "puzzle", desc: "收集散落的记忆碎片，拼凑真实身份" },
      { name: "黑客入侵", icon: "terminal", desc: "选择型入侵序列，成功解锁隐藏信息" },
      { name: "身份系统", icon: "masks", desc: "可在多重身份间切换，影响 NPC 反应" }
    ]
  },
  {
    id: "fantasy",
    icon: "fantasy",
    title: "奇幻冒险模板",
    category: "奇幻",
    difficulty: 3,
    popularity: 10300,
    updated: "2026-04-01",
    author: "冒险工会",
    authorAvatar: "冒",
    uses: 4090,
    rating: 4.8,
    desc: "经典英雄之旅结构，支持队伍系统与阵营声望。",
    tags: ["奇幻", "冒险", "RPG"],
    cover: "linear-gradient(135deg, #1a3a1a 0%, #2d5016 50%, #4a6741 100%)",
    synopsis: "从默默无闻的少年到改变世界的英雄。招募同伴、探索未知之地、在光与暗的阵营间做出选择，书写属于你的史诗传说。",
    features: ["队伍系统", "阵营声望", "技能树", "装备系统", "世界地图探索"],
    structure: {
      chapters: 5,
      endings: 4,
      characters: 5,
      branches: 16,
      outline: [
        { ch: 1, title: "命运的号角", type: "intro", desc: "平凡日常被打破，踏上旅途" },
        { ch: 2, title: "结伴同行", type: "explore", desc: "招募同伴，建立队伍" },
        { ch: 3, title: "阵营抉择", type: "conflict", desc: "光暗势力对峙，必须站队" },
        { ch: 4, title: "深渊试炼", type: "climax", desc: "核心战役，同伴信任考验" },
        { ch: 5, title: "传说终章", type: "resolution", desc: "决战与结局" }
      ]
    },
    sampleCharacters: [
      { name: "年轻冒险者（玩家）", role: "protagonist", traits: "勇气 · 成长 · 善良" },
      { name: "精灵贤者", role: "ally", traits: "睿智 · 古老 · 有秘密" },
      { name: "游侠战士", role: "ally", traits: "豪爽 · 重情义 · 粗心" },
      { name: "暗影法师", role: "wildcard", traits: "孤僻 · 强大 · 阵营可变" }
    ],
    sampleEndings: [
      { type: "good", title: "英雄凯旋", condition: "队伍信任 ≥ 75，阵营声望平衡" },
      { type: "normal", title: "代价之胜", condition: "胜利但有牺牲" },
      { type: "bad", title: "英雄陨落", condition: "队伍崩溃或阵营对立" },
      { type: "hidden", title: "第三条路", condition: "说服魔王 + 全同伴存活" }
    ],
    mechanics: [
      { name: "队伍系统", icon: "users", desc: "最多 4 人同行，同伴关系影响战斗和剧情" },
      { name: "阵营声望", icon: "scale", desc: "光明/暗影/中立三阵营，声望决定可用任务" },
      { name: "世界地图", icon: "map-pin", desc: "可探索的区域逐步解锁，隐藏支线" }
    ]
  },
  {
    id: "thriller",
    icon: "thriller",
    title: "心理惊悚模板",
    category: "惊悚",
    difficulty: 5,
    popularity: 7400,
    updated: "2026-03-22",
    author: "剧作坊",
    authorAvatar: "剧",
    uses: 2150,
    rating: 4.7,
    desc: "以不可靠叙述者为核心，真相随玩家选择逐步偏移。",
    tags: ["惊悚", "心理", "反转"],
    cover: "linear-gradient(135deg, #1a0a0a 0%, #2d1a1a 50%, #4a2020 100%)",
    synopsis: "你所看到的一切可能都不是真实的。作为一个不可靠的叙述者，你的每一次选择都在微妙地改变现实本身。",
    features: ["不可靠叙述", "现实扭曲", "心理档案", "多重时间线", "回溯修正"],
    structure: {
      chapters: 5,
      endings: 4,
      characters: 3,
      branches: 10,
      outline: [
        { ch: 1, title: "破碎的早晨", type: "intro", desc: "日常中发现不对劲的细节" },
        { ch: 2, title: "记忆缝隙", type: "explore", desc: "收集矛盾信息，质疑现实" },
        { ch: 3, title: "镜中的陌生人", type: "conflict", desc: "自我认知崩塌，叙述分裂" },
        { ch: 4, title: "深层意识", type: "climax", desc: "进入内心世界，面对真实" },
        { ch: 5, title: "最终叙述", type: "resolution", desc: "选择接受或重构现实" }
      ]
    },
    sampleCharacters: [
      { name: "叙述者（玩家）", role: "protagonist", traits: "不可靠 · 内疚 · 逃避" },
      { name: "心理医生", role: "ally", traits: "冷静 · 引导 · 可能不存在" },
      { name: "镜中倒影", role: "antagonist", traits: "真实的自己 · 对立 · 审判" }
    ],
    sampleEndings: [
      { type: "good", title: "与真相和解", condition: "接受全部记忆 + 心理值恢复" },
      { type: "normal", title: "选择性遗忘", condition: "部分接受 + 重构记忆" },
      { type: "bad", title: "永恒迷宫", condition: "拒绝真相 + 心理值崩溃" },
      { type: "hidden", title: "叙述者的觉醒", condition: "识破第四面墙 + 全线索" }
    ],
    mechanics: [
      { name: "叙述可靠度", icon: "book-open", desc: "可靠度越低，场景描述越会出现偏差和矛盾" },
      { name: "现实层", icon: "spiral", desc: "现实/记忆/幻觉三层叙事空间，随选择切换" },
      { name: "回溯系统", icon: "rewind", desc: "允许重新选择过去的对话，但会降低叙述可靠度" }
    ]
  }
];