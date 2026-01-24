import { defineCollection } from "astro:content";
import { getAllPosts, getLastPostDate, getPostsTags } from "@/database/post/queries"; // Sua query existente
import { z } from "astro/zod";

const posts = defineCollection({
	loader: async () => {
		const items = await getAllPosts();

		return items
			.sort((a, b) => {
				// Post intro é o primeiro, e o resto é ordenado pelo mais recente
				if (a.type === "intro") return -1;
				if (b.type === "intro") return 1;
				return new Date(b.date).getTime() - new Date(a.date).getTime();
			})
			.map((item) => ({
				...item,
				id: String(item.id),
			}));
	},
	schema: z.object({
		id: z.string(),
		title: z.string(),
		slug: z.string(),
		description: z.string(),
		type: z.enum(["intro", "tool", "note", "link"]),
		tags: z.array(z.string()),
		date: z.coerce.date(),
		featured: z.boolean().optional(),
		content: z.string().optional(),
		url: z.string().optional(),
		tool_name: z.string().optional(),
	}),
});

const meta = defineCollection({
	loader: async () => {
		const [tags, lastDate] = await Promise.all([getPostsTags(), getLastPostDate()]);

		return [
			{
				id: "global",
				tags: tags || {},
				lastDate: lastDate || null,
			},
		];
	},
	schema: z.object({
		tags: z.record(z.string(), z.number()),
		lastDate: z.string().nullable(),
	}),
});

export const collections = { posts, meta };
