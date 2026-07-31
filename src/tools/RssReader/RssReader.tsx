import { useStore } from "@nanostores/react";
import { ExternalLink, Loader2, Plus, RefreshCw, RotateCcw, Rss, Trash2, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ToolShell } from "../ToolShell";
import { formatRelativeDate, isValidFeedUrl, type RssArticle } from "./domain";
import {
	addFeed,
	clearAllFeeds,
	removeFeed,
	restoreDefaultFeeds,
	rssReader$,
	rssReaderStorage,
	setActiveFeed,
	updateFeedTitle,
} from "./store";
import "./rssReader.css";

type Screen = "feeds" | "articles";

interface FeedFetchResult {
	articles: RssArticle[];
	description?: string;
	error?: string;
}

async function fetchFeedArticles(feedId: string, feedUrl: string, feedTitle: string): Promise<FeedFetchResult> {
	const params = new URLSearchParams({ url: feedUrl });
	const response = await fetch(`/api/rss.json?${params.toString()}`);

	if (!response.ok) {
		let message = "Nao foi possivel carregar o feed.";
		try {
			const body = (await response.json()) as { error?: string };
			if (body.error) message = body.error;
		} catch {
			// ignore parse errors
		}
		return { articles: [], error: message };
	}

	const data = (await response.json()) as {
		title?: string;
		description?: string;
		articles?: Array<{
			id: string;
			title: string;
			link: string;
			pubDate: number;
			summary: string;
		}>;
	};

	const channelTitle = data.title?.trim() || feedTitle;
	const description = data.description?.trim() || undefined;
	const articles = (data.articles ?? []).map((article) => ({
		...article,
		feedId,
		feedTitle: channelTitle,
	}));

	return description ? { articles, description } : { articles };
}

