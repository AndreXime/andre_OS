import type { Item } from "@/data/items";

export const formatDate = (date: Date) =>
	new Intl.DateTimeFormat("pt-BR", {
		day: "2-digit",
		month: "short",
		year: "numeric",
	}).format(date);

export const getDomain = (url: string) => url.replace(/^https?:\/\//, "").split("/")[0];

export function processPosts(posts: Item[], categoryFilter: string, searchFilter: string) {
	const filteredItems = posts.filter((item) => {
		const matchesFilter = categoryFilter === "all" || item.type === categoryFilter;

		if (!searchFilter) return matchesFilter;

		const searchContent = `${item.title} ${item.description || ""}`.toLowerCase();

		return matchesFilter && searchContent.includes(categoryFilter.toLowerCase());
	});

	const tagCounts = posts.reduce(
		(acc, item) => {
			item.tags.forEach((tag) => {
				acc[tag] = (acc[tag] || 0) + 1;
			});
			return acc;
		},
		{} as Record<string, number>,
	);

	const lastDeploy = new Intl.DateTimeFormat("pt-BR", {
		day: "2-digit",
		month: "numeric",
		year: "numeric",
	}).format(
		posts.reduce((maxDate, item) => {
			if (!item.date) return maxDate;
			return item.date > maxDate ? item.date : maxDate;
		}, new Date(0)),
	);

	return {
		tagCounts,
		filteredItems,
		lastDeploy,
	};
}
