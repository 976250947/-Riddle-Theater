<template>
  <div class="game-immersive">
    <div class="game-bg-layer"><div class="bg-current"></div></div>
    <div class="game-vignette"></div>

    <!-- Top bar -->
    <div class="game-topbar">
      <button class="game-back-btn" type="button" @click="$router.push('/')">
        <svg class="svg-icon" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6" /></svg>
        返回
      </button>
      <div class="game-chapter-info">
        <span class="game-chapter-tag">{{ game.stage?.title || '' }}</span>
      </div>
      <div class="game-topbar-actions">
        <button class="game-top-btn" type="button" @click="showDrawer = true">
          <svg class="svg-icon" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
          线索记录
        </button>
        <button class="game-top-btn" type="button" @click="showRollback = true">回溯</button>
      </div>
    </div>

    <!-- Story Intro overlay -->
    <div v-if="showIntro" class="story-intro-overlay" @click="showIntro = false">
      <div class="story-intro-content">
        <div class="intro-genre">{{ pack?.genre }}</div>
        <h1 class="intro-title">{{ pack?.title }}</h1>
        <p class="intro-subtitle">{{ pack?.subtitle }}</p>
        <p class="intro-synopsis">{{ pack?.synopsis }}</p>
      </div>
      <div class="story-intro-keys">
        <div class="intro-keys-label">键盘操作</div>
        <div class="intro-keys-grid">
          <span class="ik-item"><kbd>Space</kbd><span>继续</span></span>
          <span class="ik-item"><kbd>H</kbd><span>回顾</span></span>
          <span class="ik-item"><kbd>S</kbd><span>存档</span></span>
          <span class="ik-item"><kbd>L</kbd><span>读档</span></span>
          <span class="ik-item"><kbd>Esc</kbd><span>关闭</span></span>
        </div>
        <div class="intro-prompt pulsing">点击或按 <kbd>Space</kbd> 开始</div>
      </div>
    </div>

    <!-- VN click area (full-screen advance) -->
    <div class="vn-click-area" @click="handleClick"></div>

    <!-- VN Textbox -->
    <div class="vn-textbox" :class="{ 'vn-hidden': showChoiceOverlay }">
      <div class="vn-speaker-bar">
        <span class="vn-speaker-name">{{ speakerName }}</span>
      </div>
      <div class="vn-speaker-mood">{{ moodText }}</div>
      <div class="vn-text-content" :class="{ typing: game.performState === 'typing' }">{{ displayText }}</div>
      <div class="vn-advance-hint" :class="{ hidden: game.performState !== 'waiting_click' }">
        <svg class="svg-icon" viewBox="0 0 24 24" style="font-size:12px"><polyline points="6 9 12 15 18 9" /></svg>
      </div>
    </div>

    <!-- VN Control Panel (WebGAL-style) -->
    <div class="vn-control-panel">
      <button class="vn-ctrl-btn" type="button" title="回看历史" @click="showBacklog = !showBacklog">
        <svg class="svg-icon" viewBox="0 0 24 24"><polyline points="22 12 16 12 13 15 11 15 8 12 2 12" /><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" /></svg>
        <span>LOG</span>
      </button>
      <span class="vn-ctrl-divider"></span>
      <button class="vn-ctrl-btn" type="button" title="存档" @click="showSave = 'save'">
        <svg class="svg-icon" viewBox="0 0 24 24"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></svg>
        <span>SAVE</span>
      </button>
      <button class="vn-ctrl-btn" type="button" title="读档" @click="showSave = 'load'">
        <svg class="svg-icon" viewBox="0 0 24 24"><path d="M3 15v4c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
        <span>LOAD</span>
      </button>
    </div>

    <!-- Backlog overlay -->
    <div v-if="showBacklog" class="vn-backlog-overlay" @click.self="showBacklog = false">
      <div class="vn-backlog-backdrop" @click="showBacklog = false"></div>
      <div class="vn-backlog-panel">
        <div class="vn-backlog-header">
          <h2 class="vn-backlog-title">回顾</h2>
          <button class="vn-backlog-close" type="button" @click="showBacklog = false">
            <svg class="svg-icon" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>
        <div class="vn-backlog-content">
          <div v-for="(item, i) in game.backlog" :key="i" class="backlog-item" :style="{ '--i': i % 30 }">
            <div class="backlog-item-name">{{ item.speaker || '' }}</div>
            <div class="backlog-item-text">{{ item.text }}</div>
          </div>
          <div v-if="!game.backlog.length" style="color:rgba(214,180,151,0.4);text-align:center;padding:40px 0;font-size:14px">尚无对话记录</div>
        </div>
      </div>
    </div>

    <!-- VN Choice overlay -->
    <div v-if="showChoiceOverlay" class="vn-choice-overlay">
      <div class="vn-choice-backdrop"></div>
      <div class="vn-choice-container">
        <div class="vn-choice-header">你决定……</div>
        <div class="vn-choice-list">
          <button
            v-for="(choice, index) in game.choices"
            :key="choice.id"
            class="choice-btn"
            :style="{ '--i': index }"
            @click="game.selectChoice(choice)"
          >
            <span class="choice-num">{{ index + 1 }}</span>
            <span>{{ choice.label }}</span>
          </button>
        </div>
        <!-- Free input for explore / dialogue -->
        <form v-if="showInteractionInput" class="vn-input-row" @submit.prevent="submitInteraction">
          <select v-model="interactionMode" class="input-mode-label" style="background:transparent;border:1px solid var(--border);color:var(--text);padding:6px 10px;border-radius:8px">
            <option value="explore">探索</option>
            <option v-for="ch in availableDialogueChars" :key="ch.id" :value="'dialogue:' + ch.id">对话: {{ ch.name }}</option>
          </select>
          <input v-model="inputText" class="game-free-input" type="text" maxlength="120" placeholder="输入你的自然语言回应……" />
          <button class="game-send-btn" type="submit">
            <svg class="svg-icon" viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
          </button>
        </form>
      </div>
    </div>

    <!-- Stream / loading indicator -->
    <div v-if="loading" class="stream-status" aria-live="polite">
      <div class="stream-sigil">◈</div>
      <div>
        <div class="stream-label">叙事引擎正在编织下一段命运</div>
        <div class="stream-dots" aria-hidden="true"><span></span><span></span><span></span></div>
      </div>
    </div>

    <!-- Info Drawer -->
    <aside v-if="showDrawer" class="game-info-drawer">
      <div class="drawer-backdrop" @click="showDrawer = false"></div>
      <div class="drawer-content">
        <div class="drawer-header">
          <div class="drawer-title">旅程信息</div>
          <button class="drawer-close-btn" type="button" @click="showDrawer = false">
            <svg class="svg-icon" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>

        <div class="r-section">
          <div class="r-title">旅人档案</div>
          <div class="profile-card">
            <div class="profile-name">{{ game.playerStats?.alias || '' }}</div>
            <div class="profile-meta">{{ game.playerStats?.archetypeTitle || '' }}</div>
          </div>
        </div>

        <div class="r-section">
          <div class="r-title">当前目标</div>
          <div class="note-card">
            <div class="note-title">{{ game.stage?.title || '' }}</div>
            <div class="note-body">{{ game.stage?.objective || '' }}</div>
          </div>
        </div>

        <div class="r-section">
          <div class="r-title">角色关系</div>
          <div v-for="(ch, cid) in game.characters" :key="cid" class="char-card">
            <div class="char-name">{{ ch.name }}</div>
            <div class="char-stats">好感 {{ ch.affinity }} · 信任 {{ ch.trust }} · 警觉 {{ ch.alertness }}</div>
          </div>
        </div>

        <div class="r-section">
          <div class="r-title">线索札记</div>
          <div class="clue-list">
            <div v-for="clue in game.journal" :key="clue.id || clue" class="clue-item">
              {{ clue.title || clue }}
            </div>
          </div>
        </div>
      </div>
    </aside>

    <!-- Save/Load modal -->
    <SaveLoadModal v-if="showSave" :mode="showSave" @close="showSave = null" />

    <!-- Rollback modal -->
    <section v-if="showRollback" class="modal">
      <div class="modal-backdrop" @click="showRollback = false"></div>
      <div class="modal-card">
        <div class="panel-header">
          <div class="panel-title-wrap">
            <div class="panel-sup">剧情时间轴</div>
            <div class="panel-title">回溯 · Rollback</div>
          </div>
          <button class="close-btn" @click="showRollback = false">关闭</button>
        </div>
        <div class="warn-banner">
          <div class="warn-icon">◈</div>
          <div class="warn-text">回溯会将当前进度恢复到指定关键节点，但已解锁的结局与图鉴记录会保留。</div>
        </div>
        <div class="timeline-area">
          <div v-for="(cp, idx) in checkpoints" :key="cp.checkpointId || idx" class="timeline-node">
            <div class="node-spine">
              <div class="node-dot" :class="cp.isCurrent ? 'current-pos' : 'checkpoint'"></div>
              <div v-if="idx < checkpoints.length - 1" class="node-line"></div>
            </div>
            <div class="node-content">
              <div class="node-meta">
                <div class="node-round">第 {{ cp.roundIndex }} 轮</div>
                <div class="node-checkpoint-tag">关键节点</div>
                <div v-if="cp.isCurrent" class="node-current-tag">当前位置</div>
              </div>
              <div class="node-title">{{ cp.title }}</div>
              <div class="node-summary">{{ cp.snapshotSummary || '' }}</div>
              <button v-if="!cp.isCurrent" class="rollback-btn" @click="handleRollback(idx)">回到这里</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useGameStore } from "@/stores/game.js";
