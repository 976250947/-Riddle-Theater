import { createGenericEndings } from "./_helpers.js";

const TINGWAN_ENDINGS = createGenericEndings("Tingwan");

TINGWAN_ENDINGS.good = {
  id: "good",
  code: "Tingwan / 01",
  badge: "阶段结局 / Good Ending",
  title: "灯下没有说破的话",
  subtitle: "Almost Said, Fully Understood",
  description:
    "前四章阶段结局。你没有把喜欢说成一句直白的告白，但许念已经听懂了你不会再退后的意思。雨夜开始的克制，到厨房对峙时终于有了明确方向。",
  conditions: [
    { label: "好感度", value: ">= 72" },
    { label: "信任值", value: ">= 68" },
    { label: "终局态度", value: "承认自己会当真" }
  ]
};

TINGWAN_ENDINGS.normal = {
  id: "normal",
  code: "Tingwan / 02",
  badge: "阶段结局 / Normal Ending",
  title: "把答案留到以后",
  subtitle: "Held Back, Not Gone",
  description:
    "前四章阶段结局。你们都知道这段关系已经不再只是合租室友，却还是把最关键的一步留在了以后。故事停在高张力的留白上。",
  conditions: [
    { label: "路线结果", value: "保持靠近但暂不摊牌" },
    { label: "最低信任", value: ">= 48" },
    { label: "终局态度", value: "先把今晚停在这里" }
  ]
};

TINGWAN_ENDINGS.bad = {
  id: "bad",
  code: "Tingwan / 03",
  badge: "阶段结局 / Bad Ending",
  title: "又一次退回门后",
  subtitle: "Back Behind the Door",
  description:
    "前四章阶段结局。你们差一点就把话说开，但你再次退了回去。许念察觉到你的在意，也同样看见了你的回避。",
  conditions: [
    { label: "警觉值", value: ">= 54" },
    { label: "或终局选择", value: "退回合租室友的位置" },
    { label: "阶段结果", value: "冲突被冷却" }
  ]
};

TINGWAN_ENDINGS.hidden = {
  id: "hidden",
  code: "Tingwan / 04",
  badge: "阶段结局 / Hidden Ending",
  title: "会当真的那个人",
  subtitle: "The One Who Means It",
  description:
    "前四章隐藏阶段结局。你一路没有躲开，也没有越界；雨夜的收留、雷声里的靠近、阳台上的记得与厨房里的那句“我会当真”，让许念第一次真正意识到，你这些年从未离开过。",
  conditions: [
    { label: "好感度", value: ">= 88" },
    { label: "信任值", value: ">= 80" },
    { label: "隐藏条件", value: "特殊待遇 + 雷雨靠近 + 阳台记得 + 会当真" }
  ]
};

const BASE_FORBIDDEN_REVEALS = [
  "不得跳转到后续章节或未发生的场景。",
  "不得改变当前 scene_card 规定的地点、时间、天气与关系阶段。",
  "不得让未在现场的人物突然进入当前 scene。",
  "前四章内不得直接表白、确认恋爱关系、拥抱、接吻或发生强烈肢体推进。",
  "自由回复只能被当前 scene 吸收，不能替代正式剧情推进结果。"
];

