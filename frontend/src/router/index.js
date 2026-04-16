import { createRouter, createWebHistory } from "vue-router";
import HomeView from "@/views/HomeView.vue";

const routes = [
  { path: "/", name: "home", component: HomeView },
  {
    path: "/catalog",
    name: "catalog",
    component: () => import("@/views/CatalogView.vue"),
  },
  {
    path: "/studio",
    name: "studio",
    component: () => import("@/views/StudioView.vue"),
  },
  {
    path: "/ranking",
    name: "ranking",
    component: () => import("@/views/RankingView.vue"),
  },
  {
    path: "/community",
    name: "community",
    component: () => import("@/views/CommunityView.vue"),
  },
  {
    path: "/story/:id",
    name: "story-detail",
    component: () => import("@/views/StoryDetailView.vue"),
    props: true,
  },
  {
    path: "/play/:id",
    name: "play",
    component: () => import("@/views/GameView.vue"),
    props: true,
  },
  {
    path: "/ending/:id",
    name: "ending",
    component: () => import("@/views/EndingView.vue"),
    props: true,
  },
  {
    path: "/profile",
    name: "profile",
    component: () => import("@/views/ProfileView.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
