<template>
  <RouterLink
    :to="`/story/${story.id}`"
    class="card story-shelf-card"
    :data-story-id="story.id"
    :data-story-theme="story.uiTheme || story.id"
    :aria-label="`查看剧本《${story.title}》详情`"
  >
    <span class="card-img story-shelf-poster" aria-hidden="true">
      <span v-if="display.badge" :class="['badge', display.badgeClass || '']">{{ display.badge }}</span>
    </span>
    <span class="card-content">
      <span class="card-title story-shelf-title">{{ story.title }}</span>
      <span class="tags">
        <span v-for="tag in (display.tags || []).slice(0, 2)" :key="tag" class="tag">{{ tag }}</span>
      </span>
      <span class="card-footer">
        <span>{{ display.duration || '' }}</span>
        <span>{{ display.playCount || '' }}</span>
        <span class="rating">{{ display.rating || '' }}</span>
      </span>
    </span>
  </RouterLink>
</template>

<script setup>
import { RouterLink } from "vue-router";

defineProps({
  story: { type: Object, required: true },
  display: { type: Object, default: () => ({}) },
});
</script>