import { getStoryPack } from "@runtime/config/story-packs.js";
import SaveLoadModal from "@/components/SaveLoadModal.vue";

const props = defineProps({ id: String });
const route = useRoute();
const router = useRouter();
const game = useGameStore();

const showBacklog = ref(false);
const showDrawer = ref(false);
const showSave = ref(null);
const showRollback = ref(false);
const showIntro = ref(true);
const loading = ref(false);
const inputText = ref("");
const interactionMode = ref("explore");

const storyId = props.id || route.params.id;
const pack = ref(null);

/* typewriter */
const displayText = ref("");
let typeTimer = null;

watch(() => game.currentLine, (line) => {
  if (!line?.text) { displayText.value = ""; return; }
  clearInterval(typeTimer);
  displayText.value = "";
  let i = 0;
  typeTimer = setInterval(() => {
    displayText.value += line.text[i];
    i++;
    if (i >= line.text.length) {
      clearInterval(typeTimer);
      if (game.performState === "typing") game.completeTyping();
    }
  }, 35);
}, { immediate: true });

const speakerName = computed(() => {
  const line = game.currentLine;
  if (!line?.speaker) return "";
  const ch = game.characters[line.speaker];
  return ch?.name || line.speaker;
});

const moodText = computed(() => {
  const line = game.currentLine;
  if (line?.mood) return `情绪：${line.mood}`;
  return "";
});

