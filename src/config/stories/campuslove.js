import { createGenericEndings } from "./_helpers.js";

const CAMPUS_ENDINGS = createGenericEndings("Campus");
CAMPUS_ENDINGS.good = {
  id: "good",
  code: "Campus / 01",
  badge: "好结局 / Good Ending",
  title: "盛夏回信",
  subtitle: "Letter Finally Delivered",
  description: "你和林澈在毕业前终于坦白心意。曾经犹豫的情书被当面读出，误会与胆怯都停在了晚风里。",
  conditions: [
    { label: "好感度", value: ">= 72" },
    { label: "信任值", value: ">= 66" },
    { label: "终局选择", value: "坦白心意" }
  ]
};
CAMPUS_ENDINGS.normal = {
  id: "normal",
  code: "Campus / 02",
  badge: "普通结局 / Normal Ending",
  title: "留在风里的名字",
  subtitle: "Almost, But Not Quite",
  description: "你们在毕业季保留了彼此最温柔的印象，却没能真正跨过最后一步。故事停在若有若无的心动上。",
  conditions: [
    { label: "路线结果", value: "保留暧昧" },
    { label: "最低信任", value: ">= 42" },
    { label: "终局选择", value: "先把答案留给以后" }
  ]
};
CAMPUS_ENDINGS.bad = {
  id: "bad",
  code: "Campus / 03",
  badge: "坏结局 / Bad Ending",
  title: "未寄出的情书",
  subtitle: "The Letter That Stayed Hidden",
  description: "误会和退缩压过了喜欢。你们在毕业之后走向不同的人群，只剩一封再也没寄出的信留在抽屉深处。",
  conditions: [
    { label: "警觉值", value: ">= 72" },
    { label: "或信任值", value: "<= 30" },
    { label: "终局选择", value: "沉默离场" }
  ]
};
CAMPUS_ENDINGS.hidden = {
  id: "hidden",
  code: "Campus / 04",
  badge: "隐藏结局 / Hidden Ending",
  title: "操场灯熄灭之前",
  subtitle: "Before the Last Light Went Out",
  description: "你不仅说出了喜欢，也陪林澈一起守住了她最在意的舞台。青春没有停在告白，而是走向共同成长。",
  conditions: [
    { label: "好感度", value: ">= 84" },
    { label: "信任值", value: ">= 76" },
    { label: "隐藏条件", value: "守住乐队舞台 + 主动告白" }
  ]
};

