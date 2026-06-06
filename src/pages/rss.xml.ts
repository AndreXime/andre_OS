import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import type { APIContext } from "astro";
import type { Post } from "@/content.config";

function getPostLink(post: Pick<Post, "type" | "slug" | "tool_name">): string | undefined {
	switch (post.type) {
		case "note":
			return `/post/${post.slug}`;
		case "tool":
			return post.tool_name ? `/app/${post.tool_name}` : undefined;
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
				description: entry.data.description,
				pubDate: entry.data.date,
				link,
			};
		})
		.filter((item): item is NonNullable<typeof item> => item !== undefined);

	return rss({
		title: "andre_OS",
		description: "Notas tecnicas, ferramentas web e recomendacoes de Andre Ximenes.",
		site,
		trailingSlash: false,
		items,
		customData: "<language>pt-br</language>",
	});
}
