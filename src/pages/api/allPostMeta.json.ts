import { getSortedPosts } from "@/utils/content-utils";

export async function GET(): Promise<Response> {
	const posts = await getSortedPosts();

	const allPostsData = posts
		.map((post) => ({
			id: post.id,
			title: post.data.title,
			// 密码保护文章的摘要视为受保护内容，不进公开 JSON 端点
			description: post.data.password ? "" : post.data.description,
			published: post.data.published.getTime(),
			category: post.data.category || "",
			password: !!post.data.password,
		}))
		// 日历按纯日期排序，忽略置顶
		.sort((a, b) => b.published - a.published);

	return new Response(JSON.stringify(allPostsData));
}
