import type { Post } from "@/content.config";

export function sortPosts(posts: Post[]) {
	return posts.sort((a, b) => {
		if (a.type === "intro") return -1;
		if (b.type === "intro") return 1;
		return b.date.getTime() - a.date.getTime();
	});
}

export function getPostsTags(posts: Post[]) {
	const counts: Record<string, number> = {};

	for (const post of posts) {
		for (const tag of post.tags) {
			counts[tag] = (counts[tag] ?? 0) + 1;
		}
	}

	return counts;
}

export function getLastPostDate(entries: Post[]) {
	const dates = entries.map((post) => post.date).filter((date) => !Number.isNaN(date.getTime()));

	if (dates.length === 0) return undefined;

	return new Date(Math.max(...dates.map((date) => date.getTime()))).toISOString();
}
