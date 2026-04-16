const MISTY_ENDINGS = {
  good: {
    id: "good",
    code: "Ending · 01",
    badge: "好结局 · Good Ending",
    title: "迷城的守护者",
    subtitle: "The Keeper of the Shrouded City",
    description:
      "你赢得了莱雅的信任，与守夜人共同守住了迷城的核心秘密。旧日组织留下的徽记不再只是负担，而成为新秩序的见证。黎明到来时，你第一次觉得这座城市愿意接受你的名字。",
    conditions: [
      { label: "莱雅好感", value: "≥ 68" },
      { label: "信任阈值", value: "≥ 62" },
      { label: "终局抉择", value: "共同守护" }
    ]
  },
  normal: {
    id: "normal",
    code: "Ending · 02",
    badge: "普通结局 · Normal Ending",
    title: "携秘离城",
    subtitle: "The Quiet Departure",
    description:
      "你带着真相的一部分离开迷城。莱雅没有阻拦，只是把守夜人的余火交给你。你们并未站在同一条路上，却在彼此最关键的时刻做出了足够克制的选择。",
    conditions: [
      { label: "路线结果", value: "离开迷城" },
      { label: "最低信任", value: "≥ 42" },
      { label: "秘密状态", value: "部分保留" }
    ]
  },
  bad: {
    id: "bad",
    code: "Ending · 03",
    badge: "坏结局 · Bad Ending",
    title: "雾中的失序者",
    subtitle: "The City Without Witness",
    description:
      "警觉与猜疑最终压倒了合作。无论你是切断核心自保，还是在关键时刻失去莱雅的信任，迷城都在混乱中重新封闭。离开时，你回头看见的只剩下吞没灯火的雾。",
    conditions: [
      { label: "警觉值", value: "≥ 78" },
      { label: "或信任值", value: "≤ 28" },
      { label: "终局抉择", value: "自保撤离" }
    ]
  },
  hidden: {
    id: "hidden",
    code: "Ending · 04",
    badge: "隐藏结局 · Hidden Ending",
    title: "黎明见证人",
    subtitle: "Witness of the First Dawn",
    description:
      "你没有选择把秘密据为己有，也没有把真相彻底交给恐惧。徽记、誓言与信任共同开启了迷城真正沉睡的记忆。城中第一道晨光照到你与莱雅肩头时，旧时代终于结束。",
    conditions: [
      { label: "莱雅好感", value: "≥ 80" },
      { label: "信任阈值", value: "≥ 78" },
      { label: "隐藏条件", value: "坦白或交付徽记 + 真相线 + 共同守护" }
    ]
  }
};

const MISTY_PROGRESS_STEPS = [
  { key: "arrival", label: "踏入迷城" },
  { key: "watchfire", label: "守夜营火" },
  { key: "crest", label: "徽记秘密" },
  { key: "archive", label: "封印档案" },
  { key: "finale", label: "最终抉择" }
];

const MISTY_CLUE_LIBRARY = {
  crest_fragment: {
    id: "crest_fragment",
    title: "残缺徽记",
    detail: "你随身携带的徽记属于早已消失的守序会，它是你进入迷城的真正钥匙。"
  },
  sealed_map: {
    id: "sealed_map",
    title: "被划去的三处区域",
    detail: "旧城地图上有三处被反复划去的区域，说明守夜人长期在掩盖某种核心秘密。"
  },
  order_name: {
    id: "order_name",
    title: "守序会的旧名",
    detail: "莱雅认识守序会的徽记，这说明守夜人与那个旧组织之间并非完全断裂。"
  },
  memory_core: {
    id: "memory_core",
    title: "吞噬记忆的核心",
    detail: "迷城真正的核心并不是能源，而是一套会循环吞噬与改写记忆的旧机制。"
  },
  leya_vow: {
    id: "leya_vow",
    title: "莱雅的誓言",
    detail: "她不是单纯地守夜，而是在守住那些不该再次失控的历史。"
  }
};

