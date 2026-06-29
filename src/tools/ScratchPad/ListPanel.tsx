import { Pin, Plus, Search, StickyNote, X } from "lucide-react";
import { toolBtnPrimaryClass, toolInputClass } from "@/lib/toolUi";
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
				<Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
				<input
					value={query}
					onChange={(e) => onQueryChange(e.target.value)}
					placeholder="Buscar notas…"
					className={`${toolInputClass} pl-10 pr-9`}
				/>
				{query && (
					<button
						type="button"
						onClick={() => onQueryChange("")}
						className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted hover:text-ink"
						aria-label="Limpar busca"
					>
						<X className="size-3.5" />
					</button>
				)}
			</div>

			<button
				type="button"
				onClick={onCreate}
				className={`inline-flex w-full shrink-0 items-center justify-center gap-2 ${toolBtnPrimaryClass}`}
			>
				<Plus className="size-4" strokeWidth={2.5} />
				Nova nota
			</button>

			{filtered.length === 0 ? (
				notes.length === 0 ? (
					<button
						type="button"
						onClick={onCreate}
						className="rounded-card border border-dashed border-rule bg-paper-2/50 p-6 text-center flex flex-col items-center gap-3 w-full hover:border-accent/50 hover:bg-paper-2 transition-[border,background] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
					>
						<StickyNote className="size-9 text-muted/50" />
						<p className="text-sm text-muted max-w-xs leading-relaxed">
							Nenhuma nota ainda. Toque para começar a escrever.
						</p>
					</button>
				) : (
					<div className="rounded-card border border-dashed border-rule bg-paper-2/50 p-6 text-center">
						<p className="text-sm text-muted">Nenhum resultado para &quot;{query}&quot;</p>
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
										"w-full text-left rounded-card border bg-paper-2 p-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent transition-colors",
										active
											? "border-accent/60 bg-accent-bg"
											: "border-rule hover:border-accent/30",
									].join(" ")}
								>
									<div className="flex items-start gap-2 min-w-0">
										{note.pinned && (
											<Pin className="size-3.5 shrink-0 mt-0.5 text-accent fill-accent" />
										)}
										<div className="flex flex-col gap-0.5 min-w-0 flex-1">
											<span className="text-sm font-semibold text-ink truncate">
												{displayTitle(note)}
											</span>
											<span className="text-[10px] text-muted/75">{formatDate(note.updatedAt)}</span>
											<span className="text-xs text-muted/65 line-clamp-2 leading-snug">
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
