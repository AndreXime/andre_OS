import type { Row } from "@libsql/client";
import type { Post } from "@/database/types";

export const formatDate = (date: Date) =>
	new Intl.DateTimeFormat("pt-BR", {
		day: "2-digit",
		month: "short",
		year: "numeric",
	}).format(date);

export const getDomain = (url: string) => url.replace(/^https?:\/\//, "").split("/")[0];

export function castRowToPost(row: Row): Post {
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
		status: row.status ? String(row.status) : undefined,
		url: row.url ? String(row.url) : undefined,
	};
}