const showChoiceOverlay = computed(() => {
  return game.choices.length > 0 && !["typing", "waiting_click"].includes(game.performState);
});

const showInteractionInput = computed(() => {
  const st = game.stage;
  return st && (st.allowExplore || st.allowDialogue);
});

const availableDialogueChars = computed(() => {
  const st = game.stage;
  if (!st?.presentCharacterIds) return [];
  return st.presentCharacterIds.map((id) => ({ id, name: game.characters[id]?.name || id }));
});

const checkpoints = computed(() => {
  const s = game.state;
  if (!s?.checkpoints) return [];
  const currentNodeId = s.nodes?.[s.nodes.length - 1]?.nodeId;
  return s.checkpoints.map((cp) => ({
    ...cp,
    isCurrent: cp.nodeId === currentNodeId,
  }));
});

function handleClick() {
  if (showIntro.value) { showIntro.value = false; return; }
  if (game.performState === "typing") {
    clearInterval(typeTimer);
    displayText.value = game.currentLine?.text || "";
    game.completeTyping();
  } else if (game.performState === "waiting_click") {
    game.advance();
  }
}

async function submitInteraction() {
  const text = inputText.value.trim();
  if (!text) return;
  loading.value = true;
  try {
    if (interactionMode.value === "explore") {
      await game.doExplore(text);
    } else if (interactionMode.value.startsWith("dialogue:")) {
      await game.doDialogue(interactionMode.value.replace("dialogue:", ""), text);
    }
  } finally {
    loading.value = false;
  }
  inputText.value = "";
}

function handleRollback(idx) {
  game.doRollback(idx);
  showRollback.value = false;
}

function onKeyDown(e) {
  if (e.key === " " || e.key === "Enter") { e.preventDefault(); handleClick(); }
  if (e.key === "h" || e.key === "H") showBacklog.value = !showBacklog.value;
  if (e.key === "s" || e.key === "S") showSave.value = showSave.value ? null : "save";
  if (e.key === "l" || e.key === "L") showSave.value = showSave.value ? null : "load";
  if (e.key === "Escape") { showBacklog.value = false; showDrawer.value = false; showSave.value = null; showRollback.value = false; }
}

onMounted(() => {
  pack.value = getStoryPack(storyId);
  document.addEventListener("keydown", onKeyDown);
  if (game.state?.story?.id && game.state.story.id !== storyId) {
    game.cleanup();
  }
  if (!game.state) {
    if (!game.resumeGame(storyId)) {
      router.replace({ name: "story-detail", params: { id: storyId } });
    }
  }
});

onUnmounted(() => {
  document.removeEventListener("keydown", onKeyDown);
  clearInterval(typeTimer);
});

watch(() => game.isEnded, (ended) => {
  if (ended) router.push({ name: "ending", params: { id: game.storyId } });
});
</script>
