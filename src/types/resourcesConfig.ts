// 资源推荐配置

// 资源适用平台标识
export type ResourcesPlatform =
	| "windows"
	| "macos"
	| "linux"
	| "ios"
	| "android"
	| "web";

// 单个资源条目（软件、网站或开源项目）
export type ResourcesItem = {
	title: string; // 名称
	url: string; // 地址（官网、项目仓库或站点首页）
	desc?: string; // 一句话推荐语
	// 图标，留空则自动获取目标站点的 favicon
	// 支持三种写法：
	// 1. 网络图片：https://example.com/logo.png
	// 2. public 目录图片：/assets/images/xxx.png
	// 3. astro-icon 图标名：fa7-brands:github
	icon?: string;
	// 适用平台，用于在卡片上展示小标签；网站/在线服务填 web
	platforms?: ResourcesPlatform[];
	// 是否开源
	openSource?: boolean;
	// 是否免费（false 表示收费或含付费版本）
	free?: boolean;
	weight?: number; // 组内权重，数字越大排序越靠前，默认 0
	enabled?: boolean; // 是否启用，默认 true
};

// 资源分组
export type ResourcesGroup = {
	id: string; // 分组唯一标识，用作锚点 id，如 "efficiency"
	name: string; // 分组名称
	icon?: string; // 分组图标，astro-icon 图标名
	desc?: string; // 分组描述
	weight?: number; // 分组权重，数字越大排序越靠前，默认 0
	enabled?: boolean; // 是否启用，默认 true
	items: ResourcesItem[]; // 分组内的资源列表
};

// favicon 自动获取配置
export type ResourcesFaviconConfig = {
	enabled: boolean; // 是否在未填写 icon 时自动获取 favicon
	// favicon 接口地址，{domain} 会被替换为目标站点域名
	api: string;
};

// 资源推荐页面配置
export type ResourcesPageConfig = {
	title?: string; // 页面标题，留空则使用 i18n 中的翻译
	description?: string; // 页面描述，留空则使用 i18n 中的翻译
	favicon: ResourcesFaviconConfig; // favicon 自动获取配置
};
