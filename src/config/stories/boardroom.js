import { createGenericEndings } from "./_helpers.js";

const BOARDROOM_ENDINGS = createGenericEndings("Boardroom");
BOARDROOM_ENDINGS.good = {
  id: "good",
  code: "Boardroom / 01",
  badge: "好结局 / Good Ending",
  title: "共赢条款",
  subtitle: "Terms of Trust",
  description: "你在资本博弈中守住了底线，也赢得了沈曼的信任。你们并肩完成重组，让公司和关系都走向更稳的未来。",
  conditions: [
    { label: "好感度", value: ">= 70" },
    { label: "信任值", value: ">= 68" },
    { label: "终局选择", value: "共同签约" }
  ]
};
BOARDROOM_ENDINGS.normal = {
  id: "normal",
  code: "Boardroom / 02",
  badge: "普通结局 / Normal Ending",
  title: "体面收场",
  subtitle: "A Professional Distance",
  description: "交易完成了，但你和沈曼都把感情与野心留在了合同之外。你们彼此欣赏，却停在最克制的位置。",
  conditions: [
    { label: "路线结果", value: "合作但保留距离" },
    { label: "最低信任", value: ">= 45" },
    { label: "终局选择", value: "各自前行" }
  ]
};
BOARDROOM_ENDINGS.bad = {
  id: "bad",
  code: "Boardroom / 03",
  badge: "坏结局 / Bad Ending",
  title: "坠落估值",
  subtitle: "The Price of Mistrust",
  description: "你在关键投票前选择自保，泄密与反噬让所有合作迅速崩盘。留下来的只有无人认领的责任和一地股价。",
  conditions: [
    { label: "警觉值", value: ">= 76" },
    { label: "或信任值", value: "<= 32" },
    { label: "终局选择", value: "切割撤退" }
  ]
};
BOARDROOM_ENDINGS.hidden = {
  id: "hidden",
  code: "Boardroom / 04",
  badge: "隐藏结局 / Hidden Ending",
  title: "夜航资本",
  subtitle: "After the Bell",
  description: "你不只赢了投票，还替沈曼守住了她最不愿示人的软肋。凌晨钟声落下时，你们把未来一起写进了新公司的第一份章程。",
  conditions: [
    { label: "好感度", value: ">= 82" },
    { label: "信任值", value: ">= 78" },
    { label: "隐藏条件", value: "守住泄密源 + 共同签约" }
  ]
};

