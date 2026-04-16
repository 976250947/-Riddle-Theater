export const ENDINGS = {
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

export const PROGRESS_STEPS = [
  { key: "arrival", label: "踏入迷城" },
  { key: "watchfire", label: "守夜营火" },
  { key: "crest", label: "徽记秘密" },
  { key: "archive", label: "封印档案" },
  { key: "finale", label: "最终抉择" }
];

export const CLUE_LIBRARY = {
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

export const STAGES = {
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
    build(state) {
      return {
        storyText: `迷雾正从废弃城墙的缝隙间缓慢漫出。你在天色彻底暗下去之前抵达旧城外环，自称“${state.player.alias}”的旅人身份并不足以让任何人放松。腰侧那枚残缺徽记在灯火间映出微弱金边，守夜人莱雅已经拦在前路。`,
        npcDialogue:
          "“这里不是旅人会在黄昏后停留的地方。”她的声音很轻，却没有任何退让，“如果你坚持进城，就先告诉我，你到底是为了谁而来。”",
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
          "“如果你真的在找旧档案，现在就该决定你愿意告诉我多少。”莱雅伸手压住一页标着封印记号的地图，“迷城不会再给撒谎的人第二次机会。”",
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
          "“这个标记不是普通遗物。”莱雅的声音第一次显出压抑的情绪，“如果你真和那群人有关，我需要现在就知道你站在哪一边。”",
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
        storyText: `${incoming} 老档案保管者只留下了一句残缺注释：‘若无人承担，整座城市将继续在雾中重复遗忘。’你和莱雅必须尽快决定接下来的路线。`,
        npcDialogue:
          "“我们没时间把所有真相都慢慢拆开。”莱雅站在核心封印前，手指微微发颤，“告诉我，你现在更想守住谁，又想把什么交给明天？”",
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
          "“我不能替你决定。”莱雅握紧那枚徽记，目光却始终没有离开你，“但如果我们现在错过这一刻，迷城就会永远停在雾里。”",
        eventHint: "最终抉择会立刻进入结局判定。高信任与隐藏条件会解锁特殊结局。",
        eventTags: ["终局节点", "迷城核心", "结局判定"]
      };
    }
  }
};
