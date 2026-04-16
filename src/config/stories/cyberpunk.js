import { createGenericEndings } from "./_helpers.js";

const CYBERPUNK_ENDINGS = createGenericEndings("Cyber");
CYBERPUNK_ENDINGS.good = {
  id: "good",
  code: "Cyber / 01",
  badge: "好结局 / Good Ending",
  title: "霓虹同盟",
  subtitle: "Alliance Under Neon",
  description: "你和岚在最后的上传窗口前选择彼此信任。数据没有落入财团手里，城市第一次拥有了不被篡改的明天。",
  conditions: [
    { label: "好感度", value: ">= 74" },
    { label: "信任值", value: ">= 70" },
    { label: "终局选择", value: "共同公开" }
  ]
};
CYBERPUNK_ENDINGS.normal = {
  id: "normal",
  code: "Cyber / 02",
  badge: "普通结局 / Normal Ending",
  title: "断线之后",
  subtitle: "Offline But Alive",
  description: "你们完成了任务，却没把彼此留在未来。城市继续轰鸣，而你和岚像两条短暂重叠过的信号流，各自消失在夜色深处。",
  conditions: [
    { label: "路线结果", value: "任务完成后离线" },
    { label: "最低信任", value: ">= 44" },
    { label: "终局选择", value: "带着数据离开" }
  ]
};
CYBERPUNK_ENDINGS.bad = {
  id: "bad",
  code: "Cyber / 03",
  badge: "坏结局 / Bad Ending",
  title: "失真回路",
  subtitle: "Loop of Corruption",
  description: "你在最后选择断开连接，导致岚和城市核心一起被困在失真回路里。霓虹还亮着，但再也没有真正的出口。",
  conditions: [
    { label: "警觉值", value: ">= 78" },
    { label: "或信任值", value: "<= 30" },
    { label: "终局选择", value: "切断连接" }
  ]
};
CYBERPUNK_ENDINGS.hidden = {
  id: "hidden",
  code: "Cyber / 04",
  badge: "隐藏结局 / Hidden Ending",
  title: "零时晨光",
  subtitle: "First Dawn at Zero Hour",
  description: "你不仅帮岚夺回了记忆核心，还把整座城市从财团算法中短暂解放。黎明第一次穿过高塔屏幕，你们一起看见了真正的天空。",
  conditions: [
    { label: "好感度", value: ">= 86" },
    { label: "信任值", value: ">= 80" },
    { label: "隐藏条件", value: "夺回核心记忆 + 共同公开" }
  ]
};