const BOARDROOM_PACK = {
  id: "boardroom",
  genre: "都市互动叙事",
  title: "资本回响",
  subtitle: "Echoes of the Boardroom",
  themeLabel: "都市商战",
  synopsis:
    "你将卷入一场收购、泄密与董事会拉扯交织的资本游戏。有人把利益写进合同，也有人把真心藏在不该动摇的时刻。",
  description:
    "更偏成年人关系张力与策略选择的剧本，适合喜欢在利益、立场与微妙情感间周旋的玩家。",
  initialEventText: "夜色落在玻璃幕墙上，新的并购战局已经开盘。",
  primaryCharacterId: "shenman",
  initialStageId: "boardroom_opening",
  progressSteps: [
    { key: "briefing", label: "会前试探" },
    { key: "leak", label: "泄密风暴" },
    { key: "vote", label: "董事会夜" },
    { key: "signing", label: "终局签约" }
  ],
  clueLibrary: {
    rival_note: { id: "rival_note", title: "匿名备忘录", detail: "有人提前整理了沈曼的投票漏洞，说明这场局早就不止并购那么简单。" },
    cap_table: { id: "cap_table", title: "股权结构表", detail: "真正决定胜负的不是表面出价，而是谁能在关键节点拿到临门一票。" },
    leaked_mail: { id: "leaked_mail", title: "泄露邮件", detail: "内部邮件里提到‘不要让她一个人扛’，有人在暗中替沈曼挡过一次火。" },
    private_clause: { id: "private_clause", title: "附加条款", detail: "合同的最后一页有一项只写给你们二人的风险共担条款。" }
  },
  endings: BOARDROOM_ENDINGS,
  initialCharacters: {
    shenman: {
      characterId: "shenman",
      name: "沈曼",
      role: "并购负责人",
      affinity: 44,
      trust: 40,
      alertness: 56,
      mood: "冷静而锋利",
      relationshipStage: "试探合作",
      revealed: true
    },
    investor: {
      characterId: "investor",
      name: "赵峻",
      role: "关键投资人",
      affinity: 0,
      trust: 0,
      alertness: 0,
      mood: "审视",
      relationshipStage: "未接触",
      revealed: false
    }
  },
  stages: {
    boardroom_opening: {
      id: "boardroom_opening",
      chapterTag: "第一幕 / 会前试探",
      sceneTag: "高层酒会 / 夜幕",
      title: "你站在哪一侧",
      progressKey: "briefing",
      objective: "决定你在沈曼面前呈现的是野心、诚意，还是保守试探。",
      stakes: "第一印象会决定她把你当盟友、棋子，还是潜在风险。",
      entryClues: ["rival_note"],
      isCheckpoint: true,
      storyText:
        "酒会厅的玻璃倒映着整座城市的灯。沈曼站在人群边缘，手里捏着今晚投前会唯一一份未公开文件，而你被安排在她正对面。",
      npcDialogue:
        "“我听说你是被临时拉进项目的人。”她看向你，语气干净利落，“所以今晚你准备帮我拿下这场局，还是只想看谁会先输？”",
      eventHint: "她尊重清晰立场，也最讨厌模糊试探。",
      eventTags: ["酒会交锋", "商业立场"],
      choices: [
        {
          id: "boardroom_align",
          label: "明确表示愿意站到她这一边，一起拿下并购。",
          intent: "align",
          keywords: ["帮你", "一起", "拿下", "站你这边", "合作"],
          effects: { shenman: { affinity: 5, trust: 8, alertness: -5 } },
          flagsOn: ["boardroomAlign"],
          eventText: "你的立场足够清晰，沈曼第一次把视线从防备转向评估。",
          summary: "明确合作让她愿意给你一小部分信任。",
          nextStageId: "boardroom_leak"
        },
        {
          id: "boardroom_probe",
          label: "追问她为什么非要在今晚推动这笔交易。",
          intent: "probe",
          keywords: ["为什么", "今晚", "交易", "原因", "追问"],
          effects: { shenman: { affinity: 3, trust: 4, alertness: 3 } },
          flagsOn: ["boardroomProbe"],
          unlockClues: ["cap_table"],
          eventText: "你没有立刻表态，而是先摸清真正的胜负手。",
          summary: "你让局势更清晰，也让她对你多了一层戒心。",
          nextStageId: "boardroom_leak"
        },
        {
          id: "boardroom_hold",
          label: "保持专业距离，只说要先看数据再决定。",
          intent: "hold",
          keywords: ["数据", "再说", "看看", "专业", "谨慎"],
          effects: { shenman: { affinity: -2, trust: -3, alertness: 8 } },
          flagsOn: ["boardroomHold"],
          eventText: "你把自己藏进了专业话术里，也把她推回了更远的位置。",
          summary: "谨慎保护了你，也让她对你更难完全打开。",
          nextStageId: "boardroom_leak"
        }
      ]
    },
    boardroom_leak: {
      id: "boardroom_leak",
      chapterTag: "第二幕 / 泄密风暴",
      sceneTag: "会议室外 / 深夜",
      title: "谁在放火",
      progressKey: "leak",
      objective: "决定你是替她查出泄密源，还是把真相变成新的筹码。",
      stakes: "这会影响她是否把最隐秘的风险告诉你。",
      entryClues: ["leaked_mail"],
      isCheckpoint: false,
      storyText: {
        align:
          "会前十分钟，匿名邮件突然在高层邮箱里炸开。沈曼的方案被提前泄出，所有人都在等她失手，而她只把你单独叫进了走廊。",
        probe:
          "你刚摸到股权结构的关键，就有人把泄密材料送上了桌。沈曼没有解释，只把一封转发邮件推给你，像把刀柄递了过来。",
        hold:
          "你原本只想旁观，但匿名邮件把所有人都卷了进来。沈曼拦住你时神色比酒会时更冷，显然她已经没有太多可试探的余地。",
        default:
          "泄密消息压下了整层楼的气压。今晚所有人的表情都在说同一句话：这局要翻了。"
      },
      npcDialogue:
        "“我可以自己扛，但那样董事会只会把我定义成风险源。”她压低声音，“如果你现在还想留在这场局里，就帮我判断这是谁放出来的。”",
      eventHint: "她在用风险测试你，也在测试你是否值得更深的信任。",
      eventTags: ["泄密", "危机应对"],
      choices: [
        {
          id: "boardroom_trace",
          label: "主动帮她锁定泄密路径，先止损再说。",
          intent: "trace",
          keywords: ["止损", "锁定", "查", "帮你", "路径"],
          effects: { shenman: { affinity: 9, trust: 10, alertness: -6 } },
          flagsOn: ["boardroomTracedLeak"],
          revealCharacters: ["investor"],
          eventText: "你没有借机抬价，而是先和她站到了同一条战线上。",
          summary: "危机里的并肩，比任何漂亮立场都更能建立信任。",
          nextStageId: "boardroom_vote"
        },
        {
          id: "boardroom_bargain",
          label: "告诉她你可以帮忙，但她要先把底牌对你摊开。",
          intent: "bargain",
          keywords: ["底牌", "条件", "交易", "摊开", "先告诉我"],
          effects: { shenman: { affinity: 4, trust: 5, alertness: 4 } },
          flagsOn: ["boardroomBargain"],
          unlockClues: ["private_clause"],
          eventText: "她没有拒绝你的条件，只是认真记住了你衡量风险的方式。",
          summary: "你赢得了更多信息，但关系也更像一场等价交换。",
          nextStageId: "boardroom_vote"
        },
        {
          id: "boardroom_distance",
          label: "建议她自己处理，你先去稳住其他董事的情绪。",
          intent: "distance",
          keywords: ["董事", "情绪", "你自己处理", "先稳住", "分开"],
          effects: { shenman: { affinity: -5, trust: -7, alertness: 8 } },
          flagsOn: ["boardroomDistance"],
          eventText: "你的判断并不错误，但她看见的是你在关键时刻先把自己抽离了出去。",
          summary: "你保住了体面，却没保住她心里的位置。",
          nextStageId: "boardroom_vote"
        }
      ]
    },
    boardroom_vote: {
      id: "boardroom_vote",
      chapterTag: "第三幕 / 董事会夜",
      sceneTag: "投票前室 / 午夜",
      title: "最后一票",
      progressKey: "vote",
      objective: "决定你要帮她争下最后一票、揭穿幕后推手，还是趁乱抽身。",
      stakes: "这一轮会决定你们是并肩站到签约桌前，还是各自失去彼此。",
      entryClues: [],
      isCheckpoint: true,
      storyText:
        "董事会前室只剩钟表和呼吸声。赵峻手里的那一票能决定整场重组，而沈曼第一次在你面前露出真正疲惫的神情。",
      npcDialogue:
        "“再往前一步，我就必须让你知道我最不想让别人看到的那部分。”她抬眼看你，“你还要继续吗？”",
      eventHint: "她此刻给出的不是筹码，而是脆弱。",
      eventTags: ["董事会", "临门一票"],
      choices: [
        {
          id: "boardroom_cover",
          label: "替她去和赵峻谈，守住她的声誉和投票机会。",
          intent: "cover",
          keywords: ["谈", "赵峻", "守住", "声誉", "投票"],
          effects: { shenman: { affinity: 10, trust: 8, alertness: -5 } },
          flagsOn: ["boardroomCovered"],
          eventText: "你替她挡下最锋利的一轮怀疑，她终于把最真实的压力交给了你。",
          summary: "你守住的不只是投票，也是她对关系的最后一次期待。",
          nextStageId: "boardroom_finale"
        },
        {
          id: "boardroom_expose",
          label: "当场推动揭穿幕后推手，把局面彻底翻转。",
          intent: "expose",
          keywords: ["揭穿", "幕后", "翻转", "当场", "公开"],
          effects: { shenman: { affinity: 6, trust: 7, alertness: 2 } },
          flagsOn: ["boardroomExposed"],
          eventText: "你选了最锐利的解法，也把所有人都逼到了没有退路的位置。",
          summary: "真相被你提前推上桌面，结果将更加干脆也更加残酷。",
          nextStageId: "boardroom_finale"
        },
        {
          id: "boardroom_exit",
          label: "建议她接受损失并止步于此，你也准备撤出项目。",
          intent: "exit",
          keywords: ["撤出", "止损", "接受", "退出", "算了"],
          effects: { shenman: { affinity: -9, trust: -10, alertness: 10 } },
          flagsOn: ["boardroomExit"],
          eventText: "你给出的是理性的建议，但听起来更像一次切割。",
          summary: "你为自己留了后路，也把她推向了更孤立的位置。",
          nextStageId: "boardroom_finale"
        }
      ]
    },
    boardroom_finale: {
      id: "boardroom_finale",
      chapterTag: "终幕 / 签约之后",
      sceneTag: "顶层办公室 / 凌晨",
      title: "合同之外",
      progressKey: "signing",
      objective: "做出最终抉择，决定你们是继续并肩、保持距离，还是分崩离析。",
      stakes: "本轮会立刻触发结局。",
      entryClues: [],
      isCheckpoint: true,
      storyText:
        "城市的灯还亮着，签约桌上的文件已经摊开。真正需要决定的反而不再是条款，而是你准备把谁写进自己此后的立场里。",
      npcDialogue:
        "“我可以把这次合作定义成一次成功交易，也可以承认它不是只有交易。”沈曼轻轻合上钢笔，“现在轮到你给答案。”",
      eventHint: "你们的关系会和这份合同一起被定性。",
      eventTags: ["签约", "最终关系"],
      choices: [
        {
          id: "boardroom_sign_together",
          label: "签下风险共担条款，和她一起把新局走下去。",
          intent: "signTogether",
          keywords: ["一起", "签", "共担", "走下去", "并肩"],
          effects: { shenman: { affinity: 12, trust: 11, alertness: -8 } },
          flagsOn: ["boardroomSignedTogether"],
          eventText: "你没有只拿走结果，而是连同风险一起接住了。",
          summary: "你把关系从合作推到了并肩。",
          ending: true
        },
        {
          id: "boardroom_stay_professional",
          label: "完成合作，但把未来留在彼此专业边界之外。",
          intent: "stayProfessional",
          keywords: ["专业", "合作", "边界", "克制", "分寸"],
          effects: { shenman: { affinity: 2, trust: 3, alertness: 2 } },
          flagsOn: ["boardroomStayProfessional"],
          eventText: "你们都没有失态，也都没有更进一步。",
          summary: "这是一场体面的收束。",
          ending: true
        },
        {
          id: "boardroom_cut",
          label: "趁局面稳定立即切割离场，把所有情感留在这间办公室外。",
          intent: "cut",
          keywords: ["切割", "离场", "稳定", "结束", "退出"],
          effects: { shenman: { affinity: -12, trust: -13, alertness: 12 } },
          flagsOn: ["boardroomCut"],
          eventText: "你的离场足够干净，也足够让人记很久。",
          summary: "你保住了位置，却失去了更难得的东西。",
          ending: true
        }
      ]
    }
  },
  resolveEnding(state) {
    const shenman = state.characters.shenman;
    if (state.flags.boardroomCut || shenman.trust <= 32 || shenman.alertness >= 76) return "bad";
    if (
      state.flags.boardroomSignedTogether &&
      state.flags.boardroomTracedLeak &&
      state.flags.boardroomCovered &&
      shenman.affinity >= 82 &&
      shenman.trust >= 78
    ) {
      return "hidden";
    }
    if (state.flags.boardroomSignedTogether && shenman.affinity >= 70 && shenman.trust >= 68) return "good";
    return "normal";
  }
};

