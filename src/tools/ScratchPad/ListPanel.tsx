import { Pin, Plus, Search, StickyNote, X } from "lucide-react";
import { displayTitle, type Note } from "./store";
import { formatDate } from "./utils";

function notePreview(body: string, max = 100): string {
	const t = body.trim();
	if (t === "") return "Nota vazia";
	return t.length > max ? `${t.slice(0, max)}…` : t;
}

interface ListPanelProps {
	notes: readonly Note[];
	filtered: readonly Note[];
	query: string;
	selectedId: string | null;
	onQueryChange: (query: string) => void;
	onCreate: () => void;
	onSelect: (id: string) => void;
}

export function ListPanel({
	notes,
	filtered,
	query,
	selectedId,
	onQueryChange,
	onCreate,
	onSelect,
}: ListPanelProps) {
	return (
		<div className="flex flex-col gap-3 h-full min-h-0">
			<div className="relative shrink-0">
				<Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[color:var(--text)]/70" />
				<input
					value={query}
					onChange={(e) => onQueryChange(e.target.value)}
					placeholder="Buscar notas…"
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
				onClick={onCreate}
				className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold bg-[color:var(--primary)] text-[color:var(--primary-text)] hover:opacity-90 shadow-sm shadow-black/20 active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--primary)]"
			>
				<Plus className="size-4" strokeWidth={2.5} />
				Nova nota
			</button>

			{filtered.length === 0 ? (
				notes.length === 0 ? (
					<button
						type="button"
						onClick={onCreate}
						className="rounded-2xl border border-dashed border-[color:var(--card-border)] bg-[color:var(--card-bg)]/50 p-6 text-center flex flex-col items-center gap-3 w-full hover:border-[color:var(--primary)]/50 hover:bg-[color:var(--card-bg)] transition-[border,background] focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--primary)]"
					>
						<StickyNote className="size-9 text-[color:var(--text)]/50" />
						<p className="text-sm text-[color:var(--text)] max-w-xs leading-relaxed">
							Nenhuma nota ainda. Toque para começar a escrever.
						</p>
					</button>
				) : (
					<div className="rounded-2xl border border-dashed border-[color:var(--card-border)] bg-[color:var(--card-bg)]/50 p-6 text-center">
						<p className="text-sm text-[color:var(--text)]">Nenhum resultado para &quot;{query}&quot;</p>
					</div>
				)
			) : (
				<ul className="flex flex-col gap-2 list-none m-0 p-0 flex-1 min-h-0 overflow-y-auto lg:pr-1">
					{filtered.map((note) => {
						const active = selectedId === note.id;
						return (
							<li key={note.id}>
								<button
									type="button"
									onClick={() => onSelect(note.id)}
									className={[
										"w-full text-left rounded-xl border bg-[color:var(--card-bg)] p-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--primary)] transition-colors",
										active
											? "border-[color:var(--primary)]/60 bg-[color-mix(in_srgb,var(--primary)_10%,var(--card-bg))]"
											: "border-[color:var(--card-border)] hover:border-[color:var(--primary)]/30",
									].join(" ")}
								>
									<div className="flex items-start gap-2 min-w-0">
										{note.pinned && (
											<Pin className="size-3.5 shrink-0 mt-0.5 text-[color:var(--primary)] fill-[color:var(--primary)]" />
										)}
										<div className="flex flex-col gap-0.5 min-w-0 flex-1">
											<span className="text-sm font-semibold text-[color:var(--headline)] truncate">
												{displayTitle(note)}
											</span>
											<span className="text-[10px] text-[color:var(--text)]/75">{formatDate(note.updatedAt)}</span>
											<span className="text-xs text-[color:var(--text)]/65 line-clamp-2 leading-snug">
												{notePreview(note.body)}
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
