import { prisma } from "../lib/prisma.js";

function toSummary(story) {
  return {
    id: story.id,
    title: story.title,
    subtitle: story.subtitle,
    genre: story.genre,
    themeLabel: story.themeLabel,
    synopsis: story.synopsis,
    description: story.description,
    uiTheme: story.uiTheme || story.id,
    coverImage: story.coverImage || null,
    initialStageId: story.initialStageId,
    characterCount: story.characterCount || 0,
    progressStepCount: story.progressStepCount || 0,
    endingCount: story.endingCount || 0,
    display: story.display || {}
  };
}

export async function listStories() {
  const stories = await prisma.story.findMany({
    where: { isPublished: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }]
  });

  return stories.map(toSummary);
}

export async function getStoryDetail(storyId) {
  const story = await prisma.story.findUnique({ where: { id: storyId } });
  if (!story || !story.isPublished) return null;

  const packData = story.packData || {};

  return {
    ...toSummary(story),
    playerRole: story.playerRole,
    storyPromise: story.storyPromise,
    cinematicLead: story.cinematicLead,
    openingFrame: story.openingFrame,
    worldGuide: story.worldGuide,
    castGuide: story.castGuide || [],
    journeySetup: story.journeySetup || null,
    progressSteps: story.progressSteps || [],
    endings: story.endings || [],
    stages: story.stages || [],
    initialEventText: packData.initialEventText || null,
    primaryCharacterId: packData.primaryCharacterId || null,
    clueLibrary: packData.clueLibrary || {},
    initialCharacters: packData.initialCharacters || {},
    hiddenTruths: packData.hiddenTruths || [],
    forbiddenReveals: packData.forbiddenReveals || [],
    characterTopics: packData.characterTopics || {},
    stageMap: packData.stages || {},
    packData,
  };
}