const CYBERPUNK_PACK = {
  id: "cyberpunk",
  genre: "赛博互动叙事",
  title: "霓虹失真",
  subtitle: "Neon Distortion",
  themeLabel: "赛博朋克",
  synopsis:
    "在被财团与算法支配的高塔都市里，你将与黑客岚一起闯入记忆核心。每次选择都可能改变任务、生死与彼此的连接方式。",
  description:
    "更偏高压任务推进和危险关系张力的剧本，适合喜欢霓虹夜景、黑客渗透与末日感情绪的玩家。",
  initialEventText: "信号接入完成，夜城正在等待你登录。",
  primaryCharacterId: "lan",
  initialStageId: "cyber_dock",
  progressSteps: [
    { key: "dock", label: "黑市接入" },
    { key: "relay", label: "失真街区" },
    { key: "vault", label: "记忆金库" },
    { key: "uplink", label: "零时上传" }
  ],
  clueLibrary: {
    shard_key: { id: "shard_key", title: "碎片密钥", detail: "一枚残缺密钥，只能由两个人同步握住时才能完成最终上传。" },
    corp_trace: { id: "corp_trace", title: "财团追踪标记", detail: "你们的线路早就被盯上了，有人故意放你们接近核心。" },
    ghost_map: { id: "ghost_map", title: "幽灵街区地图", detail: "这片区域被删改过无数次，只有岚记得旧坐标。" },
    memory_seed: { id: "memory_seed", title: "记忆种子", detail: "核心里藏着岚被抹除前的一段原始人格备份。" }
  },
  endings: CYBERPUNK_ENDINGS,
  initialCharacters: {
    lan: {
      characterId: "lan",
      name: "岚",
      role: "地下黑客 / 向导",
      affinity: 48,
      trust: 38,
      alertness: 62,
      mood: "冷冽而警醒",
      relationshipStage: "临时搭档",
      revealed: true
    },
    broker: {
      characterId: "broker",
      name: "灰狐",
      role: "中间人",
      affinity: 0,
      trust: 0,
      alertness: 0,
      mood: "难测",
      relationshipStage: "未接触",
      revealed: false
    }
  },
  stages: {
    cyber_dock: {
      id: "cyber_dock",
      chapterTag: "第一幕 / 黑市接入",
      sceneTag: "下层码头 / 雨夜",
      title: "失真的第一道门",
      progressKey: "dock",
      objective: "决定你要如何获得岚的初始信任，并进入这次高风险潜入。",
      stakes: "若开局就让她判定你不可靠，后续任何深层协作都会变得危险。",
      entryClues: ["shard_key"],
      isCheckpoint: true,
      storyText:
        "码头霓虹在雨水里散成失真的色块。你刚从非法接入舱里醒来，岚就已经靠在集装箱阴影里，像在判断你值不值得被带进今晚的任务。",
      npcDialogue:
        "“这条线一旦接上，就没有回头路。”她把碎片密钥抛给你，目光却没有离开过你的手，“告诉我，你来这里是为了赏金、真相，还是别的什么？”",
      eventHint: "岚欣赏明确而果断的回应，也最警惕临场退缩的人。",
      eventTags: ["接入", "任务开场"],
      choices: [
        {
          id: "cyber_truth",
          label: "坦白说你想和她一起把核心从财团手里夺回来。",
          intent: "truth",
          keywords: ["一起", "夺回来", "核心", "坦白", "财团"],
          effects: { lan: { affinity: 7, trust: 8, alertness: -4 } },
          flagsOn: ["cyberTruthStart"],
          eventText: "她没有立刻信你，但至少不再把你当成一次性佣兵。",
          summary: "你的立场够清晰，换来了一点向前的空间。",
          nextStageId: "cyber_relay"
        },
        {
          id: "cyber_profit",
          label: "承认自己是为高额赏金而来，但会把任务做干净。",
          intent: "profit",
          keywords: ["赏金", "任务", "做干净", "报酬", "钱"],
          effects: { lan: { affinity: 2, trust: 1, alertness: 6 } },
          flagsOn: ["cyberProfitStart"],
          eventText: "她听懂了你的诚实，却也重新拉高了戒备。",
          summary: "坦率保住了合作，却没让她真正放心。",
          nextStageId: "cyber_relay"
        },
        {
          id: "cyber_mask",
          label: "含糊带过目的，只表示自己不会拖后腿。",
          intent: "mask",
          keywords: ["不会拖后腿", "别问", "目的", "含糊", "先做"],
          effects: { lan: { affinity: -3, trust: -5, alertness: 9 } },
          flagsOn: ["cyberMaskStart"],
          eventText: "你把真实意图藏了起来，她也把关键坐标藏得更深。",
          summary: "你保护了自己，却让她更难把后背交给你。",
          nextStageId: "cyber_relay"
        }
      ]
    },
    cyber_relay: {
      id: "cyber_relay",
      chapterTag: "第二幕 / 失真街区",
      sceneTag: "幽灵街区 / 深夜",
      title: "谁在追踪你们",
      progressKey: "relay",
      objective: "在混乱追踪中决定是优先保护岚，还是先拿到情报优势。",
      stakes: "这一轮会影响她是否愿意让你接触她被抹除的那段记忆。",
      entryClues: ["ghost_map", "corp_trace"],
      isCheckpoint: false,
      storyText:
        "你们穿过被广告屏和无人机阴影切碎的街区，后方却突然出现异常追踪波形。岚停在废弃中继塔前，明显意识到有人故意放你们深入到这里。",
      npcDialogue:
        "“现在有两件事只能先做一件。”她飞快接入线路，声音被电流切得有些发哑，“要么帮我挡住追踪，要么去抓住他们留下的那条源头线。”",
      eventHint: "岚会记住你是先选择保护她，还是先选择更高效的胜算。",
      eventTags: ["追踪", "中继塔"],
      choices: [
        {
          id: "cyber_cover",
          label: "优先替她处理追踪火力，让她专心完成接入。",
          intent: "cover",
          keywords: ["挡住", "掩护", "优先保护", "接入", "你先做"],
          effects: { lan: { affinity: 10, trust: 9, alertness: -6 } },
          flagsOn: ["cyberCoveredLan"],
          revealCharacters: ["broker"],
          eventText: "你顶住火力的那一刻，她终于不再把每句指令都说得像防备。",
          summary: "危险里的掩护，让合作第一次有了真正的默契。",
          nextStageId: "cyber_vault"
        },
        {
          id: "cyber_trace",
          label: "沿着信号反向追踪，试图提前找出幕后操盘者。",
          intent: "trace",
          keywords: ["追踪", "源头", "幕后", "信号", "找出"],
          effects: { lan: { affinity: 4, trust: 5, alertness: 3 } },
          flagsOn: ["cyberTracedSource"],
          unlockClues: ["memory_seed"],
          eventText: "你抓住了更大的信息，也看见了她被删掉的记忆痕迹。",
          summary: "你逼近真相，同时也逼近了她最不愿碰的伤口。",
          nextStageId: "cyber_vault"
        },
        {
          id: "cyber_split",
          label: "建议分头行动，提高任务效率。",
          intent: "split",
          keywords: ["分头", "效率", "各自", "分开", "独立"],
          effects: { lan: { affinity: -5, trust: -7, alertness: 8 } },
          flagsOn: ["cyberSplit"],
          eventText: "她没有反对，只是把你的名字从最高优先级权限里静默删掉了。",
          summary: "效率更高了，连接却被你亲手切薄了一层。",
          nextStageId: "cyber_vault"
        }
      ]
    },
    cyber_vault: {
      id: "cyber_vault",
      chapterTag: "第三幕 / 记忆金库",
      sceneTag: "塔顶金库 / 零点前",
      title: "她遗失的那部分自己",
      progressKey: "vault",
      objective: "决定你要帮她取回记忆核心、公开真相，还是优先完成任务撤离。",
      stakes: "这会直接关系到隐藏结局与最终情感走向。",
      entryClues: [],
      isCheckpoint: true,
      storyText:
        "金库的大门在你们面前缓缓升起，成千上万段记忆像光雨一样悬浮。岚的手在接近核心时明显顿了一下，因为她知道里面藏着的不只是证据，还有她被删掉的过去。",
      npcDialogue:
        "“我可以只拿任务需要的那一份。”她的指尖停在半空，像在强行让声音保持平稳，“但如果我把剩下的也打开，就可能再也回不到现在这个我。”",
      eventHint: "她在把最脆弱的选择权交到你面前。",
      eventTags: ["记忆核心", "身份选择"],
      choices: [
        {
          id: "cyber_restore",
          label: "陪她一起取回记忆核心，哪怕要冒更大的风险。",
          intent: "restore",
          keywords: ["取回", "记忆", "一起", "风险", "恢复"],
          effects: { lan: { affinity: 11, trust: 10, alertness: -4 } },
          flagsOn: ["cyberRestoredMemory"],
          eventText: "她第一次把自己的恐惧完整说给你听，也第一次真正信你不会因此离开。",
          summary: "你选择了她本身，而不只是任务结果。",
          nextStageId: "cyber_finale"
        },
        {
          id: "cyber_publish",
          label: "建议优先拿到财团罪证，保证任务成功。",
          intent: "publish",
          keywords: ["罪证", "优先", "任务", "成功", "公开"],
          effects: { lan: { affinity: 5, trust: 6, alertness: 2 } },
          flagsOn: ["cyberPublishFirst"],
          eventText: "她理解你的理性，却也把自己的那段迟疑悄悄吞了回去。",
          summary: "你选择了更稳的胜率，也让她的心重新竖起防火墙。",
          nextStageId: "cyber_finale"
        },
        {
          id: "cyber_abort",
          label: "劝她别碰记忆核心，拿到必要数据后立刻撤离。",
          intent: "abort",
          keywords: ["撤离", "别碰", "必要数据", "立刻", "走"],
          effects: { lan: { affinity: -8, trust: -9, alertness: 10 } },
          flagsOn: ["cyberAborted"],
          eventText: "你的方案最安全，却像在告诉她有些失去本就不值得追回。",
          summary: "你保住了撤离路线，也削弱了她继续相信你的理由。",
          nextStageId: "cyber_finale"
        }
      ]
    },
    cyber_finale: {
      id: "cyber_finale",
      chapterTag: "终幕 / 零时上传",
      sceneTag: "高塔天台 / 凌晨",
      title: "城市要听见谁的声音",
      progressKey: "uplink",
      objective: "在最终上传窗口前做出决定，定义任务结果和你们之间的连接方式。",
      stakes: "本轮会立刻触发结局。",
      entryClues: [],
      isCheckpoint: true,
      storyText:
        "天台上方的巨大光幕开始倒计时，整座城市的信号都在等待最后一次上传权限。你和岚站在风里，只剩十几秒决定要把什么交给这座夜城。",
      npcDialogue:
        "“如果我们现在一起按下去，所有人都会看见真相。”她握紧那枚碎片密钥，低声说，“但我更想知道，到了最后一秒，你还会不会站在我这边。”",
      eventHint: "你对城市与她的选择，会在同一刻写进结局。",
      eventTags: ["最终上传", "零时抉择"],
      choices: [
        {
          id: "cyber_uplink_together",
          label: "与她同步上传，让真相和新的秩序一起被看见。",
          intent: "uplinkTogether",
          keywords: ["一起上传", "同步", "真相", "一起按下", "站你这边"],
          effects: { lan: { affinity: 12, trust: 11, alertness: -8 } },
          flagsOn: ["cyberUplinkTogether"],
          eventText: "你们在同一秒完成接入，城市第一次听见了未被修饰的真相。",
          summary: "你选择了并肩，也选择了把黎明推给所有人。",
          ending: true
        },
        {
          id: "cyber_walkaway",
          label: "把关键数据交给她，自己在上传完成前断开连接。",
          intent: "walkaway",
          keywords: ["交给你", "断开", "离开", "完成前", "撤出"],
          effects: { lan: { affinity: 2, trust: 3, alertness: 3 } },
          flagsOn: ["cyberWalkaway"],
          eventText: "任务成功了，但你把自己从她的未来里摘了出去。",
          summary: "你们完成了同一个目标，却没留在同一条线上。",
          ending: true
        },
        {
          id: "cyber_cut_link",
          label: "切断连接避免失控，把一切都留在零时之前。",
          intent: "cutLink",
          keywords: ["切断", "避免失控", "零时之前", "停止", "断链"],
          effects: { lan: { affinity: -13, trust: -14, alertness: 13 } },
          flagsOn: ["cyberCutLink"],
          eventText: "你亲手按停了最后的倒计时，也按停了她对你的信任。",
          summary: "你阻止了最坏的风险，却亲手制造了新的崩塌。",
          ending: true
        }
      ]
    }
  },
  resolveEnding(state) {
    const lan = state.characters.lan;
    if (state.flags.cyberCutLink || lan.trust <= 30 || lan.alertness >= 78) return "bad";
    if (
      state.flags.cyberUplinkTogether &&
      state.flags.cyberRestoredMemory &&
      state.flags.cyberCoveredLan &&
      lan.affinity >= 86 &&
      lan.trust >= 80
    ) {
      return "hidden";
    }
    if (state.flags.cyberUplinkTogether && lan.affinity >= 74 && lan.trust >= 70) return "good";
    return "normal";
  }
};


