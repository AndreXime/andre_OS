import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useStore } from "@nanostores/react";
import {
	ArrowLeft,
	BookOpen,
	ChefHat,
	Copy,
	Download,
	ImagePlus,
	Pencil,
	Plus,
	Search,
	Trash2,
	Upload,
	X,
	Files,
} from "lucide-react";
import { ToolShell } from "../ToolShell";
import { compressImageFile } from "./imageUtils";
import {
	cookingBook$,
	displayTitle,
	duplicateRecipe,
	exportRecipesBundle,
	importRecipesBundle,
	removeRecipe,
	saveRecipe,
	type Recipe,
} from "./store";

type Screen = "list" | "detail" | "form";
type SortMode = "recent" | "title";

function useMediaQuery(query: string): boolean {
	const [matches, setMatches] = useState(false);
	useEffect(() => {
		const mq = globalThis.matchMedia(query);
		const update = () => setMatches(mq.matches);
		update();
		mq.addEventListener("change", update);
		return () => mq.removeEventListener("change", update);
	}, [query]);
	return matches;
}

function formatDate(ts: number): string {
	return new Intl.DateTimeFormat("pt-BR", {
		day: "2-digit",
		month: "short",
		year: "numeric",
	}).format(new Date(ts));
}

function recipePreview(body: string, max = 120): string {
	const t = body.trim();
	if (t === "") return "Sem conteúdo";
	return t.length > max ? `${t.slice(0, max)}…` : t;
}

function sortRecipes(items: readonly Recipe[], mode: SortMode): readonly Recipe[] {
	const copy = [...items];
	if (mode === "title") {
		copy.sort((a, b) => displayTitle(a).localeCompare(displayTitle(b), "pt-BR"));
		return copy;
	}
	copy.sort((a, b) => b.updatedAt - a.updatedAt);
	return copy;
}

function RecipeBody({ body }: { readonly body: string }) {
	return (
		<pre className="whitespace-pre-wrap font-sans text-sm sm:text-[15px] leading-[1.7] text-[color:var(--card-text)] m-0">
			{body}
		</pre>
	);
}

function FieldLabel({ children, optional }: { readonly children: ReactNode; readonly optional?: boolean }) {
	return (
		<span className="text-[10px] font-medium uppercase tracking-[0.14em] text-[color:var(--text)]/80">
			{children}
			{optional && <span className="normal-case font-normal text-[color:var(--text)]/60"> (opcional)</span>}
		</span>
	);
}

