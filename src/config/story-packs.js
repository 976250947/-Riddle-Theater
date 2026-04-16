import { ENDING_ORDER, PLAYER_ARCHETYPES } from "./constants.js";
import { interpolateText, resolveStageText } from "./stories/_helpers.js";
import { MISTYCITY_PACK } from "./stories/mistycity.js";
import { CAMPUSLOVE_PACK } from "./stories/campuslove.js";
import { BOARDROOM_PACK } from "./stories/boardroom.js";
import { CYBERPUNK_PACK } from "./stories/cyberpunk.js";
import { TINGWAN_PACK } from "./stories/tingwan.js";

export const DEFAULT_STORY_ID = "mistycity";

export const STORY_PACKS = {
  [MISTYCITY_PACK.id]: MISTYCITY_PACK,
  [CAMPUSLOVE_PACK.id]: CAMPUSLOVE_PACK,
  [BOARDROOM_PACK.id]: BOARDROOM_PACK,
  [CYBERPUNK_PACK.id]: CYBERPUNK_PACK,
  [TINGWAN_PACK.id]: TINGWAN_PACK
};

export function getStoryPack(storyId = DEFAULT_STORY_ID) {
  return STORY_PACKS[storyId] || STORY_PACKS[DEFAULT_STORY_ID];
}

export function getStoryList() {
  return Object.values(STORY_PACKS);
}

export function getJourneyConfig(storyId = DEFAULT_STORY_ID) {
  const pack = getStoryPack(storyId);
  return (
    pack.journeySetup || {
      aliasLabel: "旅人代号",
      aliasPlaceholder: "例如：无名旅人",
      setupPrompt: "你想以怎样的方式开始这段故事？",
      setupHint: "这个选择会影响初始关系值，以及故事更偏向信任、追问还是守护的推进方式。",
      presets: {}
    }
  );
}

export function getJourneyPreset(storyId = DEFAULT_STORY_ID, archetypeId = "witness") {
  const config = getJourneyConfig(storyId);
  const preset = config.presets?.[archetypeId];
  const fallback = PLAYER_ARCHETYPES[archetypeId] || PLAYER_ARCHETYPES.witness;

  return {
    id: archetypeId,
    title: preset?.title || fallback.title,
    short: preset?.short || fallback.short,
    description: preset?.description || fallback.description,
    lens: preset?.lens || "",
    statSummary: preset?.statSummary || ""
  };
}

export function buildStoryStateMeta(pack) {
  return {
    id: pack.id,
    title: pack.title,
    subtitle: pack.subtitle,
    genre: pack.genre,
    themeLabel: pack.themeLabel,
    synopsis: pack.synopsis,
    description: pack.description,
    uiTheme: pack.uiTheme,
    storyPromise: pack.storyPromise,
    cinematicLead: pack.cinematicLead,
    openingFrame: pack.openingFrame,
    playerRole: pack.playerRole,
    worldGuide: pack.worldGuide,
    castGuide: pack.castGuide,
    journeySetup: pack.journeySetup,
    primaryCharacterId: pack.primaryCharacterId,
    progressSteps: pack.progressSteps
  };
}

export function buildStagePayload(stage, state, incomingChoice = null) {
  const publicScript = interpolateText(stage.public_script || "", state);

  return {
    storyText: resolveStageText(stage, state, incomingChoice) || publicScript,
    npcDialogue: interpolateText(stage.npcDialogue || "", state),
    eventHint: interpolateText(stage.eventHint || "", state),
    eventTags: stage.eventTags || [],
    npcSpeakerId: stage.npcSpeakerId || state.story.primaryCharacterId,
    publicScript,
    sceneCard: stage.scene_card || null,
    visualState: stage.visual_state || null
  };
}

export function toEndingKey(storyId, endingId) {
  return `${storyId}:${endingId}`;
}

export function getUnlockedEndingsForStory(meta, storyId) {
  return ENDING_ORDER.filter((endingId) => meta.unlockedEndings.includes(toEndingKey(storyId, endingId)));
}
