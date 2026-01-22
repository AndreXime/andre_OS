import { useStore } from "@nanostores/preact";
import { Terminal, Plus, CheckCircle2, Hash, Save, Eye, Edit2 } from "lucide-preact";

import {
	$editingItem,
	$formState,
	saveItem,
	triggerSuccess,
	cancelEditing,
	setCurrentType,
	$items,
	$draft,
	resetDraft,
	updateDraft,
	$preview,
} from "./store";
import { useState } from "preact/hooks";
import PreviewCard from "../ui/PreviewCards";
import DetailPostView from "../ui/DetailCard";
import { toolRegistry } from "@/tools";

export default function AdminEditor() {
	const { editingId, currentType, showSuccess } = useStore($formState);
	const editingItem = useStore($editingItem);
	const items = useStore($items);
	const draft = useStore($draft);
	const previewItem = useStore($preview);
	const [isPreview, setIsPreview] = useState(false);
	const hasIntro = items.some((i) => i.type === "intro");

	const handleSubmit = async (e: SubmitEvent) => {
		e.preventDefault();

		await saveItem(previewItem);

		triggerSuccess();

		if (!editingId) {
			resetDraft();
			setCurrentType("note");
			(e.target as HTMLFormElement).reset();
		} else {
			cancelEditing();
		}
	};

	return (
		<section className="animate-in fade-in slide-in-from-bottom-2 duration-300">
			<div className="flex items-center justify-between mb-6">
				<h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-3">
					<Terminal size={24} className={editingId ? "text-yellow-500" : "text-red-500"} />
					{editingId ? `Editando ${editingItem?.title}` : "Novo Post"}
				</h1>
				<div className="flex items-center gap-3">
					<button
						type="button"
						onClick={() => setIsPreview(!isPreview)}
						className="flex items-center gap-2 text-xs font-mono uppercase text-zinc-400 hover:text-white transition-colors bg-zinc-800/50 px-3 py-1.5 rounded border border-zinc-700/50"
					>
						{isPreview ? <Edit2 size={14} /> : <Eye size={14} />}
						{isPreview ? "Editar" : "Visualizar Card"}
					</button>

					{editingId && (
						<button
							onClick={cancelEditing}
							className="text-xs bg-zinc-800 px-3 py-1.5 rounded text-zinc-400 hover:text-white flex items-center gap-1 border border-zinc-700"
						>
							<Plus size={12} className="rotate-45" /> Cancelar
						</button>
					)}
				</div>
			</div>

			{showSuccess && (
				<div className="mb-6 bg-emerald-950/30 border border-emerald-900/50 text-emerald-400 p-4 rounded-lg flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
					<CheckCircle2 size={20} />
					<span className="font-mono text-sm">
						{editingId ? "Post atualizado com sucesso!" : "Item publicado com sucesso!"}
					</span>
				</div>
			)}

			{isPreview ? (
				<div className="bg-zinc-900/30 border border-zinc-800 p-8 rounded-lg min-h-[400px] flex flex-col items-center justify-center gap-4 animate-in fade-in zoom-in-95 duration-200">
					<p className="text-zinc-500 font-mono text-xs uppercase tracking-widest mb-4">Pré-visualização</p>
					<div className="w-full max-w-2xl mx-auto transform scale-100 origin-top">
						<PreviewCard post={previewItem} />
					</div>
					<div className="w-full">
						<DetailPostView post={previewItem} />
					</div>
				</div>
			) : (
				<form
					key={editingId ?? "new"}
					onSubmit={handleSubmit}
					className="bg-zinc-900/30 border border-zinc-800 p-8 rounded-lg space-y-8 relative animate-in fade-in"
				>
					<input type="hidden" name="type" value={currentType} />

					<fieldset className="space-y-3 border-none p-0 m-0">
						<legend className="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-3 px-0 w-full">
							Tipo de Conteúdo {editingId && "(Fixo durante edição)"}
						</legend>
						<div className="grid grid-cols-4 gap-4">
							{["note", "link", "tool", "intro"].map((t) => {
								const isIntroBlocked = t === "intro" && hasIntro && !editingId;
								const isDisabled = !!editingId || isIntroBlocked;
								return (
									<button
										key={t}
										type="button"
										disabled={isDisabled}
										onClick={() => setCurrentType(t)}
										className={`py-3 text-sm font-mono uppercase rounded-md border transition-all ${
											isDisabled ? "opacity-50 cursor-not-allowed bg-zinc-950/50" : "cursor-pointer"
										} ${
											currentType === t
												? "bg-zinc-800 border-red-500 text-white shadow-[0_0_15px_-5px_rgba(239,68,68,0.3)]"
												: !isDisabled
													? "bg-zinc-950 border-zinc-800 text-zinc-500 hover:border-zinc-700"
													: "border-zinc-900"
										}`}
									>
										{t}
									</button>
								);
							})}
						</div>
					</fieldset>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-5">
						<div className={`space-y-2 ${currentType !== "link" && currentType !== "tool" && "col-span-full"}`}>
							<label htmlFor="title" className="text-xs font-mono text-zinc-500">
								Título
							</label>
							<input
								id="title"
								name="title"
								required
								type="text"
								value={draft.title}
								onInput={(e) => {
									updateDraft("title", e.currentTarget.value);
								}}
								className="w-full bg-zinc-950 border border-zinc-800 p-2.5 rounded text-zinc-200 text-sm focus:border-red-500/50 outline-none transition-all"
							/>
						</div>

						{currentType === "link" && (
							<div className="space-y-2">
								<label htmlFor="url" className="text-xs font-mono text-zinc-500">
									URL recomendada
								</label>
								<input
									id="url"
									name="url"
									required
									type="url"
									value={draft.url}
									onInput={(e) => updateDraft("url", e.currentTarget.value)}
									className="w-full bg-zinc-950 border border-zinc-800 p-2.5 rounded text-zinc-200 text-sm focus:border-violet-500/50 outline-none transition-all"
								/>
							</div>
						)}
						{currentType === "tool" && (
							<div className="space-y-2">
								<label htmlFor="toolSelect" className="text-xs font-mono text-zinc-500">
									Selecione a Ferramenta
								</label>

								<div className="relative">
									<select
										id="toolSelect"
										name="tool"
										required
										value={draft.tool_name}
										onChange={(e) => updateDraft("tool_name", e.currentTarget.value)}
										className="w-full bg-zinc-950 border border-zinc-800 p-2.5 rounded text-zinc-200 text-sm focus:border-violet-500/50 outline-none transition-all appearance-none cursor-pointer"
									>
										<option value="" disabled className="text-zinc-500">
											Selecione uma opção...
										</option>

										{toolRegistry.map((option) => (
											<option key={option} value={option}>
												{option}
											</option>
										))}
									</select>

									<div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">
										<svg
											xmlns="http://www.w3.org/2000/svg"
											width="16"
											height="16"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											strokeWidth="2"
											strokeLinecap="round"
											strokeLinejoin="round"
										>
											<path d="m6 9 6 6 6-6" />
										</svg>
									</div>
								</div>
							</div>
						)}
					</div>

					<div className="space-y-2">
						<label htmlFor="description" className="text-xs font-mono text-zinc-500">
							Descrição Curta
						</label>
						<textarea
							id="description"
							name="description"
							required
							rows={2}
							value={draft.description}
							onInput={(e) => updateDraft("description", e.currentTarget.value)}
							className="w-full bg-zinc-950 border border-zinc-800 p-2.5 rounded text-zinc-200 text-sm focus:border-red-500/50 outline-none resize-none transition-all"
						/>
					</div>

					{currentType !== "intro" && (
						<div className="space-y-2 animate-in fade-in">
							<label htmlFor="content" className="text-xs font-mono text-zinc-500">
								Conteúdo Markdown
							</label>
							<textarea
								id="content"
								name="content"
								rows={8}
								value={draft.content}
								onInput={(e) => updateDraft("content", e.currentTarget.value)}
								className="w-full bg-zinc-950 border border-zinc-800 p-3 rounded text-zinc-200 text-sm focus:border-red-500/50 outline-none font-mono transition-all"
							/>
						</div>
					)}
					{currentType !== "intro" && (
						<div className="space-y-2">
							<label htmlFor="tags" className="text-xs font-mono text-zinc-500 flex items-center gap-2">
								<Hash size={12} /> Tags (separadas por vírgula)
							</label>
							<input
								id="tags"
								name="tags"
								type="text"
								value={draft.tags}
								onInput={(e) => updateDraft("tags", e.currentTarget.value)}
								className="w-full bg-zinc-950 border border-zinc-800 p-2.5 rounded text-zinc-200 text-sm focus:border-red-500/50 outline-none transition-all"
							/>
						</div>
					)}

					<div className="pt-6 border-t border-zinc-800 flex justify-between items-center gap-4">
						<div className="flex items-center gap-3 py-2">
							<div className="relative flex items-center">
								<input
									id="featured"
									type="checkbox"
									checked={draft.featured}
									onChange={(e) => updateDraft("featured", e.currentTarget.checked)}
									className="peer h-5 w-5 cursor-pointer appearance-none rounded border border-zinc-700 bg-zinc-950 transition-all checked:border-yellow-500 checked:bg-yellow-500/10 hover:border-zinc-500 focus:outline-none"
								/>
								<svg
									className="absolute h-3.5 w-3.5 pointer-events-none left-0.5 top-0.5 ml-[1px] mt-[0.5px] stroke-yellow-500 opacity-0 peer-checked:opacity-100 transition-opacity"
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="4"
									stroke-linecap="round"
									stroke-linejoin="round"
								>
									<polyline points="20 6 9 17 4 12"></polyline>
								</svg>
							</div>
							<label
								htmlFor="featured"
								className="text-xs font-mono uppercase tracking-wider cursor-pointer select-none text-zinc-400 peer-checked:text-yellow-500 transition-colors"
							>
								Post Destaque
							</label>
						</div>
						<button
							type="submit"
							className={`flex items-center gap-2 px-6 py-2.5 rounded text-sm font-bold transition-colors shadow-lg ${editingId ? "bg-yellow-600 hover:bg-yellow-500 text-white" : "bg-zinc-100 hover:bg-white text-zinc-900 shadow-white/5"}`}
						>
							<Save size={16} /> {editingId ? "Atualizar Post" : "Publicar"}
						</button>
					</div>
				</form>
			)}
		</section>
	);
}
