import type { Row } from "@libsql/client";
import type { Post } from "@/database/types";

export const formatDate = (date: Date) =>
	new Intl.DateTimeFormat("pt-BR", {
		day: "2-digit",
		month: "short",
		year: "numeric",
	}).format(date);

export const getDomain = (url: string) => url.replace(/^https?:\/\//, "").split("/")[0];

export const getThemeClasses = (toolType: string) => {
	switch (toolType) {
		case "tool":
			return {
				borderClass: "border-emerald-500/30",
				bgClass: "bg-emerald-950/20",
				badgeClass: "bg-emerald-950/30 text-emerald-400 border-emerald-900/50",
			};
		case "note":
			return {
				borderClass: "border-blue-500/30",
				bgClass: "bg-blue-950/20",
				badgeClass: "bg-blue-950/30 text-blue-400 border-blue-900/50",
			};
		case "link":
			return {
				borderClass: "border-violet-500/30",
				bgClass: "bg-violet-950/20",
				badgeClass: "bg-violet-950/30 text-violet-400 border-violet-900/50",
			};

		default:
			return {
				borderClass: "border-zinc-700",
				bgClass: "bg-zinc-900",
				badgeClass: "bg-zinc-800 text-zinc-400 border-zinc-700",
			};
	}
};

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
