import { navbarMode } from "@/config";
import {
	BANNER_HEIGHT,
	BANNER_HEIGHT_HOME,
	BANNER_HEIGHT_NON_HOME,
} from "@/constants/constants";
import { isBannerMode, isFullscreenMode } from "@/utils/banner-utils";
import { updateSidebarStickySpacing } from "@/utils/grid-layout-utils";

const backToTopBtn = document.getElementById("back-to-top-btn");
const navbar = document.getElementById("navbar-wrapper");

/** 优化的滚动处理函数（从 Layout.astro 迁出；visit:end 切页后也会调用） */
export function scrollFunction(): void {
	if (document.documentElement.classList.contains("is-page-transitioning")) {
		return;
	}

	const scrollTop = document.documentElement.scrollTop;
	const bannerHeight = window.innerHeight * (BANNER_HEIGHT / 100);
	const navbarElement = document.getElementById("navbar");

	// 根据滚动位置动态更新侧边栏 sticky 间距
	updateSidebarStickySpacing();

	// 使用批量DOM操作优化性能
	const operations: (() => void)[] = [];

	if (backToTopBtn) {
		operations.push(() => {
			if (scrollTop > bannerHeight) {
				backToTopBtn.classList.remove("hide");
			} else {
				backToTopBtn.classList.add("hide");
			}
		});
	}

	if (navbarMode === "fixed" && navbar) {
		operations.push(() => {
			navbar.classList.remove("navbar-hidden");
		});
	} else if (navbarMode === "dynamic" && navbar) {
		// 动态：跨壁纸/hero 保持显示；越过壁纸底部（阈值）后下滑隐藏，回到阈值以上再显示。
		// 与 static 分支共用绝对阈值逻辑，行为对齐参考站（blog.moewah.com）：
		// 只有滚过横幅底部才隐藏导航栏，而非一往下滚就立刻隐藏。
		operations.push(() => {
			const isHome = document.body.classList.contains("is-home");
			const threshold = isFullscreenMode()
				? window.innerHeight - 88
				: isBannerMode()
					? window.innerHeight *
							((isHome ? BANNER_HEIGHT_HOME : BANNER_HEIGHT_NON_HOME) / 100) -
						88
					: 0;

			if (scrollTop >= threshold) {
				navbar.classList.add("navbar-hidden");
			} else {
				navbar.classList.remove("navbar-hidden");
			}
			document.body.classList.toggle(
				"dynamic-navbar-hidden",
				navbar.classList.contains("navbar-hidden"),
			);
		});
	} else if (navbar && (isBannerMode() || isFullscreenMode())) {
		// static + banner / fullscreen：跨壁纸保持，滚到内容区才释放
		operations.push(() => {
			const isHome = document.body.classList.contains("is-home");
			// fullscreen 首页内容在 100lvh（视图顶）；banner 按横幅高度阈值
			const threshold = isFullscreenMode()
				? window.innerHeight - 88
				: window.innerHeight *
						((isHome ? BANNER_HEIGHT_HOME : BANNER_HEIGHT_NON_HOME) / 100) -
					88;

			if (scrollTop >= threshold) {
				navbar.classList.add("navbar-hidden");
			} else {
				navbar.classList.remove("navbar-hidden");
			}
		});
	}

	if (navbarElement) {
		operations.push(() => {
			if (scrollTop > 8) {
				navbarElement.classList.add("navbar-sticky-shadow");
			} else {
				navbarElement.classList.remove("navbar-sticky-shadow");
			}
		});
	}

	// 批量执行DOM操作
	if (operations.length > 0) {
		requestAnimationFrame(() => {
			operations.forEach((op) => {
				op();
			});
		});
	}
}

let scrollTimeout: number;

/** 注册滚动 / 窗口尺寸监听并初始化滚动状态（从 Layout.astro 迁出） */
export function initScroll(): void {
	// 使用优化的滚动性能处理
	window.addEventListener(
		"scroll",
		() => {
			if (scrollTimeout) {
				cancelAnimationFrame(scrollTimeout);
			}
			scrollTimeout = requestAnimationFrame(scrollFunction);
		},
		{ passive: true },
	);

	// 初始化滚动状态（例如从历史位置恢复时）
	scrollFunction();
}
