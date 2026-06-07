import { ArrowLeft, Copy, Files, Pencil, Trash2 } from "lucide-react";
import { displayTitle, type Recipe } from "./store";
import { formatDate } from "./utils";

function RecipeBody({ body }: { readonly body: string }) {
	return (
		<pre className="whitespace-pre-wrap font-sans text-sm sm:text-[15px] leading-[1.7] text-[color:var(--card-text)] m-0">
			{body}
		</pre>
	);
}

interface DetailPanelProps {
	recipe: Recipe;
	onBack: () => void;
	onCopy: (recipe: Recipe) => void;
	onDuplicate: (recipe: Recipe) => void;
	onEdit: (recipe: Recipe) => void;
	onDelete: (recipe: Recipe) => void;
}

export function DetailPanel({ recipe, onBack, onCopy, onDuplicate, onEdit, onDelete }: DetailPanelProps) {
	return (
		<article className="cooking-book-panel flex flex-col gap-4">
			<div className="flex flex-wrap items-center gap-2">
				<button
					type="button"
					onClick={onBack}
					className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm text-[color:var(--text)] hover:text-[color:var(--headline)] hover:bg-[color:var(--primary)]/10 lg:hidden"
				>
					<ArrowLeft className="size-4" />
					Voltar
				</button>
				<div className="flex-1 min-w-[8rem]" />
				<button
					type="button"
					onClick={() => onCopy(recipe)}
					className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-[color:var(--text)] border border-[color:var(--card-border)] hover:border-[color:var(--primary)]/50 hover:text-[color:var(--headline)]"
				>
					<Copy className="size-3.5" />
					Copiar
				</button>
				<button
					type="button"
					onClick={() => onDuplicate(recipe)}
					className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-[color:var(--text)] border border-[color:var(--card-border)] hover:border-[color:var(--primary)]/50 hover:text-[color:var(--headline)]"
				>
					<Files className="size-3.5" />
					Duplicar
				</button>
				<button
					type="button"
					onClick={() => onEdit(recipe)}
					className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-[color:var(--headline)] border border-[color:var(--card-border)] hover:border-[color:var(--primary)]/50"
				>
					<Pencil className="size-4" />
					Editar
				</button>
				<button
					type="button"
					onClick={() => onDelete(recipe)}
					className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-[color:var(--text)] hover:text-red-300 hover:bg-red-500/10"
				>
					<Trash2 className="size-4" />
				</button>
			</div>

			<div className="rounded-2xl border border-[color:var(--card-border)] bg-[color:var(--card-bg)] overflow-hidden shadow-lg shadow-black/15">
				<div className="p-4 sm:p-6 flex flex-col gap-3">
					<h2 className="text-2xl sm:text-3xl font-bold text-[color:var(--headline)] tracking-tight leading-tight">
						{displayTitle(recipe)}
					</h2>
					<p className="text-xs text-[color:var(--text)]/80">
						Atualizado em {formatDate(recipe.updatedAt)}
						{recipe.createdAt !== recipe.updatedAt && (
							<span className="text-[color:var(--text)]/55"> · Criado em {formatDate(recipe.createdAt)}</span>
						)}
					</p>
					<div className="h-px bg-gradient-to-r from-transparent via-[color:var(--card-border)] to-transparent" />
					<RecipeBody body={recipe.body} />
				</div>
			</div>
		</article>
	);
}
