import { BookOpen, ChefHat, Plus, Search, X } from "lucide-react";
import { displayTitle, type Recipe } from "./store";
import type { Screen } from "./store";
import { formatDate } from "./utils";

function recipePreview(body: string, max = 120): string {
	const t = body.trim();
	if (t === "") return "Sem conteúdo";
	return t.length > max ? `${t.slice(0, max)}…` : t;
}

interface ListPanelProps {
	recipes: readonly Recipe[];
	filtered: readonly Recipe[];
	query: string;
	selectedId: string | null;
	screen: Screen;
	onQueryChange: (query: string) => void;
	onOpenNew: () => void;
	onOpenDetail: (id: string) => void;
}

export function ListPanel({
	recipes,
	filtered,
	query,
	selectedId,
	screen,
	onQueryChange,
	onOpenNew,
	onOpenDetail,
}: ListPanelProps) {
	return (
		<div className="flex flex-col gap-3 h-full">
			<div className="relative">
				<Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[color:var(--text)]/70" />
				<input
					value={query}
					onChange={(e) => onQueryChange(e.target.value)}
					placeholder="Buscar receitas…"
					className="w-full min-h-10 rounded-xl border border-[color:var(--card-border)] bg-[color:var(--card-bg)] pl-10 pr-9 py-2 text-sm text-[color:var(--headline)] placeholder:text-[color:var(--text)]/70 focus:outline-none focus:ring-2 focus:ring-[color:var(--primary)]"
				/>
				{query && (
					<button
						type="button"
						onClick={() => onQueryChange("")}
						className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md text-[color:var(--text)] hover:text-[color:var(--headline)]"
						aria-label="Limpar busca"
					>
						<X className="size-3.5" />
					</button>
				)}
			</div>

			<button
				type="button"
				onClick={onOpenNew}
				className="inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold bg-[color:var(--primary)] text-[color:var(--primary-text)] hover:opacity-90 shadow-sm shadow-black/20 active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--primary)]"
			>
				<Plus className="size-4" strokeWidth={2.5} />
				Nova receita
			</button>

			{filtered.length === 0 ? (
				recipes.length === 0 ? (
					<button
						type="button"
						onClick={onOpenNew}
						className="rounded-2xl border border-dashed border-[color:var(--card-border)] bg-[color:var(--card-bg)]/50 p-6 text-center flex flex-col items-center gap-3 w-full hover:border-[color:var(--primary)]/50 hover:bg-[color:var(--card-bg)] transition-[border,background] focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--primary)]"
					>
						<BookOpen className="size-9 text-[color:var(--text)]/50" />
						<p className="text-sm text-[color:var(--text)] max-w-xs leading-relaxed">
							Seu caderno está vazio. Toque para anotar a primeira receita.
						</p>
					</button>
				) : (
					<div className="rounded-2xl border border-dashed border-[color:var(--card-border)] bg-[color:var(--card-bg)]/50 p-6 text-center">
						<p className="text-sm text-[color:var(--text)]">Nenhum resultado para &quot;{query}&quot;</p>
					</div>
				)
			) : (
				<ul className="flex flex-col gap-2 list-none m-0 p-0 lg:overflow-y-auto lg:max-h-[calc(100dvh-16rem)] lg:pr-1">
					{filtered.map((recipe) => {
						const active = selectedId === recipe.id && screen !== "list";
						return (
							<li key={recipe.id}>
								<button
									type="button"
									onClick={() => onOpenDetail(recipe.id)}
									className={[
										"cooking-book-card w-full text-left rounded-2xl border bg-[color:var(--card-bg)] overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--primary)]",
										active && "cooking-book-card--active",
									].join(" ")}
								>
									<div className="flex gap-0 min-h-[4.25rem]">
										<div className="w-20 sm:w-24 shrink-0 flex items-center justify-center bg-[color-mix(in_srgb,var(--cb-warm-dim)_80%,var(--background))] text-[color:var(--primary)]/50">
											<ChefHat className="size-6" />
										</div>
										<div className="flex flex-col justify-center gap-0.5 min-w-0 flex-1 p-3">
											<span className="text-sm font-semibold text-[color:var(--headline)] truncate">
												{displayTitle(recipe)}
											</span>
											<span className="text-[10px] text-[color:var(--text)]/75">{formatDate(recipe.updatedAt)}</span>
											<span className="text-xs text-[color:var(--text)]/65 line-clamp-2 leading-snug">
												{recipePreview(recipe.body, 80)}
											</span>
										</div>
									</div>
								</button>
							</li>
						);
					})}
				</ul>
			)}
		</div>
	);
}
