<template>
  <Teleport to="body">
    <section class="modal" aria-label="存档管理面板">
      <div class="modal-backdrop" @click="$emit('close')"></div>
      <div class="modal-card">
        <div class="panel-header">
          <div class="panel-title-wrap">
            <div class="panel-sup">存档管理</div>
            <div class="panel-title">
              <button :class="{ active: tab === 'save' }" type="button" @click="tab = 'save'">存档 · Save</button>
              <button :class="{ active: tab === 'load' }" type="button" @click="tab = 'load'">读档 · Load</button>
            </div>
          </div>
          <button class="close-btn" @click="$emit('close')">关闭</button>
        </div>
        <div class="save-slots">
          <div
            v-for="i in 6" :key="i"
            :class="['save-slot', slots[i - 1] ? 'save-slot--filled' : 'save-slot--empty']"
            @click="handleSlot(i - 1)"
          >
            <template v-if="slots[i - 1]">
              <div class="save-slot-top">
                <div class="save-slot-name">{{ slots[i - 1].name || '自动存档' }}</div>
                <button class="save-slot-delete" @click.stop="deleteSlot(i - 1)" title="删除存档">&times;</button>
              </div>
              <div class="save-slot-info">槽位 {{ i }}</div>
              <div class="save-slot-time">{{ slots[i - 1].date }}</div>
            </template>
            <template v-else>
              <div class="save-slot-label">槽位 {{ i }}</div>
              <div class="save-slot-hint">{{ tab === 'save' ? '点击保存到此槽位' : '空槽位' }}</div>
            </template>
          </div>
        </div>
      </div>
    </section>
  </Teleport>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useGameStore } from "@/stores/game.js";
import { useAuthStore } from "@/stores/auth.js";
import { saveApi } from "@/services/api.js";

const emit = defineEmits(["close"]);
const game = useGameStore();
const auth = useAuthStore();
const tab = ref("save");
const slots = ref(new Array(6).fill(null));

async function refreshSlots() {
  const storage = await import("@runtime/core/story-storage.js");

  if (auth.isLoggedIn) {
    try {
      const data = await saveApi.list();
      for (const item of data.saves || []) {
        const index = Number(item.slotId);
        if (Number.isInteger(index) && index >= 0 && index < 6 && item.data) {
          storage.saveToSlot(index, item.data, item.title || `云端存档 ${index + 1}`);
        }
      }
    } catch {}
  }

  const nextSlots = storage.getSaveSlots();
  slots.value = nextSlots.map((slot) => {
    if (!slot || slot.empty) return null;
    return {
      name: slot.name,
      date: slot.savedAt ? new Date(slot.savedAt).toLocaleString() : "",
      storyTitle: slot.storyTitle,
      storyId: slot.storyId,
    };
  });
}

onMounted(async () => {
  await refreshSlots();
});

async function handleSlot(idx) {
  if (tab.value === "save") {
    const slotName = `手动存档 ${idx + 1}`;
    game.saveSlot(idx, slotName);
    if (auth.isLoggedIn && game.state) {
      try {
        await saveApi.save(String(idx), game.state, slotName);
      } catch {}
    }
    await refreshSlots();
  } else {
    if (slots.value[idx] && game.loadSlot(idx)) emit("close");
  }
}

async function deleteSlot(idx) {
  try {
    const { deleteSlot: removeLocalSlot } = await import("@runtime/core/story-storage.js");
    removeLocalSlot(idx);
    if (auth.isLoggedIn) {
      try {
        await saveApi.remove(String(idx));
      } catch {}
    }
    await refreshSlots();
  } catch {}
}
</script>
