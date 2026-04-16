import { createApp } from "vue";
import { createPinia } from "pinia";
import router from "./router/index.js";
import App from "./App.vue";

/* legacy CSS — imported in the same order as the original index.html */
import "./styles/base.css";
import "./styles/refactor.css";
import "./styles/ux-pro.css";
import "./styles/site-pages.css";

const app = createApp(App);
app.use(createPinia());
app.use(router);
app.mount("#app");
