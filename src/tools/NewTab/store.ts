import { persistentAtom } from "@nanostores/persistent";

export interface Bookmark {
	id: string;
	title: string;
	url: string;
}

export const bookmarks$ = persistentAtom<Bookmark[]>("andre_os_newtab_bookmarks", [], {
	encode: JSON.stringify,
	decode(value: string | null) {
		if (!value) return [];
		try {
			const parsed = JSON.parse(value) as unknown;
			if (!Array.isArray(parsed)) return [];
			const list = parsed.filter(
				(b): b is Bookmark =>
					typeof b === "object" &&
					b !== null &&
					typeof (b as Bookmark).id === "string" &&
					typeof (b as Bookmark).title === "string" &&
					typeof (b as Bookmark).url === "string",
			);
			return list.length > 0 ? list : [];
		} catch {
			return [];
		}
	},
});

export function addBookmark(entry: Omit<Bookmark, "id">) {
	const next: Bookmark = { ...entry, id: crypto.randomUUID() };
	bookmarks$.set([...bookmarks$.get(), next]);
}

export function removeBookmark(id: string) {
	bookmarks$.set(bookmarks$.get().filter((b) => b.id !== id));
}
