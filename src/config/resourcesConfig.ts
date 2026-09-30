import type {
	ResourcesGroup,
	ResourcesPageConfig,
} from "../types/resourcesConfig";

// 资源推荐页面配置
export const resourcesPageConfig: ResourcesPageConfig = {
	// 页面标题，如果留空则使用 i18n 中的翻译
	title: "",

	// 页面描述文本，如果留空则使用 i18n 中的翻译
	description: "",

	// favicon 自动获取配置
	favicon: {
		// 条目未填写 icon 时，是否自动获取目标站点的 favicon 图标
		enabled: true,

		// favicon 接口地址，{domain} 为占位符，会被替换成目标站点域名
		api: "https://a.favicon.im/{domain}",
	},
};

// 资源推荐配置
// 每个数组项是一个分类组，分类组内的 items 是该分类下的资源条目
// 资源可以是软件、网站，也可以是开源项目
//
// 条目字段说明：
//   title      名称
//   url        地址（官网、项目仓库或站点首页）
//   desc       一句话推荐语，写「为什么推荐」比「它是什么」更有价值
//   icon       图标，留空会自动抓取目标站点 favicon
//   platforms  适用平台，取值 windows / macos / linux / ios / android / web
//              （网站、在线服务填 web；跨平台桌面软件可填多个）
//   openSource 是否开源，会在卡片上显示「开源」标记
//   free       是否免费，填 false 会显示「付费」标记
//   weight     组内排序权重，越大越靠前
export const resourcesConfig: ResourcesGroup[] = [
	{
		id: "efficiency",
		name: "效率工具",
		icon: "material-symbols:bolt-rounded",
		desc: "让日常操作快上一步",
		weight: 100,
		items: [
			{
				title: "Everything",
				url: "https://www.voidtools.com/zh-cn/",
				desc: "Windows 本地文件秒级搜索，输入即得，用过就回不去资源管理器了",
				icon: "material-symbols:search-rounded",
				platforms: ["windows"],
				free: true,
				weight: 10,
			},
			{
				title: "Snipaste",
				url: "https://www.snipaste.com/",
				desc: "截图并直接贴到屏幕上，写文档、对数据时比截图软件省一半步骤",
				icon: "material-symbols:screenshot-monitor-rounded",
				platforms: ["windows", "macos", "linux"],
				free: true,
				weight: 9,
			},
			{
				title: "PowerToys",
				url: "https://learn.microsoft.com/zh-cn/windows/powertoys/",
				desc: "微软官方的 Windows 增强套件，FancyZones 分屏和 PowerRename 批量改名最实用",
				icon: "fa7-brands:microsoft",
				platforms: ["windows"],
				openSource: true,
				free: true,
				weight: 8,
			},
			{
				title: "QuickLook",
				url: "https://github.com/QL-Win/QuickLook",
				desc: "按空格预览文件，像 macOS 那样不用等软件打开",
				icon: "material-symbols:visibility-rounded",
				platforms: ["windows"],
				openSource: true,
				free: true,
				weight: 7,
			},
			{
				title: "Obsidian",
				url: "https://obsidian.md/",
				desc: "本地 Markdown 笔记，双链串联知识，数据完全在自己手里",
				icon: "simple-icons:obsidian",
				platforms: ["windows", "macos", "linux", "ios", "android"],
				free: true,
				weight: 6,
			},
		],
	},
	{
		id: "develop",
		name: "开发资源",
		icon: "material-symbols:code-rounded",
		desc: "写代码时离不开的工具与文档",
		weight: 90,
		items: [
			{
				title: "Visual Studio Code",
				url: "https://code.visualstudio.com/",
				desc: "生态最庞大的代码编辑器，插件几乎能补齐任何需求",
				icon: "simple-icons:visualstudiocode",
				platforms: ["windows", "macos", "linux"],
				free: true,
				weight: 10,
			},
			{
				title: "DevToys",
				url: "https://devtoys.app/",
				desc: "开发者的瑞士军刀，JSON 格式化、时间戳转换、正则测试一站搞定",
				icon: "material-symbols:handyman-rounded",
				platforms: ["windows", "macos", "linux"],
				openSource: true,
				free: true,
				weight: 9,
			},
			{
				title: "MDN Web Docs",
				url: "https://developer.mozilla.org/zh-CN/",
				desc: "最权威的 Web 技术文档，查 API 用法和兼容性首选",
				icon: "simple-icons:mdnwebdocs",
				platforms: ["web"],
				free: true,
				weight: 8,
			},
			{
				title: "Can I use",
				url: "https://caniuse.com/",
				desc: "查 CSS 和 JS 特性的浏览器兼容性，写样式前先扫一眼心里有底",
				icon: "material-symbols:devices-rounded",
				platforms: ["web"],
				free: true,
				weight: 7,
			},
			{
				title: "regex101",
				url: "https://regex101.com/",
				desc: "正则在线调试与逐段解释，复杂表达式写起来不再靠试",
				icon: "material-symbols:regular-expression-rounded",
				platforms: ["web"],
				free: true,
				weight: 6,
			},
			{
				title: "Windows Terminal",
				url: "https://github.com/microsoft/terminal",
				desc: "多标签、可高度自定义的终端，配合 PowerShell 7 很好用",
				icon: "material-symbols:terminal-rounded",
				platforms: ["windows"],
				openSource: true,
				free: true,
				weight: 5,
			},
		],
	},
	{
		id: "learning",
		name: "学习站点",
		icon: "material-symbols:school-rounded",
		desc: "系统补齐基础知识的地方",
		weight: 80,
		items: [
			{
				title: "freeCodeCamp",
				url: "https://www.freecodecamp.org/chinese/",
				desc: "免费的系统化编程课程，边做项目边学，适合打基础",
				icon: "fa7-brands:free-code-camp",
				platforms: ["web"],
				free: true,
				weight: 10,
			},
			{
				title: "现代 JavaScript 教程",
				url: "https://zh.javascript.info/",
				desc: "从基础到进阶讲得极细的 JS 教程，配有大量可运行示例",
				icon: "simple-icons:javascript",
				platforms: ["web"],
				free: true,
				weight: 9,
			},
			{
				title: "菜鸟教程",
				url: "https://www.runoob.com/",
				desc: "覆盖面很广的中文速查站，忘了语法来查一下最快",
				icon: "material-symbols:menu-book-rounded",
				platforms: ["web"],
				free: true,
				weight: 8,
			},
			{
				title: "Roadmap.sh",
				url: "https://roadmap.sh/",
				desc: "各技术方向的学习路线图，不确定下一步学什么时看它",
				icon: "material-symbols:route-rounded",
				platforms: ["web"],
				free: true,
				weight: 7,
			},
		],
	},
	{
		id: "opensource",
		name: "开源项目",
		icon: "material-symbols:deployed-code-rounded",
		desc: "值得点 star 的自建与工具项目",
		weight: 70,
		items: [
			{
				title: "cloudflare_temp_email",
				url: "https://github.com/dreamhunter2333/cloudflare_temp_email",
				desc: "基于 Cloudflare Workers 的自建临时域名邮箱，支持多用户与 IMAP/SMTP",
				icon: "material-symbols:mail-rounded",
				platforms: ["web"],
				openSource: true,
				free: true,
				weight: 10,
			},
			{
				title: "C Cleaner Plus",
				url: "https://github.com/Kiowx/c_cleaner_plus",
				desc: "Windows 开源强力清理工具，全盘扫描垃圾文件、大文件、重复文件与系统残留",
				icon: "https://cdn.jsdelivr.net/gh/yorushika333-ship-it/blog-img/resources-icons/c_cleaner_plus.png",
				platforms: ["windows"],
				openSource: true,
				free: true,
				weight: 10,
			},
			{
				title: "MPV",
				url: "https://mpv.io/",
				desc: "极简但解码能力极强的播放器，配置脚本后什么格式都能放",
				icon: "material-symbols:play-circle-rounded",
				platforms: ["windows", "macos", "linux"],
				openSource: true,
				free: true,
				weight: 9,
			},
			{
				title: "7-Zip",
				url: "https://www.7-zip.org/",
				desc: "开源压缩工具，格式支持全、压缩率高且无广告",
				icon: "material-symbols:folder-zip-rounded",
				platforms: ["windows", "linux"],
				openSource: true,
				free: true,
				weight: 8,
			},
			{
				title: "Rufus",
				url: "https://rufus.ie/zh/",
				desc: "制作启动 U 盘的首选，体积小、速度快、选项清晰",
				icon: "material-symbols:usb-rounded",
				platforms: ["windows"],
				openSource: true,
				free: true,
				weight: 7,
			},
			{
				title: "Geek Uninstaller",
				url: "https://geekuninstaller.com/",
				desc: "彻底卸载并清理注册表残留，比系统自带卸载干净得多",
				icon: "material-symbols:delete-sweep-rounded",
				platforms: ["windows"],
				free: true,
				weight: 6,
			},
		],
	},
	{
		id: "design",
		name: "素材与设计",
		icon: "material-symbols:palette-outline-rounded",
		desc: "配图、图标与压缩处理",
		weight: 60,
		items: [
			{
				title: "Iconify",
				url: "https://icon-sets.iconify.design/",
				desc: "海量开源图标集合搜索，做前端时找图标的第一站",
				icon: "material-symbols:emoji-symbols-rounded",
				platforms: ["web"],
				free: true,
				weight: 10,
			},
			{
				title: "iconfont",
				url: "https://www.iconfont.cn/",
				desc: "阿里巴巴矢量图标库，中文项目里图标和字体资源很全",
				icon: "material-symbols:font-download-rounded",
				platforms: ["web"],
				free: true,
				weight: 9,
			},
			{
				title: "TinyPNG",
				url: "https://tinypng.com/",
				desc: "在线压缩 PNG / JPEG，压完肉眼几乎看不出差别",
				icon: "material-symbols:compress-rounded",
				platforms: ["web"],
				free: true,
				weight: 8,
			},
			{
				title: "Squoosh",
				url: "https://squoosh.app/",
				desc: "Google 出品的图片压缩与格式转换，支持转 AVIF 和 WebP",
				icon: "material-symbols:image-rounded",
				platforms: ["web"],
				free: true,
				weight: 7,
			},
			{
				title: "Coolors",
				url: "https://coolors.co/",
				desc: "快速生成和调整配色方案，卡在选色时能救急",
				icon: "material-symbols:colors-rounded",
				platforms: ["web"],
				free: true,
				weight: 6,
			},
		],
	},
];
