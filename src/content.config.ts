import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

export interface Post {
	id: number;
	slug: string;
	type: "tool" | "note" | "link";
	title: string;
	description: string;
	tags: string[];
	featured?: boolean | undefined;
	date: Date;
	content?: string | undefined;
	url?: string | undefined;
	tool_name?: string | undefined;
}

const posts = defineCollection({
	loader: glob({ pattern: "**/*.md", base: "./src/content/posts" }),
	schema: z.object({
		id: z.number(),
		title: z.string(),
		slug: z.string(),
		description: z.string(),
		type: z.enum(["tool", "note", "link"]),
		tags: z.array(z.string()),
		date: z.coerce.date(),
		featured: z.boolean().default(false),
		url: z.string().optional(),
		tool_name: z.string().optional(),
	}),
});

export const collections = { posts };
