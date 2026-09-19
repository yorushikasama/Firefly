# 依赖补丁说明

本仓库通过 `pnpm patch` 给三个依赖打了本地补丁，配置在 [pnpm-workspace.yaml](../pnpm-workspace.yaml) 的 `patchedDependencies`。三个补丁都是为了修复 **dev server 重启时的内存泄漏与误报错误**，全部源自同一个上游问题。

相关上游追踪：

- vite [#23493](https://github.com/vitejs/vite/issues/23493)（issue）/ [#23499](https://github.com/vitejs/vite/pull/23499)（PR）

## 为什么需要这些补丁

`astro dev` 修改 `astro.config.mjs` 会触发 Vite 重启。重启会新建一组 environment，但旧的 environment、模块图和插件缓存没有被完全释放，于是每次重启堆内存都会上涨一截，改十几次配置就会 OOM 崩溃。同时重启过程中还会出现两类误报：

- 旧 environment 的 module runner 被关闭后，正在进行中的 content config 加载会失败，把 content config observer 写成 `error`，导致 content sync 被跳过、collection 变空，`/about` 这类页面 500。
- 旧 environment 的 handler 创建失败会打出 `Failed to create the dev server app: ...`，但这是重启的预期行为，新 server 会自己建 handler。

## 三个补丁分别做什么

### `patches/vite@8.2.2.patch`

改 `dist/node/chunks/node.js` 的 `_createServer`，在所有 environment 完成 `init()` 之后清空 `options.previousEnvironments`。

`previousEnvironments` 只由 `restartServer()` 传入，用来把旧 environment 作为 `previousInstance` 交给新 environment。读取发生在清空之前，之后不再读取，所以清空是安全的纯内存释放。这是主要的泄漏修复。

- 影响范围：仅 dev（`_createServer` / `restartServer` 都不在 build 路径上）。
- 已知不足：如果 `environment.init()` 抛错，清空语句不会执行，旧 environment 仍会泄漏。属于修得不彻底，不影响正确性。

### `patches/rolldown@1.2.7.patch`

改 `dist/shared/normalize-string-or-regex-Dm69lpQ-.mjs` 的 `makeBuiltinPluginCallable`，把 `builtin:vite-resolve` 的 `finalizeBareSpecifier` 和 `finalizeOtherSpecifiers` 两个回调用 `WeakRef` 包一层再交给原生 `BindingCallableBuiltinPlugin`。

这两个回调闭包捕获了 `getDepsOptimizer()` → `getEnv()`，而原生插件会按自己的生命周期强引用它们，于是整个退役 environment 被钉住无法回收。弱引用持有可以让它被 GC。

补丁**刻意收窄到显式白名单**（`weaklyHeldCallbacks`），只处理这两个 key：

- vite 只在 `depsOptimizerEnabled` 为真时才传这两个函数，而该条件要求 `!isBuild`，所以**生产构建里它们恒为 `undefined`，补丁在 `astro build` 期间是可证明的 no-op**。
- 其它 builtin 插件（`builtin:vite-json`、`builtin:oxc-runtime`、`builtin:vite-react-refresh-wrapper`）的回调完全不受影响。

弱引用的安全性依赖 `plugin._options` 仍强引用原函数，且 plugin 对象本身存活。`bindingifyBuiltInPlugin` 返回的是新对象，补丁又拷贝了一份 options，`plugin._options` 没被改动，所以该前提成立。若前提被破坏，deref 失败会抛 `Released callback owner: builtin:vite-resolve.<key>` —— **见到这个报错说明上游实现变了，应当直接移除本补丁**，而不是继续修补。

### `patches/astro@7.3.3.patch`

三处改动：

1. `dist/content/config-prewarm.js`：给 in-flight 的 content config 加载绑定 environment，只有 environment 相同才复用；`finally` 里加 `if (inFlight === tracked)` 守卫，避免旧加载 settle 时抹掉新加载的 slot。仅 dev（该插件只在 `command === "dev"` 注册）。
2. `dist/content/utils.js`：给 `reloadContentConfigObserver` 加递增 `contentConfigReloadId`，只允许最新一次 reload 写 observer，防止旧 environment 的失败覆盖当前的 `loaded` 状态。**这条路径 `astro build` 的 content sync 也会走**，所以被丢弃的 stale 结果会通过 `logger.debug("content", ...)` 留痕，不会静默消失（用 `astro dev --verbose` 可见）。
3. `dist/vite-plugin-astro-server/plugin.js`：handler 创建失败时，若 runner 已关闭则把日志从 `error` 降级为 `debug`（而非完全静默），避免重启噪音同时保留可追溯性。仅 dev。

## 维护须知

**版本绑定是精确的，不会静默失效。** 三个 patch key 都写死了版本号，pnpm 的 `allowUnusedPatches` 默认为 `false`，且 pnpm v11 起补丁应用失败必定报错。所以版本一变 `pnpm install` 会直接失败，而不是悄悄不打补丁。

需要注意的是 `vite` 和 `rolldown` **都不是直接依赖**：vite 经 astro 传递，rolldown 经 vite 传递。因此升级 astro 就可能连带换掉它们的版本，让补丁 key 失配。为此 [.github/dependabot.yml](../.github/dependabot.yml) 已把 `astro`、`vite`、`rolldown` 加入 `ignore`，改为手工升级并同步重做补丁。

### 升级依赖时的操作步骤

```bash
# 1. 升级依赖（以 astro 为例）
pnpm up astro@<new-version>

# 2. 逐个重做补丁：extract 出源码，按本文说明重新施加改动
pnpm patch <pkg>@<new-version>
#    编辑输出目录里的文件，然后：
pnpm patch-commit "<输出目录>"

# 3. 同步 pnpm-workspace.yaml 里的 patchedDependencies 版本号，删掉旧 patch 文件

# 4. 验证
pnpm check && pnpm type-check && pnpm build
```

### 什么时候可以删除这些补丁

- **vite 补丁**：上游发布包含 [#23499](https://github.com/vitejs/vite/pull/23499) 的版本后即可移除。
- **rolldown 补丁**：上游修复原生插件对 JS 回调的强引用后即可移除；或者出现 `Released callback owner:` 报错时应立即移除。
- **astro 补丁**：上游修复 dev 重启期间 content config 加载的竞态后即可移除。

移除任一补丁后，请用「改 `astro.config.mjs` 触发重启 ×8 次」的方式回归验证：观察堆内存是否稳定、`/about` 是否仍正常、控制台有无 `module runner has been closed` 报错。
