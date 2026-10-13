import { createApp } from "vue";
import { createPinia } from "pinia";
import ElementPlus from "element-plus";
import * as ElementPlusIconsVue from "@element-plus/icons-vue";
import "element-plus/dist/index.css";

import App from "./App.vue";
import router from "./router";
import "./styles/index.css";

const app = createApp(App);
app.use(createPinia());
app.use(router);
app.use(ElementPlus);
// 全局注册图标（顶部导航以字符串名动态引用：<component :is="icon" />）
for (const [name, comp] of Object.entries(ElementPlusIconsVue)) {
  app.component(name, comp);
}
app.mount("#app");