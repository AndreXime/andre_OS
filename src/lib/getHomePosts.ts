import database from "@/database/database";
import type { Post } from "@/database/types";
import { castRowToPost } from "./utils";

export async function getHomePosts(categoryFilter: string, searchFilter: string) {
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

	const tagsQuery = `
        SELECT j.value as tag_name, COUNT(*) as tag_count
        FROM posts, json_each(posts.tags) as j
        GROUP BY j.value
    `;
	const lastDeployQuery = `SELECT MAX(date) as last_date FROM posts`;

	const [itemsRes, tagsRes, dateRes] = await Promise.all([
		database.execute({ sql: query, args }),
		database.execute(tagsQuery),
		database.execute(lastDeployQuery),
	]);

	const filteredItems: Post[] = itemsRes.rows.map(castRowToPost);

	const tagCounts: Record<string, number> = tagsRes.rows.reduce(
		(acc, row) => {
			const name = String(row.tag_name);
			const count = Number(row.tag_count);
			acc[name] = count;
			return acc;
		},
		{} as Record<string, number>,
	);

	const lastDateRaw = dateRes.rows[0]?.last_date;
	const lastDeploy = lastDateRaw
		? new Intl.DateTimeFormat("pt-BR", {
				day: "2-digit",
				month: "numeric",
				year: "numeric",
			}).format(new Date(String(lastDateRaw)))
		: "N/A";

	return {
		tagCounts,
		filteredItems,
		lastDeploy,
	};
}
