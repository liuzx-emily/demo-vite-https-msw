import { createApp } from "vue";
import App from "./App.vue";
import { worker } from "./mock";

async function bootstrap() {
  await worker.start(); // 等待 worker 启动完成
  createApp(App).mount("#app"); // 再启动 Vue 应用
}

bootstrap();