const CAMPUSLOVE_PACK = {
  id: "campuslove",
  genre: "青春互动叙事",
  title: "盛夏未寄出的情书",
  subtitle: "Letters Before Graduation",
  themeLabel: "校园恋爱",
  synopsis:
    "毕业季来临，你与校园乐队主唱林澈在排练、误会与心动间反复试探。你说出口的每一句话，都会改变这场夏天的结局。",
  description:
    "更偏情感代入与暧昧推进的剧本，适合从玩家视角体验心动、错过与勇敢表达。",
  initialEventText: "夏日的广播站刚刚响起，毕业季故事从一封未寄出的情书开始。",
  primaryCharacterId: "linche",
  initialStageId: "campus_quad",
  progressSteps: [
    { key: "encounter", label: "图书馆偶遇" },
    { key: "rehearsal", label: "晚间排练" },
    { key: "festival", label: "夏夜舞台" },
    { key: "graduation", label: "毕业终章" }
  ],
  clueLibrary: {
    draft_letter: { id: "draft_letter", title: "折痕情书", detail: "字迹多次涂改的信纸上，藏着迟迟没有说出口的名字。" },
    rehearsal_pass: { id: "rehearsal_pass", title: "排练通行证", detail: "林澈偷偷留给你的排练证，说明她其实希望你留下。" },
    old_photo: { id: "old_photo", title: "旧合照", detail: "照片里的你们还没长大，却已经站在同一片夕阳里。" },
    song_demo: { id: "song_demo", title: "未公开 Demo", detail: "那首歌的副歌里，写的是你们共同经历过的雨夜。" }
  },
  endings: CAMPUS_ENDINGS,
  initialCharacters: {
    linche: {
      characterId: "linche",
      name: "林澈",
      role: "校园乐队主唱",
      affinity: 50,
      trust: 44,
      alertness: 28,
      mood: "明亮却防备",
      relationshipStage: "朋友以上",
      revealed: true
    },
    roommate: {
      characterId: "roommate",
      name: "许漫",
      role: "你的室友 / 军师",
      affinity: 0,
      trust: 0,
      alertness: 0,
      mood: "八卦又可靠",
      relationshipStage: "已熟识",
      revealed: true
    }
  },
  stages: {
    campus_quad: {
      id: "campus_quad",
      chapterTag: "第一幕 / 夏日预告",
      sceneTag: "图书馆前 / 傍晚",
      title: "风吹乱的第一页",
      progressKey: "encounter",
      objective: "决定如何重新接近林澈，让她愿意和你开始这段毕业季对话。",
      stakes: "第一次回应会决定她是把你当成旧友、同伴，还是会继续保持距离。",
      entryClues: ["draft_letter"],
      isCheckpoint: true,
      storyText:
        "图书馆门口的风把那张折起的信纸吹到了你脚边。你正要捡起它，林澈已经抱着谱夹跑下台阶，像突然被心事撞见那样停在你面前。",
      npcDialogue:
        "“别看。”她下意识伸手来抢，随后又像觉得太急切，放慢了语气，“如果你真的捡到了……至少先告诉我，你今天为什么会来这里？”",
      eventHint: "林澈对重逢抱着期待，也害怕你只是偶然路过。",
      eventTags: ["重逢", "毕业季", "第一印象"],
      choices: [
        {
          id: "campus_honest",
          label: "直接说你是来找她的，还把信纸递还给她。",
          intent: "honest",
          keywords: ["找你", "来见你", "递给你", "诚实", "坦白"],
          effects: { linche: { affinity: 8, trust: 7, alertness: -4 } },
          flagsOn: ["campusHonestStart"],
          eventText: "你的直接没有把气氛弄坏，反而让林澈短暂放松了肩膀。",
          summary: "真诚让重逢的空气变得柔软了一些。",
          nextStageId: "campus_rehearsal"
        },
        {
          id: "campus_tease",
          label: "故意笑她紧张，反问那是不是写给别人的情书。",
          intent: "tease",
          keywords: ["情书", "开玩笑", "逗你", "紧张", "别人"],
          effects: { linche: { affinity: 4, trust: -2, alertness: 6 } },
          flagsOn: ["campusTeaseStart"],
          eventText: "玩笑让她耳尖微红，却也让她重新戴上了轻松外壳。",
          summary: "你把尴尬化成了玩笑，但也错过了一点认真。",
          nextStageId: "campus_rehearsal"
        },
        {
          id: "campus_guarded",
          label: "把信纸放回她手里，只说自己是碰巧经过。",
          intent: "guarded",
          keywords: ["路过", "碰巧", "没什么", "还给你", "随便"],
          effects: { linche: { affinity: -2, trust: -5, alertness: 8 } },
          flagsOn: ["campusGuardedStart"],
          eventText: "你把情绪收了回去，她也跟着后退了半步。",
          summary: "安全的距离感，也让这次重逢少了点温度。",
          nextStageId: "campus_rehearsal"
        }
      ]
    },
    campus_rehearsal: {
      id: "campus_rehearsal",
      chapterTag: "第二幕 / 排练后的风",
      sceneTag: "旧礼堂 / 夜晚",
      title: "没有说完的副歌",
      progressKey: "rehearsal",
      objective: "判断你是陪她面对舞台压力，还是继续绕着喜欢打转。",
      stakes: "这会影响她是否愿意把内心真正的不安告诉你。",
      entryClues: ["rehearsal_pass"],
      isCheckpoint: false,
      storyText: {
        honest:
          "你按约来到礼堂时，林澈已经独自练到嗓音发哑。她把一张排练通行证塞进你手里，像早就准备好要你来，只是不敢先承认。",
        tease:
          "你到礼堂时，林澈故作镇定地冲你晃了晃麦克风，但你还是看得出她比平时更紧张。那张被她留出的通行证，像是一种不肯说明的邀请。",
        guarded:
          "即便你说只是路过，林澈还是把你叫到了礼堂。她没有追问，只是在散场后把通行证轻轻放在你面前，像留给你最后一次靠近的机会。",
        default:
          "礼堂的灯只开了一半，鼓点和晚风一起回荡。林澈站在台上，像在等你决定今晚要站在哪一边。"
      },
      npcDialogue:
        "“明天就是彩排了。”她攥着拨片，笑意有些发虚，“如果我唱砸了，所有人都会觉得我不该站在这里。你会怎么想？”",
      eventHint: "她需要的不是漂亮话，而是你站在她身边的方式。",
      eventTags: ["排练", "舞台压力"],
      choices: [
        {
          id: "campus_support",
          label: "告诉她你会留下来陪她把这首歌练完。",
          intent: "support",
          keywords: ["陪你", "练完", "留下", "支持", "一起"],
          effects: { linche: { affinity: 10, trust: 9, alertness: -5 } },
          flagsOn: ["campusStayed"],
          unlockClues: ["song_demo"],
          eventText: "你没有回避她真正的紧张，林澈第一次把排练失败的原因告诉了你。",
          summary: "陪伴让她愿意把脆弱交给你看。",
          nextStageId: "campus_festival"
        },
        {
          id: "campus_probe",
          label: "追问她为什么突然这么在意这次舞台。",
          intent: "probe",
          keywords: ["为什么", "在意", "告诉我", "追问", "原因"],
          effects: { linche: { affinity: 4, trust: 6, alertness: 2 } },
          flagsOn: ["campusAskedReason"],
          unlockClues: ["old_photo"],
          eventText: "她没有立刻回答，但把一张旧合照从谱夹里抽了出来。",
          summary: "你逼近真心的边缘，也逼近她藏起来的过去。",
          nextStageId: "campus_festival"
        },
        {
          id: "campus_dodge",
          label: "轻描淡写地说她肯定没问题，让她别想太多。",
          intent: "dodge",
          keywords: ["没问题", "别想太多", "轻松点", "不用担心", "随便"],
          effects: { linche: { affinity: -1, trust: -6, alertness: 7 } },
          flagsOn: ["campusDodged"],
          eventText: "安慰的话很轻，却没有落到她最需要被听见的地方。",
          summary: "你想让气氛变轻，却让她觉得自己没被真正理解。",
          nextStageId: "campus_festival"
        }
      ]
    },
    campus_festival: {
      id: "campus_festival",
      chapterTag: "第三幕 / 夏夜舞台",
      sceneTag: "操场后台 / 演出前",
      title: "灯亮起之前",
      progressKey: "festival",
      objective: "决定是守住她的舞台、揭开误会，还是在关键时刻退后。",
      stakes: "这一轮会直接影响最终告白路线以及隐藏结局条件。",
      entryClues: [],
      isCheckpoint: true,
      storyText: {
        support:
          "后台一片忙乱，主音响却突然出了问题。林澈看向你时并不只是求助，那眼神更像在问：如果今夜的一切都失控，你还会不会站在这里。",
        probe:
          "你已经知道那张旧合照的意义，也知道她为何把这次演出看得比谁都重。后台设备出故障时，她没有先找社团负责人，而是先转身看向你。",
        dodge:
          "后台的灯忽明忽暗，工作人员来回奔跑。林澈的沉默比排练那晚更明显，她像是在判断关键时刻还能不能依赖你。",
        default:
          "观众席的喧闹声透过幕布卷进来，舞台还没开始，心跳已经先乱了。"
      },
      npcDialogue:
        "“如果今晚出了问题，我可能真的会后悔很久。”她深吸一口气，低声问你，“你会帮我把这场演出守下来吗？”",
      eventHint: "她在向你确认立场，这会影响她是否把感情和未来一起交给你。",
      eventTags: ["演出危机", "守护舞台"],
      choices: [
        {
          id: "campus_guard_stage",
          label: "主动去协调设备和老师，让她只专心上台唱歌。",
          intent: "guardStage",
          keywords: ["协调", "帮你", "设备", "老师", "上台"],
          effects: { linche: { affinity: 12, trust: 8, alertness: -6 } },
          flagsOn: ["campusGuardedStage"],
          eventText: "你替她挡下混乱，她终于能把注意力留给歌声和你。",
          summary: "你守住了她最在意的舞台，也守住了关系推进的节奏。",
          nextStageId: "campus_finale"
        },
        {
          id: "campus_confide",
          label: "拉住她说清旧误会，告诉她你一直没忘记她。",
          intent: "confide",
          keywords: ["没忘记", "误会", "解释", "告诉你", "一直"],
          effects: { linche: { affinity: 9, trust: 10, alertness: -2 } },
          flagsOn: ["campusConfide"],
          eventText: "旧误会在几句话之间被撕开，也让她终于看见你迟到的认真。",
          summary: "你把喜欢提早说到了台前，气氛因此彻底改变。",
          nextStageId: "campus_finale"
        },
        {
          id: "campus_step_back",
          label: "告诉她你相信她能处理好，然后退到人群后面。",
          intent: "stepBack",
          keywords: ["相信你", "你可以", "退后", "人群", "自己处理"],
          effects: { linche: { affinity: -6, trust: -8, alertness: 9 } },
          flagsOn: ["campusSteppedBack"],
          eventText: "你给了她空间，也让她在最需要依靠的时候记住了你的后退。",
          summary: "后退不是错误，却让她对你们的可能重新动摇。",
          nextStageId: "campus_finale"
        }
      ]
    },
    campus_finale: {
      id: "campus_finale",
      chapterTag: "终幕 / 毕业之前",
      sceneTag: "操场看台 / 深夜",
      title: "你要把答案说给谁听",
      progressKey: "graduation",
      objective: "在毕业前夜做出最终选择，决定这段感情是说出口、留在心里，还是就此错过。",
      stakes: "本轮选择会立刻触发结局。",
      entryClues: [],
      isCheckpoint: true,
      storyText:
        "演出结束后，操场的灯一盏盏暗下去。林澈抱着吉他坐在看台边，晚风把她鬓角的发吹乱，也把那个一直没被说破的问题吹到了你们之间。",
      npcDialogue:
        "“如果今晚之后我们都各自走远了，我可能会后悔。”她抬头看着你，声音很轻，“所以这一次，换你先说。”",
      eventHint: "勇敢、保留或沉默，会把这个夏天带向完全不同的方向。",
      eventTags: ["最终告白", "毕业夜"],
      choices: [
        {
          id: "campus_confess_final",
          label: "说出喜欢，并邀请她和你一起去看更远的未来。",
          intent: "confessFinal",
          keywords: ["喜欢", "未来", "一起", "告白", "想和你"],
          effects: { linche: { affinity: 12, trust: 10, alertness: -8 } },
          flagsOn: ["campusFinalConfess"],
          eventText: "你终于把那句迟到很久的话说了出来。",
          summary: "你不再让喜欢停在暗处。",
          ending: true
        },
        {
          id: "campus_wait_final",
          label: "告诉她你珍惜这段关系，但想把答案留到毕业之后。",
          intent: "waitFinal",
          keywords: ["以后", "慢一点", "珍惜", "毕业后", "留到以后"],
          effects: { linche: { affinity: 3, trust: 1, alertness: 2 } },
          flagsOn: ["campusFinalWait"],
          eventText: "你把心意留成了余地，也把结局留成了开放题。",
          summary: "你选择了温柔保留，而不是立刻抵达。",
          ending: true
        },
        {
          id: "campus_silent_final",
          label: "笑着转移话题，把所有心事留在这晚风里。",
          intent: "silentFinal",
          keywords: ["转移话题", "沉默", "算了", "晚风", "不说"],
          effects: { linche: { affinity: -10, trust: -12, alertness: 12 } },
          flagsOn: ["campusFinalSilent"],
          eventText: "她没有再追问，只是替你把沉默收好了。",
          summary: "你把最重要的话藏回去了。",
          ending: true
        }
      ]
    }
  },
  resolveEnding(state) {
    const linche = state.characters.linche;
    if (state.flags.campusFinalSilent || linche.trust <= 30 || linche.alertness >= 72) return "bad";
    if (
      state.flags.campusFinalConfess &&
      state.flags.campusGuardedStage &&
      linche.affinity >= 84 &&
      linche.trust >= 76
    ) {
      return "hidden";
    }
    if (state.flags.campusFinalConfess && linche.affinity >= 72 && linche.trust >= 66) return "good";
    return "normal";
  }
};