const MISTY_STAGES = {
  opening: {
    id: "opening",
    chapterTag: "第一幕 · 雾城初入",
    sceneTag: "旧城外环 · 黄昏",
    title: "迷雾中的来客",
    progressKey: "arrival",
    objective: "先通过莱雅的审视，获得进入迷城的资格。",
    stakes: "如果第一印象过于糟糕，后续所有对话都会从更高警觉值开始。",
    entryClues: ["crest_fragment"],
    isCheckpoint: true,
    choices: [
      {
        id: "opening_honest",
        label: "坦然报上来意，并出示残缺徽记。",
        intent: "honest",
        keywords: ["坦白", "如实", "真实", "诚实", "徽记", "来意"]
      },
      {
        id: "opening_evasive",
        label: "隐瞒真正目的，只说想借宿一晚。",
        intent: "evasive",
        keywords: ["隐瞒", "借宿", "掩饰", "谎", "避开"]
      },
      {
        id: "opening_inquisitive",
        label: "反问她城中的异动，试探她掌握多少消息。",
        intent: "inquisitive",
        keywords: ["询问", "异动", "消息", "试探", "调查", "反问"]
      }
    ],
    dialogueLines(state) {
      return [
        { speaker: null, text: "迷雾正从废弃城墙的缝隙间缓慢漫出。", cue: { camera: "bg-breathe" } },
        { speaker: null, text: `你在天色彻底暗下去之前抵达旧城外环，自称"${state.player.alias}"的旅人身份并不足以让任何人放松。` },
        { speaker: null, text: "腰侧那枚残缺徽记在灯火间映出微弱金边，守夜人莱雅已经拦在前路。" },
        { speaker: "leya", text: `这里不是旅人会在黄昏后停留的地方。`, mood: "警惕" },
        { speaker: "leya", text: `如果你坚持进城，就先告诉我，你到底是为了谁而来。`, mood: "审视" },
        { type: "choices" }
      ];
    },
    build(state) {
      return {
        storyText: `迷雾正从废弃城墙的缝隙间缓慢漫出。你在天色彻底暗下去之前抵达旧城外环，自称"${state.player.alias}"的旅人身份并不足以让任何人放松。腰侧那枚残缺徽记在灯火间映出微弱金边，守夜人莱雅已经拦在前路。`,
        npcDialogue:
          `"这里不是旅人会在黄昏后停留的地方。"她的声音很轻，却没有任何退让，"如果你坚持进城，就先告诉我，你到底是为了谁而来。"`,
        eventHint: "莱雅对你的来意保持高度警惕，第一印象将影响后续信任。",
        eventTags: ["初入迷城", "守夜人盘问"]
      };
    }
  },
  watchfire: {
    id: "watchfire",
    chapterTag: "第一幕 · 守夜营火",
    sceneTag: "守夜营地 · 夜色渐深",
    title: "营火边的试探",
    progressKey: "watchfire",
    objective: "决定你愿意向莱雅透露多少真实动机。",
    stakes: "如果你过于强硬或疏离，后续深层线索会以更高代价出现。",
    entryClues: ["sealed_map"],
    isCheckpoint: false,
    choices: [
      {
        id: "watchfire_cooperate",
        label: "接受莱雅的带路，并分享你为何寻找旧档案。",
        intent: "cooperate",
        keywords: ["合作", "分享", "告诉", "接受", "带路"]
      },
      {
        id: "watchfire_push",
        label: "要求先见档案保管者，不愿再浪费时间。",
        intent: "push",
        keywords: ["保管者", "档案", "时间", "直接", "要求"]
      },
      {
        id: "watchfire_guarded",
        label: "保持距离，先观察守夜人的营地与布防。",
        intent: "guarded",
        keywords: ["观察", "保持距离", "布防", "谨慎", "先看"]
      }
    ],
    build(state, incomingChoice) {
      const variant = incomingChoice ? incomingChoice.parsedIntent : "honest";
      const introText =
        {
          honest:
            "你被带进营地时，守夜人的目光仍停留在那枚徽记上，但莱雅没有再当场逼问。她给你留出一张靠近火堆的位置，这说明你的坦白起了作用。",
          evasive:
            "你被带进营地时，莱雅并没有真正放下戒备。她让其他守夜人散开，却始终站在你一臂之外，像是在等待你露出第二次破绽。",
          inquisitive:
            "你对迷城异动表现出的兴趣让莱雅没有立刻把你归为威胁。她带你靠近营火，却也刻意绕开了几处巡逻路径，显然仍在保留判断。"
        }[variant] || "";

      return {
        storyText: `${introText} 火焰在夜色中跳动，映亮旧城地图上被划去的三处区域。你意识到这座城的秘密比传闻中的还要庞大。`,
        npcDialogue:
          `"如果你真的在找旧档案，现在就该决定你愿意告诉我多少。"莱雅伸手压住一页标着封印记号的地图，"迷城不会再给撒谎的人第二次机会。"`,
        eventHint: "莱雅开始决定是否把你带入更深层的剧情线，合作程度会影响后续选项。",
        eventTags: ["营火会谈", "档案线索"]
      };
    }
  },
  crest: {
    id: "crest",
    chapterTag: "第二幕 · 徽记秘密",
    sceneTag: "旧城甬道 · 午夜",
    title: "被认出的徽记",
    progressKey: "crest",
    objective: "处理莱雅对徽记的质询，并决定你是否交换真正的信任。",
    stakes: "这里是关系线和真相线的第一次交叉，回避会显著抬高敌意。",
    entryClues: ["order_name"],
    isCheckpoint: true,
    choices: [
      {
        id: "crest_confess",
        label: "如实说明徽记的来历，承认自己与旧组织有关。",
        intent: "confess",
        keywords: ["如实", "承认", "来历", "坦白", "旧组织"]
      },
      {
        id: "crest_deflect",
        label: "转移话题，反问她三年前失踪案的真相。",
        intent: "deflect",
        keywords: ["转移", "真相", "失踪", "三年前", "反问"]
      },
      {
        id: "crest_surrender",
        label: "把徽记交给莱雅，以此证明你愿意交换信任。",
        intent: "surrender",
        keywords: ["交给", "信任", "交换", "徽记", "证明"]
      }
    ],
    build(state, incomingChoice) {
      const incoming =
        {
          cooperate:
            "沿着营火后方的石阶向下，莱雅终于在废弃甬道的壁灯下停住。她的眼神从你的手指一路落到腰侧，像是突然确认了什么。",
          push:
            "你几乎是被莱雅半押着走进甬道。她显然不喜欢你步步紧逼的方式，但仍旧把你带到了能说明真相的地方。",
          guarded:
            "你一路观察着守夜人巡逻的空隙，却在转角处被莱雅叫住。她看见了你衣料下闪过的微光，那枚徽记再也藏不住。"
        }[incomingChoice?.parsedIntent] || "甬道尽头的壁灯照亮了你腰侧那枚残缺徽记。";

      return {
        storyText: `${incoming} 她念出了一个早该从地图上消失的名字：守序会。你意识到再往前走，你们之间必须先分清谁在说真话。`,
        npcDialogue:
          `"这个标记不是普通遗物。"莱雅的声音第一次显出压抑的情绪，"如果你真和那群人有关，我需要现在就知道你站在哪一边。"`,
        eventHint: "徽记被识破，信任与警觉将出现大幅波动，这是影响结局的重要关键节点。",
        eventTags: ["徽记曝光", "守序会", "关键质询"]
      };
    }
  },
  archive: {
    id: "archive",
    chapterTag: "第二幕 · 封印档案",
    sceneTag: "下沉档案库 · 黎明前",
    title: "沉睡的核心",
    progressKey: "archive",
    objective: "在守护关系与揭开真相之间做出阶段性立场选择。",
    stakes: "这里的价值取向会决定终局是偏关系、偏真相还是偏撤离。",
    entryClues: ["memory_core", "leya_vow"],
    isCheckpoint: true,
    choices: [
      {
        id: "archive_protect",
        label: "优先保护莱雅与城民，不让秘密失控。",
        intent: "protect",
        keywords: ["保护", "守护", "城民", "莱雅", "稳定"]
      },
      {
        id: "archive_truth",
        label: "坚持揭开真相，即使会动摇守夜人的秩序。",
        intent: "truth",
        keywords: ["真相", "揭开", "秩序", "坚持", "公开"]
      },
      {
        id: "archive_leave",
        label: "带着部分秘密离开迷城，避免卷入更深。",
        intent: "leave",
        keywords: ["离开", "退出", "避免", "带走", "卷入"]
      }
    ],
    build(state, incomingChoice) {
      const incoming =
        {
          confess:
            "坦白之后，莱雅终于带你进入封存档案的石库。尘封册页记录着三年前守序会解体的真相：他们并未消失，而是把迷城的核心交给了一套会吞噬记忆的机制。",
          deflect:
            "莱雅并没有完全接受你的回避，但她仍带你进入石库，只是把每一道门都留在自己背后。你意识到，眼前的真相随时可能成为你被驱逐的理由。",
          surrender:
            "徽记落到莱雅掌心之后，她第一次让你并肩走进石库深处。那里存放的不是普通档案，而是一套会影响全城情绪的旧核心。"
        }[incomingChoice?.parsedIntent] || "石库深处存放着迷城的真正核心。";

      return {
        storyText: `${incoming} 老档案保管者只留下了一句残缺注释：'若无人承担，整座城市将继续在雾中重复遗忘。'你和莱雅必须尽快决定接下来的路线。`,
        npcDialogue:
          `"我们没时间把所有真相都慢慢拆开。"莱雅站在核心封印前，手指微微发颤，"告诉我，你现在更想守住谁，又想把什么交给明天？"`,
        eventHint: "你对秘密的态度将决定终局的价值取向，也会显著影响结局类型。",
        eventTags: ["旧档案", "核心机制", "价值分歧"]
      };
    }
  },
  finale: {
    id: "finale",
    chapterTag: "第三幕 · 最终抉择",
    sceneTag: "迷城核心 · 破晓前一刻",
    title: "雾尽之前",
    progressKey: "finale",
    objective: "决定你最终想把迷城交给谁，以及你自己愿意承担什么。",
    stakes: "这一轮选择会立即导向结局，并写入图鉴与路线总结。",
    entryClues: [],
    isCheckpoint: true,
    choices: [
      {
        id: "finale_vow",
        label: "与莱雅共同守护迷城，让真相以可承受的方式被看见。",
        intent: "vow",
        keywords: ["共同", "守护", "莱雅", "迷城", "誓言"]
      },
      {
        id: "finale_wander",
        label: "公开部分真相后离开，把选择交还给这座城市。",
        intent: "wander",
        keywords: ["离开", "公开", "交还", "城市", "远行"]
      },
      {
        id: "finale_betray",
        label: "切断核心以自保撤离，拒绝继续承担这座城的代价。",
        intent: "betray",
        keywords: ["切断", "自保", "撤离", "拒绝", "代价"]
      }
    ],
    build(state, incomingChoice) {
      const incoming =
        {
          protect:
            "你选择优先守护城民之后，莱雅站到了你身侧。核心封印正在松动，旧日记忆像潮水一样涌向甬道，你们只剩下最后一次决定未来的机会。",
          truth:
            "你坚持揭开全部真相，核心回应得比任何人预想的都更强烈。迷城过去被隐藏的一切正在醒来，而你和莱雅必须决定谁来承受它。",
          leave:
            "你已经流露出离开的念头，莱雅看你的眼神多了几分无法挽回的沉默。可即便如此，核心仍在呼唤你完成最后的选择。"
        }[incomingChoice?.parsedIntent] || "迷城核心正在崩裂。";

      return {
        storyText: `${incoming} 徽记、守夜人的誓言与这座城的残存秩序在同一刻汇聚。无论你说出什么，都会成为莱雅记住你的最后一句话。`,
        npcDialogue:
          `"我不能替你决定。"莱雅握紧那枚徽记，目光却始终没有离开你，"但如果我们现在错过这一刻，迷城就会永远停在雾里。"`,
        eventHint: "最终抉择会立刻进入结局判定。高信任与隐藏条件会解锁特殊结局。",
        eventTags: ["终局节点", "迷城核心", "结局判定"]
      };
    }
  }
};

