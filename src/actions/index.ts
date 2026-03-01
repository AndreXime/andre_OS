import { defineAction } from "astro:actions";
import { z } from "astro:schema";
import type { Post } from "@/database/types";
import { createPost, deletePost, updatePost } from "@/database/post/mutations";
import { revalidateCache } from "@/database/cache";
import { jwtDecrypt } from "jose";

const JWT_SECRET = new TextEncoder().encode(import.meta.env.JWT_SECRET);

async function isAuthenticated(cookie: string | undefined) {
	if (!cookie) return false;
	try {
		const { payload } = await jwtDecrypt(cookie, JWT_SECRET);
		return payload.admin === true;
	} catch {
		return false;
	}
}

function getErrorMessage(e: unknown): string {
	if (e instanceof Error) {
		if (e.message === "UNAUTHORIZED_ACCESS") return "Sessão inválida ou expirada. Faça login novamente.";
		if (e.message.includes("UNIQUE constraint failed")) return "Já existe um post com este slug.";
		if (e.message.includes("SQLITE") || e.message.includes("database")) return "Erro no banco de dados. Tente novamente.";
		return e.message;
	}
	return "Erro inesperado. Tente novamente.";
}

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
				const authCookie = context.cookies.get("admin_session")?.value;
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
				return { success: false, message: getErrorMessage(e) };
			}
		},
	}),

	deletePost: defineAction({
		input: z.object({ id: z.number() }),
		handler: async ({ id }, context) => {
			try {
				const authCookie = context.cookies.get("admin_session")?.value;
				if (!(await isAuthenticated(authCookie))) {
					throw new Error("UNAUTHORIZED_ACCESS");
				}

				await deletePost(id);
				await revalidateCache();
				return { success: true };
			} catch (e) {
				console.error(e);
				return { success: false, message: getErrorMessage(e) };
			}
		},
	}),
};
