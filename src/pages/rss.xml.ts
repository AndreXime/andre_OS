import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import type { APIContext } from "astro";
import type { Post } from "@/content.config";
import { SITE_DESCRIPTION, SITE_NAME } from "@/content/site";

function getPostLink(post: Pick<Post, "type" | "slug" | "target">): string | undefined {
	switch (post.type) {
		case "note":
			return `/post/${post.slug}`;
		case "tool":
			return post.target ? `/app/${post.target}` : undefined;
		default:
			return undefined;
	}
}

export async function GET(context: APIContext) {
	const site = context.site;
	if (!site) {
		throw new Error("Configure `site` em astro.config.mjs para gerar o feed RSS.");
	}

	const posts = await getCollection("posts");

	const items = posts
		.filter((entry) => entry.data.type === "note" || entry.data.type === "tool")
		.sort((a, b) => b.data.date.getTime() - a.data.date.getTime())
		.map((entry) => {
			const link = getPostLink(entry.data);
			if (!link) return undefined;

			return {
				title: entry.data.title,
				pubDate: entry.data.date,
				link,
			};
		})
		.filter((item): item is NonNullable<typeof item> => item !== undefined);

	return rss({
		title: SITE_NAME,
		description: SITE_DESCRIPTION,
		site,
		trailingSlash: false,
		items,
		customData: "<language>pt-br</language>",
	});
}
