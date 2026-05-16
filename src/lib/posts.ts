import type { Post } from "@/content.config";
import type { CollectionEntry } from "astro:content";

type PostEntry = CollectionEntry<"posts">;

export function sortPosts(entries: PostEntry[]) {
	return [...entries].sort((a, b) => {
		if (a.data.type === "intro") return -1;
		if (b.data.type === "intro") return 1;
		return b.data.date.getTime() - a.data.date.getTime();
	});
}

export function getPostsTags(entries: PostEntry[]) {
	const counts: Record<string, number> = {};

	for (const { data } of entries) {
		for (const tag of data.tags) {
			counts[tag] = (counts[tag] ?? 0) + 1;
		}
	}

	return counts;
}

export function getLastPostDate(entries: PostEntry[]) {
	const dates = entries.map(({ data }) => data.date).filter((date) => !Number.isNaN(date.getTime()));

	if (dates.length === 0) return undefined;

	return new Date(Math.max(...dates.map((date) => date.getTime()))).toISOString();
}

export function entryToPost(entry: PostEntry): Post {
	return {
		id: entry.data.id,
		slug: entry.data.slug,
		type: entry.data.type,
		title: entry.data.title,
		description: entry.data.description,
		tags: entry.data.tags,
		featured: entry.data.featured,
		date: entry.data.date,
		content: entry.body?.trim() || undefined,
		url: entry.data.url,
		tool_name: entry.data.tool_name,
	};
}
