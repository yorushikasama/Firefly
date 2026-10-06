export type ProfileConfig = {
	avatar?: string;
	// 暗色主题头像（可选）：声明后亮色用 avatar、暗色用 avatarDark
	avatarDark?: string;
	name: string;
	bio?: string;
	links: {
		name: string;
		url: string;
		icon: string;
		showName?: boolean;
	}[];
};
