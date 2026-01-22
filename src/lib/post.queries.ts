import database from "@/database/database";
import { castRowToPost } from "./utils";

export async function getFilteredPosts(categoryFilter: string, searchFilter: string) {
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
}

export async function getPostBySlug(slug: string) {
	const postQuery = `SELECT * FROM posts WHERE slug = ? LIMIT 1`;

	const postData = await database.execute({ sql: postQuery, args: [slug] });

	const post = postData.rows.length > 0 ? castRowToPost(postData.rows[0]) : null;

	return post;
}

export async function getAllPosts() {
	const postsRaw = await database.execute(`SELECT * FROM posts`);

	const posts = postsRaw.rows.map(castRowToPost);

	return posts;
}

export async function getLastPostDate() {
	const lastPostDateQuery = `SELECT MAX(date) as last_date FROM posts`;
	const lastPostDateData = await database.execute(lastPostDateQuery);

	const rawDate = lastPostDateData.rows[0]?.last_date;

	return new Date(String(rawDate));
}

export async function getPostsTags() {
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
}
