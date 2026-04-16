<template>
  <div class="app-shell">
    <div class="grain"></div>
    <div class="vignette"></div>
    <div class="decorative-top"></div>

    <Navbar />

    <main class="screen active">
      <RouterView />
    </main>

    <div class="toast hidden" id="toast"></div>
  </div>
</template>

<script setup>
import { onMounted } from "vue";
import { RouterView } from "vue-router";
import Navbar from "@/components/Navbar.vue";
import { useAuthStore } from "@/stores/auth.js";

const auth = useAuthStore();
onMounted(() => auth.fetchMe());
</script>

<style>
/* Google Fonts — same as legacy */
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600&family=EB+Garamond:ital,wght@0,400;0,500;1,400&family=Great+Vibes&family=Noto+Serif+SC:wght@400;600;700&family=Noto+Sans+SC:wght@400;500;700&display=swap');
</style>
