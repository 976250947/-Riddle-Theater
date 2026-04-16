<template>
  <div class="ending-shell">
    <div class="bg-radial"></div>
    <div class="top-line"></div>

    <div class="ending-tag-wrap">
      <div class="ending-type-label">结局达成</div>
      <div class="ending-badge">{{ ending?.badge || '🏆' }}</div>
    </div>

    <div class="title-block">
      <div class="ending-num">{{ ending?.code || '' }}</div>
      <div class="ending-title">{{ ending?.title || '旅程结束' }}</div>
      <div class="ending-subtitle">{{ ending?.subtitle || '' }}</div>
    </div>

    <div class="divider"><div class="d-line"></div><div class="d-diamond"></div><div class="d-line"></div></div>

    <p class="ending-desc">{{ ending?.description || '' }}</p>

    <div v-if="ending?.conditions?.length" class="conditions-block">
      <div class="cond-title">达成条件</div>
      <div class="cond-grid">
        <div v-for="c in ending.conditions" :key="c.label" class="cond-item met">
          <div class="cond-icon">●</div>
          <div class="cond-label">{{ c.label }}</div>
          <div class="cond-val">{{ c.value }}</div>
        </div>
      </div>
    </div>

    <div v-if="recap" class="ending-recap-block">
      <p>{{ recap }}</p>
    </div>

    <div class="action-group">
      <button class="act-btn-primary" @click="replay">重新开始新的旅程</button>
      <button class="act-btn-dim" @click="goHome">返回主菜单</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useGameStore } from "@/stores/game.js";

const props = defineProps({ id: String });
const router = useRouter();
const route = useRoute();
const game = useGameStore();

const ending = ref(game.endingData);
const recap = ref("");

onMounted(async () => {
  if (!ending.value && game.state) {
    const { resolveEndingData } = await import("@runtime/core/story-engine.js");
    ending.value = resolveEndingData(game.state);
  }
  try {
    const { llmRecap } = await import("@runtime/core/llm-narrator.js");
    const { getWorldState } = await import("@runtime/core/story-engine.js");
    if (game.state) {
      const ws = getWorldState(game.state);
      const result = await llmRecap(ws, ending.value, {});
      if (result.ok) recap.value = result.text;
    }
  } catch {}
});

function goHome() {
  game.cleanup();
  router.push("/");
}

function replay() {
  game.cleanup();
  router.push({ name: "story-detail", params: { id: props.id || route.params.id } });
}
</script>
