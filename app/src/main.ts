import { createApp } from "vue";
import { createPinia } from "pinia";

import App from "./App.vue";
import router from "./router";
import "./styles/index.css";
import { initOfflineQueue } from "@/utils/offline";

const app = createApp(App);
app.use(createPinia());
app.use(router);

// 离线队列：网络恢复时自动同步暂存的打卡
initOfflineQueue();

app.mount("#app");