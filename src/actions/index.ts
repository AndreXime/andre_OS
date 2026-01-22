import { defineAction } from "astro:actions";
import { z } from "astro:schema";
import type { Post } from "@/database/types";
import { createPost, deletePost, updatePost } from "@/database/post/mutations";

const PostSchema = z.object({
	// O ID é opcional na entrada, pois na criação ele não existe
	id: z.number().optional(),
	slug: z.string(),
	type: z.enum(["intro", "tool", "note", "link"]),
	title: z.string(),
	description: z.string(),
	tags: z.array(z.string()),
	featured: z.boolean().optional(),
	date: z.coerce.date(),
	content: z.string().optional(),
	url: z.string().optional(),
});

export const server = {
	savePost: defineAction({
		input: PostSchema,
		handler: async (input) => {
			try {
				// Se tiver ID, atualizamos
				if (input.id && input.id !== 0) {
					const updated = await updatePost(input as Post);
					return { success: true, post: updated, action: "update" };
				}

				const created = await createPost(input);
				return { success: true, post: created, action: "create" };
			} catch (error) {
				console.log(error);
				return { success: false };
			}
		},
	}),

	deletePost: defineAction({
		input: z.object({ id: z.number() }),
		handler: async ({ id }) => {
			try {
				await deletePost(id);
				return { success: true };
			} catch (error) {
				console.log(error);
				return { success: false };
			}
		},
	}),
};