function splitParagraphs(text) {
  return String(text || "")
    .split(/\n\s*\n/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function createPublicScriptLines(text) {
  return splitParagraphs(text).map((paragraph) => ({ speaker: null, text: paragraph }));
}

function createScene(config) {
  return {
    ...config,
    dialogueLines() {
      return [...createPublicScriptLines(config.public_script), { type: "choices" }];
    },
    forbiddenReveals: [...BASE_FORBIDDEN_REVEALS, ...(config.forbiddenReveals || [])]
  };
}

function createChoice({ id, label, intent, keywords, effects, summary, nextStageId, flagsOn = [], eventText, ending = false }) {
  return {
    id,
    label,
    intent,
    keywords,
    effects: { xunian: effects },
    flagsOn,
    eventText: eventText || summary,
    summary,
    ...(ending ? { ending: true } : { nextStageId })
  };
}

const TINGWAN_PACK = {
  id: "tingwan",
  genre: "都市恋爱互动叙事",
  title: "听晚",
  subtitle: "When the Rain Brought You Back",
  themeLabel: "久别重逢",
  uiTheme: "tingwan",
  synopsis:
    "你是沈砚川。多年以前没能说出口的喜欢，在一场突如其来的雨夜里重新回到门前。许念拖着行李住进来之后，所有克制、试探和没有放下的旧情，都开始在同一屋檐下慢慢回潮。",
  description:
    "以标准剧本为主、支持选项推进与自由回复吸收的都市恋爱故事。当前已接入前四章，核心体验是雨夜重逢、合租日常、旧情回潮与周既明带来的第一轮现实压力。",
  initialEventText: "门铃响起时，你以为只是送错门的外卖。可门外站着的人，是许念。",
  primaryCharacterId: "xunian",
  initialStageId: "tingwan_1_1",
  progressSteps: [
    { key: "rain_reunion", label: "雨夜重逢" },
    { key: "shared_roof", label: "同一屋檐下" },
    { key: "old_feelings", label: "旧情回潮" },
    { key: "new_pressure", label: "她身边的人" }
  ],
  storyPromise:
    "这不是一个靠激烈戏剧冲突推进的恋爱故事，而是一段成年人在现实缝隙里重新靠近彼此的过程。你会在门口、客厅、厨房、阳台与深夜便签之间，慢慢看清什么叫“原来这些年都没过去”。",
  cinematicLead:
    "你以为已经被时间收好的情绪，往往只需要一次很轻的重逢，就会重新乱起来。",
  openingFrame:
    "临川的雨下得很突然。你深夜开门时，门外站着一个拖着行李箱、发尾沾着雨水的女孩。她抬起头，看着你，轻轻叫了一声：学长。",
  playerRole:
    "你是沈砚川，27 岁，建筑设计师。大学时你喜欢许念，却因为毕业前的家庭变故和现实压力没有把喜欢说出口。多年之后，你们在临川重新相遇，而这一次，她住进了你的家。",
  worldGuide:
    "故事发生在沿海一线城市临川。这里有拥挤的晚高峰、老旧却有人情味的居民区、风很大的江边步道、深夜亮灯的咖啡馆，以及被工作、租房、情绪表达障碍共同塑形的成年人生活。这个世界不悬浮，所有心动都要落在真实日常里。",
  castGuide: [
    {
      name: "许念",
      role: "女主 / 新媒体编辑",
      note: "温柔、独立、细腻，看似安静，实则边界分明。她曾经也对你有过心动，但始终不确定你当年的沉默意味着什么。"
    },
    {
      name: "周既明",
      role: "项目合作方 / 现实压力来源",
      note: "风趣、会说话、擅长提供情绪价值。前四章中他主要通过许念的转述进入叙事，成为你第一次明显产生介意的人。"
    },
    {
      name: "林知夏",
      role: "朋友 / 后续助攻",
      note: "咖啡店主理人。前四章仅保留存在感，不会大量出场。"
    }
  ],
  journeySetup: {
    aliasLabel: "代入名",
    aliasPlaceholder: "留空也可以直接代入沈砚川",
    setupPrompt: "重新站到许念面前时，你更想以怎样的方式靠近她？",
    setupHint: "这个选择会影响前期好感、信任和情绪推进方式，但不会改变故事的现实基调。",
    presets: {
      witness: {
        title: "慢慢靠近的人",
        short: "偏向克制、倾听与稳步升温。",
        description: "你不会急着把话说满，而是更擅长在细节里照顾她、记住她、给她留空间。这样的进入方式更容易积累信任。",
        lens: "先稳住气氛，再让她慢慢靠近",
        statSummary: "更容易获得信任与长期稳定推进"
      },
      truthseeker: {
        title: "不想再错过的人",
        short: "偏向追问旧事、主动试探真心。",
        description: "你不愿再让当年的误会继续停在模糊里，会更直接地触碰回忆、提问和关系边界。这样的进入方式更快推进，也更容易让气氛变得敏感。",
        lens: "把没说完的话一点点逼近",
        statSummary: "更容易触发高张力场面与直接试探"
      },
      guardian: {
        title: "先照顾她的人",
        short: "偏向体贴、安置与现实陪伴。",
        description: "你更愿意先用行动去照顾她，在生活细节里让她意识到自己在你这里是特别的。这样的进入方式更适合走温柔升温路线。",
        lens: "把喜欢藏进日常照顾里",
        statSummary: "更容易提升好感与安心感"
      }
    }
  },
  clueLibrary: {
    rain_arrival: { id: "rain_arrival", title: "雨夜行李箱", detail: "许念拖着行李出现在门外，这场重逢比记忆里任何一次想象都更突然。" },
    midnight_note: { id: "midnight_note", title: "深夜便签", detail: "热牛奶和门锁提示一起留在房门口，像这些年一直没改掉的习惯。" },
    breakfast_habit: { id: "breakfast_habit", title: "热牛奶习惯", detail: "你连她现在可能还在喝热牛奶这种事，都记得很清楚。" },
    thunder_step: { id: "thunder_step", title: "雷声里的靠近", detail: "她说自己不怕打雷，却在雷响时下意识站得离你更近。" },
    old_photo: { id: "old_photo", title: "旧照片", detail: "大学校庆的合照背面写着一句你当年不该写下、却一直没有划掉的话。" },
    fridge_notes: { id: "fridge_notes", title: "冰箱便签", detail: "那些看似琐碎的便签，把你们的生活慢慢贴成了带黏性的日常。" },
    balcony_memory: { id: "balcony_memory", title: "忘不了的细节", detail: "你记得她不吃香菜、不爱太甜的奶茶，也记得她紧张时会捏手指。" },
    zhou_name: { id: "zhou_name", title: "周既明的名字", detail: "一个被频繁提起的名字，让原本克制的关系第一次出现明显失衡。" },
    stance_question: { id: "stance_question", title: "立场问题", detail: "“我有什么立场说？”这句话一出口，室友关系就再也装不稳了。" }
  },
  endings: TINGWAN_ENDINGS,
  hiddenTruths: [
    "沈砚川大学时喜欢许念，直到现在也没有真正放下。",
    "许念曾对沈砚川动过心，但她一直不确定当年的沉默意味着什么。",
    "前四章的核心是克制升温与边界试探，而不是正式表白。"
  ],
  forbiddenReveals: BASE_FORBIDDEN_REVEALS,
  characterTopics: {
    xunian: [
      { topic: "临川的新工作与临时合租" },
      { topic: "大学时期的回忆", requireFlag: "tingwan_old_photo_seen" },
      { topic: "冰箱便签和共同生活的默契", requireFlag: "tingwan_fridge_notes" },
      { topic: "周既明带来的微妙压力", requireFlag: "tingwan_zhou_named" }
    ]
  },
  initialCharacters: {
    xunian: {
      characterId: "xunian",
      name: "许念",
      role: "新媒体编辑 / 临时合租室友",
      affinity: 36,
      trust: 34,
      alertness: 22,
      mood: "克制而礼貌",
      relationshipStage: "久别重逢",
      revealed: true
    },
    zhoujiming: {
      characterId: "zhoujiming",
      name: "周既明",
      role: "品牌策划经理 / 项目合作方",
      affinity: 0,
      trust: 0,
      alertness: 0,
      mood: "未登场",
      relationshipStage: "未接触",
      revealed: false
    },
    linzhixia: {
      characterId: "linzhixia",
      name: "林知夏",
      role: "咖啡店主理人 / 朋友",
      affinity: 0,
      trust: 0,
      alertness: 0,
      mood: "未登场",
      relationshipStage: "未接触",
      revealed: false
    }
  },
  stages: {
    tingwan_1_1: createScene({
      id: "tingwan_1_1",
      chapterTag: "第一章 · 雨夜重逢",
      sceneTag: "Scene 1-1 · 雨夜门口",
      title: "雨夜门口",
      progressKey: "rain_reunion",
      objective: "完成雨夜重逢，让许念先进屋，并建立“多年未见但旧情未散”的基调。",
      stakes: "你的回应会决定这场重逢更偏向温柔接住，还是退回礼貌距离。",
      entryClues: ["rain_arrival"],
      isCheckpoint: true,
      storyText:
        "临川的雨砸在门外，你本以为门铃只是送错的外卖。可门打开时，站在外面的却是许念。多年没有收拾干净的情绪，在这一刻被雨声重新敲乱。",
      npcDialogue: "……学长？",
      eventHint: "先让她进门，先把这场重逢稳住，别让旧情在第一秒就失控。",
      eventTags: ["雨夜重逢", "玄关", "旧情翻涌"],
      public_script: `临川的雨总下得很突然。

我改完最后一版图纸的时候，已经快十一点。窗外风把雨打在玻璃上，声音细碎又发闷。门铃响时，我以为是物业或者送错门的外卖。

可打开门的那一刻，我还是怔住了。

门外站着一个女孩。

米白色风衣的肩角已经湿了，发尾也带着雨水，身边立着一个二十八寸的行李箱。她显然在楼下折腾了很久，神色疲惫，眼里却还带着一点不愿示弱的冷静。

我一眼就认出了她。

许念。

她抬头看见我，也愣住了。

“……学长？”

我有几秒没说出话。

从看见她站在门口开始，我这些年自以为早就收拾好的情绪，就全乱了。

我侧开身，让出门口的位置。

“先进来。”我说，“外面冷。”

她像是这才回神，轻轻“嗯”了一声。

我伸手去接她的行李箱，她下意识握紧拉杆，像还没从重逢的冲击里缓过来。

“我来。”我又说了一遍。

这次她没再坚持。

门关上的时候，屋外的雨声被挡住了一半，客厅的暖光把她身上的狼狈也稍微柔和了一些。

我看了她一眼，尽量让自己的语气听起来和平时没什么两样。

“你怎么会来这里？”

“我来租房。”她低声说。

“联系你的人没说房东是谁？”

“没说。”

“联系我的人也没说租客是你。”

她低头理了理湿掉的袖口，似乎有点尴尬。

“原来的房子临时毁约了。我今天刚到临川，行李都带着，实在找不到别的地方。”她顿了顿，声音更轻了些，“如果不方便的话，我今晚先住酒店也行。”

“不用。”

我回答得比预想中更快。

她抬头看我。

我把她的行李箱拉进门内，握住拉杆的手用了点力，语气却尽量平静。

“都已经来了，先住下。”

她看着我，安静了两秒。

“谢谢。”

这两个字很轻，却让我胸口微微一沉。

因为太客气了。

客气得像我们只是多年不见的普通校友。

可她明明不是。`,
      scene_card: {
        chapter: "第一章《雨夜重逢》",
        scene: "Scene 1-1 雨夜门口",
        location: "公寓门外 / 玄关",
        time: "夜",
        weather: "雨",
        relationship_stage: "久别重逢，礼貌克制",
        emotional_tone: "潮湿、克制、旧情翻涌但不外露",
        current_goal: [
          "完成两人重逢",
          "让许念进入屋内",
          "建立多年未见但旧情未散的基调",
          "不要推进到表白或肢体越界"
        ],
        constraints: [
          "不可离开玄关/门口区域",
          "不可新增角色",
          "不可切换天气和服装",
          "不可触发告白、拥抱、牵手等过度推进"
        ]
      },
      visual_state: {
        background: "公寓玄关雨夜",
        characters: ["许念·风衣带雨", "沈砚川·深夜居家"],
        time: "夜",
        weather: "雨",
        emotion: "重逢冲击与克制礼貌"
      },
      presentCharacterIds: ["xunian"],
      characterTopics: {
        xunian: ["租房临时毁约", "多年未见的尴尬", "先进屋避雨"]
      },
      hiddenTruths: [
        "沈砚川看似平静，其实从开门起情绪就乱了。",
        "许念疲惫又拘谨，不会在这一场立刻热络。"
      ],
      forbiddenReveals: [
        "不可把关系推进到重逢之外。",
        "不可让许念立刻解释多年心意。"
      ],
      choices: [
        createChoice({
          id: "tingwan_1_1_warm",
          label: "先接过她的行李，把人稳稳接进门里。",
          intent: "warm",
          keywords: ["先进来", "拿行李", "别淋雨", "住下", "接住她"],
          effects: { affinity: 6, trust: 5, alertness: -3 },
          flagsOn: ["tingwan_rain_welcome"],
          summary: "你先处理她的狼狈，也先稳住了这场重逢的分寸。",
          nextStageId: "tingwan_1_2"
        }),
        createChoice({
          id: "tingwan_1_1_steady",
          label: "先问清情况，再让她先进来安顿。",
          intent: "steady",
          keywords: ["怎么回事", "问清楚", "先进屋", "慢慢说", "安顿"],
          effects: { affinity: 4, trust: 4, alertness: -1 },
          summary: "你没有失控，也没有疏离，只是把照顾放在了分寸里。",
          nextStageId: "tingwan_1_2"
        }),
        createChoice({
          id: "tingwan_1_1_guarded",
          label: "让开门口，但把语气收得更平一点。",
          intent: "guarded",
          keywords: ["进来吧", "先住下", "没关系", "礼貌", "分寸"],
          effects: { affinity: 1, trust: 1, alertness: 3 },
          summary: "你接住了她，却也保留了太明显的距离感。",
          nextStageId: "tingwan_1_2"
        })
      ]
    }),
    tingwan_1_2: createScene({
      id: "tingwan_1_2",
      chapterTag: "第一章 · 雨夜重逢",
      sceneTag: "Scene 1-2 · 客厅安置",
      title: "客厅安置",
      progressKey: "rain_reunion",
      objective: "降低初见的生硬感，让两人开始自然交谈，并暗示沈砚川记得许念过去的细节。",
      stakes: "若你过于急切，会破坏客厅里刚刚稳定下来的克制氛围。",
      storyText:
        "热水、客厅暖灯和几句试探性的闲谈，把这场雨夜重逢从冲击感里稍微拉回日常。可越是日常，越显得你记得她太多。",
      npcDialogue: "挺像你的。也有点不近人情。",
      eventHint: "让对话像日常一样自然，不必急着碰最深的那层。",
      eventTags: ["客厅", "安置", "轻微试探"],
      public_script: `我去厨房给她倒了杯热水。

她站在客厅中央，视线不动声色地扫过四周。屋子不算大，但很安静。茶几上放着没收好的设计图，沙发旁有一盏暖黄色落地灯，角落里摆着一盆长得很好的绿植。

这屋子太像我自己了。

干净、克制、没什么多余的东西。

我把热水放到她手边。

“先喝一点。”

“谢谢。”

她抱着杯子，指尖贴在杯壁上，像在借那点温度让自己慢慢缓下来。

空气安静了一会儿。

“你什么时候到临川的？”我问。

“今天下午。”

“工作定了？”

“嗯，下周入职。”

“哪家公司？”

“栖川传媒。”

我点了点头。

“离这里不远。”

她看着我，像是犹豫了一下，还是问：“你一直住这儿吗？”

“搬过一次，后来又换到这边。”

“挺像你的。”

“像我什么？”

“安静。”她低头笑了笑，“也有点不近人情。”

我看了她一眼。

“你以前也这么说过。”

“是吗？”

“嗯。”

她像是有些意外，随后又低头去喝水。那一瞬间，我忽然意识到，原来我连她几年前随口说过的话都还记得很清楚。

这不是个好习惯。

至少，对我来说不是。`,
      scene_card: {
        chapter: "第一章《雨夜重逢》",
        scene: "Scene 1-2 客厅安置",
        location: "客厅",
        time: "夜",
        weather: "雨夜室内",
        relationship_stage: "重逢后的试探期",
        emotional_tone: "安静、日常、轻微试探",
        current_goal: [
          "降低初见的生硬感",
          "让两人开始自然交谈",
          "暗示男主记得她过去的细节",
          "维持克制，不进入高强度暧昧"
        ],
        constraints: [
          "不可直接谈及我喜欢你",
          "不可离开客厅",
          "对话应该自然、日常、轻微试探"
        ]
      },
      visual_state: {
        background: "客厅暖灯",
        characters: ["许念·抱着热水杯", "沈砚川·夜归居家"],
        time: "夜",
        weather: "雨声被门隔开",
        emotion: "尴尬逐步放松"
      },
      presentCharacterIds: ["xunian"],
      characterTopics: {
        xunian: ["新工作", "客厅与居住氛围", "以前说过的话"]
      },
      hiddenTruths: ["男主连她几年前随口说过的话都记得。"],
      choices: [
        createChoice({
          id: "tingwan_1_2_ask",
          label: "继续顺着她的新工作和临川安排聊下去。",
          intent: "ask",
          keywords: ["工作", "入职", "临川", "公司", "安排"],
          effects: { affinity: 4, trust: 4, alertness: -1 },
          flagsOn: ["tingwan_knows_job"],
          summary: "你把话题放在现实落点上，让她更容易放松下来。",
          nextStageId: "tingwan_1_3"
        }),
        createChoice({
          id: "tingwan_1_2_echo",
          label: "顺着“不近人情”的玩笑回她一句。",
          intent: "echo",
          keywords: ["不近人情", "安静", "以前", "你也这么说过", "玩笑"],
          effects: { affinity: 5, trust: 2, alertness: 0 },
          summary: "你接住了她的玩笑，也让“你一直记得”这件事轻轻露了一角。",
          nextStageId: "tingwan_1_3"
        }),
        createChoice({
          id: "tingwan_1_2_slow",
          label: "把节奏放慢，只让热水和安静先留下来。",
          intent: "slow",
          keywords: ["先喝水", "慢慢来", "不急", "休息", "客厅"],
          effects: { affinity: 2, trust: 5, alertness: -1 },
          summary: "你没有逼近问题，而是先让她觉得这里可以待下来。",
          nextStageId: "tingwan_1_3"
        })
      ]
    }),
    tingwan_1_3: createScene({
      id: "tingwan_1_3",
      chapterTag: "第一章 · 雨夜重逢",
      sceneTag: "Scene 1-3 · 客房门口",
      title: "客房门口",
      progressKey: "rain_reunion",
      objective: "完成“住下”的落点，让重逢情绪留下尾钩。",
      stakes: "你们此刻说出口的每一句话，都可能让礼貌距离稍微松动，或者重新拉紧。",
      storyText:
        "客房门推开的那一刻，今晚这场意外终于有了落点。可越靠近“安顿好她”的完成时，你越意识到自己其实一点也不平静。",
      npcDialogue: "谢谢，沈砚川。",
      eventHint: "这一场要温柔收束，不要把本该留到后面的情绪提前说破。",
      eventTags: ["客房门口", "收尾", "尾钩"],
      public_script: `我把客房门推开。

“床单都是新的。”我说，“热水器开着，洗完早点休息。”

她站在门口，手还搭在行李箱拉杆上，像有很多想说的话堵在嘴边。可最后只是点了点头。

“好。”

我本来已经转身走了两步，还是停下来，回头看她。

“许念。”

“嗯？”

“欢迎来临川。”

她像是没想到我会说这个，微微怔了一下。

半晌，她轻轻笑了。

“谢谢，沈砚川。”

这是她这么多年第一次连名带姓地叫我。

我站在原地，忽然觉得心口某个地方被很轻地碰了一下。`,
      scene_card: {
        chapter: "第一章《雨夜重逢》",
        scene: "Scene 1-3 客房门口",
        location: "客房门口",
        time: "夜",
        weather: "雨夜室内",
        relationship_stage: "重逢初期，开始松动",
        emotional_tone: "轻柔、收束、余韵明确",
        current_goal: [
          "完成住下的落点",
          "让重逢情绪留尾钩",
          "暗示男主仍然在意她"
        ],
        constraints: [
          "关系仍处于重逢初期",
          "不可进一步深入谈心",
          "语气保持温柔、克制"
        ]
      },
      visual_state: {
        background: "客房门口暖光",
        characters: ["许念·扶着行李箱", "沈砚川·站在门外"],
        time: "夜",
        weather: "雨夜未停",
        emotion: "安顿后的轻微回响"
      },
      presentCharacterIds: ["xunian"],
      characterTopics: {
        xunian: ["客房安排", "欢迎来临川", "连名带姓的称呼"]
      },
      choices: [
        createChoice({
          id: "tingwan_1_3_welcome",
          label: "把“欢迎来临川”这句话说完整。",
          intent: "welcome",
          keywords: ["欢迎来临川", "欢迎", "叫她名字", "留下来", "临川"],
          effects: { affinity: 5, trust: 4, alertness: -2 },
          flagsOn: ["tingwan_named_welcome"],
          summary: "一句并不越界的话，让今晚忽然有了私人意味。",
          nextStageId: "tingwan_1_4"
        }),
        createChoice({
          id: "tingwan_1_3_rest",
          label: "把关心放在“早点休息”这种最稳妥的话里。",
          intent: "rest",
          keywords: ["早点休息", "热水器", "床单", "晚安", "休息"],
          effects: { affinity: 3, trust: 4, alertness: -1 },
          summary: "你没有多说，但该留给她的安心一分也没少。",
          nextStageId: "tingwan_1_4"
        }),
        createChoice({
          id: "tingwan_1_3_distance",
          label: "只点点头，把情绪压回到门后。",
          intent: "distance",
          keywords: ["点头", "先休息", "我走了", "没事", "分寸"],
          effects: { affinity: 1, trust: 1, alertness: 2 },
          summary: "你守住了分寸，也让这句谢谢更像礼貌而不是回声。",
          nextStageId: "tingwan_1_4"
        })
      ]
    }),
    tingwan_1_4: createScene({
      id: "tingwan_1_4",
      chapterTag: "第一章 · 雨夜重逢",
      sceneTag: "Scene 1-4 · 深夜便签",
      title: "深夜便签",
      progressKey: "rain_reunion",
      objective: "作为第一章收尾，暗示男主一直记得她，为第二章的情感升温留空间。",
      stakes: "你如何处理这张便签，会决定这场重逢是被你彻底压回去，还是被悄悄保留下来。",
      entryClues: ["midnight_note"],
      isCheckpoint: true,
      storyText:
        "夜深以后，热牛奶和便签一起停在她的房门口。你明知道自己写下的是不该暴露得这么早的习惯，却还是没有把纸抽回来。",
      npcDialogue: "",
      eventHint: "这是一场独自发生的收尾。重点不是动作本身，而是你为什么还记得。",
      eventTags: ["夜深", "便签", "男主独白"],
      public_script: `夜深以后，我把热牛奶放在她房门口，顺手压了一张便签。

写完之后，我盯着那张纸看了两秒，才发现自己写的是：

“门锁有点旧，晚上反锁要多转半圈。密码还是你以前总爱设的那组数字。”

我皱了皱眉，想把纸抽回来。

可手碰到边缘的时候，又停住了。

算了。

有些习惯本来就没改过。
也不是今天才开始的。`,
      scene_card: {
        chapter: "第一章《雨夜重逢》",
        scene: "Scene 1-4 深夜便签",
        location: "客房门外走廊",
        time: "深夜",
        weather: "雨夜室内",
        relationship_stage: "重逢初夜，男主独自失守一点点",
        emotional_tone: "安静、克制、轻微失控",
        current_goal: [
          "作为章节收尾",
          "暗示男主一直记得她",
          "给第二章升温留空间"
        ],
        constraints: [
          "仅表现男主独白和行动",
          "不需要许念出场",
          "不可让她当场回应"
        ]
      },
      visual_state: {
        background: "深夜走廊与门缝暖光",
        characters: ["沈砚川·独自站在门外"],
        time: "深夜",
        weather: "雨夜静下来",
        emotion: "独自心软"
      },
      allowDialogue: false,
      presentCharacterIds: [],
      hiddenTruths: ["他这些年没有改掉和她有关的习惯。"],
      forbiddenReveals: ["不可让许念出来接住这份情绪。"],
      choices: [
        createChoice({
          id: "tingwan_1_4_keep",
          label: "把便签留在门口，承认自己还是会记得。",
          intent: "keep",
          keywords: ["留便签", "热牛奶", "记得", "不抽回来", "习惯"],
          effects: { affinity: 4, trust: 2, alertness: -1 },
          flagsOn: ["tingwan_note_left"],
          summary: "你没有再把那点心软收回去。",
          nextStageId: "tingwan_2_1"
        }),
        createChoice({
          id: "tingwan_1_4_rest",
          label: "关灯回房，把这一夜先收好。",
          intent: "rest",
          keywords: ["回房", "休息", "关灯", "先这样", "收好"],
          effects: { affinity: 2, trust: 1, alertness: 0 },
          summary: "你把情绪压了回去，但并没有真正放下。",
          nextStageId: "tingwan_2_1"
        }),
        createChoice({
          id: "tingwan_1_4_pause",
          label: "站在门外停一会儿，再转身离开。",
          intent: "pause",
          keywords: ["停一会", "门外", "听一听", "再走", "犹豫"],
          effects: { affinity: 3, trust: 2, alertness: 0 },
          summary: "你没有敲门，只是承认自己比想象中更在意。",
          nextStageId: "tingwan_2_1"
        })
      ]
    }),
    tingwan_2_1: createScene({
      id: "tingwan_2_1",
      chapterTag: "第二章 · 同一屋檐下",
      sceneTag: "Scene 2-1 · 清晨厨房",
      title: "清晨厨房",
      progressKey: "shared_roof",
      objective: "建立同居日常感，展现男主对她习惯的熟悉，并制造轻微暧昧。",
      stakes: "太急会显得目的明显，太淡又会失去生活感升温。",
      entryClues: ["breakfast_habit"],
      isCheckpoint: true,
      storyText:
        "第二天的厨房像一个过于普通的清晨。可越是普通，越能显出你对她习惯的熟悉已经不只是“顺手”那么简单。",
      npcDialogue: "知道了，房东先生。",
      eventHint: "重点是自然、顺手、生活化，不要把暧昧写得太用力。",
      eventTags: ["清晨厨房", "同住日常", "轻微暧昧"],
      public_script: `第二天我照常起得很早。

锅里煎蛋的时候，身后传来很轻的脚步声。我回头，看见许念站在厨房门口，头发刚洗过，松松散散披在肩上，脸上没什么妆，眼神还有点刚睡醒的迷糊。

和大学时差不多。

安静的时候，整个人都有种很干净的感觉。

“醒了？”我问。

“嗯。”

“早餐快好了。”

她走过来，看了眼案板上的东西。

“你还会做这些？”

“人总要吃饭。”

她笑了一下。

我把热牛奶递给她。

她接过去喝了一口，眉眼稍微舒展了些。

“还是热牛奶？”我问。

她抬头看我。

“你怎么知道我现在还喝这个？”

“猜的。”

其实不是猜。

是记得。

她踮脚去拿上层柜子里的杯子，指尖差了一点。我从她身后伸手，把杯子拿下来递给她。

她接杯子时，手指轻轻碰到我。

只是一瞬间，她动作就顿了顿。

我装作没察觉，把锅里的鸡蛋翻了个面。

“地铁口在右边，走五分钟。”我说，“第一天上班别迟到。”

“知道了，房东先生。”

我偏头看她。

“别乱叫。”

她笑着问：“那叫什么？学长？”

我没接话。

因为这两个字从她嘴里出来，比我预想中更容易让人失去冷静。`,
      scene_card: {
        chapter: "第二章《同一屋檐下》",
        scene: "Scene 2-1 清晨厨房",
        location: "厨房",
        time: "清晨",
        weather: "室内晨光",
        relationship_stage: "日常共处初期",
        emotional_tone: "生活化、松弛、轻微心动",
        current_goal: [
          "建立同居日常感",
          "展现男主对她习惯的熟悉",
          "制造轻微暧昧但不越界"
        ],
        constraints: [
          "不可出现明显调情",
          "重点是自然、顺手、生活化",
          "不可直接摊开过去感情"
        ]
      },
      visual_state: {
        background: "厨房日景",
        characters: ["许念·晨起居家", "沈砚川·做早餐"],
        time: "清晨",
        weather: "晨光",
        emotion: "日常松弛里的心动"
      },
      presentCharacterIds: ["xunian"],
      characterTopics: {
        xunian: ["早餐与热牛奶", "上班路线", "房东先生的玩笑"]
      },
      choices: [
        createChoice({
          id: "tingwan_2_1_habit",
          label: "继续把关心放在她熟悉的生活习惯上。",
          intent: "habit",
          keywords: ["热牛奶", "早餐", "习惯", "还记得", "照顾"],
          effects: { affinity: 5, trust: 4, alertness: -1 },
          flagsOn: ["tingwan_habit_seen"],
          summary: "你没有说太多，却让“记得她”变成了一种很自然的存在。",
          nextStageId: "tingwan_2_2"
        }),
        createChoice({
          id: "tingwan_2_1_tease",
          label: "顺着她“房东先生”的叫法轻轻回逗一句。",
          intent: "tease",
          keywords: ["房东先生", "学长", "别乱叫", "逗她", "玩笑"],
          effects: { affinity: 4, trust: 2, alertness: 0 },
          summary: "厨房里那点好笑的气氛，让尴尬被生活感盖过去了。",
          nextStageId: "tingwan_2_2"
        }),
        createChoice({
          id: "tingwan_2_1_route",
          label: "把心思藏进上班路线和时间提醒里。",
          intent: "route",
          keywords: ["地铁口", "别迟到", "路线", "右边", "五分钟"],
          effects: { affinity: 2, trust: 5, alertness: -1 },
          summary: "你把关心说成了安排，反而更像会长期存在的东西。",
          nextStageId: "tingwan_2_2"
        })
      ]
    }),
    tingwan_2_2: createScene({
      id: "tingwan_2_2",
      chapterTag: "第二章 · 同一屋檐下",
      sceneTag: "Scene 2-2 · 夜归留灯",
      title: "夜归留灯",
      progressKey: "shared_roof",
      objective: "强化男主照顾感，让许念察觉自己在男主这里有些特殊。",
      stakes: "这场对话越自然，许念越容易意识到“特殊待遇”不是她的错觉。",
      storyText:
        "加班后的晚归、客厅里留着的灯和早就准备好的水果，把“照顾”这件事放到了没法装作没看见的程度。你一时没收住的话，也让今晚比往常更亮。",
      npcDialogue: "那我是不是该谢谢自己还有点特殊待遇？",
      eventHint: "允许轻微暧昧，但不能越过“试探期”的边界。",
      eventTags: ["夜归", "留灯", "特殊待遇"],
      public_script: `她第一天入职就加班到十点多。

门开的时候，我正坐在客厅改图。她换鞋的动作很慢，肩膀也微微垂着，一看就是累坏了。

“回来了。”我说。

“嗯。”她揉了揉脖子，“今天事情有点多。”

我起身去厨房，把切好的水果和热水端出来。

“先吃点东西。”

她看着我：“你怎么知道我没吃晚饭？”

“看得出来。”

她低头笑了笑，坐到餐桌边。

“沈砚川。”

“嗯？”

“你以前有这么会照顾人吗？”

我把水杯推到她面前，语气淡淡的。

“不是每个人都值得照顾。”

她怔了一下。

空气忽然安静了几秒。

我意识到自己这句话说快了，正想把它绕回去，却听见她轻声开口：

“那我是不是该谢谢自己还有点特殊待遇？”

我看着她。

她笑得很浅，可眼睛在灯下很亮。

“也许吧。”我说。

那天晚上回房以后，我很久都没继续画图。

因为她那句玩笑太轻了，反而更容易让人当真。`,
      scene_card: {
        chapter: "第二章《同一屋檐下》",
        scene: "Scene 2-2 夜归留灯",
        location: "客厅 / 餐桌",
        time: "夜",
        weather: "室内夜灯",
        relationship_stage: "试探期，开始出现特殊感",
        emotional_tone: "温柔照顾、轻微暧昧、话里有停顿",
        current_goal: [
          "强化男主照顾感",
          "让许念察觉自己有些特殊",
          "继续升温但不直接说喜欢"
        ],
        constraints: [
          "不可直接说喜欢",
          "允许轻微暧昧",
          "不可进入摊牌或告白"
        ]
      },
      visual_state: {
        background: "客厅夜灯与餐桌",
        characters: ["许念·加班后疲惫", "沈砚川·收起图纸"],
        time: "夜",
        weather: "室内留灯",
        emotion: "照顾与被特别对待"
      },
      presentCharacterIds: ["xunian"],
      characterTopics: {
        xunian: ["加班", "晚饭", "特殊待遇"]
      },
      choices: [
        createChoice({
          id: "tingwan_2_2_special",
          label: "不回避，让她知道自己确实被你另眼相待。",
          intent: "special",
          keywords: ["特殊待遇", "值得照顾", "不一样", "也许吧", "特别"],
          effects: { affinity: 6, trust: 4, alertness: -2 },
          flagsOn: ["tingwan_special_treatment"],
          summary: "你没有把那句话收回去，气氛因此比平时更像真的。",
          nextStageId: "tingwan_2_3"
        }),
        createChoice({
          id: "tingwan_2_2_feed",
          label: "把话题重新落回“先吃东西”这种照顾里。",
          intent: "feed",
          keywords: ["先吃", "别空着肚子", "热水", "水果", "照顾"],
          effects: { affinity: 3, trust: 4, alertness: -1 },
          summary: "你把情绪压在照顾后面，让暧昧留在灯下，不让它失控。",
          nextStageId: "tingwan_2_3"
        }),
        createChoice({
          id: "tingwan_2_2_hold",
          label: "把这句试探含混带过，不再接近。",
          intent: "hold",
          keywords: ["算玩笑", "别闹", "随口", "没什么", "继续改图"],
          effects: { affinity: 1, trust: 2, alertness: 1 },
          summary: "你稳住了自己，也让这句玩笑只停在一半。",
          nextStageId: "tingwan_2_3"
        })
      ]
    }),
    tingwan_2_3: createScene({
      id: "tingwan_2_3",
      chapterTag: "第二章 · 同一屋檐下",
      sceneTag: "Scene 2-3 · 雷雨夜客厅",
      title: "雷雨夜客厅",
      progressKey: "shared_roof",
      objective: "制造高质量暧昧场景，强调她在你身边会下意识靠近。",
      stakes: "这一场是前两章最接近“靠近”本身的时刻，但仍不能越过肢体边界。",
      entryClues: ["thunder_step"],
      storyText:
        "客厅夜灯、窗外雷声和她抱着杯子站近的那一步，把“她会下意识靠近你”这件事写得太明显。你们谁都没有再往前，却也谁都没有退开。",
      npcDialogue: "……下意识。",
      eventHint: "暧昧可以强，但动作必须克制，重点是“她愿意站近一点”。",
      eventTags: ["雷雨夜", "客厅", "下意识靠近"],
      public_script: `夜里突然打雷。

我原本在客厅回邮件，听见房门轻轻一响。许念端着杯子出来，像只是来接水，却在第二声雷响起时很明显地停了一下。

“被吵醒了？”我问。

“嗯。”

她走到饮水机旁，低头接水。窗外一道闪电掠过去，紧接着是一声闷雷。

我看了她一眼。

“你还是怕打雷？”

“没有。”

她回答得很快。

下一秒，又一声雷。

她握着杯子的手指微微收紧，人已经不知不觉站到了离我更近的位置。

我忍不住低笑了一声。

“不怕的话，为什么站到我这边来了？”

她低头看了一眼，像是这才意识到自己已经靠近了些。

“……下意识。”

“那也算一种诚实。”

她没说话，只是把杯子抱得更紧了点。客厅里很安静，只有雨声和很轻的电流声。她站在离我不远的位置，没有退开。

我也没出声。

那一刻我忽然觉得，有些距离不是靠往前走才缩短的。
有时候，只是她愿意站近一点，就已经足够让人心软。`,
      scene_card: {
        chapter: "第二章《同一屋檐下》",
        scene: "Scene 2-3 雷雨夜客厅",
        location: "客厅",
        time: "夜",
        weather: "雷雨",
        relationship_stage: "自然亲近前夜",
        emotional_tone: "安静、高质量暧昧、克制靠近",
        current_goal: [
          "制造高质量暧昧场景",
          "强调她会下意识靠近",
          "关系推进到更自然亲近，但仍未明确表白"
        ],
        constraints: [
          "不可有拥抱、牵手",
          "对话保持克制",
          "不可让雷雨变成过度保护戏"
        ]
      },
      visual_state: {
        background: "客厅夜景雨天版",
        characters: ["许念·睡前居家", "沈砚川·夜里回邮件"],
        time: "夜",
        weather: "雷雨",
        emotion: "靠近却不越界"
      },
      presentCharacterIds: ["xunian"],
      characterTopics: {
        xunian: ["打雷", "下意识靠近", "不承认的怕"]
      },
      choices: [
        createChoice({
          id: "tingwan_2_3_close",
          label: "低声告诉她，站近一点也没关系。",
          intent: "close",
          keywords: ["靠近一点", "没关系", "站这边", "别怕", "我在"],
          effects: { affinity: 6, trust: 5, alertness: -2 },
          flagsOn: ["tingwan_thunder_close"],
          summary: "你没有碰她，却让她知道自己可以留在你身边。",
          nextStageId: "tingwan_3_1"
        }),
        createChoice({
          id: "tingwan_2_3_tease",
          label: "顺着“不怕”的嘴硬，轻轻逗她一句。",
          intent: "tease",
          keywords: ["你还是怕", "下意识", "诚实", "逗她", "嘴硬"],
          effects: { affinity: 4, trust: 2, alertness: 1 },
          summary: "你让气氛轻了一点，也让她没法再装得那么从容。",
          nextStageId: "tingwan_3_1"
        }),
        createChoice({
          id: "tingwan_2_3_ignore",
          label: "假装没看出来，只把安静留给她。",
          intent: "ignore",
          keywords: ["假装没看见", "不说", "安静", "沉默", "别拆穿"],
          effects: { affinity: 1, trust: 1, alertness: 2 },
          summary: "你保留了她的体面，也让这一步靠近没有真正落地。",
          nextStageId: "tingwan_3_1"
        })
      ]
    }),
    tingwan_3_1: createScene({
      id: "tingwan_3_1",
      chapterTag: "第三章 · 旧情回潮",
      sceneTag: "Scene 3-1 · 旧照片",
      title: "旧照片",
      progressKey: "old_feelings",
      objective: "用旧物触发大学回忆，首次比较明确地暗示男主一直喜欢她。",
      stakes: "这张照片会把“过去的心动”从模糊感觉拉到可以被对视的问题上。",
      entryClues: ["old_photo"],
      isCheckpoint: true,
      storyText:
        "周末的客厅地毯上摊着几张旧照片，而你最不该被她看见的那一句话，恰好就写在照片背面。旧情终于不再只是日常里的细枝末节。",
      npcDialogue: "你大学的时候，为什么总是对我那么好？",
      eventHint: "可以暗示过去感情，但不能直接进入正式告白。",
      eventTags: ["旧照片", "大学回忆", "感情暗示"],
      public_script: `周末她在客房整理东西，从书架最上层翻出一本旧摄影册。

我刚从外面回来，就看见她坐在客厅地毯上，腿边散着几张旧照片。

“这些你还留着？”她抬头问我。

我走过去，看见最上面那张，是大学校庆的合照。

她站在人群最后，笑得很好看。

照片背面有我当年写的一句话。

——她今天笑得很好看。

“忘了扔。”我说。

她看着我，明显不信。

“你这种人会忘？”

我沉默了一下。

“那就是舍不得。”

话一出口，我们都安静了。

她低头看着照片，过了一会儿才轻轻问：“你大学的时候，为什么总是对我那么好？”

我站在原地，没立刻回答。

因为这个问题其实不难。
难的是，一旦回答了，很多事就再也回不到普通朋友的距离。

她像是察觉到了我的犹豫，先笑了一下。

“算了，当我没问。”

“因为你不一样。”我说。

她抬头。

客厅里安静得只剩窗外隐约的风声。

“哪里不一样？”她问。

“你知道的。”我看着她，“许念，有些事不是现在才开始的。”

她没有再接话。

只是把那张照片慢慢翻过去，指尖停在背面的字迹上，停了很久。`,
      scene_card: {
        chapter: "第三章《旧情回潮》",
        scene: "Scene 3-1 旧照片",
        location: "客厅",
        time: "周末白天",
        weather: "室内",
        relationship_stage: "从日常升温到过去心意被触碰",
        emotional_tone: "回忆、停顿、压抑已久的喜欢开始浮出",
        current_goal: [
          "用旧物触发大学回忆",
          "明确暗示男主一直喜欢她",
          "让女主开始认真意识到当年的心动并非单向"
        ],
        constraints: [
          "可以暗示过去感情",
          "不能直接进入正式告白",
          "不可把问题一下说透"
        ]
      },
      visual_state: {
        background: "客厅白天与地毯旧照片",
        characters: ["许念·坐在地毯上", "沈砚川·刚回到家"],
        time: "白天",
        weather: "周末安静",
        emotion: "旧情被翻出来"
      },
      presentCharacterIds: ["xunian"],
      characterTopics: {
        xunian: ["旧照片", "大学时为什么对她那么好", "你不一样"]
      },
      hiddenTruths: ["这场问题本质上已经碰到当年的喜欢。"],
      choices: [
        createChoice({
          id: "tingwan_3_1_admit",
          label: "承认自己不是忘了，而是真的舍不得。",
          intent: "admit",
          keywords: ["舍不得", "没扔", "记得", "照片", "不是忘了"],
          effects: { affinity: 6, trust: 5, alertness: -2 },
          flagsOn: ["tingwan_old_photo_seen"],
          summary: "你第一次没有把过去藏在玩笑后面。",
          nextStageId: "tingwan_3_2"
        }),
        createChoice({
          id: "tingwan_3_1_different",
          label: "只说她不一样，把答案留在半步之外。",
          intent: "different",
          keywords: ["你不一样", "不是现在才开始", "不一样", "当年", "以前"],
          effects: { affinity: 5, trust: 4, alertness: -1 },
          summary: "你把心意递到了她面前，却仍然留了最后一层纸。",
          nextStageId: "tingwan_3_2"
        }),
        createChoice({
          id: "tingwan_3_1_deflect",
          label: "把问题轻轻岔开，不让今晚继续深入。",
          intent: "deflect",
          keywords: ["算了", "以后再说", "别看了", "岔开", "轻描淡写"],
          effects: { affinity: 1, trust: 1, alertness: 3 },
          summary: "你保住了退路，也让她的试探再次停在门口。",
          nextStageId: "tingwan_3_2"
        })
      ]
    }),
    tingwan_3_2: createScene({
      id: "tingwan_3_2",
      chapterTag: "第三章 · 旧情回潮",
      sceneTag: "Scene 3-2 · 便签和习惯",
      title: "便签和习惯",
      progressKey: "old_feelings",
      objective: "通过日常互动继续展现默契感，让玩家感受到两人生活已经有了黏性。",
      stakes: "戏剧化一点都不合适，这一场必须靠琐碎细节把关系继续推近。",
      entryClues: ["fridge_notes"],
      storyText:
        "冰箱上的便签越贴越多，连情绪都开始可以被写下来再被接住。关系没有轰然推进，却在这种无声往返里慢慢黏住了。",
      npcDialogue: "那如果没用呢？",
      eventHint: "重点写温柔日常，不要把这场变成戏剧化摊牌。",
      eventTags: ["便签", "默契", "温柔日常"],
      public_script: `那之后，冰箱上的便签慢慢多了起来。

最开始只是生活提醒。

“牛奶快没了，我下班买。”
“记得带伞，今天有雨。”
“冰箱里有切好的水果，别空着肚子睡。”

后来又夹了些无关紧要的玩笑。

“房东先生，厨房盐在哪？”
“左边第二层。”
“你家收纳怎么这么反人类？”
“是你不会找。”

有天晚上我加班回来，看见冰箱上又多了一张。

“今天项目被改了三遍，想辞职。”

我站在冰箱前看了两秒，低头写下回复。

“先吃饭，再辞。”

第二天早上，她站在冰箱前看着那张纸笑。

“你这安慰方式还挺特别。”

“有用就行。”

“那如果没用呢？”

我看着她。

“那就再想别的办法。”

她没接话，只是把便签小心揭下来，折好塞进口袋里。

那个动作很轻，却莫名让我觉得，有些东西正在变得和从前不一样。`,
      scene_card: {
        chapter: "第三章《旧情回潮》",
        scene: "Scene 3-2 便签和习惯",
        location: "厨房 / 冰箱前",
        time: "早晚交错的日常段落",
        weather: "日常室内",
        relationship_stage: "生活默契形成中",
        emotional_tone: "温柔、稳定、有黏性",
        current_goal: [
          "通过日常互动让关系更自然",
          "展现默契感",
          "让玩家感受到共同生活的黏性"
        ],
        constraints: [
          "不要戏剧化",
          "重点写温柔日常",
          "不可突然跳去重大冲突"
        ]
      },
      visual_state: {
        background: "厨房与冰箱便签",
        characters: ["许念·清晨看便签", "沈砚川·上班前停在冰箱前"],
        time: "日常切片",
        weather: "室内",
        emotion: "默契累积"
      },
      presentCharacterIds: ["xunian"],
      characterTopics: {
        xunian: ["便签往返", "项目疲惫", "再想别的办法"]
      },
      choices: [
        createChoice({
          id: "tingwan_3_2_reassure",
          label: "认真接住她的疲惫，让“再想别的办法”落下来。",
          intent: "reassure",
          keywords: ["别的办法", "接住", "辞职", "安慰", "有用"],
          effects: { affinity: 4, trust: 5, alertness: -1 },
          flagsOn: ["tingwan_fridge_notes"],
          summary: "你把安慰说得很平，但分量已经足够她收进口袋。",
          nextStageId: "tingwan_3_3"
        }),
        createChoice({
          id: "tingwan_3_2_joke",
          label: "继续用一点玩笑，把沉重的工作感冲淡。",
          intent: "joke",
          keywords: ["房东先生", "玩笑", "轻松", "先吃饭", "再辞"],
          effects: { affinity: 4, trust: 2, alertness: 0 },
          summary: "你让她笑出来，也让这份依赖看起来更自然。",
          nextStageId: "tingwan_3_3"
        }),
        createChoice({
          id: "tingwan_3_2_support",
          label: "不谈大道理，只说真累了就别硬撑。",
          intent: "support",
          keywords: ["别硬撑", "真累", "先休息", "支持", "慢一点"],
          effects: { affinity: 3, trust: 4, alertness: -1 },
          summary: "你把照顾放在现实层面，她反而更容易听进去。",
          nextStageId: "tingwan_3_3"
        })
      ]
    }),
    tingwan_3_3: createScene({
      id: "tingwan_3_3",
      chapterTag: "第三章 · 旧情回潮",
      sceneTag: "Scene 3-3 · 阳台谈心",
      title: "阳台谈心",
      progressKey: "old_feelings",
      objective: "明确表现男主多年未忘，让女主的心动显著上升。",
      stakes: "这是前三章情感推进最强的一场，再往前半步就会进入正式告白区。",
      entryClues: ["balcony_memory"],
      isCheckpoint: true,
      storyText:
        "夜风把楼下灯火吹得很远，你却把那些关于她的细节一句句说得太近。阳台上没有谁真正越界，但“没放下”已经几乎写在空气里。",
      npcDialogue: "沈砚川，你是不是一直都记得以前的事？",
      eventHint: "暧昧可以很强，但不要直接告白，也不要发生拥抱或接吻。",
      eventTags: ["阳台", "谈心", "多年未忘"],
      public_script: `那天晚上，她站在阳台吹风。

我拿了件外套给她披上。

“临川晚上风大。”我说。

她抓着外套边缘，低声问我：“沈砚川，你是不是一直都记得以前的事？”

我站在她身侧，看着楼下零零散散的灯火。

“有些会忘。”我说。

“那有些呢？”

“忘不了。”

她安静了一会儿。

“比如什么？”

我沉默几秒，还是开口了。

“比如你不吃香菜。”
“比如你不爱太甜的奶茶。”
“比如你紧张的时候会先捏一下自己的手指。”
“比如你其实怕打雷，只是从来不承认。”

她愣住了。

我看着她，忽然觉得自己已经退无可退。

“许念。”

“嗯？”

“你要是再问下去，我可能就装不下去了。”

她看着我，眼神轻轻晃了一下。

晚风从我们之间吹过去，明明很轻，我却觉得有什么已经开始失控了。`,
      scene_card: {
        chapter: "第三章《旧情回潮》",
        scene: "Scene 3-3 阳台谈心",
        location: "阳台",
        time: "夜",
        weather: "晚风",
        relationship_stage: "高张力暧昧期",
        emotional_tone: "夜风、对视、情绪几乎失控却仍克制",
        current_goal: [
          "明确表现男主多年未忘",
          "让女主心动显著上升",
          "把关系推到最接近表白的位置但不越线"
        ],
        constraints: [
          "暧昧强，但不可直接告白",
          "不可发生拥抱接吻",
          "不可让这场直接结束在摊牌上"
        ]
      },
      visual_state: {
        background: "阳台夜景与都市灯火",
        characters: ["许念·披着外套", "沈砚川·站在她身侧"],
        time: "夜",
        weather: "晚风",
        emotion: "多年未忘被清楚说出来"
      },
      presentCharacterIds: ["xunian"],
      characterTopics: {
        xunian: ["忘不了的细节", "外套", "再问下去我可能装不下去"]
      },
      choices: [
        createChoice({
          id: "tingwan_3_3_remember",
          label: "继续说下去，让她知道你记得她远不止这些。",
          intent: "remember",
          keywords: ["忘不了", "记得", "不吃香菜", "怕打雷", "装不下去"],
          effects: { affinity: 7, trust: 6, alertness: -2 },
          flagsOn: ["tingwan_not_over"],
          summary: "你没有直接说喜欢，却已经把“没放下”说得足够清楚。",
          nextStageId: "tingwan_4_1"
        }),
        createChoice({
          id: "tingwan_3_3_stop",
          label: "停在“忘不了”这一步，不再逼近。",
          intent: "stop",
          keywords: ["忘不了", "先这样", "停住", "不继续", "到这里"],
          effects: { affinity: 3, trust: 3, alertness: 0 },
          summary: "你们都听懂了后半句，却谁也没有替对方说出来。",
          nextStageId: "tingwan_4_1"
        }),
        createChoice({
          id: "tingwan_3_3_retreat",
          label: "把外套拢好，转而聊起风和夜色。",
          intent: "retreat",
          keywords: ["风大", "夜景", "回去吧", "转移话题", "别问了"],
          effects: { affinity: 1, trust: 1, alertness: 2 },
          summary: "你替自己保住了退路，也让这场靠近少了最后一点重量。",
          nextStageId: "tingwan_4_1"
        })
      ]
    }),
    tingwan_4_1: createScene({
      id: "tingwan_4_1",
      chapterTag: "第四章 · 她身边的人",
      sceneTag: "Scene 4-1 · 她提起别人",
      title: "她提起别人",
      progressKey: "new_pressure",
      objective: "让周既明首次通过转述进入剧情，并让男主第一次产生明显醋意。",
      stakes: "你越压着情绪，介意这件事反而会越清楚。",
      entryClues: ["zhou_name"],
      isCheckpoint: true,
      storyText:
        "只是晚饭时被轻描淡写提起的一个名字，却让你整场都无法真正平静下来。周既明还没出现，压力已经先抵达了。",
      npcDialogue: "你这语气怎么有点像在审人？",
      eventHint: "男主不能直接说“我吃醋”，但必须让介意从语气里露出来。",
      eventTags: ["周既明", "吃醋", "克制失衡"],
      public_script: `许念开始逐渐适应新工作，也开始比之前更晚回家。

有一次吃晚饭时，她提起项目合作，说到一个名字时，语气里有种她自己都没意识到的轻松。

“周既明人挺好的。”她说。

我握着筷子的手顿了一下。

“同事？”

“算是上级吧，挺会照顾人的，也很会活跃气氛。”

她说这些的时候神色很自然。

可越自然，我越烦躁。

因为这说明她和那个人相处得不错。

“你最近提他次数有点多。”我说。

她抬头看我，像是有点意外。

“有吗？”

“有。”

她忍不住笑了。

“你这语气怎么有点像在审人？”

我垂下眼，淡淡道：“只是随口问问。”

可我心里很清楚。

不是随口。

是介意。

很介意。`,
      scene_card: {
        chapter: "第四章《她身边的人》",
        scene: "Scene 4-1 她提起别人",
        location: "餐桌 / 客厅",
        time: "晚饭时间",
        weather: "室内",
        relationship_stage: "半公开在意之前的压抑期",
        emotional_tone: "克制、发酸、不自然",
        current_goal: [
          "让周既明首次通过转述进入剧情",
          "男主首次产生明显醋意",
          "仍不爆发，只是压着情绪"
        ],
        constraints: [
          "男主不能直接说我吃醋",
          "周既明只能通过转述出现",
          "要表现克制和不自然"
        ]
      },
      visual_state: {
        background: "餐桌夜景",
        characters: ["许念·自然提起同事", "沈砚川·握着筷子停顿"],
        time: "晚饭时间",
        weather: "室内",
        emotion: "第一次明显介意"
      },
      presentCharacterIds: ["xunian"],
      characterTopics: {
        xunian: ["周既明", "项目合作", "你最近提他次数有点多"]
      },
      forbiddenReveals: ["周既明此场不可直接到场。"],
      choices: [
        createChoice({
          id: "tingwan_4_1_direct",
          label: "直接指出她最近提周既明的次数确实有点多。",
          intent: "direct",
          keywords: ["提他很多次", "周既明", "次数有点多", "介意", "总说他"],
          effects: { affinity: 4, trust: 3, alertness: 1 },
          flagsOn: ["tingwan_zhou_named"],
          summary: "你没有承认吃醋，但已经把介意写在了语气里。",
          nextStageId: "tingwan_4_2"
        }),
        createChoice({
          id: "tingwan_4_1_light",
          label: "轻描淡写地再问一句这个人到底怎么样。",
          intent: "light",
          keywords: ["他怎么样", "同事", "上级", "人挺好", "随口问问"],
          effects: { affinity: 2, trust: 2, alertness: 0 },
          summary: "你把锋芒收住了，但那点不自然仍然足够明显。",
          nextStageId: "tingwan_4_2"
        }),
        createChoice({
          id: "tingwan_4_1_withhold",
          label: "把这份介意暂时压下去，不继续追问。",
          intent: "withhold",
          keywords: ["算了", "不问了", "继续吃饭", "压住", "不提他"],
          effects: { affinity: 0, trust: 1, alertness: 2 },
          summary: "你试着像个无所谓的室友，可情绪并没有因此真的平下来。",
          nextStageId: "tingwan_4_2"
        })
      ]
    }),
    tingwan_4_2: createScene({
      id: "tingwan_4_2",
      chapterTag: "第四章 · 她身边的人",
      sceneTag: "Scene 4-2 · 公司聚会后回家",
      title: "公司聚会后回家",
      progressKey: "new_pressure",
      objective: "把“立场问题”第一次说出口，让女主开始直面他为什么会介意。",
      stakes: "这场冲突不能直接摊牌，却必须留下足够重的停顿。",
      entryClues: ["stance_question"],
      storyText:
        "很晚的门响、她身上的淡淡酒气和周既明再次出现的名字，让你终于没法再演一个无所谓的合租室友。那句“我有什么立场说”一出口，局面就彻底不一样了。",
      npcDialogue: "沈砚川，你是不是有话想说？",
      eventHint: "这是前四章最强冲突场，不可直接摊牌，但冲突必须有留白。",
      eventTags: ["聚会后回家", "酒意", "立场问题"],
      public_script: `那天她参加公司聚会，回来得很晚。

门开的时候，我闻到了她身上淡淡的酒气。

不重，却足够让我心情更差。

“喝酒了？”我问。

“喝了一点。”她弯腰换鞋，“周既明替我挡了不少，不然会更惨。”

又是周既明。

我站在客厅灯影里，突然有点想笑。笑自己居然会为了一个名字情绪失控。

“你是不是不高兴？”她抬头看我。

“没有。”

“你有。”

她站直了身子，目光落在我脸上。

“沈砚川，你是不是有话想说？”

我看着她，压了很久的情绪一点点浮上来。可到最后，也只变成一句：

“我有什么立场说？”

话音落下，客厅瞬间安静。

她看着我，像是被这一句定住了。

而我也终于意识到，我根本没办法再继续演一个无所谓的合租室友。`,
      scene_card: {
        chapter: "第四章《她身边的人》",
        scene: "Scene 4-2 聚会后回家",
        location: "客厅",
        time: "深夜",
        weather: "室内夜灯",
        relationship_stage: "在意已经无法完全隐藏",
        emotional_tone: "压抑、发紧、留白式冲突",
        current_goal: [
          "把立场问题第一次说出口",
          "让女主开始直面他为什么会介意",
          "为厨房短对峙做情绪准备"
        ],
        constraints: [
          "不可直接摊牌表白",
          "冲突要留白",
          "不可让周既明出现在现场"
        ]
      },
      visual_state: {
        background: "客厅夜景",
        characters: ["许念·聚会后带一点酒意", "沈砚川·站在灯影里"],
        time: "深夜",
        weather: "室内",
        emotion: "压了很久的在意浮上来"
      },
      presentCharacterIds: ["xunian"],
      characterTopics: {
        xunian: ["聚会", "酒意", "我有什么立场说"]
      },
      forbiddenReveals: ["不可在本场直接确认恋爱关系或当场和好。"],
      choices: [
        createChoice({
          id: "tingwan_4_2_press",
          label: "顺着她的追问，把这份介意再往前推一步。",
          intent: "press",
          keywords: ["你有话想说", "介意", "周既明", "立场", "不高兴"],
          effects: { affinity: 4, trust: 3, alertness: 2 },
          flagsOn: ["tingwan_pressure_rise"],
          summary: "你仍然没有说破，但已经没法再把自己放回“没关系”的位置。",
          nextStageId: "tingwan_4_3"
        }),
        createChoice({
          id: "tingwan_4_2_worry",
          label: "承认自己不只是介意，也确实在担心她。",
          intent: "worry",
          keywords: ["担心你", "喝多了", "晚回家", "不只是", "不是没事"],
          effects: { affinity: 3, trust: 4, alertness: 0 },
          summary: "你把情绪落回照顾里，让她更难把这份在意当成普通室友情绪。",
          nextStageId: "tingwan_4_3"
        }),
        createChoice({
          id: "tingwan_4_2_silence",
          label: "让这句“立场”停在空气里，不再继续。",
          intent: "silence",
          keywords: ["先这样", "不说了", "去休息", "沉默", "停住"],
          effects: { affinity: 0, trust: 1, alertness: 2 },
          summary: "你把最锋利的地方咽了回去，但这场沉默已经够重。",
          nextStageId: "tingwan_4_3"
        })
      ]
    }),
    tingwan_4_3: createScene({
      id: "tingwan_4_3",
      chapterTag: "第四章 · 她身边的人",
      sceneTag: "Scene 4-3 · 厨房短对峙",
      title: "厨房短对峙",
      progressKey: "new_pressure",
      objective: "把男主的在意从隐性升级到半公开，为后续更高升温做准备。",
      stakes: "再往前一步就是摊牌，可现在仍然必须停在“快要说破”的门槛前。",
      storyText:
        "厨房的暖光把她的眼睛照得太亮，也让你更难继续装作若无其事。“因为我会当真”这句话落下来时，前四章该有的张力已经全都到位。",
      npcDialogue: "你没有立场，那谁有？",
      eventHint: "允许高张力对视、沉默和轻度试探，但仍不可正式表白。",
      eventTags: ["厨房", "短对峙", "会当真"],
      public_script: `她把包放下，跟着我进了厨房。

“你没有立场，那谁有？”她问。

我背对着她，拧开矿泉水瓶，动作很慢。

“至少不是我。”

“为什么不是？”

她声音不高，却步步紧逼。

我转过身看她。厨房灯光偏暖，把她的眼睛映得很亮，也让我更难继续装作若无其事。

“因为我不确定，你想让我以什么身份过问这些。”

她怔住了。

我胸口发紧，还是把视线移开了一点。

“许念，别随便问这种问题。”

“为什么？”

“因为我会当真。”

空气在那一刻几乎静止。

她看着我，很久都没说话。

我也没再往下说。

有些话一旦再往前一步，就会彻底失去退路。
而现在，还不是时候。`,
      scene_card: {
        chapter: "第四章《她身边的人》",
        scene: "Scene 4-3 厨房短对峙",
        location: "厨房",
        time: "深夜",
        weather: "室内夜灯",
        relationship_stage: "半公开在意 / 未正式摊牌",
        emotional_tone: "高张力、停顿、几乎失去退路",
        current_goal: [
          "男主的在意从隐性升级到半公开",
          "女主被这份在意触动",
          "为第五章高升温做准备"
        ],
        constraints: [
          "仍不可正式表白",
          "允许高张力对视、沉默、轻度试探",
          "不可在本场给出完整关系答案"
        ]
      },
      visual_state: {
        background: "厨房暖光夜景",
        characters: ["许念·追问不退", "沈砚川·克制到发紧"],
        time: "深夜",
        weather: "室内",
        emotion: "半公开在意"
      },
      presentCharacterIds: ["xunian"],
      characterTopics: {
        xunian: ["身份", "立场", "会当真"]
      },
      forbiddenReveals: ["不可把这场写成正式表白或确定关系。"],
      choices: [
        createChoice({
          id: "tingwan_4_3_serious",
          label: "迎上她的视线，承认你刚才那句“会当真”不是随口。",
          intent: "serious",
          keywords: ["会当真", "不是随口", "身份", "认真", "我在意"],
          effects: { affinity: 8, trust: 7, alertness: -2 },
          flagsOn: ["tingwan_will_take_it_seriously"],
          summary: "你没有正式表白，却已经把退路缩到了最窄。",
          ending: true
        }),
        createChoice({
          id: "tingwan_4_3_later",
          label: "让她先去休息，把最关键的话留到以后。",
          intent: "later",
          keywords: ["先休息", "以后再说", "今晚先到这", "留到以后", "慢一点"],
          effects: { affinity: 3, trust: 4, alertness: 0 },
          flagsOn: ["tingwan_leave_for_later"],
          summary: "你们都知道答案已经在路上，但这一步仍然被你留给了以后。",
          ending: true
        }),
        createChoice({
          id: "tingwan_4_3_stepback",
          label: "把自己重新退回合租室友的位置，结束今晚。",
          intent: "stepback",
          keywords: ["算了", "室友", "别问了", "结束今晚", "退回去"],
          effects: { affinity: -4, trust: -5, alertness: 6 },
          flagsOn: ["tingwan_step_back"],
          summary: "你又一次退开了，而她也清楚看见了这一步后退。",
          ending: true
        })
      ]
    })
  },
  resolveEnding(state) {
    const xunian = state.characters.xunian;

    if (state.flags.tingwan_step_back || xunian.alertness >= 54 || xunian.trust <= 40) {
      return "bad";
    }

    if (
      state.flags.tingwan_will_take_it_seriously &&
      state.flags.tingwan_special_treatment &&
      state.flags.tingwan_thunder_close &&
      state.flags.tingwan_not_over &&
      xunian.affinity >= 88 &&
      xunian.trust >= 80
    ) {
      return "hidden";
    }

    if (state.flags.tingwan_will_take_it_seriously && xunian.affinity >= 72 && xunian.trust >= 68) {
      return "good";
    }

    return "normal";
  }
};

export { TINGWAN_PACK };