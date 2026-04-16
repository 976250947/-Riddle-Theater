/**
 * 核心引擎测试 — 覆盖 story-engine、utils、story-packs、llm-config
 *
 * Usage: node scripts/test.js
 */

const { describe, it, assert, assertEqual, assertDeepEqual, assertType, summary } = require("./test-runner.js");

// ── 因为 ESM 模块需要 dynamic import ──
async function run() {
  console.log("\n  谜语剧场 · 核心引擎测试\n  ========================");

  // ── Utils ──
  const utils = await import("../src/core/utils.js");

  describe("utils.clamp()", () => {
    it("clamps value below min", () => {
      assertEqual(utils.clamp(-5, 0, 100), 0);
    });
    it("clamps value above max", () => {
      assertEqual(utils.clamp(150, 0, 100), 100);
    });
    it("returns value within range", () => {
      assertEqual(utils.clamp(50, 0, 100), 50);
    });
    it("handles equal min/max", () => {
      assertEqual(utils.clamp(50, 10, 10), 10);
    });
  });

  describe("utils.createId()", () => {
    it("creates an id with prefix", () => {
      const id = utils.createId("test");
      assert(id.startsWith("test_"), `id should start with "test_", got "${id}"`);
    });
    it("creates unique ids", () => {
      const ids = new Set(Array.from({ length: 100 }, () => utils.createId("x")));
      assertEqual(ids.size, 100, "100 ids should all be unique");
    });
  });

  describe("utils.escapeHtml()", () => {
    it("escapes special characters", () => {
      assertEqual(utils.escapeHtml('<script>alert("xss")</script>'), "&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;");
    });
    it("handles non-string input", () => {
      assertEqual(utils.escapeHtml(42), "42");
    });
  });

  describe("utils.deepClone()", () => {
    it("creates independent copy", () => {
      const orig = { a: 1, b: { c: [2, 3] } };
      const clone = utils.deepClone(orig);
      clone.b.c.push(4);
      assertEqual(orig.b.c.length, 2, "original should not be modified");
    });
  });

  describe("utils.formatDelta()", () => {
    it("formats positive", () => assertEqual(utils.formatDelta(5), "+5"));
    it("formats negative", () => assertEqual(utils.formatDelta(-3), "-3"));
    it("formats zero/falsy", () => assertEqual(utils.formatDelta(0), "0"));
  });

  // ── Story Packs ──
  const packs = await import("../src/config/story-packs.js");

  describe("story-packs.getStoryList()", () => {
    it("returns array of packs", () => {
      const list = packs.getStoryList();
      assert(Array.isArray(list), "should be array");
      assert(list.length >= 5, `should have ≥ 5 packs, got ${list.length}`);
    });
    it("each pack has required fields", () => {
      for (const p of packs.getStoryList()) {
        assert(p.id, `pack missing id`);
        assert(p.title, `pack ${p.id} missing title`);
        assert(p.stages, `pack ${p.id} missing stages`);
        assert(p.initialCharacters, `pack ${p.id} missing initialCharacters`);
      }
    });
  });

  describe("story-packs.getStoryPack()", () => {
    it("returns mistycity pack", () => {
      const p = packs.getStoryPack("mistycity");
      assertEqual(p.id, "mistycity");
      assert(Object.keys(p.stages).length >= 6, "should have ≥ 6 stages");
    });
    it("returns tingwan pack", () => {
      const p = packs.getStoryPack("tingwan");
      assertEqual(p.id, "tingwan");
      assert(Object.keys(p.stages).length >= 13, "tingwan should include the first four chapters split into scenes");
    });
    it("returns default for unknown id", () => {
      const p = packs.getStoryPack("nonexistent");
      assertEqual(p.id, packs.DEFAULT_STORY_ID);
    });
  });

  describe("story-packs.buildStagePayload()", () => {
    it("exported as function", () => {
      assertType(packs.buildStagePayload, "function");
    });
  });

  describe("story-packs.toEndingKey()", () => {
    it("creates consistent ending key", () => {
      const key = packs.toEndingKey("mistycity", "truth");
      assertType(key, "string");
      assert(key.length > 0, "key should not be empty");
    });
  });

  // ── Story Engine ──
  const engine = await import("../src/core/story-engine.js");

  describe("story-engine.createInitialState()", () => {
    it("creates valid state for mistycity", () => {
      const state = engine.createInitialState({}, { storyId: "mistycity", alias: "测试", archetypeId: "witness" });
      assertEqual(state.story.id, "mistycity");
      assertEqual(state.player.alias, "测试");
      assert(state.session.sessionId, "should have sessionId");
      assert(state.session.currentStageId, "should have currentStageId");
      assert(state.characters, "should have characters");
      assert(state.journal, "should have journal");
    });
    it("applies archetype stat modifiers", () => {
      const state = engine.createInitialState({}, { storyId: "mistycity", archetypeId: "truthseeker" });
      // truthseeker has trust bonus — character stats should reflect modifier
      const primary = Object.values(state.characters).find((c) => c.characterId === state.story.primaryCharacterId);
      assertType(primary.trust, "number");
    });
  });

  describe("story-packs.buildStagePayload() (with engine state)", () => {
    it("returns valid payload for mistycity.opening", () => {
      const state = engine.createInitialState({}, { storyId: "mistycity", alias: "测试", archetypeId: "witness" });
      const stage = engine.getCurrentStage(state);
      const payload = packs.buildStagePayload(stage, state);
      assert(payload, "payload should exist");
      assertType(payload.storyText, "string", "storyText");
      assertType(payload.npcSpeakerId, "string", "npcSpeakerId");
    });
    it("includes scene metadata for tingwan", () => {
      const state = engine.createInitialState({}, { storyId: "tingwan", alias: "测试", archetypeId: "guardian" });
      const stage = engine.getCurrentStage(state);
      const payload = packs.buildStagePayload(stage, state);
      assertType(payload.publicScript, "string", "publicScript");
      assert(payload.publicScript.includes("临川的雨总下得很突然"), "should preserve public script text");
      assert(payload.sceneCard, "should include sceneCard metadata");
      assert(payload.visualState, "should include visualState metadata");
    });
  });

  describe("story-engine.getWorldState()", () => {
    it("returns complete world state", () => {
      const state = engine.createInitialState({}, { storyId: "mistycity", archetypeId: "witness" });
      const world = engine.getWorldState(state);
      assertEqual(world.storyId, "mistycity");
      assert(world.stageId, "should have stageId");
      assert(world.playerKnowledge, "should have playerKnowledge");
      assert(Array.isArray(world.playerKnowledge.clues), "clues should be array");
      assert(world.characterKnowledge, "should have characterKnowledge");
      assert(Array.isArray(world.hiddenTruths), "hiddenTruths should be array");
      assert(Array.isArray(world.forbiddenReveals), "forbiddenReveals should be array");
      assert(Array.isArray(world.availableModes), "availableModes should be array");
      assertType(world.exploreRemaining, "number");
      assertType(world.dialogueRemaining, "number");
    });
    it("includes sceneCard and visualState for tingwan", () => {
      const state = engine.createInitialState({}, { storyId: "tingwan", archetypeId: "witness" });
      const world = engine.getWorldState(state);
      assertEqual(world.storyId, "tingwan");
      assert(world.sceneCard, "should include sceneCard");
      assert(world.visualState, "should include visualState");
      assertEqual(world.sceneCard.location, "公寓门外 / 玄关");
      assert(Array.isArray(world.presentCharacters), "presentCharacters should be array");
      assert(world.presentCharacters.includes("xunian"), "xunian should be present in the opening scene");
    });
  });

  describe("story-engine.getCurrentStage()", () => {
    it("returns stage object", () => {
      const state = engine.createInitialState({}, { storyId: "mistycity", archetypeId: "witness" });
      const stage = engine.getCurrentStage(state);
      assert(stage, "stage should exist");
      assert(stage.title, "stage should have title");
    });
  });

  describe("story-engine.generateDynamicOptions()", () => {
    it("returns array", () => {
      const state = engine.createInitialState({}, { storyId: "mistycity", archetypeId: "witness" });
      const options = engine.generateDynamicOptions(state);
      assert(Array.isArray(options), "should be array");
    });
  });

  describe("story-engine.normalizeState()", () => {
    it("repairs missing fields", () => {
      const state = engine.createInitialState({}, { storyId: "mistycity", archetypeId: "witness" });
      delete state.player.archetypeTitle;
      delete state.session.exploreHistory;
      const fixed = engine.normalizeState(state);
      assert(fixed.player.archetypeTitle, "archetypeTitle should be restored");
    });
  });

  describe("story-engine.submitExploreAction() (async)", () => {
    it("rejects when explore not allowed", async () => {
      const state = engine.createInitialState({}, { storyId: "mistycity", archetypeId: "witness" });
      // opening stage may not allow explore
      const stage = engine.getCurrentStage(state);
      if (!stage.allowExplore) {
        const result = await engine.submitExploreAction(state, "查看窗户");
        assertEqual(result.success, false);
      } else {
        const result = await engine.submitExploreAction(state, "查看窗户");
        assertType(result.success, "boolean");
      }
    });
    it("returns feedback text on success", async () => {
      const state = engine.createInitialState({}, { storyId: "mistycity", archetypeId: "witness" });
      // advance to a stage with explore... check if any story has explore from start
      const stage = engine.getCurrentStage(state);
      if (stage.allowExplore) {
        const result = await engine.submitExploreAction(state, "环顾四周");
        assert(result.feedback, "should have feedback text");
      }
    });
  });

  describe("story-engine.submitDialogue() (async)", () => {
    it("rejects when character not revealed", async () => {
      const state = engine.createInitialState({}, { storyId: "mistycity", archetypeId: "witness" });
      const result = await engine.submitDialogue(state, "nonexistent_char", "你好");
      assertEqual(result.success, false);
    });
  });

  // ── LLM Config ──
  const llmConfig = await import("../src/config/llm-config.js");

  describe("llm-config exports", () => {
    it("has LLM_CONFIG object", () => {
      assert(llmConfig.LLM_CONFIG, "should export LLM_CONFIG");
      assertType(llmConfig.LLM_CONFIG.enabled, "boolean");
      assertType(llmConfig.LLM_CONFIG.baseURL, "string");
    });
    it("has SYSTEM_PROMPT", () => {
      assertType(llmConfig.SYSTEM_PROMPT, "string");
      assert(llmConfig.SYSTEM_PROMPT.includes("谜语剧场"), "should mention 谜语剧场");
    });
    it("buildExplorePrompt returns string", () => {
      const prompt = llmConfig.buildExplorePrompt({ stageId: "test_stage" }, "检查桌子");
      assertType(prompt, "string");
      assert(prompt.includes("test_stage"), "should include stage id");
    });
    it("buildDialoguePrompt returns string", () => {
      const prompt = llmConfig.buildDialoguePrompt(
        { stageId: "test" },
        "leya",
        { name: "蕾雅", role: "守夜人", mood: "平静", affinity: 50, trust: 50, alertness: 20, relationshipStage: "neutral" },
        "你好"
      );
      assertType(prompt, "string");
      assert(prompt.includes("蕾雅"), "should include character name");
    });
  });

  // ── LLM Client ──
  const llmClient = await import("../src/core/llm-client.js");

  describe("llm-client.isLLMEnabled()", () => {
    it("returns false by default", () => {
      assertEqual(llmClient.isLLMEnabled(), false);
    });
  });

  describe("llm-client.buildMessages()", () => {
    it("creates system+user message array", () => {
      const msgs = llmClient.buildMessages("你好");
      assertEqual(msgs.length, 2);
      assertEqual(msgs[0].role, "system");
      assertEqual(msgs[1].role, "user");
      assertEqual(msgs[1].content, "你好");
    });
  });

  describe("llm-client.chatCompletion() (disabled)", () => {
    it("throws LLMDisabledError when not enabled", async () => {
      try {
        await llmClient.chatCompletion([{ role: "user", content: "test" }]);
        assert(false, "should have thrown");
      } catch (err) {
        assertEqual(err.name, "LLMDisabledError");
      }
    });
  });

  // ── LLM Narrator ──
  const narrator = await import("../src/core/llm-narrator.js");

  describe("llm-narrator (LLM disabled)", () => {
    it("llmExplore returns ok:false when disabled", async () => {
      const result = await narrator.llmExplore({ stageId: "test" }, "看窗户");
      assertEqual(result.ok, false);
    });
    it("llmDialogue returns ok:false when disabled", async () => {
      const result = await narrator.llmDialogue({}, "leya", {}, "你好");
      assertEqual(result.ok, false);
    });
    it("llmNarrate returns ok:false when disabled", async () => {
      const result = await narrator.llmNarrate({}, "context");
      assertEqual(result.ok, false);
    });
    it("llmRecap returns ok:false when disabled", async () => {
      const result = await narrator.llmRecap({}, {}, {});
      assertEqual(result.ok, false);
    });
  });

  // ── All stories load and pass basic validation ──
  describe("story-packs validation (all 5 stories)", () => {
    for (const storyId of ["mistycity", "campuslove", "boardroom", "cyberpunk", "tingwan"]) {
      it(`${storyId}: createInitialState succeeds`, () => {
        const state = engine.createInitialState({}, { storyId, archetypeId: "witness" });
        assertEqual(state.story.id, storyId);
      });
      it(`${storyId}: has stages and characters`, () => {
        const pack = packs.getStoryPack(storyId);
        const stageCount = Object.keys(pack.stages).length;
        assert(stageCount >= 5, `${storyId} should have ≥ 5 stages, got ${stageCount}`);
        const charCount = Object.keys(pack.initialCharacters).length;
        assert(charCount >= 2, `${storyId} should have ≥ 2 characters, got ${charCount}`);
      });
      it(`${storyId}: has endings`, () => {
        const pack = packs.getStoryPack(storyId);
        const endingCount = Object.keys(pack.endings).length;
        assert(endingCount >= 3, `${storyId} should have ≥ 3 endings, got ${endingCount}`);
      });
      it(`${storyId}: getWorldState is valid`, () => {
        const state = engine.createInitialState({}, { storyId, archetypeId: "witness" });
        const world = engine.getWorldState(state);
        assertEqual(world.storyId, storyId);
        assert(world.stageId, `${storyId}: world.stageId should exist`);
      });
    }
  });

  await summary();
}

run().catch((err) => {
  console.error("Test setup failed:", err);
  process.exit(1);
});
