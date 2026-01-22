import database from "@/database/database";
import type { Post } from "../types";
import type { Row } from "@libsql/client";

function castRowToPost(row: Row): Post {
	return {
		id: Number(row.id),
		slug: String(row.slug),
		type: row.type as Post["type"],
		title: String(row.title),
		description: String(row.description),
		tags: JSON.parse(String(row.tags)) as string[],
		featured: Boolean(row.featured),
		date: new Date(String(row.date)),
		content: row.content ? String(row.content) : undefined,
		url: row.url ? String(row.url) : undefined,
		tool_name: row.tool_name ? String(row.tool_name) : undefined,
	};
}

export async function getFilteredPosts(categoryFilter: string, searchFilter: string) {
	try {
		let query = `SELECT * FROM posts WHERE 1=1`;
		const args: (string | number)[] = [];

		if (categoryFilter !== "all") {
			query += ` AND type = ?`;
			args.push(categoryFilter);
		}

		if (searchFilter) {
			query += ` AND (title LIKE ? OR description LIKE ?)`;
			const searchParam = `%${searchFilter}%`;
			args.push(searchParam, searchParam);
		}

		query += ` ORDER BY date DESC`;

		const postsData = await database.execute({ sql: query, args });

		return postsData.rows.map(castRowToPost);
	} catch {
		return undefined;
	}
}

export async function getPostBySlug(slug: string) {
	try {
		const postQuery = `SELECT * FROM posts WHERE slug = ? LIMIT 1`;

		const postData = await database.execute({ sql: postQuery, args: [slug] });

		if (postData.rows.length === 0 || !postData) {
			return undefined;
		}

		return castRowToPost(postData.rows[0]);
	} catch {
		return undefined;
	}
}

export async function getPostToolName(slug: string) {
	try {
		const postQuery = `SELECT tool_name FROM posts WHERE slug = ? LIMIT 1`;

		const postData = await database.execute({ sql: postQuery, args: [slug] });

		const toolName = postData.rows[0].tool_name;

		if (toolName) {
			return undefined;
		}

		return String(toolName);
	} catch {
		return undefined;
	}
}

export async function getAllPosts() {
	const postsRaw = await database.execute(`SELECT * FROM posts`);

	const posts = postsRaw.rows.map(castRowToPost);

	return posts;
}

export async function getLastPostDate() {
	try {
		const lastPostDateQuery = `SELECT MAX(date) as last_date FROM posts`;
		const lastPostDateData = await database.execute(lastPostDateQuery);

		const rawDate = lastPostDateData.rows[0]?.last_date;

		if (!rawDate) {
			return undefined;
		}

		return String(rawDate);
	} catch {
		return undefined;
	}
}

export async function getPostsTags() {
	try {
		const tagsQuery = `
				SELECT j.value as tag_name, COUNT(*) as tag_count
				FROM posts, json_each(posts.tags) as j
				GROUP BY j.value
			`;

		const tagsData = await database.execute(tagsQuery);

		return tagsData.rows.reduce(
			(acc, row) => {
				const name = String(row.tag_name);
				const count = Number(row.tag_count);
				acc[name] = count;
				return acc;
			},
			{} as Record<string, number>,
		);
	} catch {
		return undefined;
	}
}