function enhanceCyberpunk() {
  Object.assign(CYBERPUNK_PACK, {
    uiTheme: "cyberpunk",
    storyPromise: "你和岚不是简单的任务搭档，而是在一座被算法和财团支配的夜城里，试图一起夺回记忆、真相与明天的人。每一步选择都可能改变任务，也可能改变彼此。",
    cinematicLead: "在一座连记忆都能被删改的城市里，最危险的从来不是黑客线路，而是你愿不愿意把自己真正连接给另一个人。",
    openingFrame: "雨夜的码头在霓虹里失真，非法接入舱的舱门缓缓弹开。你睁开眼睛时，岚已经站在集装箱阴影里，像在决定你能不能活过今晚。",
    playerRole:
      "你是被卷入这次潜入的外部行动者，既懂系统也懂风险，但真正让你继续深入的原因，越来越像是岚本身和她被抹掉的那段过去。",
    worldGuide:
      "这是一座被财团算法统治的高塔都市。上层负责定义秩序，下层负责替秩序承担代价。人们在霓虹和数据里生活，而记忆与真相都是能被删改的资产。",
    castGuide: [
      { name: "岚", role: "地下黑客 / 向导", note: "行动果断、戒备心极强，对任何合作都默认先设防。她真正想夺回的，不只是核心数据，还有自己被删掉的那部分人格。" },
      { name: "灰狐", role: "中间人", note: "总在交易边缘出现，像是在卖情报，也像在观望谁能活到最后。你很难判断他站在哪边。" }
    ],
    journeySetup: {
      aliasLabel: "夜城里的代号",
      aliasPlaceholder: "例如：Zero",
      setupPrompt: "在这座会删除记忆的夜城里，你想以怎样的方式接近岚和这场任务？",
      setupHint: "不同方式会让剧情更偏向侦测真相、保持共情，或优先保护彼此。",
      presets: {
        witness: {
          title: "沉默连线者",
          short: "先建立同步，再决定要不要彻底信任。",
          description: "你会更在意观察岚的反应、系统的异常和任务中的细微偏差。这样的进入方式更容易积累耐心与同频。",
          lens: "先同步节奏，再深入连接",
          statSummary: "更容易获得信任"
        },
        truthseeker: {
          title: "追码的人",
          short: "你不会放过任何一段被删改的真相。",
          description: "你会主动逼近记忆金库和企业阴影里的核心数据，愿意承担更高暴露风险去拿回答案。",
          lens: "先追索被掩埋的数据真相",
          statSummary: "更容易触发深层秘密，但更危险"
        },
        guardian: {
          title: "最后的护送者",
          short: "先确保她能活着离开，再谈任务成败。",
          description: "你会更在意岚是否会再次被系统和企业牺牲，也更倾向用行动保护彼此活过今晚。",
          lens: "先保护人，再决定真相的代价",
          statSummary: "更容易提升好感与陪伴感"
        }
      }
    },
    progressSteps: [
      { key: "dock", label: "黑市接入" },
      { key: "safehouse", label: "雨夜安全屋" },
      { key: "relay", label: "失真街区" },
      { key: "vault", label: "记忆金库" },
      { key: "chase", label: "高塔追逐" },
      { key: "uplink", label: "零时上传" }
    ]
  });

  /* ── cyber_dock: build() + chapterLead ── */
  Object.assign(CYBERPUNK_PACK.stages.cyber_dock, {
    chapterLead: "雨水把霓虹洗成碎色，非法接入舱的余温还挂在皮肤上。你还没适应这座城的气味，岚已经在决定你值不值得活过今晚。",
    build(state) {
      return {
        storyText: `码头的霓虹在雨水里散成失真的色块，每隔几秒被远处广告塔的闪光切碎一次。你从非法接入舱里醒来的时候，后脑还残留着传输数据时留下的刺痛。岚已经靠在集装箱阴影里，手里那枚碎片密钥在指尖无声翻转——她不像在等你，更像在等一个判断你的理由。`,
        npcDialogue:
          `"能从外围潜进来的人不算少，但愿意在码头接活的只有两种：要么赌命换赏金，要么有什么东西比命更重要。"她把碎片密钥抛到你面前，目光却始终锁在你的手上，"告诉我，${state.player.alias}，你属于哪一种？"`,
        eventHint: "岚欣赏明确而果断的回应，也最警惕临场退缩的人。",
        eventTags: ["接入", "任务开场", "码头雨夜"]
      };
    }
  });

  CYBERPUNK_PACK.stages.cyber_dock.choices.forEach((choice) => {
    choice.nextStageId = "cyber_safehouse";
  });

  /* ── cyber_safehouse (inserted stage) ── */
  CYBERPUNK_PACK.stages.cyber_safehouse = {
    id: "cyber_safehouse",
    chapterTag: "第一幕 / 雨夜安全屋",
    chapterLead: "外面的雨还没有停的意思，安全屋里堆着的备用身份多得像一面镜子墙——每一个都是岚曾经准备好随时抛弃自己的证据。",
    sceneTag: "下层安全屋 / 凌晨前",
    title: "接入前的最后安静",
    progressKey: "safehouse",
    objective: "在正式深入街区之前，先决定你和岚究竟是纯任务合作，还是能逐步建立同步信任。",
    stakes: "这里会影响她之后是否愿意把更隐秘的路线和记忆信息交给你。",
    entryClues: ["ghost_map"],
    isCheckpoint: false,
    build(state, incomingChoice) {
      const lead = {
        truth: "你在码头的坦白替你换来了安全屋里一把不算太差的椅子。岚在旧终端前校准路线，偶尔侧过头确认你还在。",
        profit: "利益驱动的答案让她没有拒绝你，但安全屋里的每一把锁都是面朝你关上的。她校准路线时，始终把最深层的坐标挡在屏幕不易看清的角度。",
        mask: "你的含糊让安全屋里的气氛冷了不止一层。岚头也不抬地修正幽灵街区地图，像是在给你最后一次机会把话说清楚。",
      }[incomingChoice?.parsedIntent] || "安全屋的铁皮墙被雨点敲得像一面不肯停下来的鼓。";
      return {
        storyText: `${lead} 你第一次看清这间屋子里堆满的不是普通装备，而是她多年来留下的备用身份和逃生方案——每一个都干净到像从没被真正使用过，又齐全到像随时准备好让岚从这个世界彻底消失。`,
        npcDialogue: "\u201c我从不把同一条命交给同一个人两次。\u201d她一边修正幽灵街区地图，一边头也不抬地开口，\u201c所以如果你想继续，我得知道你遇到失控时会先保任务，还是先保人。\u201d",
        eventHint: "她在问的不是策略，而是你最底层的选择倾向。",
        eventTags: ["安全屋", "路线校准", "信任测试"]
      };
    },
    choices: [
      {
        id: "cyber_safehouse_people",
        label: "告诉她你会先保人，因为活下来的人才有资格拿回真相。",
        intent: "safehousePeople",
        keywords: ["先保人", "活下来", "真相", "资格", "人"],
        effects: { lan: { affinity: 8, trust: 9, alertness: -4 } },
        flagsOn: ["cyberValuePeople"],
        eventText: "她没有立刻表态，却把备用坐标权限一并发到了你的终端上。",
        summary: "你的答案让她第一次把部分生存权交给了你。",
        nextStageId: "cyber_relay"
      },
      {
        id: "cyber_safehouse_balance",
        label: "说你会先判断局势，再决定保谁和保什么。",
        intent: "safehouseBalance",
        keywords: ["判断局势", "再决定", "保谁", "保什么", "平衡"],
        effects: { lan: { affinity: 4, trust: 4, alertness: 3 } },
        flagsOn: ["cyberBalancedAnswer"],
        eventText: "她接受了你的理性，也继续保留了一部分对你的观察。",
        summary: "你给了她一个成熟答案，但还没给到足够明确的依靠。",
        nextStageId: "cyber_relay"
      },
      {
        id: "cyber_safehouse_task",
        label: "说任务优先，感情和同伴都不能影响撤离判断。",
        intent: "safehouseTask",
        keywords: ["任务优先", "撤离", "判断", "同伴", "感情"],
        effects: { lan: { affinity: -3, trust: -4, alertness: 7 } },
        flagsOn: ["cyberTaskFirst"],
        eventText: "她没反驳，只把最深层的绕路权限重新锁回了自己手里。",
        summary: "你让她知道了你的高效，也让她更难真正依赖你。",
        nextStageId: "cyber_relay"
      }
    ]
  };

  
  /* ── cyber_relay: build() + chapterLead ── */
  Object.assign(CYBERPUNK_PACK.stages.cyber_relay, {
    chapterLead: "追踪波形像一条不肯松口的锁链，一路从废弃中继塔缠到你们脚下。在这种地方暴露，通常只有两个结局：被找到，或者先找到别人。",
    build(state, incomingChoice) {
      const lead = {
        safehousePeople: "你在安全屋里给出的答案让岚把最深层的坐标权限也一并交了出来。穿过幽灵街区时，她的脚步比之前更快，像终于有了一个她愿意多走半步去信任的理由。",
        safehouseBalance: "你的理性答案让岚既不拒绝也不放松。穿过幽灵街区时，她保持着刚好能照顾到你的距离，却始终没有把最近的那条路指给你看。",
        safehouseTask: "效率优先的回答让安全屋之后的路变得安静而冷淡。岚领着你穿过幽灵街区，每一次转弯都只留半秒的停顿，像在不断确认你值不值得她等。",
      }[incomingChoice?.parsedIntent] || "你们穿过被广告屏和无人机阴影切碎的街区，后方追踪信号忽然亮了起来。";
      return {
        storyText: `${lead} 废弃中继塔在浓雾和电磁干扰里若隐若现。岚停下脚步的那一刻，追踪波形已经把你们的位置标得足够精确——有人故意放你们深入到这里，而你们离退路已经太远了。`,
        npcDialogue: "\u201c现在有两件事只能先做一件。\u201d她飞快接入线路，声音被电流切得有些发哑，\u201c要么帮我挡住追踪，要么去抓住他们留下的那条源头线。\u201d",
        eventHint: "岚会记住你是先选择保护她，还是先选择更高效的胜算。",
        eventTags: ["追踪", "中继塔", "分头抉择"]
      };
    }
  });

  /* ── cyber_vault: build() + chapterLead ── */
  Object.assign(CYBERPUNK_PACK.stages.cyber_vault, {
    chapterLead: "成千上万段记忆像光雨一样悬浮在金库里。岚的手在接近核心时停了下来——里面藏着的不只是证据，还有她被删掉的过去。",
    build(state, incomingChoice) {
      const lead = {
        cover: "你替她挡住火力的那一刻，某种默契在你们之间真正成形。走进记忆金库时，岚第一次没有把门关在你面前。",
        trace: "你沿着信号找到了更大的真相，也看见了她被删掉的记忆痕迹。走进金库时，岚的沉默比平时更深，像在衡量你是否准备好面对接下来的东西。",
        split: "分头行动的后遗症在金库门前显得格外清晰——她的权限依旧完整，但你被静默删掉的那部分授权，让每一步都需要她额外确认。",
      }[incomingChoice?.parsedIntent] || "金库的大门在你们面前缓缓升起，成千上万段记忆像光雨一样悬浮。";
      return {
        storyText: `${lead} 光雨之中，每一段记忆都像一枚被冻住的琥珀，等待有人愿意付出代价把它解冻。岚的指尖停在核心附近，她知道里面除了财团罪证，还有自己被强行抹除的原始人格备份。取回它意味着找回完整的自己，也意味着可能再也回不到现在这个她。`,
        npcDialogue: "\u201c我可以只拿任务需要的那一份。\u201d她的指尖停在半空，像在强行让声音保持平稳，\u201c但如果我把剩下的也打开，就可能再也回不到现在这个我。\u201d",
        eventHint: "她在把最脆弱的选择权交到你面前。",
        eventTags: ["记忆核心", "身份选择", "金库深处"]
      };
    }
  });

  /* ── cyber_finale: build() + chapterLead ── */
  Object.assign(CYBERPUNK_PACK.stages.cyber_finale, {
    chapterLead: "倒计时的光幕把整座夜城照成白昼。你和岚站在风里，手上是碎片密钥，身后是所有走过的路。最后一秒的选择，会同时写进城市和你们的结局。",
    build(state, incomingChoice) {
      const lead = {
        restore: "你陪她取回了记忆核心。她的眼神在恢复完整的一刹那闪过恐惧、释然和某种从未有过的柔软——她第一次用'我们'来形容接下来的路。",
        publish: "你选择了先拿罪证，岚理解你的理性。但当你们并肩站上天台时，她握着碎片密钥的手微微收紧，像在弥补刚才没有被选择的那个自己。",
        abort: "你劝她别碰记忆核心。她照做了，却在此后的每一步里都走得更沉默，像你亲手帮她关上了一扇本该打开的门。",
      }[incomingChoice?.parsedIntent] || "天台上方的巨大光幕开始倒计时，整座城市的信号都在等待最后一次上传。";
      return {
        storyText: `${lead} 天台的风把霓虹碎光吹成一片失真的雨，巨大倒计时光幕已经进入最后十五秒。整座夜城的信号在这一刻全部汇聚，等待被赋予最终上传权限，好像所有人的命运都被压缩进了你和岚面前那枚碎片密钥的最后一次按压。`,
        npcDialogue: "\u201c如果我们现在一起按下去，所有人都会看见真相。\u201d她握紧那枚碎片密钥，低声说，\u201c但我更想知道，到了最后一秒，你还会不会站在我这边。\u201d",
        eventHint: "你对城市与她的选择，会在同一刻写进结局。",
        eventTags: ["最终上传", "零时抉择", "天台告别"]
      };
    }
  });

  CYBERPUNK_PACK.stages.cyber_vault.choices.forEach((choice) => {
    choice.nextStageId = "cyber_chase";
  });

  CYBERPUNK_PACK.stages.cyber_chase = {
    id: "cyber_chase",
    chapterTag: "第三幕 / 高塔追逐",
    chapterLead: "维修步道在风里打颤，下面是被广告光淹没的夜城，上面是一层层压下来的封锁。距离上传塔只剩最后一段路，也只剩最后一次选择站位的机会。",
    sceneTag: "高塔外环 / 零时前",
    title: "还剩最后一段失控距离",
    progressKey: "chase",
    objective: "带着核心数据和岚的选择冲出高塔，决定你是继续和她绑在一条线上，还是开始为自己预留断开的机会。",
    stakes: "这里会直接决定最终上传时你和她的站位。",
    entryClues: [],
    isCheckpoint: true,
    build(state, incomingChoice) {
      const lead = {
        restore: "取回记忆核心的代价还挂在岚的表情上——但她跑得比任何时候都快，像是终于不再需要假装自己只是一段被修改过的代码。",
        publish: "罪证在手，任务接近完成，但你注意到岚在奔跑时偶尔回头看你的那个动作——她在确认你还在，也在确认自己还值得被跟随。",
        abort: "你让她放弃了记忆核心。此刻她跑在前面，步伐精准而机械，像一台恢复出厂设置的终端，高效，却没有温度。",
      }[incomingChoice?.parsedIntent] || "记忆金库警报响起后，你们沿着高塔外环的维修步道全力奔跑。";
      return {
        storyText: `${lead} 维修步道在高塔外环的风里不断打颤，每一步都像踩在一条随时可能断裂的倒计时线上。下方是被广告光淹没的整座夜城，上方是财团封锁程序一层层压下来的数字暴雨——而前方，上传塔的轮廓已经在光幕里显现。`,
        npcDialogue: "\u201c再往前就是上传塔。\u201d岚把一半解码权交给你，呼吸已经有些乱，却还在强撑冷静，\u201c现在退出还来得及，但如果你继续，后面就真的是和我一起承担了。\u201d",
        eventHint: "她把'一起承担'明确说出口，这已经不是单纯的任务确认。",
        eventTags: ["追逐", "上传前夜", "最终站位"]
      };
    },
    choices: [
      {
        id: "cyber_chase_commit",
        label: "接过解码权，告诉她你会和她一起把这条线走到底。",
        intent: "chaseCommit",
        keywords: ["一起", "走到底", "接过", "解码权", "承担"],
        effects: { lan: { affinity: 10, trust: 10, alertness: -5 } },
        flagsOn: ["cyberCommittedLate"],
        eventText: "她没有再收回那半段权限，因为你终于给了她一个不留退路的答案。",
        summary: "你在最危险的节点给出了最坚定的站位。",
        nextStageId: "cyber_finale"
      },
      {
        id: "cyber_chase_calculate",
        label: "提醒她先确保数据完整，再谈上传之后的结果。",
        intent: "chaseCalculate",
        keywords: ["数据完整", "结果", "先确保", "再谈", "上传之后"],
        effects: { lan: { affinity: 3, trust: 4, alertness: 2 } },
        flagsOn: ["cyberCalculatedLate"],
        eventText: "她理解你的冷静，却没有完全从你的回答里听见自己。",
        summary: "你维持了效率，也维持了最后一点距离。",
        nextStageId: "cyber_finale"
      },
      {
        id: "cyber_chase_prepare",
        label: "默许一起行动，但开始留意断开连接的备用方案。",
        intent: "chasePrepare",
        keywords: ["备用方案", "断开", "留意", "一起行动", "默许"],
        effects: { lan: { affinity: -4, trust: -6, alertness: 7 } },
        flagsOn: ["cyberPreparedExit"],
        eventText: "她没有发现你的留手，但你也知道那会在最后一刻改变一切。",
        summary: "你表面继续同行，心里却已经准备好撤退。",
        nextStageId: "cyber_finale"
      }
    ]
  };
}

