/**
 * 等待按需 pagefind 加载器完成。
 *
 * pagefind.js 由 Navbar.astro 的内联脚本挂载到 window.__loadPagefind，返回一个幂等的
 * loading promise。此前搜索 UI 依赖一次性的 `pagefindready` 事件来解除 `initialized`
 * 门闩，但组件水合常常晚于内联脚本执行 —— 事件早已派发、`{ once: true }` 又不重放，
 * 导致 `initialized` 永远为 false、查到的结果被静默丢弃。直接 await 这个幂等 promise
 * 可从根本上消除该竞态；加载失败时加载器会安装一个返回空结果的兜底桩，promise 依旧 resolve。
 */
export async function whenPagefindReady(): Promise<void> {
	if (typeof window === "undefined") return;
	await Promise.resolve(window.__loadPagefind?.());
}
