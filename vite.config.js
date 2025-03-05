import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";
import mkcert from "vite-plugin-mkcert";

export default defineConfig({
  plugins: [
    vue(),
    mkcert({
      source: "coding", //指定 mkcert 的下载源，国内用户可以设置成 coding 从 coding.net 镜像下载
    }),
  ],
  server: {
    https: true,
  },
});