function enhanceCampusLove() {
  Object.assign(CAMPUSLOVE_PACK, {
    uiTheme: "campuslove",
    synopsis:
      "毕业前最后一个夏天，你重新遇见了曾一起做广播节目的林澈。你们之间有一场被错过的演出、一封没有寄出的信和一段始终没能解释清楚的沉默。这个故事不是从心动开始，而是从重新站回彼此前面开始。",
    description:
      "更强调校园日常、旧误会修复和青春电影感的长线恋爱剧本。玩家会先理解你和林澈为何渐行渐远，再在排练、散场和毕业前夜里一点点把关系真正救回来。",
    storyPromise:
      "这不是一段突然降临的恋爱，而是一个关于错过、补偿与重新靠近的完整夏天。你和林澈会一起穿过图书馆、广播站、旧礼堂、雨后天台、操场后台与毕业清晨，决定那封一直没寄出的信最终该停在抽屉里，还是被亲手读给彼此听。",
    cinematicLead: "青春里最难忘的从来不是第一次心动，而是那个你以为再也赶不上的人，忽然又站回你面前。",
    openingFrame:
      "图书馆门前的风把一张折痕明显的信纸吹到你脚边。你弯腰捡起它时，抱着谱夹跑下台阶的林澈恰好停在你面前，像是你们之间那段没说完的过去，终于被这个夏天重新翻开。",
    playerRole:
      "你和林澈曾在大一一起做过广播站的深夜栏目，也一起约好去看她第一次在旧礼堂的小型演出。可在那天之前，你因为家里的突发变故匆忙离校，既没能赴约，也没把后来的解释说完整。毕业季最后几周，你重新回到校园节奏里，第一次真正有机会把那段缺席补回来。",
    worldGuide:
      "故事发生在毕业前最后几周。白天是选修课、图书馆、广播站和社团交接，夜晚属于旧礼堂排练、雨后天台、操场后台与散场后的长椅。校园里每个地方都还留着旧夏天的痕迹，所以重逢不是从零开始，而是从回到曾经一起走过的地方开始。",
    castGuide: [
      { name: "林澈", role: "校园乐队主唱 / 前广播搭档", note: "在舞台上总是明亮又稳当，私下却会把真正的失落藏得很深。她最难放下的，不是当年的那次缺席本身，而是你后来始终没有给出的完整回答。" },
      { name: "许漫", role: "你的室友 / 唯一知情人", note: "知道你当年为什么突然离校，也知道你其实从来没有真正放下过林澈。她常常负责在你又想退一步时，把你推回该说的话前面。" }
    ],
    clueLibrary: {
      ...CAMPUSLOVE_PACK.clueLibrary,
      backstage_note: {
        id: "backstage_note",
        title: "后台手写提示",
        detail: "林澈在演出流程单背面写了一句：‘如果他今天也没来，我就把这首歌彻底留给夏天。’"
      },
      unsent_letter: {
        id: "unsent_letter",
        title: "未寄出的情书",
        detail: "信纸写完后被折了很多次，最后一句停在‘如果你那天真的有苦衷，我其实想听你亲口说。’"
      }
    },
    journeySetup: {
      aliasLabel: "她会怎样叫你",
      aliasPlaceholder: "例如：阿迟",
      setupPrompt: "重新回到林澈面前时，你想以怎样的方式进入这个夏天？",
      setupHint: "这个选择会影响她对你的第一轮感受，以及故事更偏向倾听、说清误会，还是主动陪伴。",
      presets: {
        witness: {
          title: "把她听完的人",
          short: "先听她把那段没说完的夏天讲完。",
          description: "你不急着证明自己，而是想先让林澈把失望、委屈和这些年没说出口的话讲完。这样的进入方式更容易修复信任。",
          lens: "先倾听，再回应",
          statSummary: "更容易获得信任与耐心"
        },
        truthseeker: {
          title: "想把误会说清的人",
          short: "你回来就是为了把当年的缺席解释完整。",
          description: "你会更主动追问旧事、逼近真正的答案，不愿让这段关系继续停在模糊和猜测里。这样更容易触发深层剧情，也更容易让情绪提前翻涌。",
          lens: "主动追问，尽快触碰真心",
          statSummary: "更容易推进深层线索，但更敏感"
        },
        guardian: {
          title: "不想再缺席的人",
          short: "你最想做的，是这次别再在关键时刻后退。",
          description: "你会更在意林澈面对舞台和毕业时是否有人陪在身边，也更倾向用行动补上曾经的空位。这样的进入方式更容易提高好感。",
          lens: "先陪伴，再谈答案",
          statSummary: "更容易提升好感与陪伴感"
        }
      }
    },
    progressSteps: [
      { key: "encounter", label: "图书馆偶遇" },
      { key: "daylight", label: "广播站午后" },
      { key: "rehearsal", label: "晚间排练" },
      { key: "rooftop", label: "雨后天台" },
      { key: "festival", label: "夏夜舞台" },
      { key: "afterglow", label: "散场长夜" },
      { key: "graduation", label: "毕业终章" }
    ]
  });

  CAMPUSLOVE_PACK.stages.campus_quad.choices.forEach((choice) => {
    choice.nextStageId = "campus_daylight";
  });

  Object.assign(CAMPUSLOVE_PACK.stages.campus_quad, {
    chapterLead: "有些重逢并不会给人准备的时间。你以为自己只是路过图书馆，却在捡起那页信纸时，被迫重新走回那个没有解释完的夏天。",
    build(state, incomingChoice) {
      const lead =
        {
          honest:
            "你已经不是第一次站在图书馆前等林澈了，只是这一次，等她的人终于不再打算继续装作偶然。",
          tease:
            "你还是下意识想用玩笑替自己挡一下，可林澈看向你的眼神已经在提醒你，这一次没有那么容易混过去。",
          guarded:
            "你原本想把这次碰面处理成一次无害的偶遇，可那页信纸落进手里的瞬间，很多借口都显得不再可靠。"
        }[incomingChoice?.parsedIntent] ||
        "图书馆闭馆广播还没响起，晚风先把那张折痕明显的信纸吹到了你脚边。";

      return {
        storyText: `${lead} 林澈抱着谱夹从台阶上快步下来，呼吸有些急，额前细碎的头发被风吹乱。她的手原本已经伸出来要拿回那页纸，视线在碰到你的那一瞬又僵住，像忽然意识到，自己真正慌张的不是信纸被看见，而是你终于又站到了她面前。你也在这一刻清楚地意识到，这个夏天之所以难，是因为你们之间从来不是“没开始”，而是一直停在“没说完”。`,
        npcDialogue: `“别先翻开。”林澈的声音很轻，和你记忆里广播站深夜收尾时的语气有些像，只是更绷紧了些，“${state.player.alias}，你今天为什么会出现在这里？如果你只是顺路，我可以现在就把它拿回去；但如果你不是……那你最好别再像以前一样，只说一半。”`,
        eventHint: "她问的不是你为什么来图书馆，而是你为什么现在才真正站到她面前。",
        eventTags: ["重逢", "旧约缺席", "未寄出的信"]
      };
    }
  });

  CAMPUSLOVE_PACK.stages.campus_daylight = {
    id: "campus_daylight",
    chapterTag: "第一幕 / 广播站午后",
    sceneTag: "旧广播站 / 下午",
    title: "那些没来得及说完的话",
    progressKey: "daylight",
    objective: "在白天的日常相处里重新找回你们的默契，让重逢不只是短暂心动。",
    stakes: "这一段会决定林澈是否愿意让你重新进入她真正的生活节奏。",
    entryClues: ["old_photo"],
    isCheckpoint: false,
    chapterLead: "真正让人重新靠近的，往往不是盛大的场面，而是某个普通午后，你们还能不能像以前一样，把话安静地说完。",
    build(state, incomingChoice) {
      const lead =
        {
          honest:
            "第二天午后，林澈把你约到了旧广播站。门一关上，外面毕业季的喧闹像被玻璃隔远，房间里只剩转得很慢的老吊扇、阳光里的灰尘和你们都熟悉的录音带气味。",
          tease:
            "林澈还是故意把语气放得轻松，像是怕一认真就会把气氛推得太满。可你走进广播站时，她把桌上那张旧合照按住的动作还是暴露了真正紧张的部分。",
          guarded:
            "哪怕前一晚你仍旧退了一步，林澈还是把你叫到了广播站。她像是给了你第二次机会，也像是在替自己确认，究竟还要不要继续相信那句迟到的解释。"
        }[incomingChoice?.parsedIntent] ||
        "旧广播站的门一关上，夏天忽然就安静了下来。";

      return {
        storyText: `${lead} 墙上还贴着你们大一做栏目时留下的手写歌单，最下面那一张已经微微卷边。林澈把一张旧合照推到你面前，照片里的你们站在广播站门口，肩膀挨得很近，像那时谁也没想过后来会有那么长的一段沉默。你忽然明白，她约你来这里，不只是为了叙旧，而是为了把你们真正出问题的地方重新摆回桌上。`,
        npcDialogue:
          "“我后来想过很多次，那天如果你提前跟我说一句，我是不是就不会那么生气。”林澈指尖压着照片边缘，声音没有责怪，却比责怪更让人难以躲开，“可你连解释都像只解释了一半。现在毕业快到了，我不想再把这件事拖成一个永远都没答案的夏天。”",
        eventHint: "她已经把旧误会放到你面前，你接下来决定的是修复、倾听还是再次转开视线。",
        eventTags: ["广播站", "旧合照", "重建默契"]
      };
    },
    eventHint: "她已经开始把过去和现在同时摆到你面前了。",
    eventTags: ["广播站", "旧合照", "重建默契"],
    choices: [
      {
        id: "campus_daylight_open",
        label: "接过合照，坦白说你这些年一直记得她。",
        intent: "daylightOpen",
        keywords: ["一直记得", "坦白", "合照", "这些年", "记得你"],
        effects: { linche: { affinity: 8, trust: 8, alertness: -4 } },
        flagsOn: ["campusDaylightOpen"],
        eventText: "你没有再把旧日默契装作偶然，林澈也终于不必继续一个人回想。",
        summary: "你主动把过去接了回来，关系因此真正开始升温。",
        nextStageId: "campus_rehearsal"
      },
      {
        id: "campus_daylight_listen",
        label: "先听她说完毕业和乐队的压力，再慢慢回应。",
        intent: "daylightListen",
        keywords: ["先听", "说完", "压力", "毕业", "回应"],
        effects: { linche: { affinity: 6, trust: 9, alertness: -3 } },
        flagsOn: ["campusDaylightListen"],
        eventText: "你的安静没有让气氛冷掉，反而给了她把心事摊开的空间。",
        summary: "你用耐心换来了更深的信任。",
        nextStageId: "campus_rehearsal"
      },
      {
        id: "campus_daylight_shift",
        label: "把话题转回社团和排练，暂时不碰更深的情绪。",
        intent: "daylightShift",
        keywords: ["排练", "社团", "先不说", "转回", "以后再聊"],
        effects: { linche: { affinity: 1, trust: -2, alertness: 5 } },
        flagsOn: ["campusDaylightShift"],
        eventText: "她没有拆穿你的闪躲，只把合照重新收回了抽屉里。",
        summary: "你留住了轻松，也推迟了真正的靠近。",
        nextStageId: "campus_rehearsal"
      }
    ]
  };

  Object.assign(CAMPUSLOVE_PACK.stages.campus_rehearsal, {
    chapterLead: "有些情绪只会在夜里排练。灯一暗，旧礼堂里最先被放大的不是鼓点，而是那些白天还没来得及回答的话。",
    build(state, incomingChoice) {
      const lead =
        {
          daylightOpen:
            "你从广播站出来后没有再逃。傍晚时分走进旧礼堂，林澈已经一个人在台上调试耳返，像是知道今晚终于能把真正的心事往前推一小步。",
          daylightListen:
            "广播站午后的那场长谈把你们之间僵着的地方松开了一些。到礼堂时，林澈没有像昨天那样先装轻松，而是直接把给你留的通行证放到台边。",
          daylightShift:
            "即便你白天仍旧把话题绕开，林澈还是在礼堂给你留了位置。只是她看向你的目光里多了一点谨慎，像还在等你决定要不要真正进来。",
          honest:
            "礼堂的灯只开了一半，林澈站在台上的背影被切成一圈温柔的边线。她看见你时没有明显地笑，只是把身边那瓶没开封的水往台沿推了一点，像是在说，至少今晚你还来得及。"
        }[incomingChoice?.parsedIntent] ||
        "旧礼堂的灯只开了一半，鼓点和晚风一起在空荡看台间回响。";

      return {
        storyText: `${lead} 这间礼堂过完暑假就会拆掉，所以这场毕业音乐会对林澈来说，比任何一次普通演出都更像告别。她低头翻着总谱，指尖在某一页停了很久。你走近时才看见，那一页副歌旁边写着一行小字，正是当年你们在广播站里一起想出来、后来却没能真正唱成的那句词。`,
        npcDialogue:
          "“我不是只在紧张演出。”林澈把拨片攥进掌心，声音有一点发哑，“我是在想，如果这首歌终于能在旧礼堂里唱完，可你还是像那次一样没有真正留下，那我是不是就该承认，有些人真的只会陪我走到一半。”",
        eventHint: "她已经把‘缺席’这个词说得很近了，这一轮决定你是用行动接住，还是继续让她一个人猜。",
        eventTags: ["旧礼堂", "最后演出", "缺席阴影"]
      };
    }
  });

  CAMPUSLOVE_PACK.stages.campus_rehearsal.choices.forEach((choice) => {
    choice.nextStageId = "campus_rooftop";
  });

  CAMPUSLOVE_PACK.stages.campus_rooftop = {
    id: "campus_rooftop",
    chapterTag: "第三幕 / 雨后天台",
    sceneTag: "教学楼天台 / 夜雨刚停",
    title: "差一点就说出口",
    progressKey: "rooftop",
    objective: "在演出前最安静的一夜里，判断你们能否先跨过心里的那道坎。",
    stakes: "这会影响她在舞台危机来临时，第一时间会不会本能地相信你。",
    entryClues: [],
    isCheckpoint: true,
    chapterLead: "青春故事里最难的一步，往往不是说喜欢，而是先承认自己其实一直都在等。",
    build() {
      return {
        storyText:
          "排练结束后，雨刚停，林澈没有立刻回宿舍，而是带你上了教学楼天台。远处操场的灯被潮湿空气晕成一团一团，栏杆上还挂着未干的雨水。你们肩并肩站着，楼下偶尔有毕业生骑车经过，笑声很远很轻，反而把这片安静衬得更适合说真话。林澈把那枚用了很多年的拨片夹在指间，迟迟没有开口，像是在给自己最后一次鼓起勇气的时间。",
        npcDialogue:
          "“我后来其实想明白了。”她终于抬头看你，眼睛里映着楼下斑驳的灯，“我生气不是因为你没来那场演出。我气的是你后来明明回来过，却一直不肯把真实原因完整告诉我。你知道吗，我最怕的不是唱砸，而是我认真等了很久的人，最后还是会在最关键的时候不站在我这边。”",
        eventHint: "她第一次把真正的不安说得这么直白，你给出的答案会决定这段关系能不能从‘重逢’进入‘重新开始’。",
        eventTags: ["天台", "雨后夜谈", "真心试探"]
      };
    },
    eventHint: "她把真正的不安说了出来，现在轮到你决定是接住，还是再次轻轻带过。",
    eventTags: ["天台", "雨后夜谈", "真心试探"],
    choices: [
      {
        id: "campus_rooftop_stay",
        label: "告诉她无论舞台还是毕业之后，你都会认真留在她身边。",
        intent: "rooftopStay",
        keywords: ["留在", "身边", "毕业之后", "认真", "不会走"],
        effects: { linche: { affinity: 10, trust: 11, alertness: -5 } },
        flagsOn: ["campusRooftopStay"],
        eventText: "你的回答没有夸张，却正好落在了她最想听见的位置上。",
        summary: "你给了她一份明确而温柔的依靠。",
        nextStageId: "campus_festival"
      },
      {
        id: "campus_rooftop_tease",
        label: "故意逗她，说你至少不会错过这么重要的演出。",
        intent: "rooftopTease",
        keywords: ["不会错过", "演出", "逗你", "重要", "当然会去"],
        effects: { linche: { affinity: 5, trust: 3, alertness: 2 } },
        flagsOn: ["campusRooftopTease"],
        eventText: "玩笑让她笑了，但也把那句真正想问的话留在了风里。",
        summary: "气氛轻了下来，答案却还没完全落地。",
        nextStageId: "campus_festival"
      },
      {
        id: "campus_rooftop_retreat",
        label: "先说她别想太多，等演出结束再谈这些。",
        intent: "rooftopRetreat",
        keywords: ["别想太多", "演出结束", "再谈", "先这样", "以后"],
        effects: { linche: { affinity: -2, trust: -5, alertness: 7 } },
        flagsOn: ["campusRooftopRetreat"],
        eventText: "她点了点头，却把本该更靠近的情绪又重新收了回去。",
        summary: "你把压力往后推，也把信任往后推了一步。",
        nextStageId: "campus_festival"
      }
    ]
  };

  Object.assign(CAMPUSLOVE_PACK.stages.campus_festival, {
    chapterLead: "真正重要的舞台，从来不只关乎掌声。对林澈来说，这一晚是旧礼堂最后一次亮灯，也是她最后一次决定要不要把这首歌唱给你听。",
    build(state, incomingChoice) {
      const lead =
        {
          rooftopStay:
            "你们从天台下来时，彼此之间那层最难说破的迟疑已经薄了许多。所以后台设备突发故障的那一刻，林澈几乎是本能地先回头看向你。",
          rooftopTease:
            "天台那场对话让气氛变轻了一些，却还没真正落到答案上。演出前后台忽然乱成一团时，林澈看向你的眼神里明显还带着一丝犹豫。",
          rooftopRetreat:
            "你在天台上把最重要的话又往后推了一次，所以当后台音响临时出问题时，林澈看向你时的第一反应里，更多是试探而不是依赖。"
        }[incomingChoice?.parsedIntent] ||
        "幕布后的喧闹声一阵高过一阵，旧礼堂最后一次夏夜演出，终于走到了真正开场前的那一分钟。";

      return {
        storyText: `${lead} 工作人员来回跑动，线路图、备用麦克风和老师的催促声混在一起。林澈站在候场口，吉他背带压过肩头，脸色比排练那晚还白了一点。可你能看出来，她真正慌的不是设备，而是这个夜晚会不会又变成另一次“明明很重要，却还是没能好好留下”的证明。`,
        npcDialogue:
          "“如果今晚也乱掉，我可能真的会记很多年。”林澈攥着流程单，声音压得很低，“我不是在问你能不能解决设备，我是在问……你这次会不会真的跟我站到同一边，直到灯亮起来。”",
        eventHint: "这不是一道技术题，而是立场题。你的回答会决定她愿不愿把最深的心意也交给这个夜晚。",
        eventTags: ["演出危机", "后台失序", "站在她身边"]
      };
    }
  });

  CAMPUSLOVE_PACK.stages.campus_festival.choices.forEach((choice) => {
    choice.nextStageId = "campus_afterglow";
  });

  CAMPUSLOVE_PACK.stages.campus_afterglow = {
    id: "campus_afterglow",
    chapterTag: "第四幕 / 散场长夜",
    sceneTag: "操场看台后 / 演出结束后",
    title: "那封终于递到你手里的信",
    progressKey: "afterglow",
    objective: "在掌声散去之后，决定你们如何面对那封一直没寄出的信，以及它背后的真正情绪。",
    stakes: "这一段会决定最终告白是建立在共同坦白之上，还是再次被留到以后。",
    entryClues: ["backstage_note", "unsent_letter"],
    isCheckpoint: true,
    build(state, incomingChoice) {
      const lead =
        {
          guardStage:
            "演出最终稳稳落了地。最后一首歌唱完时，林澈在灯光最亮的地方朝台下看了一眼，而你知道，那一眼其实是在确认你真的没有再缺席。",
          confide:
            "你在后台先一步把旧误会扯开之后，林澈整场演出都像终于卸下了一层重量。散场时她抱着吉他走向你，眼睛比上台前亮，也比上台前更脆弱。",
          stepBack:
            "演出还是顺利结束了，但你在后台那次后退留了痕。林澈谢幕时依旧稳稳唱完，可散场后朝你走来的步子明显比你记忆里慢了很多。"
        }[incomingChoice?.parsedIntent] || "掌声散去后，操场周围的风忽然显得格外清。";

      return {
        storyText: `${lead} 看台边的灯一盏盏暗下来，学生们拖着道具和笑声陆续离开，只剩余温还留在夏夜里。林澈把吉他放到一边，从谱夹最深处抽出一页已经被折出白痕的信纸。她没有立刻递给你，像是这几个月、甚至这几年里所有没说出口的话，都在这一秒重新变得沉。`,
        npcDialogue:
          "“这是我本来没打算让你看到的东西。”她终于把信纸递过来，指尖还带着一点演出后的凉意，“去年你没来那场演出以后，我写了很多遍，想问你到底为什么不来，也想问如果你那天真的有苦衷，为什么后来还是不肯好好告诉我。可我一直没寄出去，因为我不知道你是不是还在乎答案。”",
        eventHint: "这封信不是证据，而是林澈把压了很久的情绪第一次交到你手里。",
        eventTags: ["散场", "未寄出的信", "真正坦白"]
      };
    },
    choices: [
      {
        id: "campus_afterglow_read",
        label: "接过信纸，当着她的面把那段缺席和这些年的想念一起说清楚。",
        intent: "afterglowRead",
        keywords: ["说清楚", "接过信", "这些年", "想念", "缺席"],
        effects: { linche: { affinity: 10, trust: 12, alertness: -6 } },
        flagsOn: ["campusHeldLetter"],
        eventText: "你没有再把解释拆成零碎的片段，而是第一次把那年缺席前后的全部真相都放到了她面前。",
        summary: "你们终于不再只对着误会说话，而是开始对着彼此说话。",
        nextStageId: "campus_finale"
      },
      {
        id: "campus_afterglow_listen",
        label: "先把信收好，告诉她这次你想先听她把真正委屈的部分说完。",
        intent: "afterglowListen",
        keywords: ["先听", "委屈", "说完", "收好", "你先说"],
        effects: { linche: { affinity: 7, trust: 11, alertness: -4 } },
        flagsOn: ["campusLetHerSpeak"],
        eventText: "她第一次在你面前把委屈和想念都说得很完整，而你没有再打断，也没有再替自己找更轻的说法。",
        summary: "你用倾听接住了她最晚才交出来的情绪。",
        nextStageId: "campus_finale"
      },
      {
        id: "campus_afterglow_postpone",
        label: "把信轻轻折好，说今晚先别把话说得太满，等毕业典礼后再认真谈。",
        intent: "afterglowPostpone",
        keywords: ["别说太满", "毕业后", "再谈", "先收好", "以后"],
        effects: { linche: { affinity: -2, trust: -6, alertness: 8 } },
        flagsOn: ["campusPostponedAgain"],
        eventText: "她点头把情绪压了回去，可你们都知道，这一次的推迟已经不像温柔，更像再次错过的前奏。",
        summary: "你保留了空间，也让这段关系再次站到悬而未决的边缘。",
        nextStageId: "campus_finale"
      }
    ]
  };

  Object.assign(CAMPUSLOVE_PACK.stages.campus_finale, {
    chapterLead: "真正的毕业不只是离开校园，也是终于决定要不要把最重要的话在离开之前说出来。",
    build(state, incomingChoice) {
      const lead =
        {
          afterglowRead:
            "散场后的那封信像终于找到了归处。第二天清晨，毕业典礼开始前，你和林澈一起走过教学楼到操场的长坡，脚步比任何时候都慢。",
          afterglowListen:
            "你前一晚让林澈把最深的委屈说完，很多僵着的地方终于松开。毕业典礼的早晨没有谁先刻意提起昨晚，但你们之间的安静已经不再让人难受。",
          afterglowPostpone:
            "散场后的推迟一直压在你们之间。典礼清晨，校园里到处都是拍照和笑声，可你和林澈走在通往操场的林荫路上时，谁都知道有一句话再不说，就可能真的来不及了。"
        }[incomingChoice?.parsedIntent] || "毕业典礼开始前，校园比平时更亮，也更像一部快放完的电影。";

      return {
        storyText: `${lead} 树影筛下来的晨光落在林澈学士服的肩头，她手里还捏着那枚用了很多年的拨片，像从昨晚一直握到了现在。操场那边传来彩排的广播声，空气里有花束、草地和盛夏早晨混在一起的气味。你忽然明白，这就是最后的节点了，不只是这条校园小路，也是你们这几年迟迟没有抵达的那句答案。`,
        npcDialogue:
          "“我昨晚回宿舍以后，一直在想一件事。”林澈停下来看着你，语气轻得像怕惊动这个早晨，“如果我们今天各自去拍毕业照、各自走进新的生活，那我以后会不会永远记得，现在这句本来该说出口的话。${state.player.alias}，这次……你还想让我继续猜吗？”",
        eventHint: "你终于走到了这段故事真正的终点。接下来不是再试探，而是决定要不要真正开始。",
        eventTags: ["毕业清晨", "最终告白", "未来入口"]
      };
    }
  });

  CAMPUSLOVE_PACK.resolveEnding = (state) => {
    const linche = state.characters.linche;
    if (state.flags.campusFinalSilent || state.flags.campusPostponedAgain || linche.trust <= 30 || linche.alertness >= 72) {
      return "bad";
    }
    if (
      state.flags.campusFinalConfess &&
      state.flags.campusGuardedStage &&
      state.flags.campusHeldLetter &&
      linche.affinity >= 84 &&
      linche.trust >= 76
    ) {
      return "hidden";
    }
    if (state.flags.campusFinalConfess && linche.affinity >= 72 && linche.trust >= 66) return "good";
    return "normal";
  };
}

