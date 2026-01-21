import { useStore } from "@nanostores/preact";
import { Terminal, Plus, CheckCircle2, Hash, Save } from "lucide-preact";

import { $editingItem, $formState, saveItem, triggerSuccess, cancelEditing, setCurrentType } from "./store";
import type { Post } from "@/database/types";

export default function AdminEditor() {
	const { editingId, currentType, showSuccess } = useStore($formState);
	const editingItem = useStore($editingItem);

	const handleSubmit = (e: SubmitEvent) => {
		e.preventDefault();

		const form = e.currentTarget as HTMLFormElement;
		const formData = new FormData(form);
		const rawData = Object.fromEntries(formData) as Record<string, string>;

		const tagsArray = rawData.tags
			? rawData.tags
					.split(",")
					.map((t) => t.trim())
					.filter(Boolean)
			: [];

		const newItem: Post = {
			id: editingId ? Number(editingId) : Date.now(),
			type: currentType as Post["type"],
			title: rawData.title,
			description: rawData.description,
			slug: editingItem?.slug || rawData.title.toLowerCase().replace(/\s+/g, "-"),
			tags: tagsArray,
			date: editingItem ? editingItem.date : new Date(),
			featured: editingItem?.featured || false,
			content: rawData.content || undefined,
			url: currentType === "link" ? rawData.url : undefined,
			status: currentType === "tool" ? rawData.status : undefined,
		};

		// Salva na store
		saveItem(newItem);
		triggerSuccess();

		// Limpeza de UI
		if (!editingId) {
			form.reset();
			setCurrentType("note");
		} else {
			cancelEditing();
		}
	};

	return (
		<section className="animate-in fade-in slide-in-from-bottom-2 duration-300">
			<div className="flex items-center justify-between mb-6">
				<h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-3">
					<Terminal size={24} className={editingId ? "text-yellow-500" : "text-red-500"} />
					{editingId ? `Editando Post` : "Novo Post"}
				</h1>
				{editingId && (
					<button
						onClick={cancelEditing}
						className="text-xs bg-zinc-800 px-3 py-1.5 rounded text-zinc-400 hover:text-white flex items-center gap-1 border border-zinc-700"
					>
						<Plus size={12} className="rotate-45" /> Cancelar Edição
					</button>
				)}
			</div>

			{showSuccess && (
				<div className="mb-6 bg-emerald-950/30 border border-emerald-900/50 text-emerald-400 p-4 rounded-lg flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
					<CheckCircle2 size={20} />
					<span className="font-mono text-sm">
						{editingId ? "Post atualizado com sucesso!" : "Item publicado com sucesso!"}
					</span>
				</div>
			)}

			{/* TRUQUE IMPORTANTE: key={editingId ?? 'new'} 
								Isso força o React/Preact a "remontar" o form quando mudamos de item.
								Sem isso, os defaultValue não seriam atualizados ao clicar em "Editar".
							*/}
			<form
				key={editingId ?? "new"}
				onSubmit={handleSubmit}
				className="bg-zinc-900/30 border border-zinc-800 p-8 rounded-lg space-y-8 relative"
			>
				{/* Input Hidden para garantir que o type vá no FormData */}
				<input type="hidden" name="type" value={currentType} />

				{/* SELEÇÃO DE TIPO */}
				<fieldset className="space-y-3 border-none p-0 m-0">
					<legend className="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-3 px-0 w-full">
						Tipo de Conteúdo
					</legend>
					<div className="grid grid-cols-4 gap-4">
						{" "}
						{/* Mudei para 4 colunas para caber o 'intro' */}
						{["note", "link", "tool", "intro"].map((t) => (
							<button
								key={t}
								type="button"
								onClick={() => setCurrentType(t)}
								className={`py-3 text-sm font-mono uppercase rounded-md border transition-all ${
									currentType === t
										? "bg-zinc-800 border-red-500 text-white shadow-[0_0_15px_-5px_rgba(239,68,68,0.3)]"
										: "bg-zinc-950 border-zinc-800 text-zinc-500 hover:border-zinc-700"
								}`}
							>
								{t}
							</button>
						))}
					</div>
				</fieldset>

				{/* CAMPOS PRINCIPAIS */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<div className="space-y-2">
						<label htmlFor="title" className="text-xs font-mono text-zinc-500">
							Título
						</label>
						<input
							id="title"
							name="title"
							required
							type="text"
							defaultValue={editingItem?.title}
							className="w-full bg-zinc-950 border border-zinc-800 p-2.5 rounded text-zinc-200 text-sm focus:border-red-500/50 outline-none transition-all"
						/>
					</div>

					{/* CAMPO URL (Apenas para Links) */}
					{currentType === "link" && (
						<div className="space-y-2 animate-in fade-in">
							<label htmlFor="url" className="text-xs font-mono text-zinc-500">
								URL de Destino
							</label>
							<input
								id="url"
								name="url" // IMPORTANTE: name deve ser 'url' agora
								required
								type="url"
								placeholder="https://exemplo.com"
								defaultValue={editingItem?.url}
								className="w-full bg-zinc-950 border border-zinc-800 p-2.5 rounded text-zinc-200 text-sm focus:border-violet-500/50 outline-none transition-all"
							/>
						</div>
					)}

					{/* CAMPO STATUS/VERSÃO (Apenas para Tools) */}
					{currentType === "tool" && (
						<div className="space-y-2 animate-in fade-in">
							<label htmlFor="status" className="text-xs font-mono text-zinc-500">
								Versão da Ferramenta
							</label>
							<input
								id="status"
								name="status"
								type="text"
								placeholder="v1.0.0"
								defaultValue={editingItem?.status}
								className="w-full bg-zinc-950 border border-zinc-800 p-2.5 rounded text-zinc-200 text-sm focus:border-emerald-500/50 outline-none transition-all"
							/>
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
						defaultValue={editingItem?.description}
						className="w-full bg-zinc-950 border border-zinc-800 p-2.5 rounded text-zinc-200 text-sm focus:border-red-500/50 outline-none resize-none transition-all"
					/>
				</div>

				{/* CONTEÚDO (Intro não tem conteúdo longo segundo seu comentário) */}
				{currentType !== "intro" && (
					<div className="space-y-2 animate-in fade-in">
						<label htmlFor="content" className="text-xs font-mono text-zinc-500">
							Conteúdo Markdown
						</label>
						<textarea
							id="content"
							name="content"
							rows={8}
							defaultValue={editingItem?.content}
							className="w-full bg-zinc-950 border border-zinc-800 p-3 rounded text-zinc-200 text-sm focus:border-red-500/50 outline-none font-mono transition-all"
						/>
					</div>
				)}

				<div className="space-y-2">
					<label htmlFor="tags" className="text-xs font-mono text-zinc-500 flex items-center gap-2">
						<Hash size={12} /> Tags (separadas por vírgula)
					</label>
					<input
						id="tags"
						name="tags"
						type="text"
						defaultValue={editingItem?.tags.join(", ")}
						className="w-full bg-zinc-950 border border-zinc-800 p-2.5 rounded text-zinc-200 text-sm focus:border-red-500/50 outline-none transition-all"
					/>
				</div>

				<div className="pt-6 border-t border-zinc-800 flex justify-end items-center gap-4">
					<button
						type="submit"
						className={`flex items-center gap-2 px-6 py-2.5 rounded text-sm font-bold transition-colors shadow-lg ${editingId ? "bg-yellow-600 hover:bg-yellow-500 text-white" : "bg-zinc-100 hover:bg-white text-zinc-900 shadow-white/5"}`}
					>
						<Save size={16} /> {editingId ? "Atualizar Post" : "Publicar"}
					</button>
				</div>
			</form>
		</section>
	);
}
