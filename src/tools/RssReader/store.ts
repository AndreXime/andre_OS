import { createJsonPersistentAtom } from "@/lib/toolStorage/persistentAtom";
import type { ToolStorageEntry } from "@/lib/toolStorage/types";
import { DEFAULT_FEEDS, type RssFeed } from "./domain";

export interface RssReaderState {
	readonly feeds: readonly RssFeed[];
	readonly activeFeedId: string;
}

const RSS_READER_STORAGE_KEY = "rss_reader_v1";

function newId(): string {
	return globalThis.crypto?.randomUUID?.() ?? `feed-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function normalizeFeed(raw: unknown): RssFeed | null {
	if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
	const f = raw as Record<string, unknown>;
	if (typeof f.id !== "string" || f.id === "") return null;
	if (typeof f.url !== "string" || f.url === "") return null;
	const title = typeof f.title === "string" && f.title.trim() !== "" ? f.title.trim() : f.url;
	return { id: f.id, url: f.url.trim(), title };
}

function resolveActiveFeedId(feeds: readonly RssFeed[], activeRaw: unknown): string {
	if (feeds.length === 0) return "";
	if (typeof activeRaw === "string" && activeRaw !== "all" && feeds.some((f) => f.id === activeRaw)) {
		return activeRaw;
	}
	return feeds[0]?.id ?? "";
}

function normalizeState(raw: unknown): RssReaderState {
	if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
		const feeds = [...DEFAULT_FEEDS];
		return { feeds, activeFeedId: resolveActiveFeedId(feeds, undefined) };
	}

	const o = raw as Record<string, unknown>;

	if (Array.isArray(o.feeds)) {
		const feeds: RssFeed[] = [];
		for (const item of o.feeds) {
			const feed = normalizeFeed(item);
			if (feed) feeds.push(feed);
		}
		return {
			feeds,
			activeFeedId: resolveActiveFeedId(feeds, o.activeFeedId),
		};
	}

	const feeds = [...DEFAULT_FEEDS];
	return { feeds, activeFeedId: resolveActiveFeedId(feeds, undefined) };
}

const defaultFeeds = [...DEFAULT_FEEDS];

const defaultState: RssReaderState = {
	feeds: defaultFeeds,
	activeFeedId: resolveActiveFeedId(defaultFeeds, undefined),
};

export const rssReader$ = createJsonPersistentAtom<RssReaderState>({
	storageKey: RSS_READER_STORAGE_KEY,
	defaultValue: defaultState,
	normalize: normalizeState,
});

export const rssReaderStorage: ToolStorageEntry = {
	toolId: "rss_reader",
	keys: [RSS_READER_STORAGE_KEY],
	atoms: { [RSS_READER_STORAGE_KEY]: rssReader$ },
};

export function setActiveFeed(feedId: string): void {
	const state = rssReader$.get();
	if (!state.feeds.some((f) => f.id === feedId)) return;
	rssReader$.set({ ...state, activeFeedId: feedId });
}

export function addFeed(url: string, title?: string): string | null {
	const trimmedUrl = url.trim();
	if (trimmedUrl === "") return null;

	const state = rssReader$.get();
	if (state.feeds.some((f) => f.url === trimmedUrl)) return null;

	const id = newId();
	const feed: RssFeed = {
		id,
		url: trimmedUrl,
		title: title?.trim() || trimmedUrl,
	};

	rssReader$.set({ feeds: [...state.feeds, feed], activeFeedId: id });
	return id;
}

export function removeFeed(id: string): void {
	const state = rssReader$.get();
	const nextFeeds = state.feeds.filter((f) => f.id !== id);
	if (nextFeeds.length === state.feeds.length) return;

	const activeFeedId =
		state.activeFeedId === id ? resolveActiveFeedId(nextFeeds, undefined) : state.activeFeedId;

	rssReader$.set({ feeds: nextFeeds, activeFeedId });
}

export function updateFeedTitle(id: string, title: string): void {
	const trimmed = title.trim();
	if (trimmed === "") return;

	const state = rssReader$.get();
	const feeds = state.feeds.map((f) => (f.id === id ? { ...f, title: trimmed } : f));
	rssReader$.set({ ...state, feeds });
}

export function restoreDefaultFeeds(): void {
	const state = rssReader$.get();
	const existingUrls = new Set(state.feeds.map((f) => f.url));
	const missing = DEFAULT_FEEDS.filter((f) => !existingUrls.has(f.url));
	if (missing.length === 0) return;
	rssReader$.set({ ...state, feeds: [...state.feeds, ...missing] });
}

export function clearAllFeeds(): void {
	rssReader$.set({ feeds: [], activeFeedId: "" });
}