export function CookingBookView() {
	const { recipes } = useStore(cookingBook$);
	const isWide = useMediaQuery("(min-width: 1024px)");
	const [screen, setScreen] = useState<Screen>("list");
	const [selectedId, setSelectedId] = useState<string | null>(null);
	const [query, setQuery] = useState("");
	const [sortMode, setSortMode] = useState<SortMode>("recent");
	const [toast, setToast] = useState<string | null>(null);

	const [title, setTitle] = useState("");
	const [recipeContent, setRecipeContent] = useState("");
	const [photoDataUrl, setPhotoDataUrl] = useState<string | undefined>(undefined);
	const [photoError, setPhotoError] = useState<string | null>(null);
	const [saving, setSaving] = useState(false);
	const [formDirty, setFormDirty] = useState(false);

	const fileInputRef = useRef<HTMLInputElement>(null);
	const importInputRef = useRef<HTMLInputElement>(null);
	const titleInputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		if (!toast) return;
		const t = setTimeout(() => setToast(null), 2800);
		return () => clearTimeout(t);
	}, [toast]);

	useEffect(() => {
		if (screen === "form" && !selectedId) {
			titleInputRef.current?.focus();
		}
	}, [screen, selectedId]);

	const selected = useMemo(
		() => (selectedId ? recipes.find((r) => r.id === selectedId) : undefined),
		[recipes, selectedId],
	);

	const filtered = useMemo(() => {
		const q = query.trim().toLowerCase();
		const base =
			q === ""
				? recipes
				: recipes.filter((r) => {
						const label = displayTitle(r).toLowerCase();
						return label.includes(q) || r.body.toLowerCase().includes(q) || r.title.toLowerCase().includes(q);
					});
		return sortRecipes(base, sortMode);
	}, [recipes, query, sortMode]);

	const canSave = title.trim() !== "" || recipeContent.trim() !== "";
	const showListPanel = !isWide ? screen === "list" : true;
	const showMainPanel = !isWide ? screen !== "list" : true;

	const notify = useCallback((msg: string) => setToast(msg), []);

	function markDirty() {
		setFormDirty(true);
	}

	function openNew() {
		setSelectedId(null);
		setTitle("");
		setRecipeContent("");
		setPhotoDataUrl(undefined);
		setPhotoError(null);
		setFormDirty(false);
		setScreen("form");
	}

	function openEdit(recipe: Recipe) {
		setSelectedId(recipe.id);
		setTitle(recipe.title);
		setRecipeContent(recipe.body);
		setPhotoDataUrl(recipe.photoDataUrl);
		setPhotoError(null);
		setFormDirty(false);
		setScreen("form");
	}

	function openDetail(id: string) {
		setSelectedId(id);
		setScreen("detail");
	}

	function backToList() {
		if (screen === "form" && formDirty) {
			const ok = globalThis.confirm("Descartar alterações não salvas?");
			if (!ok) return;
		}
		setScreen("list");
		setSelectedId(null);
		setFormDirty(false);
	}

	function leaveForm(target: Screen) {
		if (formDirty) {
			const ok = globalThis.confirm("Descartar alterações não salvas?");
			if (!ok) return;
		}
		setFormDirty(false);
		setScreen(target);
	}

	async function onPhotoPick(file: File | undefined) {
		if (!file) return;
		setPhotoError(null);
		setSaving(true);
		try {
			const dataUrl = await compressImageFile(file);
			setPhotoDataUrl(dataUrl);
			markDirty();
		} catch (err) {
			setPhotoError(err instanceof Error ? err.message : "Erro ao carregar a foto.");
		} finally {
			setSaving(false);
		}
	}

	function handleSave() {
		if (!canSave) return;
		const id = saveRecipe({
			...(selectedId ? { id: selectedId } : {}),
			title,
			body: recipeContent,
			...(photoDataUrl ? { photoDataUrl } : {}),
		});
		if (id === "") return;
		setSelectedId(id);
		setFormDirty(false);
		setScreen("detail");
		notify(selectedId ? "Receita atualizada" : "Receita salva");
	}

	function handleDelete(recipe: Recipe) {
		const ok = globalThis.confirm(`Remover "${displayTitle(recipe)}"?`);
		if (!ok) return;
		removeRecipe(recipe.id);
		if (isWide) {
			setScreen("list");
			setSelectedId(null);
		} else {
			backToList();
		}
		notify("Receita removida");
	}

	function handleDuplicate(recipe: Recipe) {
		const newId = duplicateRecipe(recipe.id);
		if (newId === "") return;
		setSelectedId(newId);
		setScreen("detail");
		notify("Receita duplicada");
	}

	async function handleCopy(recipe: Recipe) {
		const text = [displayTitle(recipe), "", recipe.body.trim()].filter(Boolean).join("\n");
		try {
			await navigator.clipboard.writeText(text);
			notify("Copiado para a área de transferência");
		} catch {
			notify("Não foi possível copiar");
		}
	}

	function handleExport() {
		const bundle = exportRecipesBundle();
		const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: "application/json" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `receitas-${new Date().toISOString().slice(0, 10)}.json`;
		a.click();
		URL.revokeObjectURL(url);
		notify("Backup exportado");
	}

	async function handleImportFile(file: File | undefined) {
		if (!file) return;
		try {
			const raw: unknown = JSON.parse(await file.text());
			const replace = globalThis.confirm("OK = substituir todas as receitas.\nCancelar = mesclar com as existentes.");
			const result = importRecipesBundle(raw, replace ? "replace" : "merge");
			if (result.error) {
				notify(result.error);
				return;
			}
			notify(`${result.imported} receita(s) importada(s)`);
			setScreen("list");
			setSelectedId(null);
		} catch {
			notify("Arquivo JSON inválido");
		}
		if (importInputRef.current) importInputRef.current.value = "";
	}

	const listPanel = (
		<div className="flex flex-col gap-3 h-full">
			<div className="flex items-center justify-between gap-2">
				<span className="text-xs text-[color:var(--text)]/80 tabular-nums">
					{recipes.length === 0 ? "Nenhuma receita" : `${recipes.length} receita${recipes.length === 1 ? "" : "s"}`}
				</span>
				<div className="flex items-center gap-1">
					<button
						type="button"
						onClick={() => setSortMode((m) => (m === "recent" ? "title" : "recent"))}
						className="text-[10px] uppercase tracking-wider px-2 py-1 rounded-md border border-[color:var(--card-border)] text-[color:var(--text)] hover:text-[color:var(--headline)] hover:border-[color:var(--primary)]/40 transition-colors"
						title={sortMode === "recent" ? "Ordenar A–Z" : "Ordenar por data"}
					>
						{sortMode === "recent" ? "Recentes" : "A–Z"}
					</button>
				</div>
			</div>

			<div className="relative">
				<Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[color:var(--text)]/70" />
				<input
					value={query}
					onChange={(e) => setQuery(e.target.value)}
					placeholder="Buscar receitas…"
					className="w-full min-h-10 rounded-xl border border-[color:var(--card-border)] bg-[color:var(--card-bg)] pl-10 pr-9 py-2 text-sm text-[color:var(--headline)] placeholder:text-[color:var(--text)]/70 focus:outline-none focus:ring-2 focus:ring-[color:var(--primary)]"
				/>
				{query && (
					<button
						type="button"
						onClick={() => setQuery("")}
						className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md text-[color:var(--text)] hover:text-[color:var(--headline)]"
						aria-label="Limpar busca"
					>
						<X className="size-3.5" />
					</button>
				)}
			</div>

			{!isWide && (
				<button
					type="button"
					onClick={openNew}
					className="inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold bg-[color:var(--primary)] text-[color:var(--primary-text)] hover:opacity-90 shadow-sm shadow-black/20 active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--primary)]"
				>
					<Plus className="size-4" strokeWidth={2.5} />
					Nova receita
				</button>
			)}

			{filtered.length === 0 ? (
				recipes.length === 0 ? (
					<button
						type="button"
						onClick={openNew}
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
									onClick={() => openDetail(recipe.id)}
									className={[
										"cooking-book-card w-full text-left rounded-2xl border bg-[color:var(--card-bg)] overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--primary)]",
										active && "cooking-book-card--active",
									].join(" ")}
								>
									<div className="flex gap-0 min-h-[4.25rem]">
										{recipe.photoDataUrl ? (
											<img
												src={recipe.photoDataUrl}
												alt=""
												className="w-20 sm:w-24 shrink-0 object-cover bg-[color:var(--background)]"
											/>
										) : (
											<div className="w-20 sm:w-24 shrink-0 flex items-center justify-center bg-[color-mix(in_srgb,var(--cb-warm-dim)_80%,var(--background))] text-[color:var(--primary)]/50">
												<ChefHat className="size-6" />
											</div>
										)}
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

	const detailPanel =
		selected && screen === "detail" ? (
			<article className="cooking-book-panel flex flex-col gap-4">
				<div className="flex flex-wrap items-center gap-2">
					{!isWide && (
						<button
							type="button"
							onClick={backToList}
							className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm text-[color:var(--text)] hover:text-[color:var(--headline)] hover:bg-[color:var(--primary)]/10"
						>
							<ArrowLeft className="size-4" />
							Voltar
						</button>
					)}
					<div className="flex-1 min-w-[8rem]" />
					<button
						type="button"
						onClick={() => handleCopy(selected)}
						className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-[color:var(--text)] border border-[color:var(--card-border)] hover:border-[color:var(--primary)]/50 hover:text-[color:var(--headline)]"
					>
						<Copy className="size-3.5" />
						Copiar
					</button>
					<button
						type="button"
						onClick={() => handleDuplicate(selected)}
						className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-[color:var(--text)] border border-[color:var(--card-border)] hover:border-[color:var(--primary)]/50 hover:text-[color:var(--headline)]"
					>
						<Files className="size-3.5" />
						Duplicar
					</button>
					<button
						type="button"
						onClick={() => openEdit(selected)}
						className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-[color:var(--headline)] border border-[color:var(--card-border)] hover:border-[color:var(--primary)]/50"
					>
						<Pencil className="size-4" />
						Editar
					</button>
					<button
						type="button"
						onClick={() => handleDelete(selected)}
						className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-[color:var(--text)] hover:text-red-300 hover:bg-red-500/10"
					>
						<Trash2 className="size-4" />
					</button>
				</div>

				<div className="rounded-2xl border border-[color:var(--card-border)] bg-[color:var(--card-bg)] overflow-hidden shadow-lg shadow-black/15">
					{selected.photoDataUrl ? (
						<div className="cooking-book-hero relative">
							<img
								src={selected.photoDataUrl}
								alt=""
								className="w-full max-h-80 object-cover bg-[color:var(--background)]"
							/>
							<div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[color:var(--card-bg)] to-transparent pointer-events-none" />
						</div>
					) : null}
					<div className="p-4 sm:p-6 flex flex-col gap-3">
						<h2 className="text-2xl sm:text-3xl font-bold text-[color:var(--headline)] tracking-tight leading-tight">
							{displayTitle(selected)}
						</h2>
						<p className="text-xs text-[color:var(--text)]/80">
							Atualizado em {formatDate(selected.updatedAt)}
							{selected.createdAt !== selected.updatedAt && (
								<span className="text-[color:var(--text)]/55"> · Criado em {formatDate(selected.createdAt)}</span>
							)}
						</p>
						<div className="h-px bg-gradient-to-r from-transparent via-[color:var(--card-border)] to-transparent" />
						<RecipeBody body={selected.body} />
					</div>
				</div>
			</article>
		) : null;

	const formPanel =
		screen === "form" ? (
			<form
				className="cooking-book-panel flex flex-col gap-4"
				onSubmit={(e) => {
					e.preventDefault();
					handleSave();
				}}
			>
				<div className="flex flex-wrap items-center gap-2">
					{!isWide && (
						<button
							type="button"
							onClick={() => (selectedId && selected ? leaveForm("detail") : backToList())}
							className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm text-[color:var(--text)] hover:text-[color:var(--headline)]"
						>
							<ArrowLeft className="size-4" />
							Voltar
						</button>
					)}
					<h2 className="text-lg sm:text-xl font-semibold text-[color:var(--headline)]">
						{selectedId ? "Editar receita" : "Nova receita"}
					</h2>
				</div>

				<div className="rounded-2xl border border-[color:var(--card-border)] bg-[color:var(--card-bg)] p-4 sm:p-5 flex flex-col gap-4 shadow-lg shadow-black/10">
					<div className="flex flex-col gap-1.5">
						<label htmlFor="recipe-title">
							<FieldLabel optional>Título</FieldLabel>
						</label>
						<input
							ref={titleInputRef}
							id="recipe-title"
							value={title}
							onChange={(e) => {
								setTitle(e.target.value);
								markDirty();
							}}
							placeholder="Bolo de cenoura, risoto…"
							className="w-full min-h-10 rounded-lg border border-[color:var(--card-border)] bg-[color:var(--background)] px-3 py-2 text-sm text-[color:var(--headline)] placeholder:text-[color:var(--text)]/70 focus:outline-none focus:ring-2 focus:ring-[color:var(--primary)]"
						/>
					</div>

					<div className="flex flex-col gap-1.5">
						<label htmlFor="recipe-body">
							<FieldLabel>Receita</FieldLabel>
						</label>
						<textarea
							id="recipe-body"
							value={recipeContent}
							onChange={(e) => {
								setRecipeContent(e.target.value);
								markDirty();
							}}
							rows={12}
							placeholder={
								"Ingredientes, modo de preparo, temperos, tempo no forno…\nEscreva como quiser, sem formato fixo."
							}
							className="w-full min-h-[10rem] rounded-lg border border-[color:var(--card-border)] bg-[color:var(--background)] px-3 py-2.5 text-sm text-[color:var(--headline)] placeholder:text-[color:var(--text)]/70 focus:outline-none focus:ring-2 focus:ring-[color:var(--primary)] resize-y leading-relaxed"
						/>
					</div>

					<div className="flex flex-col gap-2">
						<FieldLabel optional>Foto</FieldLabel>
						<input
							ref={fileInputRef}
							type="file"
							accept="image/*"
							className="sr-only"
							onChange={(e) => {
								const file = e.target.files?.[0];
								void onPhotoPick(file);
								e.target.value = "";
							}}
						/>
						{photoDataUrl ? (
							<div className="relative rounded-xl overflow-hidden border border-[color:var(--card-border)]">
								<img src={photoDataUrl} alt="" className="w-full max-h-52 object-cover" />
								<button
									type="button"
									onClick={() => {
										setPhotoDataUrl(undefined);
										markDirty();
									}}
									className="absolute top-2 right-2 rounded-lg bg-black/60 p-1.5 text-white hover:bg-black/80"
									aria-label="Remover foto"
								>
									<X className="size-4" />
								</button>
							</div>
						) : (
							<button
								type="button"
								disabled={saving}
								onClick={() => fileInputRef.current?.click()}
								className="inline-flex items-center justify-center gap-2 rounded-xl border border-dashed border-[color:var(--card-border)] px-4 py-6 text-sm text-[color:var(--text)] hover:border-[color:var(--primary)]/50 hover:text-[color:var(--headline)] transition-colors disabled:opacity-50 w-full"
							>
								<ImagePlus className="size-5" />
								{saving ? "Processando foto…" : "Adicionar foto"}
							</button>
						)}
						{photoError && <p className="text-xs text-red-300">{photoError}</p>}
					</div>

					<button
						type="submit"
						disabled={!canSave || saving}
						className={[
							"inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-[opacity,transform]",
							canSave && !saving
								? "bg-[color:var(--primary)] text-[color:var(--primary-text)] hover:opacity-90 active:scale-[0.99]"
								: "bg-[color:var(--card-border)]/40 text-[color:var(--text)]/60 cursor-not-allowed",
						].join(" ")}
					>
						{selectedId ? "Salvar alterações" : "Salvar receita"}
					</button>
				</div>
			</form>
		) : null;

	const emptyMainPanel =
		isWide && screen === "list" ? (
			<div className="cooking-book-panel hidden lg:flex flex-col items-center justify-center rounded-2xl border border-dashed border-[color:var(--card-border)] bg-[color:var(--card-bg)]/30 p-12 text-center min-h-[20rem]">
				<ChefHat className="size-12 text-[color:var(--primary)]/40 mb-4" />
				<p className="text-sm text-[color:var(--text)] max-w-xs leading-relaxed mb-4">
					{recipes.length === 0
						? "Comece criando sua primeira receita."
						: "Selecione uma receita na lista ou crie uma nova."}
				</p>
				<button
					type="button"
					onClick={openNew}
					className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold bg-[color:var(--primary)] text-[color:var(--primary-text)] hover:opacity-90"
				>
					<Plus className="size-4" />
					Nova receita
				</button>
			</div>
		) : null;

	return (
		<>
			{toast && (
				<output
					aria-live="polite"
					className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 block px-4 py-2 rounded-full text-sm font-medium bg-[color:var(--card-bg)] border border-[color:var(--primary)]/40 text-[color:var(--headline)] shadow-lg shadow-black/30 animate-[cb-fade-in_0.2s_ease-out]"
				>
					{toast}
				</output>
			)}

			<ToolShell
				title="Livro de receitas"
				description="Caderno pessoal no navegador. Texto livre, foto opcional, backup em JSON."
				icon={<ChefHat className="size-6" strokeWidth={2} />}
				actions={
					<>
						<input
							ref={importInputRef}
							type="file"
							accept="application/json,.json"
							className="sr-only"
							onChange={(e) => {
								void handleImportFile(e.target.files?.[0]);
							}}
						/>
						<button
							type="button"
							onClick={() => importInputRef.current?.click()}
							className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium border border-[color:var(--card-border)] text-[color:var(--text)] hover:text-[color:var(--headline)] hover:border-[color:var(--primary)]/40"
						>
							<Upload className="size-3.5" />
							Importar
						</button>
						<button
							type="button"
							onClick={handleExport}
							disabled={recipes.length === 0}
							className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium border border-[color:var(--card-border)] text-[color:var(--text)] hover:text-[color:var(--headline)] hover:border-[color:var(--primary)]/40 disabled:opacity-40 disabled:cursor-not-allowed"
						>
							<Download className="size-3.5" />
							Exportar
						</button>
						{isWide && (
							<button
								type="button"
								onClick={openNew}
								className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold bg-[color:var(--primary)] text-[color:var(--primary-text)] hover:opacity-90"
							>
								<Plus className="size-3.5" />
								Nova
							</button>
						)}
					</>
				}
			>
				<div className="flex flex-col lg:flex-row lg:gap-8 lg:items-start">
					{showListPanel && (
						<aside className="w-full lg:w-[min(100%,22rem)] lg:shrink-0 lg:sticky lg:top-6">{listPanel}</aside>
					)}

					{showMainPanel && (
						<section className="flex-1 min-w-0 mt-4 lg:mt-0">{detailPanel ?? formPanel ?? emptyMainPanel}</section>
					)}
				</div>
			</ToolShell>

			{!isWide && recipes.length > 0 && screen === "list" && (
				<button
					type="button"
					onClick={openNew}
					className="fixed bottom-6 right-4 z-40 inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold bg-[color:var(--primary)] text-[color:var(--primary-text)] shadow-lg shadow-black/40 hover:opacity-95 active:scale-[0.98] lg:hidden"
					aria-label="Nova receita"
				>
					<Plus className="size-5" strokeWidth={2.5} />
					Nova
				</button>
			)}
		</>
	);
}