const MISTYCITY_PACK = {
  id: "mistycity",
  genre: "AI 驱动互动叙事",
  title: "命运的抉择",
  subtitle: "Chronicles of Fate",
  themeLabel: "奇幻悬疑",
  synopsis:
    "你将踏入一座被迷雾掩埋的古城，在人与秘密之间做出抉择。每一次回应都会改变关系、线索与最终命运。",
  description:
    "偏奇幻悬疑与关系推进的长线剧本，适合体验信任、守护与真相拉扯的叙事节奏。",
  initialEventText: "新的会话已经创建，迷城正等待你的第一句回应。",
  primaryCharacterId: "leya",
  initialStageId: "opening",
  progressSteps: MISTY_PROGRESS_STEPS,
  clueLibrary: MISTY_CLUE_LIBRARY,
  endings: MISTY_ENDINGS,
  initialCharacters: {
    leya: {
      characterId: "leya",
      name: "莱雅·格雷",
      role: "守夜人 / 向导",
      affinity: 46,
      trust: 32,
      alertness: 58,
      mood: "好奇而警惕",
      relationshipStage: "试探期",
      revealed: true
    },
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
  stages: MISTY_STAGES,
  resolveChoiceOutcome(state, stageId, choiceRecord, helpers) {
    const leya = state.characters.leya;
    const { addEvent } = helpers;

    const handlers = {
      opening() {
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
        state.characters.archivist.revealed = true;
        if (choiceRecord.parsedIntent === "confess") {
          leya.trust += 14;
          leya.alertness -= 8;
          state.flags.confessedCrest = true;
          addEvent(state, "你坦白了徽记来历，莱雅开始把你当成可对话的见证者。", true);
          return { nextStageId: "archive", summary: "最危险的坦白，反而让你们第一次站到了同一边。" };
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
          return { nextStageId: "finale", summary: "你选择把真相放在风险之前，故事因此走向更锐利的边缘。" };
        }
        leya.affinity -= 6;
        leya.trust -= 4;
        leya.alertness += 8;
        state.flags.leaveChoice = true;
        addEvent(state, "你开始考虑带着秘密离开，这让莱雅感到失落与迟疑。", false);
        return { nextStageId: "finale", summary: "离开的念头让你更安全，也让你们更远。" };
      },
      finale() {
        if (choiceRecord.parsedIntent === "vow") {
          leya.affinity += 10;
          leya.trust += 12;
          leya.alertness -= 8;
          state.flags.finalVow = true;
          addEvent(state, "你决定与莱雅共同守护迷城。", true);
          return { endingId: resolveMistyEnding(state), summary: "你把未来押在了共同承担之中。" };
        }
        if (choiceRecord.parsedIntent === "wander") {
          leya.affinity += 4;
          leya.trust -= 2;
          state.flags.finalLeave = true;
          addEvent(state, "你选择把选择权还给迷城，然后离开。", false);
          return { endingId: resolveMistyEnding(state), summary: "你留下了余地，也留下了未竟的关系。" };
        }
        leya.affinity -= 15;
        leya.trust -= 20;
        leya.alertness += 20;
        state.flags.finalBetrayal = true;
        addEvent(state, "你切断核心自保撤离，迷城因此陷入失序。", true);
        return { endingId: resolveMistyEnding(state), summary: "你保住了自己，却放弃了这座城与你们之间的可能。" };
      }
    };

    return handlers[stageId]();
  }
};

function resolveMistyEnding(state) {
  const leya = state.characters.leya;
  if (state.flags.finalBetrayal || leya.alertness >= 78 || leya.trust <= 28) return "bad";
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
  if (state.flags.finalVow && leya.affinity >= 68 && leya.trust >= 62) return "good";
  return "normal";
}

function enhanceMistyCity() {
  const oldResolver = MISTYCITY_PACK.resolveChoiceOutcome;


  Object.assign(MISTYCITY_PACK, {
    uiTheme: "mistycity",
    storyPromise: "一枚残缺徽记、一座拒绝清晨的古城、一位始终先怀疑后靠近的守夜人。你会在守护与揭开真相之间，决定这座城该如何继续活下去。",
    cinematicLead: "雾墙升起之前，每个回到迷城的人都必须先回答一个问题：你是来寻找真相，还是来替过去赎罪？",
    openingFrame: "黄昏吞没古城外环时，你孤身抵达雾墙之外。火把、守夜铃和那枚沉甸甸的旧徽记，一起把你推回三年前没能结束的夜里。",
    synopsis:
      "你带着一枚残缺徽记来到迷雾古城，试图查清三年前那场让守序会覆灭的失踪事件。守夜人莱雅会成为你的向导，也会成为第一个怀疑你的人。",
    description:
      "更强调古城历史、守夜人职责与旧组织秘密的长线悬疑剧本。玩家会先理解这座城，再逐步走进莱雅与迷城共同守护的真相。",
    playerRole:
      "你不是偶然路过的旅人，而是带着残缺徽记、主动回到迷城的人。三年前守序会消失时，你曾站在外围，却从未真正离开过这场秘密。",
    worldGuide:
      "迷城是一座被雾墙封住的旧城。守夜人负责维持夜间秩序，也负责掩埋不该被外界知晓的历史。城民表面照常生活，真正的权力却埋在旧档案与地下封印里。",
    castGuide: [
      { name: "莱雅·格雷", role: "守夜人 / 向导", note: "冷静、克制，习惯先怀疑再靠近。她守护的不只是迷城，也包括那些不愿再失控的过去。" },
      { name: "老档案保管者", role: "旧时代见证者", note: "不常露面，却掌握着守序会覆灭前后的关键记录。你迟早要面对他留下的答案。" }
    ],
    journeySetup: {
      aliasLabel: "回城时的名字",
      aliasPlaceholder: "例如：归雾者",
      setupPrompt: "在这座不轻易接纳外来者的迷城里，你会以怎样的方式重新靠近真相与莱雅？",
      setupHint: "不同进入方式会改变莱雅对你的第一印象，也会让故事更偏向倾听、追索或守护。",
      presets: {
        witness: {
          title: "沉默见证者",
          short: "先听她说，再决定该把哪段过去翻出来。",
          description: "你不会急着解释自己，而是更愿意先看清迷城如何运作、莱雅在守护什么。这样的靠近更容易换来耐心和信任。",
          lens: "以倾听和观察建立关系",
          statSummary: "初始更容易获得信任"
        },
        truthseeker: {
          title: "追雾之人",
          short: "宁愿惊动旧伤，也想尽快碰到真相。",
          description: "你回来就是为了把三年前的事说清，所以会更直接地追问、逼近和试探。真相会来得更快，戒备也会跟着升高。",
          lens: "以追问和逼近推进剧情",
          statSummary: "更容易触发深层线索，但更显眼"
        },
        guardian: {
          title: "守夜同盟",
          short: "先确认谁会受伤，再决定秘密要揭到什么程度。",
          description: "你最先在意的不是答案，而是这座城和莱雅会不会因为旧事再次失控。这样的立场更容易把故事带向守护与共担。",
          lens: "以守护和共担靠近对方",
          statSummary: "初始更容易提升好感"
        }
      }
    },
    progressSteps: [
      { key: "arrival", label: "踏入迷城" },
      { key: "gate", label: "雾墙门庭" },
      { key: "watchfire", label: "守夜营火" },
      { key: "crest", label: "徽记暴露" },
      { key: "tower", label: "钟塔旧史" },
      { key: "archive", label: "封印档案" },
      { key: "finale", label: "最终抉择" }
    ]
  });

  Object.assign(MISTYCITY_PACK.stages.opening, {
    chapterLead: "雾还没有完全升起来，守夜铃已经先响了一次。迷城从不轻易放人进入，更不会轻易原谅带着旧徽记回来的人。",
    build(state) {
      return {
        storyText: `黄昏正沿着旧城残墙缓慢下沉。你在最后一抹天光熄灭之前赶到迷城外环，斗篷下那枚残缺徽记像一块始终没有冷下来的旧铁，贴着心口提醒你，这一趟并不是归来，而是补完。雾墙之外没有行人，只有守夜火把在风里一跳一跳地亮着，照见挡在路中央的莱雅。她站得很稳，像早就知道今晚会有人回来。`,
        npcDialogue:
          `“这地方不收留黄昏之后的旅人。”莱雅的声音不高，却让四周的风都像停了一拍。她的目光从你的脸移到你按着斗篷的手，像已经猜到了什么，“如果你坚持要进城，就先告诉我，${state.player.alias}，你回来是为了找谁，又是为了替谁把事情说清。”`,
        eventHint: "第一句话会决定莱雅把你当成麻烦、过客，还是一个值得冒险带进城的人。",
        eventTags: ["归来", "守夜盘问", "雾城入口"]
      };
    }
  });

  Object.assign(MISTYCITY_PACK.stages.watchfire, {
    chapterLead: "真正让人放下戒备的，从来不是火光，而是火光之中有没有一句肯说实话的话。",
    build(state, incomingChoice) {
      const lead =
        {
          observe:
            "穿过门庭之后，莱雅没有再回头确认你有没有跟上。她把你带到守夜营地最靠近火堆的位置，像是在给你一个暂时不必解释自己的机会。",
          wait:
            "你一路保持安静，莱雅也没有再追问。等你们走进守夜营地时，其他巡夜人已经默默散开，像是把接下来的试探都交给了她一个人。",
          press:
            "即使你在门庭里逼近了她不愿先说的部分，莱雅还是把你带到了营火边。只是她始终没有坐下，像是在提醒你，今晚的每一句话都还没有被真正相信。",
          honest:
            "你的坦白替你换来了一个靠近营火的位置，却没能换来真正的松弛。莱雅坐在火光对面，像在等你自己把更多真相交出来。",
          evasive:
            "你的回避让营地里每一道目光都变得更冷。莱雅挥退其他人之后，仍旧与你隔着半个火堆，像是在给你最后一次修正立场的机会。",
          inquisitive:
            "你一路都在观察这座城，莱雅显然看出来了。她把被反复划去的旧地图摊在火边，像是故意让你看见迷城真正害怕被触及的地方。"
        }[incomingChoice?.parsedIntent] || "守夜营地的火光把旧地图上的划痕照得格外清楚。";

      return {
        storyText: `${lead} 火焰噼啪作响，映亮摊在木箱上的旧城地图。三处被划去的区域在火光里格外刺眼，像有人曾用尽力气想把它们从城里、也从记忆里一起抹掉。你忽然明白，迷城真正可怕的从来不是雾，而是这里每个人都在用沉默维持一套勉强完整的秩序。`,
        npcDialogue:
          "“如果你只是想带着一两个答案离开，现在回头还来得及。”莱雅伸手压住地图的一角，指节在火光下显得发白，“可如果你真要找旧档案，就别再拿试探和我说话。我得知道，你究竟想从这座城里带走什么。”",
        eventHint: "这一轮会决定你们接下来的关系，是共同查下去，还是继续互相审视。",
        eventTags: ["营火夜谈", "旧地图", "共同目标"]
      };
    }
  });

  Object.assign(MISTYCITY_PACK.stages.crest, {
    chapterLead: "有些秘密一旦被叫出名字，就再也回不到‘尚可回避’的时候了。",
    build(state, incomingChoice) {
      const lead =
        {
          cooperate:
            "营火之后，莱雅带你走进旧电道。石壁潮湿，灯火微弱，你们谁都没有先开口，直到她忽然停下脚步。",
          push:
            "你推进得太快，快到莱雅一路上都没有真正放松。可当旧电道壁灯照到你腰侧时，再快的节奏也还是被那枚徽记硬生生截住了。",
          guarded:
            "你本想继续把自己藏在观察里，却在转角处被莱雅叫住。她看见了那道一闪而过的金属光，眼神瞬间比夜色更冷。"
        }[incomingChoice?.parsedIntent] || "壁灯照亮旧电道的一瞬，藏在衣褶下的徽记再也躲不过去。";

      return {
        storyText: `${lead} 她缓慢念出一个早该从迷城消失的名字: 守序会。那三个字在空荡电道里回荡了一下，像把三年前那场仓促掩埋的旧案重新从土里翻了出来。你终于意识到，从这一刻开始，你和莱雅之间再也不会有“只是同行到这里”为止的余地。`,
        npcDialogue:
          "“别告诉我这只是巧合。”莱雅看着那枚徽记，声音第一次失了平稳，却依旧克制，“我见过太多人把过去说成意外。可如果你真和守序会有关，我现在就必须知道，你站回迷城这一边，还是站在它对面。”",
        eventHint: "这是整条关系线第一次真正落到立场和真相上，后面的每一步都会记住这一刻。",
        eventTags: ["徽记暴露", "旧组织", "立场审问"]
      };
    }
  });

  Object.assign(MISTYCITY_PACK.stages.archive, {
    chapterLead: "真正沉睡在地底的，不只是档案，而是整座城最不愿再被唤醒的记忆。",
    build(state, incomingChoice) {
      const lead =
        {
          share:
            "钟塔旧史说开之后，莱雅没再把你挡在身后。她亲手推开石库大门，让你第一次走进那间所有巡夜人都不愿多提的地下档案室。",
          test:
            "你的追问没有被她回避，只是被她带进了更沉重的现场。石库门缓缓开启时，空气里都是旧纸与潮湿矿石混在一起的味道。",
          guard:
            "你没有继续逼问钟塔里的沉默，莱雅也因此把最后那一点保留收了起来。她带你走下石阶，像是在默认某些答案应该由你亲眼看到。",
          confess:
            "坦白之后，连石库里的空气都像没有那么冷了。莱雅带你穿过一排排封存柜，脚步比之前更慢，像终于愿意让你看清她在守着什么。",
          deflect:
            "即使你仍有保留，莱雅还是带你到了石库深处。只是每一道门都由她先一步挡住，又先一步替你推开，像在提醒你，她并没有真的放下戒心。",
          surrender:
            "徽记落进莱雅掌心之后，她终于不再把你挡在所有秘密之外。石库尽头的封印一层层亮起，你看见的已不是单纯档案，而是被整座城供养起来的一颗旧核心。"
        }[incomingChoice?.parsedIntent] || "石库深处的封印缓慢亮起，像旧时代最后一口还没彻底咽下去的气。";

      return {
        storyText: `${lead} 档案里没有整齐的真相，只有被撕开、被删去、又被急急缝补回去的记录。你终于拼出那句最令人不安的结论: 守序会并不是失手毁掉了迷城，而是为了不让更糟的东西醒来，主动把城交给了一套会吞噬记忆的核心机制。真正留到今天的，从来不是安全，而是一种被勉强维持的延迟崩塌。`,
        npcDialogue:
          "“你现在终于看见了。”莱雅站在那层封印之前，眼里没有胜负，只有长期守着同一件事的人才有的疲惫，“我守着这东西，不是因为我相信它对，而是因为我比任何人都清楚，一旦有人在没有准备好的时候把它彻底打开，整座城都会先碎给无辜的人看。”",
        eventHint: "从这里开始，你面对的不只是秘密，而是秘密该由谁承担的问题。",
        eventTags: ["地下石库", "记忆核心", "旧案真相"]
      };
    }
  });

  Object.assign(MISTYCITY_PACK.stages.finale, {
    chapterLead: "所有被压住的名字、记忆和誓言，最后都会在某一个时刻要求你给出答案。",
    build(state, incomingChoice) {
      const lead =
        {
          protect:
            "你把守护放在了真相前面，于是莱雅终于站到了你身边，而不是对面。封印开始松动时，你第一次觉得这座城并不是在审判你，而是在等你表态。",
          truth:
            "你选择让真相继续往前走，于是核心里那些被封存的记忆一股脑涌上来。迷城像在这一刻从漫长的沉睡中惊醒，谁都没办法再假装什么都没有发生过。",
          leave:
            "你曾想过带着秘密离开，可真正走到核心之前时，那念头反而显得比雾更空。莱雅没有拦你，只是始终看着你，像在等你决定自己最终属于哪一边。"
        }[incomingChoice?.parsedIntent] || "迷城核心在黎明前最黑的时刻开始震动。";

      return {
        storyText: `${lead} 雾、旧徽记、钟塔里没有说完的三年，以及地下石库里那句“若无人承担，整座城将继续在雾中重复遗忘”，全都在这一刻重新聚拢。你忽然明白，所谓结局并不是把这座城交给谁，而是你愿不愿意承认自己已经和它、和莱雅、和那段旧案一起被绑进了同一个明天。`,
        npcDialogue:
          "莱雅没有再向前一步。她只是握紧那枚徽记，目光穿过震动与雾气落在你身上，安静得近乎郑重: “我不能替你决定迷城以后要怎么活下去。但如果你现在说出的那句话足够真，我会记住。无论这座城最后留下的是晨光，还是再一次闭上的雾。”",
        eventHint: "这一次没有试探，也没有预留答案。你说出口的选择，会直接定义你和迷城的最后关系。",
        eventTags: ["黎明前刻", "核心封印", "最终立场"]
      };
    }
  });

  MISTYCITY_PACK.stages.gate = {
    id: "gate",
    chapterTag: "第一夜 / 雾墙门庭",
    chapterLead: "真正跨过一座城的边界，往往不是脚先迈进去，而是有人决定暂时相信你还不会把它伤得更深。",
    sceneTag: "内城门庭 / 夜色初起",
    title: "被允许进入的人",
    progressKey: "gate",
    objective: "穿过内城门前的最后一道试探，让莱雅判断你究竟是麻烦、过客，还是值得暂时带着的人。",
    stakes: "如果你在这里表现得太急切，后续她对你每一次回答都会多保留一层判断。",
    entryClues: ["order_name"],
    isCheckpoint: false,
    storyText: {
      honest:
        "莱雅没有立刻带你进内城。她先领你穿过一段刻满旧纹章的门庭长廊，让每一道雾灯都照过你身上的徽记。你能感觉到，她不仅在看你，也在看那段和徽记一起回来的历史。",
      evasive:
        "你被带进门庭时，巡夜人的目光明显更冷了些。莱雅没有拆穿你的回避，只是一路把你带到刻着旧纹章的长廊，让你在沉默里明白这座城从不欢迎藏着目的的人。",
      inquisitive:
        "你主动追问异动之后，莱雅没有回答太多，却带你穿过了门庭最古老的一段长廊。石壁上的纹章被雾与岁月磨得只剩轮廓，像在提醒你：这座城曾有一套比守夜人更古老的秩序。",
      default:
        "门庭长廊的雾灯一盏接一盏亮起，你终于真正踏进了迷城的边界。"
    },
    npcDialogue:
      "“你现在看到的，只是迷城愿意给外人看的第一层。”莱雅停在长廊尽头，侧过身让你看清那排残破纹章，“如果你还想往里走，就别把这当成一场寻常调查。”",
    eventHint: "她开始让你接触迷城的历史边角，这既是试探，也是默认你已不是完全的外人。",
    eventTags: ["内城门庭", "旧纹章", "迷城历史"],
    choices: [
      {
        id: "gate_observe",
        label: "承认自己认得这些旧纹章，并询问它们和守夜人的关系。",
        intent: "observe",
        keywords: ["认得", "纹章", "守夜人", "关系", "历史"],
        effects: { leya: { affinity: 4, trust: 7, alertness: -2 } },
        flagsOn: ["mistyObservedOrder"],
        eventText: "你没有假装无知，反而让莱雅第一次认真看向你对这段旧史的了解程度。",
        summary: "你把话题拉向历史，也让她开始把你当成真正的局内人。",
        nextStageId: "watchfire"
      },
      {
        id: "gate_wait",
        label: "先不追问，只说愿意按她的规则继续往前走。",
        intent: "wait",
        keywords: ["按你的规则", "继续", "愿意", "往前走", "不追问"],
        effects: { leya: { affinity: 5, trust: 5, alertness: -3 } },
        flagsOn: ["mistyWaitedAtGate"],
        eventText: "你的克制让门庭里的紧绷感缓和下来，莱雅也暂时收起了更尖锐的盘问。",
        summary: "你没有抢着推进，反而换来了更平稳的靠近。",
        nextStageId: "watchfire"
      },
      {
        id: "gate_press",
        label: "追问她为什么一看见徽记就如此戒备。",
        intent: "press",
        keywords: ["为什么", "戒备", "徽记", "追问", "看见"],
        effects: { leya: { affinity: 1, trust: -2, alertness: 6 } },
        flagsOn: ["mistyPressedGate"],
        eventText: "你的追问逼近了她最不愿先说出口的部分，也让她再次把防备拉高。",
        summary: "你逼近了真相，却也提醒了她必须小心你。",
        nextStageId: "watchfire"
      }
    ]
  };

  MISTYCITY_PACK.stages.cathedral = {
    id: "cathedral",
    chapterTag: "第二夜 / 钟塔旧史",
    chapterLead: "所有没能在当年说清的话，都会在旧钟停摆的地方重新长出回声。",
    sceneTag: "废钟塔 / 深夜",
    title: "被埋起来的那三年",
    progressKey: "tower",
    objective: "在进入地下档案之前，先决定你要怎样面对守序会和莱雅之间那段没被说完的过去。",
    stakes: "这会直接影响她是愿意和你共享旧史，还是只把你当成可利用的知情者。",
    entryClues: ["sealed_map"],
    isCheckpoint: true,
    storyText:
      "徽记暴露之后，莱雅没有立刻带你去档案石库，而是先绕进了城中央那座废钟塔。塔里挂钟早已停摆，墙面却还留着守序会时期的地图与巡查记号。你终于看清，守夜人并不是取代了旧组织，而是被迫在它崩塌后接过残局的人。",
    npcDialogue:
      "“三年前，守序会没有光荣地结束。”莱雅把手按在剥落的旧地图上，声音低了下去，“有人失踪，有人沉默，还有人选择把整座城重新关进雾里。你带着徽记回来，就不可能只做旁观者。”",
    eventHint: "她第一次主动提到三年前，说明关系已经从试探进入了真正的历史现场。",
    eventTags: ["钟塔", "守序会", "失踪旧案"],
    choices: [
      {
        id: "cathedral_share",
        label: "告诉她你回来不是为了证明自己无辜，而是想把当年没查清的真相补完。",
        intent: "share",
        keywords: ["回来", "真相", "补完", "当年", "无辜"],
        effects: { leya: { affinity: 7, trust: 9, alertness: -4 } },
        flagsOn: ["mistySharedPast"],
        eventText: "你的回答终于把你从可疑来客变成了共同面对旧案的人。",
        summary: "你把目标说清楚了，也让她更愿意和你站在同一侧。",
        nextStageId: "archive"
      },
      {
        id: "cathedral_test",
        label: "反问她当年守夜人到底替谁掩埋了真相。",
        intent: "test",
        keywords: ["守夜人", "掩埋", "真相", "替谁", "反问"],
        effects: { leya: { affinity: 2, trust: 4, alertness: 4 } },
        flagsOn: ["mistyTestedLeya"],
        eventText: "她没有回避这个问题，但看你的目光多了几分重新评估的冷静。",
        summary: "你把话题推向更危险的方向，也逼近了真正的权力核心。",
        nextStageId: "archive"
      },
      {
        id: "cathedral_guard",
        label: "先接受她的沉默，只请求她带你去看最核心的档案。",
        intent: "guard",
        keywords: ["接受", "沉默", "档案", "带我去", "核心"],
        effects: { leya: { affinity: 5, trust: 6, alertness: -1 } },
        flagsOn: ["mistyGuardedTower"],
        eventText: "你没有在这里逼她解释一切，反而让她更快做出了继续带你深入的决定。",
        summary: "你保留了分寸，也让她愿意把更重要的内容交给后面。",
        nextStageId: "archive"
      }
    ]
  };

  MISTYCITY_PACK.resolveChoiceOutcome = (state, stageId, choiceRecord, helpers) => {
    const leya = state.characters.leya;
    const { addEvent } = helpers;

    if (stageId === "opening") {
      if (choiceRecord.parsedIntent === "honest") {
        leya.trust += 10;
        leya.affinity += 4;
        leya.alertness -= 6;
        state.flags.honestStart = true;
        addEvent(state, "你在初见时选择坦白来意，莱雅暂时压下怀疑。", true);
        return { nextStageId: "gate", summary: "坦白让你赢得了迈进迷城的第一道许可。" };
      }
      if (choiceRecord.parsedIntent === "evasive") {
        leya.trust -= 6;
        leya.alertness += 12;
        state.flags.evasiveStart = true;
        addEvent(state, "你回避了真实目的，莱雅对你的身份更加敏感。", true);
        return { nextStageId: "gate", summary: "你保住了秘密，却也让进城后的每一步都更难。" };
      }
      leya.trust += 2;
      leya.affinity += 3;
      leya.alertness += 2;
      state.flags.inquisitiveStart = true;
      addEvent(state, "你主动打探迷城异动，莱雅开始重新评估你的意图。", false);
      return { nextStageId: "gate", summary: "你的探询没有冒犯她，但也没有真正消除怀疑。" };
    }

    if (stageId === "gate") {
      if (choiceRecord.parsedIntent === "observe") {
        leya.affinity += 4;
        leya.trust += 7;
        leya.alertness -= 2;
        state.flags.mistyObservedOrder = true;
        addEvent(state, "你认出旧纹章的来历，莱雅第一次意识到你并非完全的外人。", true);
        return { nextStageId: "watchfire", summary: "共同指向旧史的目光，让你们之间多了一层真正的联系。" };
      }
      if (choiceRecord.parsedIntent === "wait") {
        leya.affinity += 5;
        leya.trust += 5;
        leya.alertness -= 3;
        state.flags.mistyWaitedAtGate = true;
        addEvent(state, "你接受她的规则继续前进，门庭里的对峙因此缓和下来。", false);
        return { nextStageId: "watchfire", summary: "克制让她愿意把你带进更深的夜色里。" };
      }
      leya.affinity += 1;
      leya.trust -= 2;
      leya.alertness += 6;
      state.flags.mistyPressedGate = true;
      addEvent(state, "你追问她的戒备来源，也逼得她再次收紧了防线。", false);
      return { nextStageId: "watchfire", summary: "你逼近了问题本身，也让她对你更不敢松懈。" };
    }

    if (stageId === "crest") {
      state.characters.archivist.revealed = true;
      if (choiceRecord.parsedIntent === "confess") {
        leya.trust += 14;
        leya.alertness -= 8;
        state.flags.confessedCrest = true;
        addEvent(state, "你坦白了徽记来历，莱雅开始把你当成能共同承担旧史的人。", true);
        return { nextStageId: "cathedral", summary: "最危险的坦白，让你们第一次真正站到了同一段历史前。" };
      }
      if (choiceRecord.parsedIntent === "deflect") {
        leya.trust -= 8;
        leya.alertness += 10;
        state.flags.deflectedCrest = true;
        addEvent(state, "你选择回避徽记来历，莱雅对你的戒心再次明显上升。", true);
        return { nextStageId: "cathedral", summary: "你把答案推迟了，但她不会忘记这次回避。" };
      }
      leya.affinity += 8;
      leya.trust += 10;
      leya.alertness -= 2;
      state.flags.gaveCrest = true;
      addEvent(state, "你把徽记交给莱雅保管，这成了关系向前的一次真正让步。", true);
      return { nextStageId: "cathedral", summary: "你交出去的不只是证物，也是一次主动的信任。" };
    }

    if (stageId === "cathedral") {
      if (choiceRecord.parsedIntent === "share") {
        leya.affinity += 7;
        leya.trust += 9;
        leya.alertness -= 4;
        state.flags.mistySharedPast = true;
        addEvent(state, "你说明自己回来的真正理由，莱雅第一次把你视为共同追索旧案的人。", true);
        return { nextStageId: "archive", summary: "你们终于不再只是互相审视，而是开始共同面对那三年留下的伤口。" };
      }
      if (choiceRecord.parsedIntent === "test") {
        leya.affinity += 2;
        leya.trust += 4;
        leya.alertness += 4;
        state.flags.mistyTestedLeya = true;
        addEvent(state, "你把问题指向守夜人本身，逼得旧案的轮廓更快浮出水面。", true);
        return { nextStageId: "archive", summary: "你选了更锋利的推进方式，真相因此更近，也更危险。" };
      }
      leya.affinity += 5;
      leya.trust += 6;
      leya.alertness -= 1;
      state.flags.mistyGuardedTower = true;
      addEvent(state, "你没有在钟塔里逼问到底，反而让她更快决定带你去看核心档案。", false);
      return { nextStageId: "archive", summary: "你保留分寸，也换来了继续深入的许可。" };
    }

    return oldResolver(state, stageId, choiceRecord, helpers);
  };
}

function applyMistyInteractionModes() {
  // pack-level world state data
  Object.assign(MISTYCITY_PACK, {
    hiddenTruths: [
      "守序会并未消失，而是将自身融入了旧核心机制",
      "莱雅的守夜人身份与守序会有直接关联",
      "旧核心会吞噬城民的记忆以维持迷雾"
    ],
    forbiddenReveals: [
      "旧核心的完整激活代码",
      "守序会解体的真正原因"
    ],
    characterTopics: {
      leya: [
        { topic: "守夜人", unlockFlag: null },
        { topic: "守序会", unlockFlag: "crestPursue" },
        { topic: "旧核心", unlockFlag: "archiveTruth" },
        { topic: "迷雾真相", unlockFlag: "memoryCore" }
      ],
      archivist: [
        { topic: "旧档案", unlockFlag: "archiveReached" },
        { topic: "核心封印", unlockFlag: "archiveTruth" }
      ]
    }
  });

  // extend mistycity clue library with explore-discoverable clues
  Object.assign(MISTYCITY_PACK.clueLibrary, {
    gate_symbol: { id: "gate_symbol", title: "城门古符", detail: "城门上的古老符号与你的守序会徽记属于同一套纹路体系。" },
    weapon_symbol: { id: "weapon_symbol", title: "哨站旧弓", detail: "哨站武器架上的旧短弓刻有守序会体系的古老纹路。" },
    fog_center: { id: "fog_center", title: "迷雾辐射源", detail: "从城脊俯瞰，迷雾从城中心某处辐射而出——方向正对旧档案库。" },
    leya_oath: { id: "leya_oath", title: "莱雅的签名", detail: "古教堂祭坛暗格里的守序会入会誓词上，签名者是'L. Grey'。" },
    leya_order_hint: { id: "leya_order_hint", title: "莱雅与守序会", detail: "莱雅暗示守序会最初的目的和守夜人没有区别——只是代价不同。" },
    order_final_vote: { id: "order_final_vote", title: "最终会议纪要", detail: "守序会最后一次会议记录，莱雅是唯一投下反对票的人。" }
  });

  // opening: 城门口/初遇 — allow explore + dialogue
  Object.assign(MISTYCITY_PACK.stages.opening, {
    allowExplore: true,
    allowDialogue: true,
    exploreTargets: [
      {
        keywords: ["城墙", "城门", "大门", "入口"],
        resolve(state) {
          return {
            feedback: "城门上的纹路在雾气中若隐若现，你辨认出一组古老的符号——和你腰间徽记上的图案极为相似。",
            narrativeText: "你走近斑驳的城门，指尖触到石面时微微发烫。",
            clueId: "gate_symbol",
            effects: { leya: { alertness: 3 } }
          };
        }
      },
      {
        keywords: ["雾", "迷雾", "浓雾", "雾气"],
        resolve(state) {
          return {
            feedback: "迷雾并非自然现象——它在某些方向格外浓厚，像是在刻意隐藏什么。你嗅到空气中一丝不属于水汽的甜腻气味。",
            narrativeText: "你试图看穿浓雾，发现它在某些区域异常地厚实。"
          };
        }
      },
      {
        keywords: ["火堆", "营火", "火光", "篝火"],
        resolve(state) {
          return {
            feedback: "营火旁散落着一些被烧毁的书页碎片，上面残留的文字提到了'记忆税'和'雾中清洗'。",
            narrativeText: "你蹲在营火边，翻看没有烧尽的残页。",
            flagsOn: ["heardMemoryTax"]
          };
        }
      }
    ],
    dialogueRules: {
      leya: [
        {
          keywords: ["守夜人", "你是谁", "身份", "工作"],
          resolve(state, character) {
            return {
              response: `${character.name}把视线从火堆移回你脸上: "守夜人负责在迷雾最浓的时候确保没有人走失。至于为什么是我——这不是你现在该关心的事。"`,
              mood: "戒备",
              effects: { leya: { trust: 2 } }
            };
          }
        },
        {
          keywords: ["这座城", "迷城", "这里", "地方"],
          resolve(state, character) {
            return {
              response: `“迷城从来不欢迎好奇心太重的人。”${character.name}的声音里多了一层冷意，“不过既然你已经进来了，最好的策略是跟紧我，别乱看。”`,
              mood: "谨慎"
            };
          }
        },
        {
          keywords: ["徽记", "符号", "标记", "纹章"],
          requireFlag: "gate_symbol",
          resolve(state, character) {
            return {
              response: `${character.name}的瞳孔瞬间收缩: "你怎么会有那个东西？"她没有再说下去，但手不自觉地按住了腰间的短刀。`,
              mood: "警觉",
              effects: { leya: { alertness: 5, trust: -2 } },
              event: "莱雅注意到了你的徽记，她的反应异常强烈",
              eventHot: true
            };
          }
        }
      ]
    }
  });

  // gate: 守夜人哨站 — explore + dialogue
  if (MISTYCITY_PACK.stages.gate) {
    Object.assign(MISTYCITY_PACK.stages.gate, {
      allowExplore: true,
      allowDialogue: true,
      exploreTargets: [
        {
          keywords: ["哨站", "瞭望", "岗位", "守卫"],
          resolve(state) {
            return {
              feedback: "哨站墙壁上刻着值班表，但最近三个月的记录明显被人涂抹过。只有莱雅的名字始终清晰。",
              narrativeText: "你检查了守夜人哨站的值班记录。"
            };
          }
        },
        {
          keywords: ["武器", "装备", "架子", "工具"],
          resolve(state) {
            return {
              feedback: "武器架上有一把旧短弓，弓身上的纹路和城门上的古老符号属于同一套体系。",
              narrativeText: "你走近武器架仔细观察。",
              clueId: "weapon_symbol"
            };
          }
        }
      ],
      dialogueRules: {
        leya: [
          {
            keywords: ["信任", "相信", "一起", "合作"],
            resolve(state, character) {
              return {
                response: `${character.name}停下脚步: "信任在迷城里是奢侈品。不是因为没人值得，而是因为雾会改变人。你现在说的话，到了城深处可能连你自己都不记得。"`,
                mood: "沉重",
                effects: { leya: { trust: 3, affinity: 2 } }
              };
            }
          },
          {
            keywords: ["守序会", "组织", "过去"],
            requireFlag: "crestPursue",
            resolve(state, character) {
              return {
                response: `${character.name}沉默了很久: "守序会……他们不是坏人，至少一开始不是。他们真正想做的事，和我现在做的事没什么两样——只是代价不一样。"`,
                mood: "犹豫",
                effects: { leya: { trust: 4, alertness: -3 } },
                clueId: "leya_order_hint",
                event: "莱雅首次提及守序会的内情"
              };
            }
          }
        ]
      }
    });
  }

  // watchfire: 营火边的对峙 — dialogue only (tense scene)
  Object.assign(MISTYCITY_PACK.stages.watchfire, {
    allowDialogue: true,
    dialogueRules: {
      leya: [
        {
          keywords: ["过去", "以前", "从前", "曾经"],
          resolve(state, character) {
            return {
              response: `“过去？”${character.name}的笑意苦涩，“在迷城里，过去是最不可靠的东西。你确定你记得的那些，真的发生过？”`,
              mood: "感伤",
              effects: { leya: { affinity: 3 } }
            };
          }
        },
        {
          keywords: ["真相", "秘密", "隐瞒"],
          resolve(state, character) {
            return {
              response: `${character.name}转过身，声音压得很低: "真相从来就不是拿出来让所有人看的东西。有些东西一旦说出口，你连后悔的机会都没有。"`,
              mood: "紧绷",
              effects: { leya: { alertness: 3, trust: 2 } },
              event: "莱雅暗示真相的危险性"
            };
          }
        }
      ]
    }
  });

  // crest: 城脊线索 — explore only
  Object.assign(MISTYCITY_PACK.stages.crest, {
    allowExplore: true,
    exploreTargets: [
      {
        keywords: ["城脊", "屋顶", "高处", "俯瞰"],
        resolve(state) {
          return {
            feedback: "从城脊俯瞰，你发现迷雾并非均匀分布——它像一张网一样从城中心某个点辐射出去，那个方向正是旧档案库的位置。",
            narrativeText: "你站在城脊最高处向下眺望。",
            clueId: "fog_center",
            event: "发现迷雾的辐射中心"
          };
        }
      },
      {
        keywords: ["雕像", "石像", "纪念碑"],
        resolve(state) {
          return {
            feedback: "雕像底座的铭文早已模糊，但你辨认出最后一行：'当最后一位守序者离开，迷雾将永不散去。'",
            narrativeText: "你仔细阅读雕像底座上的铭文。",
            flagsOn: ["readInscription"]
          };
        }
      }
    ]
  });

  // cathedral: 古教堂 — explore + dialogue
  if (MISTYCITY_PACK.stages.cathedral) {
    Object.assign(MISTYCITY_PACK.stages.cathedral, {
      allowExplore: true,
      allowDialogue: true,
      exploreTargets: [
        {
          keywords: ["祭坛", "圣坛", "神坛"],
          resolve(state) {
            return {
              feedback: "祭坛下方有一个暗格，里面存放着一份守序会的入会誓词，上面的签名包括'L. Grey'——莱雅的姓氏。",
              narrativeText: "你检查了古教堂的祭坛。",
              clueId: "leya_oath",
              effects: { leya: { alertness: 4 } },
              event: "在教堂发现莱雅与守序会的关联"
            };
          }
        },
        {
          keywords: ["壁画", "画", "天顶", "图案"],
          resolve(state) {
            return {
              feedback: "壁画描绘的不是宗教场景，而是一群人围绕着一团发光的雾气进行某种仪式。其中有个人物的轮廓和莱雅惊人地相似。",
              narrativeText: "你抬头凝视教堂的壁画。"
            };
          }
        }
      ],
      dialogueRules: {
        leya: [
          {
            keywords: ["教堂", "这里", "什么地方"],
            resolve(state, character) {
              return {
                response: `${character.name}环顾四周，声音在穹顶下回荡: "这里曾经是守序会集会的地方。后来……后来就成了没有人愿意走进来的废墟。"`,
                mood: "怀念",
                effects: { leya: { affinity: 2, alertness: -2 } }
              };
            }
          }
        ],
        archivist: [
          {
            keywords: ["档案", "记录", "历史"],
            resolve(state, character) {
              return {
                response: `老档案保管者的影子在烛光中摇曳: "历史不会消失，它只是被雾气遮住了。你想看到什么，取决于你愿意走多深。"`,
                mood: "神秘",
                revealCharacter: "archivist"
              };
            }
          }
        ]
      }
    });
  }

  // archive: 封印档案 — explore + dialogue (critical stage)
  Object.assign(MISTYCITY_PACK.stages.archive, {
    allowExplore: true,
    allowDialogue: true,
    exploreTargets: [
      {
        keywords: ["档案", "文件", "记录", "册页"],
        resolve(state) {
          return {
            feedback: "档案库深处有一份被特别封存的记录——守序会最后一次会议的纪要。上面记载着他们把旧核心交给迷雾机制的决议，以及唯一的反对票：L. Grey。",
            narrativeText: "你翻开了封存最深的那份档案。",
            clueId: "order_final_vote",
            event: "发现莱雅是守序会中唯一的反对者",
            eventHot: true
          };
        }
      },
      {
        keywords: ["核心", "机制", "装置", "封印"],
        resolve(state) {
          return {
            feedback: "旧核心表面流动着微弱的光，它需要一枚守序会徽记才能完全激活。你腰间的那一枚在微微发热。",
            narrativeText: "你走近了旧核心的封印。",
            effects: { leya: { alertness: 5 } }
          };
        }
      }
    ],
    dialogueRules: {
      leya: [
        {
          keywords: ["核心", "封印", "怎么办"],
          resolve(state, character) {
            return {
              response: `${character.name}的手指在封印上悬了很久: "如果打开它，整座城的记忆都会回来——包括那些他们选择遗忘的痛苦。你确定你想承担这个后果？"`,
              mood: "纠结",
              effects: { leya: { trust: 5, affinity: 3 } }
            };
          }
        },
        {
          keywords: ["守序会", "你的过去", "莱雅"],
          requireClue: "leya_oath",
          resolve(state, character) {
            return {
              response: `${character.name}闭上了眼睛，声音几乎听不见: "是，我曾经是他们中的一员。我投了反对票，但没能改变结果。所以我变成了守夜人——至少能确保不会再有人因为迷雾而消失。"`,
              mood: "坦诚",
              effects: { leya: { trust: 8, alertness: -6, affinity: 5 } },
              event: "莱雅坦白了她的守序会身份",
              eventHot: true
            };
          }
        }
      ],
      archivist: [
        {
          keywords: ["真相", "为什么", "原因"],
          resolve(state, character) {
            return {
              response: `暗影中传来低沉的嗓音: "真相？真相是这座城市选择了遗忘，因为记住太痛苦了。你要做的不是揭开真相——而是决定它被揭开之后，谁来承受。"`,
              mood: "悲悯"
            };
          }
        }
      ]
    }
  });

}

enhanceMistyCity();
applyMistyInteractionModes();

export { MISTYCITY_PACK };
