import type { Live2DWidgetConfig, SpineModelConfig } from "../types/pioConfig";

// Spine 看板娘配置
export const spineModelConfig: SpineModelConfig = {
	// Spine 看板娘开关
	enable: false,

	// Spine模型配置
	model: {
		// Spine模型文件路径
		path: "/pio/models/spine/firefly/1310.json",
		// 模型缩放比例
		scale: 1.0,
		// X轴偏移
		x: 0,
		// Y轴偏移
		y: 0,
	},

	// 位置配置
	position: {
		// 显示位置 bottom-left，bottom-right，top-left，top-right，注意：在右下角可能会挡住返回顶部按钮
		corner: "bottom-left",
		// 距离边缘0px
		offsetX: 0,
		// 距离下边缘0px
		offsetY: 0,
	},

	// 尺寸配置
	size: {
		// 容器宽度
		width: 135,
		// 容器高度
		height: 165,
	},

	// 交互配置
	interactive: {
		// 交互功能开关
		enabled: true,
		// 点击时随机播放的动画列表
		clickAnimations: [
			"emoji_0",
			"emoji_1",
			"emoji_2",
			"emoji_3",
			"emoji_4",
			"emoji_5",
		],
		// 点击时随机显示的文字消息
		clickMessages: [
			"你好呀！我是流萤~",
			"今天也要加油哦！✨",
			"想要一起去看星空吗？🌟",
			"记得要好好休息呢~",
			"有什么想对我说的吗？💫",
			"让我们一起探索未知的世界吧！🚀",
			"每一颗星星都有自己的故事~⭐",
			"希望能带给你温暖和快乐！💖",
		],
		// 文字显示时间（毫秒）
		messageDisplayTime: 3000,
		// 待机动画列表
		idleAnimations: ["idle", "emoji_0", "emoji_1", "emoji_3", "emoji_4"],
		// 待机动画切换间隔（毫秒）
		idleInterval: 8000,
	},

	// 响应式配置
	responsive: {
		// 在移动端隐藏
		hideOnMobile: true,
		// 移动端断点
		mobileBreakpoint: 768,
	},

	// 层级
	zIndex: 1000, // 层级

	// 透明度
	opacity: 1.0,
};

// Live2D 看板娘配置 (使用 l2d-widget 库，文档：https://l2d-widget.hacxy.cn)
export const live2dWidgetConfig: Live2DWidgetConfig = {
	// Live2D 看板娘开关
	enable: true,
	// 模型配置，支持单个模型或数组（多模型切换）
	model: {
		// Live2D模型本地文件路径（自制楪祈半身模型，源工程见 D:\live2d）
		path: "/pio/models/live2d/yuzuriha/yuzuriha.model3.json",
		// 动作声音音量 范围0~1，默认 0（静音）
		volume: 0,
		// 模型缩放比例
		scale: 1,
		// X轴偏移，范围 -2~2，正值向右
		x: 0,
		// Y轴偏移，范围 -2~2，正值向上
		y: 0,
		// PSD 画布中人物实体的占比（中性姿势实测，见模型工程演示页）。
		// y0 取 0 而非实测的 0.029：给头发物理/待机摆动留出顶部余量，
		// 否则人物顶缘贴死画布顶，头发会被上边缘裁掉
		charBox: { x0: 0.202, x1: 0.794, y0: 0, y1: 0.946 },
	},
	// 显示位置：bottom-left 或 bottom-right
	position: "bottom-left" as const,
	// 画布尺寸（px）。半身模型偏高，画布拉高避免头顶/裙摆被裁
	size: { width: 280, height: 340 },
	// 主题色，用于菜单、状态条等 UI 元素的背景色，默认 'rgba(96,165,250,0.9)'
	primaryColor: "var(--l2d-msg-bg)",
	// 入场/退场动画时长（ms）
	transitionDuration: 1500,
	// 入场/退场动画类型
	transitionType: "slide" as const,
	// 菜单配置
	menus: {
		// 完全替换默认菜单项
		items: [
			{
				icon: "mdi:home",
				label: "返回主页",
				action: "home",
			},
			{
				icon: "mdi:arrow-up",
				label: "返回顶部",
				action: "scrollToTop",
			},
			{
				icon: "mdi:bed",
				label: "休眠",
				action: "sleep",
			},
			{
				icon: "mdi:restore",
				label: "重置位置",
				action: "resetPosition",
			},
		],
		// 菜单对齐方式
		align: "right" as const,
	},
	// 提示气泡配置
	tips: {
		// 气泡开关
		enable: true,
		// 初始欢迎消息
		welcomeMessage: ["你好呀！", "欢迎来到我的世界！"],
		// 循环提示内容
		messages: [
			"有什么需要帮助的吗？",
			"今天天气真不错呢！",
			"要不要一起玩游戏？",
			"记得按时休息哦！",
		],
		// 文字显示时间（ms）
		duration: 3000,
		// 提示气泡切换间隔（ms）
		interval: 6000,
		// 位置偏移量（px），基于默认位置（模型正上方居中）进行微调
		offset: {
			x: 0, // 正值右移，负值左移
			y: 0, // 正值下移，负值上移
		},
		// 打字时驱动嘴型。这个模型没有张口素材（口腔/牙/舌缺失），
		// ParamMouthOpenY 是对一条 16×7px 墨线的几何插值，幅度调小当
		// 氛围反馈用，别指望对齐口型
		typing: {
			speed: 90, // ms/字
			minValue: 0.05,
			maxValue: 0.3,
		},
	},
	// 响应式配置
	responsive: {
		// 在移动端隐藏
		hideOnMobile: true,
		// 移动端断点
		mobileBreakpoint: 768,
	},
	// 休眠配置：休眠时缩成悬浮球（头部快照，可拖动），点球唤醒；
	// 刷新后保持休眠状态；切走标签页自动休眠、回来唤醒
	sleep: {
		// 无操作多少分钟后自动休眠，0 = 关闭
		autoSleepMinutes: 5,
	},
	// 拖动配置
	draggable: {
		// 是否允许拖动看板娘
		enable: true,
		// 长按多久（ms）后才进入拖动，太短会抢走单击换动作
		longPressMs: 150,
		// 是否记忆位置（刷新、切页后仍停在原处）
		savePosition: true,
	},
};
