import { PrismaClient } from "@prisma/client";
import { getStoryDisplay } from "../../src/config/story-display.js";
import { getStoryList } from "../../src/config/story-packs.js";

const prisma = new PrismaClient();

const STORY_COVER_MAP = {
  mistycity: "/covers/Chronicles-of-Fate.png",
  campuslove: "/covers/Letters-Before-Graduation.png",
  boardroom: "/covers/Echoes-of the-Boardroom.png",
  cyberpunk: "/covers/Neon-Distortion.png",
};

function stripFunctionsDeep(value) {
  if (value === null || value === undefined) return value;
  if (typeof value === "function") return undefined;
  if (Array.isArray(value)) {
    return value
      .map((item) => stripFunctionsDeep(item))
      .filter((item) => item !== undefined);
  }
  if (typeof value === "object") {
    const next = {};
    for (const [key, nestedValue] of Object.entries(value)) {
      const cleaned = stripFunctionsDeep(nestedValue);
      if (cleaned !== undefined) {
        next[key] = cleaned;
      }
    }
    return next;
  }
  return value;
}

function toStoryRecord(pack, sortOrder) {
  const packData = stripFunctionsDeep(pack);

  return {
    id: pack.id,
    title: pack.title,
    subtitle: pack.subtitle,
    genre: pack.genre,
    themeLabel: pack.themeLabel,
    synopsis: pack.synopsis,
    description: pack.description,
    uiTheme: pack.uiTheme || pack.id,
    coverImage: STORY_COVER_MAP[pack.id] || null,
    initialStageId: pack.initialStageId,
    characterCount: Object.keys(pack.initialCharacters || {}).length + 1,
    progressStepCount: (pack.progressSteps || []).length,
    endingCount: Object.keys(pack.endings || {}).length,
    playerRole: pack.playerRole || null,
    storyPromise: pack.storyPromise || null,
    cinematicLead: pack.cinematicLead || null,
    openingFrame: pack.openingFrame || null,
    worldGuide: pack.worldGuide || null,
    castGuide: pack.castGuide || [],
    journeySetup: pack.journeySetup || null,
    progressSteps: pack.progressSteps || [],
    endings: Object.values(pack.endings || {}).map((ending) => ({
      id: ending.id,
      title: ending.title,
      subtitle: ending.subtitle,
      badge: ending.badge,
      description: ending.description,
      conditions: ending.conditions || []
    })),
    stages: Object.values(pack.stages || {}).map((stage) => ({
      id: stage.id,
      title: stage.title,
      chapterTag: stage.chapterTag,
      sceneTag: stage.sceneTag,
      objective: stage.objective,
      stakes: stage.stakes,
      eventTags: stage.eventTags || [],
      isCheckpoint: Boolean(stage.isCheckpoint)
    })),
    display: getStoryDisplay(pack.id),
    packData,
    sortOrder,
    isPublished: true,
  };
}

async function main() {
  const stories = getStoryList().map((pack, index) => toStoryRecord(pack, index));
  const comments = [
    {
      storyId: "mistycity",
      alias: "雾都守夜人",
      content: "第一章的悬疑氛围很稳，适合做课程展示里的开场案例。"
    },
    {
      storyId: "tingwan",
      alias: "临川晚风",
      content: "《听晚》的 sceneCard 设计很适合拿来讲受控 LLM 的实现思路。"
    },
    {
      storyId: "boardroom",
      alias: "会议室旁听者",
      content: "如果后续补上真实评论和点赞，这个项目会更像完整平台。"
    }
  ];

  for (const story of stories) {
    await prisma.story.upsert({
      where: { id: story.id },
      update: story,
      create: story,
    });
  }

  for (const item of comments) {
    const exists = await prisma.comment.findFirst({
      where: { storyId: item.storyId, alias: item.alias, content: item.content }
    });

    if (!exists) {
      await prisma.comment.create({ data: item });
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