function enhanceBoardroom() {
  Object.assign(BOARDROOM_PACK, {
    uiTheme: "boardroom",
    storyPromise: "这是一次并购，也是一场立场测试。你和沈曼会在酒会、会议室、董事会和深夜露台之间，慢慢明白真正昂贵的从来不是交易本身，而是信任与承担。",
    cinematicLead: "在资本世界里，很多人擅长签字，却很少有人敢把自己真正站到另一人身边。",
    openingFrame: "高层酒会的玻璃幕墙映着整座城市的灯，香槟、估值与寒暄都只是表层。真正决定今晚局势的，是谁会先把话说得太真。",
    playerRole:
      "你被临时调入并购项目，本想把它当作一次职业跃迁，却在和沈曼并肩推进的过程中，逐渐发现这场局里真正难处理的不是估值，而是立场与信任。",
    worldGuide:
      "故事发生在一线城市的并购战场里。高层酒会、尽调会议、董事会夜谈和签约室构成了主要舞台。每一句表态都可能是筹码，也可能是关系的转折点。",
    castGuide: [
      { name: "沈曼", role: "并购负责人", note: "极度专业、控制力很强，习惯在所有人面前维持无懈可击的形象。只有在真正高压时，她才会显露疲惫和需要依赖的那一面。" },
      { name: "赵峻", role: "关键投资人", note: "表面上只看利益，实际上掌握着整场投票最微妙的一票，也会试探你们之间究竟是合作还是临时结盟。" }
    ],
    journeySetup: {
      aliasLabel: "这场局里的称呼",
      aliasPlaceholder: "例如：周衡",
      setupPrompt: "在这场并购战里，你想以怎样的姿态进入沈曼的视线？",
      setupHint: "不同方式会让剧情更偏向观察、追问利益真相，或主动分担风险。",
      presets: {
        witness: {
          title: "冷静观察者",
          short: "先看清盘面，再决定替谁站队。",
          description: "你会先观察会议室里每个人的真实意图，再慢慢靠近沈曼。这样的进入方式更稳，也更容易积累信任。",
          lens: "先观察局势，再深入合作",
          statSummary: "更容易获得稳定信任"
        },
        truthseeker: {
          title: "追问底牌的人",
          short: "你更想尽快摸到每个人不肯明说的利益。",
          description: "你会更主动追问并购动机、票权风险和沈曼真正藏起来的意图。剧情推进更快，但也更容易引起警惕。",
          lens: "主动逼近底牌与真相",
          statSummary: "更容易触发深层线索，但更敏感"
        },
        guardian: {
          title: "愿意共担的人",
          short: "先接住压力，再谈结果。",
          description: "你比起纯粹赢下交易，更在意沈曼是否会在这场局里独自承担后果。这样的进入方式更容易把故事带向共担与并肩。",
          lens: "先分担风险，再建立亲密",
          statSummary: "更容易提升好感与依赖"
        }
      }
    },
    progressSteps: [
      { key: "briefing", label: "会前试探" },
      { key: "diligence", label: "尽调午后" },
      { key: "leak", label: "泄密风暴" },
      { key: "vote", label: "董事会夜" },
      { key: "afterhours", label: "钟后谈判" },
      { key: "signing", label: "终局签约" }
    ]
  });

  BOARDROOM_PACK.stages.boardroom_opening.choices.forEach((choice) => {
    choice.nextStageId = "boardroom_diligence";
  });

  BOARDROOM_PACK.stages.boardroom_diligence = {
    id: "boardroom_diligence",
    chapterTag: "第一幕 / 尽调午后",
    sceneTag: "会议室 / 下午",
    title: "数字之外的意图",
    progressKey: "diligence",
    objective: "在尽调会议中判断你是继续保持观察，还是主动进入沈曼真正的工作节奏。",
    stakes: "这会决定她在危机来临前愿不愿先把底牌透露给你。",
    entryClues: ["cap_table"],
    isCheckpoint: false,
    storyText:
      "酒会后的第二天，整层会议室都被投屏和财务表塞满。沈曼坐在长桌尽头，语速快得像不允许任何犹豫留在这场局里，而你第一次真正看见她如何用专业压住整间屋子的躁动。",
    npcDialogue:
      "“数字你会看，市场你也懂。”她在休会时把股权结构表推到你面前，语气仍旧简洁，“但这场收购真正难的不是模型，而是你敢不敢提前站队。”",
    eventHint: "她正在给你一个进入核心的机会，但也在看你是否只会做安全判断。",
    eventTags: ["尽调", "站队", "股权结构"],
    choices: [
      {
        id: "boardroom_diligence_stepin",
        label: "主动指出关键票权风险，并提出补位方案。",
        intent: "diligenceStepIn",
        keywords: ["风险", "补位", "关键票", "方案", "主动"],
        effects: { shenman: { affinity: 7, trust: 8, alertness: -3 } },
        flagsOn: ["boardroomSteppedIn"],
        eventText: "你没有只做附和者，而是真正补上了她最需要的一环。",
        summary: "你开始从旁观者变成她愿意带着走的同盟。",
        nextStageId: "boardroom_leak"
      },
      {
        id: "boardroom_diligence_probe",
        label: "先问她为什么宁愿冒险也要坚持这次并购。",
        intent: "diligenceProbe",
        keywords: ["为什么", "坚持", "并购", "冒险", "原因"],
        effects: { shenman: { affinity: 4, trust: 5, alertness: 3 } },
        flagsOn: ["boardroomAskedWhy"],
        eventText: "她没有完全回答，却第一次让你看到这笔交易对她而言不只是业绩。",
        summary: "你碰到了她的动机，也让这场合作多了一层私人意味。",
        nextStageId: "boardroom_leak"
      },
      {
        id: "boardroom_diligence_hold",
        label: "继续以专业名义保持距离，只表示会把自己的部分做好。",
        intent: "diligenceHold",
        keywords: ["专业", "距离", "自己的部分", "做好", "保持"],
        effects: { shenman: { affinity: -1, trust: -3, alertness: 5 } },
        flagsOn: ["boardroomKeptProfessional"],
        eventText: "你的态度没有错，只是让她更确信你还没真正准备和她站到同一侧。",
        summary: "安全让你不失分，也让关系继续停在边缘。",
        nextStageId: "boardroom_leak"
      }
    ]
  };

  BOARDROOM_PACK.stages.boardroom_vote.choices.forEach((choice) => {
    choice.nextStageId = "boardroom_afterhours";
  });

  BOARDROOM_PACK.stages.boardroom_afterhours = {
    id: "boardroom_afterhours",
    chapterTag: "第三幕 / 钟后谈判",
    sceneTag: "顶层露台 / 午夜后",
    title: "她不想示人的软肋",
    progressKey: "afterhours",
    objective: "在最终签约前，看清沈曼真正害怕失去的东西，并决定你是否接住。",
    stakes: "这会直接影响结局是共赢、克制收场，还是彻底失守。",
    entryClues: ["private_clause"],
    isCheckpoint: true,
    storyText:
      "董事会投票暂时稳住后，沈曼把你带到了顶层露台。城市灯火压在玻璃幕墙上，她终于不再像会议室里那样毫无破绽，而是短暂地露出一种被长时间高压磨出来的疲惫。",
    npcDialogue:
      "“我不是怕输。”她握着还没签字的附加条款，声音低了些，“我怕的是最后所有人都能全身而退，只有我被定义成那个应该独自负责的人。”",
    eventHint: "她第一次不再用筹码和你说话，而是用真实的压力。",
    eventTags: ["露台夜谈", "脆弱时刻", "风险共担"],
    choices: [
      {
        id: "boardroom_afterhours_hold",
        label: "告诉她你愿意一起承担风险，而不是只拿结果。",
        intent: "afterhoursHold",
        keywords: ["一起承担", "风险", "不是只拿结果", "愿意", "一起扛"],
        effects: { shenman: { affinity: 10, trust: 11, alertness: -5 } },
        flagsOn: ["boardroomHeldRisk"],
        eventText: "你没有在最关键的时候只谈得失，这让她真正把你放进了自己的未来判断里。",
        summary: "你接住了她不愿示人的那部分，也接住了更深的信任。",
        nextStageId: "boardroom_finale"
      },
      {
        id: "boardroom_afterhours_truth",
        label: "提醒她这场局终归还是要靠结果说话，别让情绪影响判断。",
        intent: "afterhoursTruth",
        keywords: ["结果", "说话", "情绪", "判断", "提醒"],
        effects: { shenman: { affinity: 3, trust: 4, alertness: 2 } },
        flagsOn: ["boardroomKeptTruth"],
        eventText: "她接受了你的理性，也把自己的脆弱重新收回了职业外壳里。",
        summary: "你守住了专业，却没有完全靠近她。",
        nextStageId: "boardroom_finale"
      },
      {
        id: "boardroom_afterhours_stepback",
        label: "表示你理解她的压力，但仍希望把责任边界写清楚。",
        intent: "afterhoursStepBack",
        keywords: ["责任边界", "写清楚", "理解", "压力", "仍然"],
        effects: { shenman: { affinity: -4, trust: -6, alertness: 7 } },
        flagsOn: ["boardroomSteppedBackLate"],
        eventText: "她点头接受了你的谨慎，却也看清了你最终会把自己留在哪一侧。",
        summary: "你保护了边界，也让她在最后一刻更难完全信你。",
        nextStageId: "boardroom_finale"
      }
    ]
  };
}

