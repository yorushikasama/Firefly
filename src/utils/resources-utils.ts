import { resourcesConfig } from "../config/resourcesConfig";
import type {
	ResourcesFaviconConfig,
	ResourcesGroup,
	ResourcesItem,
	ResourcesPlatform,
} from "../types/resourcesConfig";

// 资源图标解析结果
export type ResolvedResourcesIcon =
	| { kind: "icon"; value: string } // astro-icon 图标名
	| { kind: "image"; value: string } // 图片地址
	| { kind: "letter"; value: string }; // 首字母兜底

// astro-icon 图标名格式：namespace:name
const ICON_NAME_PATTERN = /^[\w-]+:[\w-]+$/;

// 平台标识到中文短标签的映射
const PLATFORM_LABELS: Record<ResourcesPlatform, string> = {
	windows: "Windows",
	macos: "macOS",
	linux: "Linux",
	ios: "iOS",
	android: "Android",
	web: "Web",
};

// 从资源地址中提取域名，地址非法时返回空字符串
export function getResourcesDomain(url: string): string {
	try {
		return new URL(url).hostname;
	} catch {
		return "";
	}
}

// 用域名替换 favicon 接口地址中的 {domain} 占位符
export function buildFaviconUrl(api: string, domain: string): string {
	if (!api || !domain) return "";
	return api.replaceAll("{domain}", encodeURIComponent(domain));
}

// 取标题首字符作为兜底图标
export function getResourcesLetter(title: string): string {
	return (title || "?").trim().charAt(0).toUpperCase() || "?";
}

// 平台标识转展示用标签，未知取值原样返回
export function getPlatformLabel(platform: ResourcesPlatform): string {
	return PLATFORM_LABELS[platform] ?? platform;
}

// 解析资源图标：手填优先，其次 favicon 自动获取，最后首字母兜底
export function resolveResourcesIcon(
	item: ResourcesItem,
	favicon: ResourcesFaviconConfig,
): ResolvedResourcesIcon {
	const icon = item.icon?.trim();

	if (icon) {
		// 网络图片或 public 目录图片
		if (/^https?:\/\//.test(icon) || icon.startsWith("/")) {
			return { kind: "image", value: icon };
		}
		// astro-icon 图标名
		if (ICON_NAME_PATTERN.test(icon)) {
			return { kind: "icon", value: icon };
		}
		// 其他一律当作图片路径处理
		return { kind: "image", value: icon };
	}

	// 未填写图标时，尝试自动获取 favicon
	if (favicon.enabled) {
		const faviconUrl = buildFaviconUrl(
			favicon.api,
			getResourcesDomain(item.url),
		);
		if (faviconUrl) {
			return { kind: "image", value: faviconUrl };
		}
	}

	return { kind: "letter", value: getResourcesLetter(item.title) };
}

// 获取启用的资源分组，分组与组内条目均按权重排序
export function getEnabledResourcesGroups(): ResourcesGroup[] {
	return resourcesConfig
		.filter((group) => group.enabled !== false)
		.map((group) => ({
			...group,
			items: group.items
				.filter((item) => item.enabled !== false)
				.sort((a, b) => (b.weight ?? 0) - (a.weight ?? 0)),
		}))
		.filter((group) => group.items.length > 0)
		.sort((a, b) => (b.weight ?? 0) - (a.weight ?? 0));
}
