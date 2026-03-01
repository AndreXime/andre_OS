import { defineAction } from "astro:actions";
import { z } from "astro:schema";
import type { Post } from "@/database/types";
import { createPost, deletePost, updatePost } from "@/database/post/mutations";
import { revalidateCache } from "@/database/cache";
import { isAuthenticated, getAuthErrorMessage, ADMIN_SESSION_COOKIE } from "@/lib/auth";

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
	tool_name: z.string().optional(),
});

export const server = {
	savePost: defineAction({
		input: PostSchema,
		handler: async (input, context) => {
			try {
				const authCookie = context.cookies.get(ADMIN_SESSION_COOKIE)?.value;
				if (!(await isAuthenticated(authCookie))) {
					throw new Error("UNAUTHORIZED_ACCESS");
				}
				// Se tiver ID, atualizamos
				if (input.id && input.id !== 0) {
					const updated = await updatePost(input as Post);
					await revalidateCache();
					return { success: true, post: updated, action: "update" };
				}

				const created = await createPost(input);
				await revalidateCache();
				return { success: true, post: created, action: "create" };
			} catch (e) {
				return { success: false, message: getAuthErrorMessage(e) };
			}
		},
	}),

	deletePost: defineAction({
		input: z.object({ id: z.number() }),
		handler: async ({ id }, context) => {
			try {
				const authCookie = context.cookies.get(ADMIN_SESSION_COOKIE)?.value;
				if (!(await isAuthenticated(authCookie))) {
					throw new Error("UNAUTHORIZED_ACCESS");
				}

				await deletePost(id);
				await revalidateCache();
				return { success: true };
			} catch (e) {
				console.error(e);
				return { success: false, message: getAuthErrorMessage(e) };
			}
		},
	}),
};
