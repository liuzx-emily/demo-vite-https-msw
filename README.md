# Vite 项目集成 MSW + HTTPS

本项目演示了如何在 Vite 项目中集成 [MSW (Mock Service Worker)](https://github.com/mswjs/msw) 并配置 HTTPS，用于在开发环境中模拟网络请求。

更多内容可参考 [这篇文章](https://liuzx-emily.github.io/blog/#/post/54adc7f2-5a2d-4557-b35b-273214b4b206)。

---

## 快速开始

```bash
pnpm i # 安装依赖
pnpm dev # 启动开发服务器
pnpm build # 打包项目
pnpm preview # 预览打包结果
```

## 核心要点

### 配置 HTTPS

在某些情况下，本地开发需要通过 IP 地址访问应用。可以通过在启动脚本中添加 --host 参数实现：

```
  "scripts": {
    "dev": "vite --host",
  },
```

访问应用时使用 `http://ip`。

然而，MSW 依赖的 Service Worker 只能在安全的网络环境中运行，即 `https`、`localhost` 或 `127.0.0.1`。为了同时支持 IP 访问和 MSW，需要将本地开发环境从 `http://ip` 切换为 `https://ip`。

通过配置 Vite 启用 HTTPS，并使用 `vite-plugin-mkcert` 插件生成证书：

```js
// vite.config.js
  plugins: [
    mkcert({
      source: "coding", //指定 mkcert 的下载源，国内用户可以设置成 coding 从 coding.net 镜像下载
    }),
  ],
  server: {
    https: true,
  },
```

### MSW 异步启动

MSW 的启动是异步的，因此需要确保在应用挂载之前完成初始化：

```js
async function bootstrap() {
  await worker.start(); // 等待 worker 启动完成
  createApp(App).mount("#app"); // 再启动 Vue 应用
}
```

### 仅在开发模式下使用 MSW

如果只需要在开发环境中使用 MSW，可以通过环境变量进行判断：

```js
async function bootstrap() {
  // 仅在 dev 环境下使用 msw
  if (import.meta.env.DEV) {
    await worker.start(); // 等待 worker 启动完成
  }
  createApp(App).mount("#app"); // 再启动 Vue 应用
}
```

通过这种方式，打包后的代码将不会启用 MSW。

注意：虽然此时 MSW 不会在生产环境中生效，但打包后的输出目录中仍会包含 mockServiceWorker.js 文件。如果希望删除该文件，可以参考相关讨论 [Question: How can I prevent mockServiceWorker.js from being added to build folder?](https://github.com/mswjs/msw/issues/291)。

本项目选择的方案是使用 postbuild 脚本：

package.json：

```json
  "scripts": {
    "build": "vite build",
    "postbuild": "rimraf dist/mockServiceWorker.js",
  },
```

## 后续补充

在实际使用 MSW 的过程中，发现了一些问题并补充如下：

1. **Vite 项目启用 HTTPS 后，WebSocket 需要调整为 WSS**  
   • 将 `ws` 替换为 `wss` 后，仍可能因浏览器安全策略导致连接失败。此时需在浏览器中手动访问对应的 WSS 网址并授权。

2. **Vite 与 MSW 的兼容性问题**  
   • Vite 的资源按需加载机制会导致每个资源请求都被 MSW 拦截，虽然不影响实际效果，但所有资源请求都会出现在 Network 的 XHR 栏中，影响调试体验。  
   • 尝试通过设置 `serviceWorker.options.scope` 来限制拦截范围，但直接导致页面无限刷新，项目无法正常运行。  
     ```js
     serviceWorker: {
       options: {
         scope: '/接口前缀', // 此设置会导致页面无限刷新，不可使用！
       },
     },
     ```
   • 相关讨论见：[Chrome reloads infinitely when serviceWorker.options.scope is set](https://github.com/mswjs/msw/issues/1627)。

  
