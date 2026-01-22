import database from "@/database/database";
import type { Post } from "@/database/types";

type CreatePostInput = Omit<Post, "id">;

export async function createPost(post: CreatePostInput) {
	const query = `
        INSERT INTO posts (
            slug, type, title, description, tags, 
            featured, date, content, url, tool_name
        ) VALUES (
            ?, ?, ?, ?, json(?), 
            ?, ?, ?, ?, ?
        )
    `;

	const args = [
		post.slug,
		post.type,
		post.title,
		post.description,
		JSON.stringify(post.tags),
		post.featured ? 1 : 0,
		post.date.toISOString(),
		post.content ?? null,
		post.url ?? null,
		post.tool_name ?? null,
	];

	const result = await database.execute({ sql: query, args });

	return {
		...post,
		id: Number(result.lastInsertRowid),
	};
}

export async function updatePost(post: Post) {
	const query = `
        UPDATE posts SET 
            slug = ?, 
            type = ?, 
            title = ?, 
            description = ?, 
            tags = json(?), 
            featured = ?, 
            date = ?, 
            content = ?, 
            url = ?,
			tool_name = ?
        WHERE id = ?
    `;

	const args = [
		post.slug,
		post.type,
		post.title,
		post.description,
		JSON.stringify(post.tags),
		post.featured ? 1 : 0,
		post.date.toISOString(),
		post.content ?? null,
		post.url ?? null,
		post.tool_name ?? null,
		post.id,
	];

	await database.execute({ sql: query, args });

	return post;
}

export async function deletePost(id: number) {
	const query = `DELETE FROM posts WHERE id = ?`;

	await database.execute({ sql: query, args: [id] });

	return true;
}
