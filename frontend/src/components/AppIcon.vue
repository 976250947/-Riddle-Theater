<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    :class="['svg-icon', { filled }]"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.75"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    v-html="iconMarkup"
  ></svg>
</template>

<script setup>
import { computed } from "vue";
import { getIconPath } from "@/utils/app-icons.js";

const props = defineProps({
  name: {
    type: String,
    required: true,
  },
  size: {
    type: [Number, String],
    default: 16,
  },
  filled: {
    type: Boolean,
    default: false,
  },
});

const iconMarkup = computed(() => getIconPath(props.name));
</script>