export const STORY_DISPLAY = {
  mistycity: {
    featuredCategory: "悬疑推理",
    tags: ["悬疑推理", "多结局"],
    duration: "4-5h",
    difficulty: "较高",
    playCount: "4.8万",
    rating: "9.6",
    badge: "独家",
    badgeClass: "exclusive",
    recommended: true,
    logline: "一封匿名来信，把你带进雾城与旧组织的真相。",
    featuredCopy: "二十世纪二十年代的雾都，选择将决定你与迷城守夜人之间的命运。"
  },
  campuslove: {
    featuredCategory: "情感沉浸",
    tags: ["校园恋爱", "青春电影感"],
    duration: "3-4h",
    difficulty: "轻中度",
    playCount: "3.2万",
    rating: "9.3",
    badge: "",
    badgeClass: "",
    recommended: true,
    logline: "一封没寄出的信，把你重新带回那个未完成的夏天。",
    featuredCopy: "图书馆、广播站、旧礼堂与毕业前夜，这一次你终于能把那句迟到的话说完。"
  },
  boardroom: {
    featuredCategory: "都市博弈",
    tags: ["都市商战", "成年关系"],
    duration: "4-5h",
    difficulty: "中高难度",
    playCount: "2.8万",
    rating: "9.1",
    badge: "推荐",
    badgeClass: "new",
    recommended: true,
    logline: "一次并购，不止关乎筹码，更关乎信任与承担。",
    featuredCopy: "你和沈曼会在酒会、会议室与深夜露台之间，慢慢看清真正昂贵的从来不是交易本身。"
  },
  cyberpunk: {
    featuredCategory: "未来科幻",
    tags: ["赛博朋克", "高压潜行"],
    duration: "5-6h",
    difficulty: "高难度",
    playCount: "2.1万",
    rating: "9.4",
    badge: "新作",
    badgeClass: "free",
    recommended: true,
    logline: "霓虹深处的每一次接入，都可能篡改你对真实的判断。",
    featuredCopy: "在黑客渗透、身份伪装与记忆偏移之间，你需要决定自己究竟站在哪一边。"
  },
  tingwan: {
    featuredCategory: "都市恋爱",
    tags: ["久别重逢", "合租心动"],
    duration: "2-3h",
    difficulty: "轻中度",
    playCount: "新作",
    rating: "9.5",
    badge: "连载",
    badgeClass: "new",
    recommended: true,
    logline: "一场雨夜重逢，把你重新带回那个以为已经成为过去的人身边。",
    featuredCopy: "玄关、客厅、厨房、阳台与深夜便签之间，所有没说完的话都在慢慢回潮。"
  }
};

export function getStoryDisplay(storyId) {
  return STORY_DISPLAY[storyId] || {
    featuredCategory: "剧情叙事",
    tags: ["剧情叙事"],
    duration: "3-4h",
    difficulty: "标准",
    playCount: "1.0万",
    rating: "9.0",
    badge: "",
    badgeClass: "",
    recommended: true,
    logline: "一段等待你推进的故事。",
    featuredCopy: "你的选择会在不同章节里留下不一样的回声。"
  };
}