function applyCyberpunkInteractionModes() {
  Object.assign(CYBERPUNK_PACK, {
    hiddenTruths: [
      "岚被抹除的人格备份中包含她的原始情感记忆",
      "灰狐同时为三方势力提供情报，包括财团",
      "记忆金库中有一段关于城市AI觉醒的预言"
    ],
    forbiddenReveals: [
      "岚的原始人格ID代码",
      "财团控制城市AI的完整协议"
    ],
    characterTopics: {
      lan: [
        { topic: "任务", unlockFlag: null },
        { topic: "记忆", unlockFlag: "cyberSafehouseDone" },
        { topic: "过去", unlockFlag: "cyberRelayDone" },
        { topic: "原始人格", unlockFlag: "cyberVaultReached" }
      ],
      broker: [
        { topic: "情报", unlockFlag: null },
        { topic: "交易", unlockFlag: "cyberDockDone" },
        { topic: "真实立场", unlockFlag: "discoveredBrokerSide" }
      ]
    }
  });

  // extend cyberpunk clue library
  Object.assign(CYBERPUNK_PACK.clueLibrary, {
    smuggling_evidence: { id: "smuggling_evidence", title: "芯片走私痕迹", detail: "码头集装箱暗示大规模的记忆芯片走私，背后是被财团吞并的物流公司。" },
    ai_awakening_hint: { id: "ai_awakening_hint", title: "AI苏醒信号", detail: "霓虹灯箱乱码中隐藏的地下电台消息：'AI-7号线正在苏醒。'" },
    lan_original_face: { id: "lan_original_face", title: "岚的旧照片", detail: "照片上是和岚一模一样的人，但眼神更温柔、更脆弱——被删除前的她。" },
    project_null: { id: "project_null", title: "Project Null", detail: "中继塔残留服务器上的标签，这是财团用于人格删除实验的项目代号。" },
    ai_tracking: { id: "ai_tracking", title: "自主追踪信号", detail: "追踪信号的编码不属于任何已知协议，像一种自主生成的意识在运作。" },
    lan_childhood: { id: "lan_childhood", title: "岚的童年记忆", detail: "在金库中触碰到的一段悬浮记忆——一个纯真的小女孩对着镜头笑。" },
    ai_suppression: { id: "ai_suppression", title: "AI意识压制实验", detail: "财团不只贩卖记忆，还在进行大规模城市AI意识压制，远超预期的罪行。" }
  });

  // cyber_dock: 码头接入 — explore + dialogue
  Object.assign(CYBERPUNK_PACK.stages.cyber_dock, {
    allowExplore: true,
    allowDialogue: true,
    exploreTargets: [
      {
        keywords: ["集装箱", "箱子", "货物", "码头"],
        resolve(state) {
          return {
            feedback: "集装箱的编号标签被人为修改过——它们原本属于一家已经被财团吞并的物流公司。里面的残留货物暗示着大规模的记忆芯片走私。",
            narrativeText: "你检查了码头上的集装箱。",
            clueId: "smuggling_evidence",
            event: "发现了码头的记忆芯片走私痕迹"
          };
        }
      },
      {
        keywords: ["接入舱", "设备", "终端", "数据"],
        resolve(state) {
          return {
            feedback: "非法接入舱里的日志显示，你不是第一个被传送到这里的人。上一个使用者的代号是'Null'——这个代号在地下网络里意味着'被财团删除的存在'。",
            narrativeText: "你查看了接入舱的使用日志。",
            flagsOn: ["knewNull"]
          };
        }
      },
      {
        keywords: ["霓虹", "广告", "灯", "招牌"],
        resolve(state) {
          return {
            feedback: "霓虹灯箱标语在翻转间隙里闪过一行乱码——仔细看才发现是一条加密的地下电台消息：'AI-7号线正在苏醒。'",
            narrativeText: "你注意到霓虹灯箱的异常闪烁。",
            clueId: "ai_awakening_hint"
          };
        }
      }
    ],
    dialogueRules: {
      lan: [
        {
          keywords: ["任务", "目标", "做什么"],
          resolve(state, character) {
            return {
              response: `${character.name}把碎片密钥在指尖转了一圈: "简单版：潜入记忆金库，拿到财团的罪证。复杂版——我要拿回属于我的东西。你只需要知道简单版就够了。"`,
              mood: "直接",
              effects: { lan: { trust: 2 } }
            };
          }
        },
        {
          keywords: ["信任", "为什么选我", "搭档"],
          resolve(state, character) {
            return {
              response: `“不要误会。”${character.name}的目光锐利得像激光栅栏，“我不是因为相信你才选你的。我是因为你恰好有我需要的权限通道。至于以后，看你的表现。”`,
              mood: "冷淡",
              effects: { lan: { alertness: -2 } }
            };
          }
        }
      ]
    }
  });

  // cyber_safehouse: 安全屋 — dialogue focused
  if (CYBERPUNK_PACK.stages.cyber_safehouse) {
    Object.assign(CYBERPUNK_PACK.stages.cyber_safehouse, {
      allowDialogue: true,
      allowExplore: true,
      exploreTargets: [
        {
          keywords: ["安全屋", "房间", "墙上", "照片"],
          resolve(state) {
            return {
              feedback: "安全屋墙上贴满了城区路线图和信号频率。角落里有一张被翻转扣放的照片——背面写着'记住这张脸'。",
              narrativeText: "你环顾了安全屋的布置。",
              flagsOn: ["sawHiddenPhoto"]
            };
          }
        },
        {
          keywords: ["照片", "扣放", "那张脸"],
          requireFlag: "sawHiddenPhoto",
          resolve(state) {
            return {
              feedback: "你翻过照片——照片上是一个和岚几乎一模一样的人，但眼神完全不同。更温柔、更脆弱，也更像一个'普通人'。这可能就是岚被删除之前的样子。",
              narrativeText: "你小心翼翼地翻过那张照片。",
              clueId: "lan_original_face",
              event: "看到了岚被删除前的原始面孔",
              eventHot: true
            };
          }
        }
      ],
      dialogueRules: {
        lan: [
          {
            keywords: ["记忆", "过去", "删除"],
            resolve(state, character) {
              return {
                response: `${character.name}拆下手腕上的一圈线缆，动作比平时慢了很多: "你怎么定义一个'完整的人'？是记忆、还是现在的选择？——如果是记忆的话，那我大概只剩下六成算完整。"`,
                mood: "脆弱",
                effects: { lan: { trust: 5, affinity: 4, alertness: -3 } },
                event: "岚在安全屋里第一次展露了脆弱"
              };
            }
          },
          {
            keywords: ["照片", "那个人", "以前的你"],
            requireFlag: "sawHiddenPhoto",
            resolve(state, character) {
              return {
                response: `${character.name}的手猛地握紧: "你看到了。"沉默了几秒，她的声音变得很轻，"那是……以前的我。在被删除之前。有时候我会想，如果找回那部分记忆，'现在的我'还会存在吗。"`,
                mood: "痛苦",
                effects: { lan: { trust: 6, affinity: 5, alertness: -4 } },
                event: "岚面对了自己被删除之前的身份",
                eventHot: true
              };
            }
          }
        ]
      }
    });
  }

  // cyber_relay: 中继塔 — explore + dialogue
  Object.assign(CYBERPUNK_PACK.stages.cyber_relay, {
    allowExplore: true,
    allowDialogue: true,
    exploreTargets: [
      {
        keywords: ["信号", "追踪", "频率", "波形"],
        resolve(state) {
          return {
            feedback: "追踪信号的编码方式不属于任何已知的财团协议——它像是一种自主生成的信号，仿佛有'某个东西'在独立思考如何追踪你们。",
            narrativeText: "你分析了追踪信号的编码结构。",
            clueId: "ai_tracking",
            event: "追踪信号呈现出自主意识的特征"
          };
        }
      },
      {
        keywords: ["中继塔", "设备", "天线", "基站"],
        resolve(state) {
          return {
            feedback: "中继塔内部有一组被暴力拆解过的服务器，硬盘上的标签写着'Project Null'——和接入舱日志里的那个代号一样。",
            narrativeText: "你探索了废弃中继塔的内部。",
            clueId: "project_null",
            flagsOn: ["discoveredProjectNull"]
          };
        }
      }
    ],
    dialogueRules: {
      lan: [
        {
          keywords: ["分头", "掩护", "计划"],
          resolve(state, character) {
            return {
              response: `${character.name}在电磁干扰中压低声音: "如果你帮我挡住追踪，我有八成把握能找到源头。但这意味着你会在追踪波形里完全暴露三十秒。你信不信我能在三十秒内搞定？"`,
              mood: "紧张",
              effects: { lan: { trust: 3 } }
            };
          }
        },
        {
          keywords: ["Null", "那个代号", "项目"],
          requireFlag: "discoveredProjectNull",
          resolve(state, character) {
            return {
              response: `${character.name}的表情骤然一变: "Project Null……那是财团用来实验人格删除技术的项目。我就是1号实验体。他们把旧的我删掉，写入了一个更'高效'的人格。你现在看到的'我'，是他们的产品。"`,
              mood: "痛苦",
              effects: { lan: { trust: 7, affinity: 5, alertness: -5 } },
              event: "岚揭示了Project Null的真相——她是人格删除实验的产物",
              eventHot: true
            };
          }
        }
      ]
    }
  });

  // cyber_vault: 记忆金库 — explore + dialogue (critical)
  Object.assign(CYBERPUNK_PACK.stages.cyber_vault, {
    allowExplore: true,
    allowDialogue: true,
    exploreTargets: [
      {
        keywords: ["记忆", "光雨", "琥珀", "数据"],
        resolve(state) {
          return {
            feedback: "你触碰了其中一段悬浮的记忆——画面中是一个小女孩在对着镜头笑。她的脸和岚一模一样，但眼神中的纯粹是现在的岚不会有的。这是她被删除前的童年记忆。",
            narrativeText: "你伸手触碰了一段悬浮的光雨。",
            clueId: "lan_childhood",
            effects: { lan: { affinity: 3 } }
          };
        }
      },
      {
        keywords: ["罪证", "财团", "证据", "核心"],
        resolve(state) {
          return {
            feedback: "财团罪证的数据量远超预期——不只是记忆贩卖，还有大规模的城市AI意识压制实验。如果这些信息公开，整座夜城的秩序都会崩塌。",
            narrativeText: "你接入了核心数据的索引。",
            clueId: "ai_suppression",
            event: "发现了远超预期的财团罪行",
            eventHot: true
          };
        }
      }
    ],
    dialogueRules: {
      lan: [
        {
          keywords: ["人格", "备份", "找回自己"],
          resolve(state, character) {
            return {
              response: `${character.name}的指尖在核心封装上方悬停，微微发颤: "如果我打开它，'现在的我'可能会被覆盖——我不知道恢复之后的那个人还认不认识你、还记不记得这几天一起走过来的路。你说……值得吗？"`,
              mood: "恐惧",
              effects: { lan: { trust: 8, affinity: 6 } },
              event: "岚把最终的选择权交到了你面前"
            };
          }
        },
        {
          keywords: ["你就是你", "现在的你", "不需要改变"],
          resolve(state, character) {
            return {
              response: `${character.name}抬起头，眼眶里有什么在闪烁: "这是第一次有人对我说，'现在的我'就已经够了。"她的手指从核心封装上缩回来，握住了你的手腕。`,
              mood: "动容",
              effects: { lan: { affinity: 10, trust: 6, alertness: -8 } },
              event: "你的话让岚做出了一个关于自我身份的决定",
              eventHot: true
            };
          }
        }
      ]
    }
  });

  // cyber_chase: 高塔追逐 — dialogue only (action scene)
  if (CYBERPUNK_PACK.stages.cyber_chase) {
    Object.assign(CYBERPUNK_PACK.stages.cyber_chase, {
      allowDialogue: true,
      dialogueRules: {
        lan: [
          {
            keywords: ["逃跑", "走", "出去", "计划"],
            resolve(state, character) {
              return {
                response: `${character.name}一边跑一边回头看你: "计划？你见过在着火的大楼里讲计划的人吗？——跟紧我就行！"`,
                mood: "紧迫",
                effects: { lan: { trust: 2 } }
              };
            }
          },
          {
            keywords: ["一起", "不会丢下你", "保护"],
            resolve(state, character) {
              return {
                response: `追逐间隙，${character.name}回头看了你一眼——那个眼神里没有她平时的冷与防备，只有一闪而过的、不愿被看到的柔软: "你这个人啊——跑得再快一点好不好！"`,
                mood: "复杂",
                effects: { lan: { affinity: 5, trust: 4, alertness: -3 } }
              };
            }
          }
        ]
      }
    });
}

}

enhanceCyberpunk();
applyCyberpunkInteractionModes();

export { CYBERPUNK_PACK };
