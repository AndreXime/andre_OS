export interface RssFeed {
	readonly id: string;
	readonly url: string;
	readonly title: string;
}

export interface RssArticle {
	readonly id: string;
	readonly title: string;
	readonly link: string;
	readonly pubDate: number;
	readonly summary: string;
	readonly feedId: string;
	readonly feedTitle: string;
}

export const DEFAULT_FEEDS: readonly RssFeed[] = [
	{ id: "tabnews", url: "https://tabnews.com.br/rss", title: "TabNews" },
	{ id: "tecnoblog", url: "https://tecnoblog.net/feed", title: "Tecnoblog" },
	{ id: "diolinux", url: "https://diolinux.com.br/feed/", title: "Diolinux" },
	{ id: "hn-best", url: "https://hnrss.org/best", title: "HN Best" },
	{ id: "pragmatic-engineer", url: "https://blog.pragmaticengineer.com/rss/", title: "Pragmatic Engineer" },
	{ id: "devto", url: "https://dev.to/feed", title: "DEV Community" },
	{ id: "smashing", url: "https://www.smashingmagazine.com/feed/", title: "Smashing Magazine" },
	{ id: "simon-willison", url: "https://simonwillison.net/atom/everything/", title: "Simon Willison" },
	{ id: "josh-comeau", url: "https://www.joshwcomeau.com/rss.xml", title: "Josh Comeau" },
	{ id: "the-verge", url: "https://www.theverge.com/rss/index.xml", title: "The Verge" },
] as const;

export function formatRelativeDate(timestamp: number): string {
	const diff = Date.now() - timestamp;
	const minutes = Math.floor(diff / 60_000);
	if (minutes < 1) return "agora";
	if (minutes < 60) return `${minutes}min`;
	const hours = Math.floor(minutes / 60);
	if (hours < 24) return `${hours}h`;
	const days = Math.floor(hours / 24);
	if (days < 7) return `${days}d`;
	return new Date(timestamp).toLocaleDateString("pt-BR", {
		day: "2-digit",
		month: "short",
		year: timestamp < Date.now() - 365 * 86_400_000 ? "numeric" : undefined,
	});
}

export function isValidFeedUrl(raw: string): boolean {
	try {
		const url = new URL(raw.trim());
		return url.protocol === "http:" || url.protocol === "https:";
	} catch {
		return false;
	}
}
