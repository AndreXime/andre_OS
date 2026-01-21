import database from "@/database/database";
import { castRowToPost } from "./utils";

export default async function getPostBySlug(slug: string) {
	// 1. Query do Post Único
	const postQuery = `SELECT * FROM posts WHERE slug = ? LIMIT 1`;

	// 2. Query de Metadados Globais (Tags e Last Deploy)
	const tagsQuery = `
        SELECT j.value as tag_name, COUNT(*) as tag_count
        FROM posts, json_each(posts.tags) as j
        GROUP BY j.value
    `;
	const lastDeployQuery = `SELECT MAX(date) as last_date FROM posts`;

	// Execução paralela
	const [postRes, tagsRes, dateRes] = await Promise.all([
		database.execute({ sql: postQuery, args: [slug] }),
		database.execute(tagsQuery),
		database.execute(lastDeployQuery),
	]);

	// 3. Processamento do Post (Retorna null se não encontrar)
	const post = postRes.rows.length > 0 ? castRowToPost(postRes.rows[0]) : null;

	// 4. Mapeamento das Tags
	const tagCounts: Record<string, number> = tagsRes.rows.reduce(
		(acc, row) => {
			acc[String(row.tag_name)] = Number(row.tag_count);
			return acc;
		},
		{} as Record<string, number>,
	);

	// 5. Formatação do Last Deploy
	const lastDateRaw = dateRes.rows[0]?.last_date;
	const lastDeploy = lastDateRaw
		? new Intl.DateTimeFormat("pt-BR", {
				day: "2-digit",
				month: "numeric",
				year: "numeric",
			}).format(new Date(String(lastDateRaw)))
		: "N/A";

	return {
		post,
		tagCounts,
		lastDeploy,
	};
}