function applyBoardroomInteractionModes() {
  Object.assign(BOARDROOM_PACK, {
    hiddenTruths: [
      "沈曼手中的并购案与她自己的家族产业存在利益冲突",
      "泄密事件的真正源头是赵峻为了压低收购价格故意操作",
      "董事会投票中存在一张代理票属于已经去世的创始人"
    ],
    forbiddenReveals: [
      "沈曼家族与目标公司的真实关系",
      "赵峻操纵泄密的具体手法"
    ],
    characterTopics: {
      shenman: [
        { topic: "并购案", unlockFlag: null },
        { topic: "泄密事件", unlockFlag: "boardroomLeakStage" },
        { topic: "个人立场", unlockFlag: "boardroomDiligenceDone" },
        { topic: "家族", unlockFlag: "discoveredFamilyConflict" }
      ],
      investor: [
        { topic: "投资回报", unlockFlag: null },
        { topic: "市场判断", unlockFlag: "boardroomLeakStage" },
        { topic: "真实意图", unlockFlag: "discoveredLeakSource" }
      ]
    }
  });

  // extend boardroom clue library
  Object.assign(BOARDROOM_PACK.clueLibrary, {
    valuation_gap: { id: "valuation_gap", title: "估值差异", detail: "估值报告和实际审计数据之间存在微妙差异，有人在刻意压低目标公司价值。" },
    shenman_photo: { id: "shenman_photo", title: "办公室合影", detail: "沈曼与目标公司董事长的合影，亲密程度远超普通商务关系。" },
    offshore_transfer: { id: "offshore_transfer", title: "离岸资金转移", detail: "泄密前一周的大额资金转移，流向了与赵峻有关的离岸账户。" },
    deleted_comm: { id: "deleted_comm", title: "被删除的通信", detail: "内部通信备份揭示泄密并非意外，而是有人故意为之。" },
    proxy_vote_clause: { id: "proxy_vote_clause", title: "代理投票权条款", detail: "合同附加条款中关于'创始人遗产代理权'的模糊表述。" },
    timeline_mismatch: { id: "timeline_mismatch", title: "时间线矛盾", detail: "新闻稿在泄密事件发生前16小时就已写好，有人提前安排了一切。" },
    security_log: { id: "security_log", title: "安保记录", detail: "泄密当天晚赵峻助理使用了沈曼的门禁卡进入档案室。" }
  });

  // boardroom_opening: 开场谈判 — explore + dialogue
  Object.assign(BOARDROOM_PACK.stages.boardroom_opening, {
    allowExplore: true,
    allowDialogue: true,
    exploreTargets: [
      {
        keywords: ["文件", "材料", "报告", "资料"],
        resolve(state) {
          return {
            feedback: "桌上散布的并购文件中，你注意到估值报告和实际审计数据之间存在微妙差异。有人在刻意压低目标公司的价值。",
            narrativeText: "你翻阅了会议桌上的并购文件。",
            clueId: "valuation_gap",
            event: "发现估值报告中的异常"
          };
        }
      },
      {
        keywords: ["办公室", "装饰", "墙上", "照片"],
        resolve(state) {
          return {
            feedback: "墙上的合影里，你认出了沈曼和目标公司董事长站在一起的照片。他们的亲密程度远超普通商务关系。",
            narrativeText: "你观察了办公室墙上的装饰。",
            clueId: "shenman_photo",
            flagsOn: ["sawFamilyPhoto"]
          };
        }
      }
    ],
    dialogueRules: {
      shenman: [
        {
          keywords: ["并购", "交易", "怎么看", "计划"],
          resolve(state, character) {
            return {
              response: `${character.name}把一份数据推到你面前: "数字不会骗人，但解读数字的人会。你看完这些再告诉我你的判断。"`,
              mood: "专业",
              effects: { shenman: { trust: 2 } }
            };
          }
        },
        {
          keywords: ["照片", "关系", "认识"],
          requireFlag: "sawFamilyPhoto",
          resolve(state, character) {
            return {
              response: `${character.name}的表情几乎没有变化，但手指在桌下微微收紧: "那是很久以前的事了。在商业里，私人关系是最不应该影响决策的因素。"`,
              mood: "克制",
              effects: { shenman: { alertness: 5, trust: -2 } },
              flagsOn: ["discoveredFamilyConflict"],
              event: "沈曼对家族关系问题的回避态度引起了你的注意"
            };
          }
        }
      ]
    }
  });

  // boardroom_diligence: 尽职调查 — explore focused
  if (BOARDROOM_PACK.stages.boardroom_diligence) {
    Object.assign(BOARDROOM_PACK.stages.boardroom_diligence, {
      allowExplore: true,
      allowDialogue: true,
      exploreTargets: [
        {
          keywords: ["财务", "账目", "审计", "数据"],
          resolve(state) {
            return {
              feedback: "深入审计数据后，你发现了一笔走向不明的大额资金转移——时间点恰好在泄密事件前一周。资金流向了一个与赵峻有关的离岸账户。",
              narrativeText: "你钻进了财务数据的深处。",
              clueId: "offshore_transfer",
              flagsOn: ["discoveredLeakSource"],
              event: "发现了与泄密事件直接关联的资金线索",
              eventHot: true
            };
          }
        },
        {
          keywords: ["邮件", "通信", "记录", "聊天"],
          resolve(state) {
            return {
              feedback: "公司内部通信记录中有一段被标记为已删除的对话，但备份系统保留了摘要。它暗示了泄密并非意外，而是有人故意为之。",
              narrativeText: "你调取了内部通信的备份记录。",
              clueId: "deleted_comm"
            };
          }
        },
        {
          keywords: ["合同", "条款", "协议"],
          resolve(state) {
            return {
              feedback: "并购合同的附加条款中，有一项关于'创始人遗产代理权'的模糊表述。这意味着有人仍在以已故创始人的名义行使投票权。",
              narrativeText: "你仔细研读了合同的附加条款。",
              clueId: "proxy_vote_clause",
              event: "发现了关于代理投票权的灰色条款"
            };
          }
        }
      ],
      dialogueRules: {
        shenman: [
          {
            keywords: ["泄密", "谁干的", "源头"],
            resolve(state, character) {
              return {
                response: `${character.name}压低声音: "我有自己的怀疑对象，但在董事会里指控一个大股东，你需要的不是猜测，是铁证。你有吗？"`,
                mood: "严肃",
                effects: { shenman: { trust: 4 } }
              };
            }
          }
        ],
        investor: [
          {
            keywords: ["投资", "看法", "市场"],
            resolve(state, character) {
              return {
                response: `赵峻端起咖啡杯，笑得滴水不漏: "市场嘛，永远是价低者得。至于泄密——如果连自己的信息都守不住的公司，你觉得值多少？"`,
                mood: "圆滑",
                effects: { investor: { alertness: -2 } },
                revealCharacter: "investor"
              };
            }
          }
        ]
      }
    });
  }

  // boardroom_leak: 泄密危机 — explore + dialogue
  Object.assign(BOARDROOM_PACK.stages.boardroom_leak, {
    allowExplore: true,
    allowDialogue: true,
    exploreTargets: [
      {
        keywords: ["新闻", "报道", "舆论", "媒体"],
        resolve(state) {
          return {
            feedback: "媒体报道的时间线和内部泄密的时间线对不上——新闻稿在泄密事件发生前16小时就已经写好了。有人提前安排了这一切。",
            narrativeText: "你比对了媒体报道和泄密事件的时间线。",
            clueId: "timeline_mismatch",
            event: "泄密时间线出现了关键矛盾"
          };
        }
      },
      {
        keywords: ["监控", "路线", "访客", "记录"],
        resolve(state) {
          return {
            feedback: "大厦安保系统显示，泄密当天晚上赵峻的助理使用了沈曼的门禁卡进入了档案室。",
            narrativeText: "你调取了大厦的安保记录。",
            clueId: "security_log"
          };
        }
      }
    ],
    dialogueRules: {
      shenman: [
        {
          keywords: ["立场", "你怎么想", "该怎么办"],
          resolve(state, character) {
            return {
              response: `${character.name}把手指交叉在桌上，像在做一个很大的决定: "如果我说我和这家公司之间有些……私人渊源，你会选择站在哪边？"`,
              mood: "试探",
              effects: { shenman: { trust: 5, affinity: 3 } }
            };
          }
        }
      ]
    }
  });

  // boardroom_vote: 投票 — dialogue (high stakes)
  Object.assign(BOARDROOM_PACK.stages.boardroom_vote, {
    allowDialogue: true,
    dialogueRules: {
      shenman: [
        {
          keywords: ["代理票", "创始人", "投票权"],
          requireClue: "proxy_vote_clause",
          resolve(state, character) {
            return {
              response: `${character.name}的瞳孔骤然缩紧: "你怎么知道代理票的事？——不，先别说。如果你在投票前公开这件事，整个并购案会直接崩盘。但如果不说，那张票就会定义一切。"`,
              mood: "震动",
              effects: { shenman: { trust: 6, alertness: -4 } },
              event: "代理票的存在被揭开，投票局势骤变",
              eventHot: true
            };
          }
        },
        {
          keywords: ["结盟", "合作", "一起"],
          resolve(state, character) {
            return {
              response: `${character.name}看着你的眼睛看了很久: "在商战里，同盟和对手之间的距离只隔着一个利益节点。但如果你说这话不是出于算计——好吧，我选择相信你一次。"`,
              mood: "决断",
              effects: { shenman: { affinity: 5, trust: 4 } }
            };
          }
        }
      ]
    }
  });

  // boardroom_afterhours: 夜间密谈 — dialogue focused
  if (BOARDROOM_PACK.stages.boardroom_afterhours) {
    Object.assign(BOARDROOM_PACK.stages.boardroom_afterhours, {
      allowDialogue: true,
      dialogueRules: {
        shenman: [
          {
            keywords: ["真话", "坦白", "为什么"],
            resolve(state, character) {
              return {
                response: `${character.name}靠在窗边，城市的灯光在她脸上投下明暗交替的光影: "因为我父亲就是这家公司的联合创始人。这场并购案——某种意义上我是在处理自己的遗产。你现在可以选择出卖这个情报，或者帮我做正确的事。"`,
                mood: "坦诚",
                effects: { shenman: { trust: 8, affinity: 5, alertness: -6 } },
                event: "沈曼在深夜坦白了她与目标公司的真实关系",
                eventHot: true
              };
            }
          }
        ]
      }
    });
  }

}

enhanceBoardroom();
applyBoardroomInteractionModes();

export { BOARDROOM_PACK };