function applyCampusInteractionModes() {
  Object.assign(CAMPUSLOVE_PACK, {
    hiddenTruths: [
      "林澈即将因家庭原因转学离开",
      "圆形广场的时间胶囊里藏着未寄出的第一封信",
      "音乐节的曲目安排中隐藏着一首写给你的歌"
    ],
    forbiddenReveals: [
      "林澈转学的确切日期",
      "学校关于社团改制的内部决定"
    ],
    characterTopics: {
      linche: [
        { topic: "音乐", unlockFlag: null },
        { topic: "乐队", unlockFlag: null },
        { topic: "毕业", unlockFlag: "campusRehearsalDone" },
        { topic: "未来", unlockFlag: "campusRooftopVisited" },
        { topic: "那封信", unlockFlag: "foundTimeCapsule" }
      ],
      roommate: [
        { topic: "八卦", unlockFlag: null },
        { topic: "林澈", unlockFlag: null },
        { topic: "策略", unlockFlag: "campusQuadDone" }
      ]
    }
  });

  // extend campuslove clue library
  Object.assign(CAMPUSLOVE_PACK.clueLibrary, {
    bench_secret: { id: "bench_secret", title: "花坛秘密", detail: "长椅下花坛边刻着'在这里埋了一个秘密 2024.3'。" },
    time_capsule_letter: { id: "time_capsule_letter", title: "时间胶囊里的信", detail: "一封叠得整齐的信，信封上写着'如果你也在这里'。" },
    song_draft: { id: "song_draft", title: "手写歌词草稿", detail: "林澈桌上的歌词稿，标题被涂掉了，依稀看到'如果那天没有下雨'。" },
    duet_score: { id: "duet_score", title: "双人乐谱", detail: "一首没有标题的曲子，编曲为独唱设计，但标注了两个人的位置。" },
    rooftop_wish: { id: "rooftop_wish", title: "心愿丝带", detail: "天台栏杆上的新丝带背面写着'希望最后一场演出之前，能说出来'。" }
  });

  // campus_quad: 广场初遇 — explore + dialogue
  Object.assign(CAMPUSLOVE_PACK.stages.campus_quad, {
    allowExplore: true,
    allowDialogue: true,
    exploreTargets: [
      {
        keywords: ["公告栏", "海报", "通知", "告示"],
        resolve(state) {
          return {
            feedback: "公告栏上贴着音乐节的报名公告和一张手写的乐队招募启事——字迹清秀但有些潦草，落款是'林澈'。",
            narrativeText: "你走近圆形广场的公告栏。",
            flagsOn: ["sawBandRecruit"]
          };
        }
      },
      {
        keywords: ["花坛", "花", "长椅", "树下"],
        resolve(state) {
          return {
            feedback: "长椅下方的花坛边缘有一行用指甲刻上去的小字：'在这里埋了一个秘密 2024.3'。日期是三个月前。",
            narrativeText: "你在广场的花坛边坐下，注意到了什么。",
            clueId: "bench_secret"
          };
        }
      },
      {
        keywords: ["时间胶囊", "胶囊", "埋", "秘密"],
        requireFlag: "bench_secret",
        resolve(state) {
          return {
            feedback: "你小心翼翼地拨开泥土，发现了一个小铁盒。里面是一封叠得整整齐齐的信，信封上写着'如果你也在这里'。",
            narrativeText: "你顺着线索找到了埋在花坛里的东西。",
            clueId: "time_capsule_letter",
            flagsOn: ["foundTimeCapsule"],
            event: "发现了一封时间胶囊里的信",
            eventHot: true
          };
        }
      }
    ],
    dialogueRules: {
      linche: [
        {
          keywords: ["音乐", "唱歌", "乐队", "吉他"],
          resolve(state, character) {
            return {
              response: `${character.name}的眼睛亮了一下: "你也喜欢音乐？——等等，你是来报名的吗？我们正好缺一个……算了，你先听听我们排练再说。"`,
              mood: "兴奋",
              effects: { linche: { affinity: 4, trust: 2 } }
            };
          }
        },
        {
          keywords: ["你好", "认识", "名字", "自我介绍"],
          resolve(state, character) {
            return {
              response: `${character.name}把耳机挂到脖子上，微微歪头: "我叫林澈，音乐社的。你呢？——不对，我好像在社团迎新的时候见过你？"`,
              mood: "友善",
              effects: { linche: { affinity: 3 } }
            };
          }
        }
      ],
      roommate: [
        {
          keywords: ["林澈", "那个人", "他是谁"],
          resolve(state, character) {
            return {
              response: `许漫推了推眼镜，露出了然于心的笑: "林澈啊？音乐社大二的，据说会弹好几种乐器，人还特别好。你问这个干嘛——不会是对他有意思吧？"`,
              mood: "起哄",
              effects: { linche: { affinity: 1 } }
            };
          }
        }
      ]
    }
  });

  // campus_daylight: 日间相处 — explore + dialogue
  if (CAMPUSLOVE_PACK.stages.campus_daylight) {
    Object.assign(CAMPUSLOVE_PACK.stages.campus_daylight, {
      allowExplore: true,
      allowDialogue: true,
      exploreTargets: [
        {
          keywords: ["琴房", "练习室", "排练"],
          resolve(state) {
            return {
              feedback: "琴房的白板上写着最近的排练曲目，其中有一首被圈了又圈，旁边备注写着'这首要特别一点'。",
              narrativeText: "你悄悄看了一眼琴房里的白板。",
              flagsOn: ["sawSpecialSong"]
            };
          }
        },
        {
          keywords: ["书包", "桌上", "笔记", "歌词"],
          resolve(state) {
            return {
              feedback: "林澈桌上散落着几张手写歌词，最上面一张的标题被涂掉了，但你依稀辨认出几个词：'如果那天没有下雨'。",
              narrativeText: "你瞥见了桌上的纸张。",
              clueId: "song_draft"
            };
          }
        }
      ],
      dialogueRules: {
        linche: [
          {
            keywords: ["曲子", "歌", "写歌", "创作"],
            resolve(state, character) {
              return {
                response: `${character.name}条件反射地把桌上的稿纸翻过去: "没什么，就随便写写。其实我最近在试一种新的编曲方式，就是……嗯，等我弄好了再给你听吧。"`,
                mood: "局促",
                effects: { linche: { affinity: 3, trust: 2 } }
              };
            }
          },
          {
            keywords: ["毕业", "以后", "未来", "打算"],
            resolve(state, character) {
              return {
                response: `${character.name}笑容淡了一瞬: "以后啊……还没想那么远。先把音乐节弄好再说。"他转移话题的方式很自然，但你隐约觉得有什么被藏了起来。`,
                mood: "闪避",
                effects: { linche: { alertness: 3 } }
              };
            }
          }
        ]
      }
    });
  }

  // campus_rehearsal: 排练 — dialogue focused
  Object.assign(CAMPUSLOVE_PACK.stages.campus_rehearsal, {
    allowDialogue: true,
    allowExplore: true,
    exploreTargets: [
      {
        keywords: ["乐谱", "谱子", "曲谱"],
        resolve(state) {
          return {
            feedback: "散落在排练室的乐谱里，你找到了一首没有标题的曲子。旋律简单却动人，编曲明显是为独唱设计的——但位置却标注了两个人。",
            narrativeText: "你拾起地上散落的乐谱仔细看。",
            clueId: "duet_score"
          };
        }
      }
    ],
    dialogueRules: {
      linche: [
        {
          keywords: ["紧张", "准备好了吗", "加油"],
          resolve(state, character) {
            return {
              response: `${character.name}转过吉他，手指在弦上停了一瞬: "说不紧张是假的。但有人愿意听我弹的时候，就觉得比一个人练习的时候好很多。"`,
              mood: "认真",
              effects: { linche: { affinity: 4, trust: 3 } }
            };
          }
        },
        {
          keywords: ["那首歌", "特别", "为谁写的"],
          requireFlag: "sawSpecialSong",
          resolve(state, character) {
            return {
              response: `${character.name}的手指明显顿了一下，耳朵微微发红: "你看到了啊……那首歌还没写完，等写完了你就知道了。"`,
              mood: "羞涩",
              effects: { linche: { affinity: 5, alertness: -3 } },
              event: "林澈对那首特别的歌表现出了异常的在意",
              eventHot: true
            };
          }
        }
      ]
    }
  });

  // campus_rooftop: 天台 — explore + dialogue (intimate)
  if (CAMPUSLOVE_PACK.stages.campus_rooftop) {
    Object.assign(CAMPUSLOVE_PACK.stages.campus_rooftop, {
      allowExplore: true,
      allowDialogue: true,
      exploreTargets: [
        {
          keywords: ["天台", "栏杆", "远处", "风景"],
          resolve(state) {
            return {
              feedback: "天台的栏杆上绑了很多彩色丝带，据说是毕业生离开前留下的许愿。其中有一条新的，颜色和林澈经常戴的手环一样。",
              narrativeText: "你站在天台边上看着远方。"
            };
          }
        },
        {
          keywords: ["手环", "丝带", "许愿"],
          resolve(state) {
            return {
              feedback: "那条新丝带的背面写着一行很小的字：'希望最后一场演出之前，能说出来。'",
              narrativeText: "你凑近看了那条特别的丝带。",
              clueId: "rooftop_wish",
              event: "发现了林澈的心愿丝带"
            };
          }
        }
      ],
      dialogueRules: {
        linche: [
          {
            keywords: ["喜欢", "在意", "感觉", "心意"],
            resolve(state, character) {
              return {
                response: `${character.name}没有回头，风把他的碎发吹乱: "你有没有那种感觉——有些话如果不在特定的时间说出来，就再也没有合适的时机了？"`,
                mood: "思念",
                effects: { linche: { affinity: 6, trust: 5 } },
                event: "天台上，林澈的防线出现了松动"
              };
            }
          },
          {
            keywords: ["转学", "离开", "走"],
            resolve(state, character) {
              return {
                response: `${character.name}猛地转过头，表情像是没来得及收起的慌张: "你怎么知道的？——不，这件事还没有确定。我、我还在想办法。"`,
                mood: "震惊",
                effects: { linche: { trust: -4, alertness: 6 } },
                event: "你触碰到了林澈最不想面对的话题",
                eventHot: true
              };
            }
          }
        ]
      }
    });
  }

  // campus_festival: 音乐节 — dialogue before the big performance
  Object.assign(CAMPUSLOVE_PACK.stages.campus_festival, {
    allowDialogue: true,
    dialogueRules: {
      linche: [
        {
          keywords: ["最后", "结束", "以后怎么办"],
          resolve(state, character) {
            return {
              response: `${character.name}握紧了吉他拨片: "如果今天是最后一次站在这个舞台上，至少让我把该唱的都唱完。剩下的事——演出结束再说。"`,
              mood: "决绝",
              effects: { linche: { trust: 4 } }
            };
          }
        },
        {
          keywords: ["一起", "陪你", "我在"],
          resolve(state, character) {
            return {
              response: `${character.name}在后台看着你，忽然什么都没说，只是把手伸出来，掌心朝上。`,
              mood: "温柔",
              effects: { linche: { affinity: 8, trust: 5 } },
              event: "音乐节后台，你们之间的距离从未如此近"
            };
          }
        }
      ]
    }
  });

}

enhanceCampusLove();
applyCampusInteractionModes();

export { CAMPUSLOVE_PACK };