export default function RssReader() {
	const { feeds, activeFeedId } = useStore(rssReader$);
	const [screen, setScreen] = useState<Screen>("articles");
	const [articles, setArticles] = useState<RssArticle[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [showAddForm, setShowAddForm] = useState(false);
	const [newFeedUrl, setNewFeedUrl] = useState("");
	const [newFeedTitle, setNewFeedTitle] = useState("");
	const [addError, setAddError] = useState<string | null>(null);
	const [channelDescriptions, setChannelDescriptions] = useState<Record<string, string>>({});
	const [displayedFeedId, setDisplayedFeedId] = useState<string | null>(null);

	const activeFeed = useMemo(() => feeds.find((f) => f.id === activeFeedId) ?? feeds[0], [activeFeedId, feeds]);

	const activeLabel = activeFeed?.title ?? "Feed";
	const isContentLoading = loading || (activeFeed !== undefined && displayedFeedId !== activeFeed.id);

	const loadArticles = useCallback(async () => {
		if (!activeFeed) {
			setArticles([]);
			setChannelDescriptions({});
			setDisplayedFeedId(null);
			setError(null);
			setLoading(false);
			return;
		}

		if (activeFeed.id !== activeFeedId) {
			setActiveFeed(activeFeed.id);
		}

		const requestFeedId = activeFeed.id;
		setLoading(true);
		setError(null);

		try {
			const result = await fetchFeedArticles(requestFeedId, activeFeed.url, activeFeed.title);

			if (rssReader$.get().activeFeedId !== requestFeedId) return;

			if (result.description) {
				const { description } = result;
				setChannelDescriptions((prev) => ({ ...prev, [requestFeedId]: description }));
			}

			if (result.error && result.articles.length === 0) {
				setError(result.error);
				setArticles([]);
			} else {
				setError(null);
				setArticles([...result.articles].sort((a, b) => b.pubDate - a.pubDate));
			}

			setDisplayedFeedId(requestFeedId);
		} catch {
			if (rssReader$.get().activeFeedId !== requestFeedId) return;
			setError("Erro ao carregar artigos.");
			setArticles([]);
			setDisplayedFeedId(requestFeedId);
		} finally {
			if (rssReader$.get().activeFeedId === requestFeedId) {
				setLoading(false);
			}
		}
	}, [activeFeed, activeFeedId]);

	useEffect(() => {
		void loadArticles();
	}, [loadArticles]);

	function selectFeed(feedId: string) {
		if (feedId !== activeFeedId) {
			setLoading(true);
			setError(null);
		}
		setActiveFeed(feedId);
		setScreen("articles");
	}

	async function handleAddFeed() {
		setAddError(null);
		const url = newFeedUrl.trim();

		if (!isValidFeedUrl(url)) {
			setAddError("Informe uma URL valida (http ou https).");
			return;
		}

		if (feeds.some((f) => f.url === url)) {
			setAddError("Este feed ja esta na lista.");
			return;
		}

		const probe = await fetchFeedArticles("probe", url, newFeedTitle.trim() || url);
		if (probe.error && probe.articles.length === 0) {
			setAddError(probe.error);
			return;
		}

		const customTitle = newFeedTitle.trim();
		const detectedTitle = probe.articles[0]?.feedTitle;
		const title = customTitle || detectedTitle || url;
		const id = addFeed(url, title);
		if (!id) {
			setAddError("Nao foi possivel adicionar o feed.");
			return;
		}

		if (!customTitle && detectedTitle) {
			updateFeedTitle(id, detectedTitle);
		}

		setNewFeedUrl("");
		setNewFeedTitle("");
		setShowAddForm(false);
		setScreen("articles");
	}

	function handleRemoveFeed(id: string, title: string) {
		const ok = globalThis.confirm(`Remover o feed "${title}"?`);
		if (!ok) return;
		removeFeed(id);
		setChannelDescriptions((prev) => {
			const next = { ...prev };
			delete next[id];
			return next;
		});
	}

	function handleClearAllFeeds() {
		if (feeds.length === 0) return;
		const ok = globalThis.confirm("Remover todos os feeds da lista?");
		if (!ok) return;
		clearAllFeeds();
		setChannelDescriptions({});
		setDisplayedFeedId(null);
		setShowAddForm(false);
		setAddError(null);
		setScreen("feeds");
	}

	return (
		<div className="rss-reader min-h-full w-full">
			<ToolShell
				title="Leitor de feeds RSS"
				description="Acompanhe varios feeds em um so lugar. Adicione, remova e leia sem sair do navegador."
				icon={<Rss className="size-6" strokeWidth={2} />}
				storage={rssReaderStorage}
				actions={
					<button
						type="button"
						onClick={() => void loadArticles()}
						disabled={loading || !activeFeed}
						className="inline-flex items-center gap-2 rounded-lg border border-rule bg-paper-2 px-3 py-1.5 text-xs font-medium text-ink hover:border-accent/50 disabled:opacity-50"
					>
						<RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
						Atualizar
					</button>
				}
			>
				<div className="rss-reader-layout flex flex-col lg:flex-row lg:gap-8 lg:items-start" data-screen={screen}>
					<aside className="rss-reader-sidebar w-full lg:w-[min(100%,20rem)] lg:shrink-0 lg:sticky lg:top-6">
						<div className="flex flex-col gap-3">
							<div className="flex items-start justify-between gap-2">
								<div className="min-w-0">
									<h2 className="text-sm font-semibold text-ink">Feeds</h2>
									<p className="text-xs text-muted">
										{feeds.length} feed{feeds.length === 1 ? "" : "s"} configurado
										{feeds.length === 1 ? "" : "s"}
									</p>
								</div>
								<div className="flex shrink-0 items-center gap-2">
									<button
										type="button"
										onClick={() => restoreDefaultFeeds()}
										className="inline-flex items-center gap-1 text-xs text-muted hover:text-ink"
										title="Restaurar feeds padrão ausentes"
									>
										<RotateCcw className="size-3" />
										Padrões
									</button>
									<button
										type="button"
										onClick={handleClearAllFeeds}
										disabled={feeds.length === 0}
										className="inline-flex items-center gap-1 text-xs text-muted hover:text-red-400 disabled:opacity-40 disabled:hover:text-muted"
										title="Remover todos os feeds"
									>
										<Trash2 className="size-3" />
										Limpar
									</button>
								</div>
							</div>

							<ul className="flex flex-col gap-2">
								{feeds.map((feed) => (
									<li key={feed.id}>
										<div
											className={`rss-reader-feed group/card flex items-stretch rounded-card border text-sm ${
												activeFeedId === feed.id ? "rss-reader-feed--active font-medium text-ink" : "text-ink-2"
											}`}
										>
											<button
												type="button"
												onClick={() => selectFeed(feed.id)}
												className="min-w-0 flex-1 px-3 py-2.5 text-left"
											>
												<span className="block truncate">{feed.title}</span>
												{channelDescriptions[feed.id] && (
													<span className="mt-0.5 block text-xs font-normal text-muted line-clamp-2 leading-snug">
														{channelDescriptions[feed.id]}
													</span>
												)}
											</button>
											<button
												type="button"
												onClick={() => handleRemoveFeed(feed.id, feed.title)}
												className="shrink-0 self-center rounded-lg border border-transparent px-2.5 py-2 text-muted opacity-0 transition-opacity hover:border-rule hover:text-red-400 group-hover/card:opacity-100 focus:opacity-100"
												aria-label={`Remover ${feed.title}`}
											>
												<Trash2 className="size-3.5" />
											</button>
										</div>
									</li>
								))}
							</ul>

							{showAddForm ? (
								<div className="rounded-card border border-rule bg-paper-2 p-3 flex flex-col gap-2">
									<input
										value={newFeedUrl}
										onChange={(e) => setNewFeedUrl(e.target.value)}
										placeholder="URL do feed RSS/Atom"
										className="w-full rounded-lg border border-rule bg-paper px-3 py-2 text-sm text-ink placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-accent"
									/>
									<input
										value={newFeedTitle}
										onChange={(e) => setNewFeedTitle(e.target.value)}
										placeholder="Título (opcional)"
										className="w-full rounded-lg border border-rule bg-paper px-3 py-2 text-sm text-ink placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-accent"
									/>
									{addError && <p className="text-xs text-red-400">{addError}</p>}
									<div className="flex gap-2">
										<button
											type="button"
											onClick={() => void handleAddFeed()}
											className="flex-1 rounded-lg bg-accent px-3 py-2 text-xs font-semibold text-accent-ink hover:opacity-90"
										>
											Adicionar
										</button>
										<button
											type="button"
											onClick={() => {
												setShowAddForm(false);
												setAddError(null);
												setNewFeedUrl("");
												setNewFeedTitle("");
											}}
											className="rounded-lg border border-rule px-3 py-2 text-xs text-muted hover:text-ink"
										>
											<X className="size-3.5" />
										</button>
									</div>
								</div>
							) : (
								<button
									type="button"
									onClick={() => setShowAddForm(true)}
									className="inline-flex w-full items-center justify-center gap-2 rounded-card border border-dashed border-rule px-4 py-2.5 text-sm font-medium text-muted hover:border-accent/50 hover:text-ink"
								>
									<Plus className="size-4" />
									Adicionar feed
								</button>
							)}
						</div>
					</aside>

					<section className="rss-reader-main flex-1 min-w-0 mt-4 lg:mt-0">
						<div className="rss-reader-panel flex flex-col gap-4">
							<div className="flex items-center gap-3">
								<button
									type="button"
									onClick={() => setScreen("feeds")}
									className="lg:hidden rounded-lg border border-rule px-3 py-1.5 text-xs text-muted"
								>
									Feeds
								</button>
								<div className="min-w-0 flex-1">
									<h2 className="text-lg font-bold text-ink truncate">{activeLabel}</h2>
								</div>
							</div>

							{feeds.length === 0 ? (
								<div className="rounded-card border border-dashed border-rule bg-paper-2/40 p-10 text-center">
									<Rss className="mx-auto size-10 text-accent/40 mb-3" />
									<p className="text-sm text-muted mb-4">
										Nenhum feed configurado. Adicione um ou restaure os padroes.
									</p>
									<button
										type="button"
										onClick={() => restoreDefaultFeeds()}
										className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-ink"
									>
										Restaurar feeds padrão
									</button>
								</div>
							) : isContentLoading ? (
								<div className="flex flex-col items-center justify-center gap-3 py-16 text-muted">
									<Loader2 className="size-8 animate-spin text-accent" />
									<p className="text-sm">Carregando artigos...</p>
								</div>
							) : error && articles.length === 0 ? (
								<div className="rounded-card border border-red-500/30 bg-red-500/5 p-6 text-center">
									<p className="text-sm text-red-300">{error}</p>
									<button
										type="button"
										onClick={() => void loadArticles()}
										className="mt-4 rounded-lg border border-rule px-4 py-2 text-xs text-ink"
									>
										Tentar novamente
									</button>
								</div>
							) : articles.length === 0 ? (
								<div className="rounded-card border border-dashed border-rule bg-paper-2/40 p-10 text-center">
									<p className="text-sm text-muted">Nenhum artigo encontrado neste feed.</p>
								</div>
							) : (
								<ul className="flex flex-col gap-3">
									{articles.map((article) => (
										<li key={`${article.feedId}-${article.id}`}>
											<a
												href={article.link || undefined}
												target="_blank"
												rel="noopener noreferrer"
												className="rss-reader-article block rounded-card border bg-paper-2 p-4 sm:p-5 group"
											>
												<div className="flex items-start justify-between gap-3">
													<div className="min-w-0 flex-1">
														<p className="text-xs font-medium text-accent mb-1 truncate">{article.feedTitle}</p>
														<h3 className="text-base font-semibold text-ink leading-snug group-hover:text-accent transition-colors">
															{article.title}
														</h3>
														{article.summary && (
															<p className="mt-2 text-sm text-muted line-clamp-2 leading-relaxed">{article.summary}</p>
														)}
														{article.pubDate > 0 && (
															<time
																dateTime={new Date(article.pubDate).toISOString()}
																className="mt-2 block text-xs text-muted/70"
															>
																{formatRelativeDate(article.pubDate)}
															</time>
														)}
													</div>
													{article.link && (
														<ExternalLink className="size-4 shrink-0 text-muted/50 group-hover:text-accent" />
													)}
												</div>
											</a>
										</li>
									))}
								</ul>
							)}
						</div>
					</section>
				</div>
			</ToolShell>
		</div>
	);
}
