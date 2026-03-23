import { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import type { Bookmark } from "./store";

export function AddBookmarkModal({
	onClose,
	onAdd,
}: {
	onClose: () => void;
	onAdd: (b: Omit<Bookmark, "id">) => void;
}) {
	const [title, setTitle] = useState("");
	const [url, setUrl] = useState("");
	const inputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		inputRef.current?.focus();
	}, []);

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") onClose();
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [onClose]);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!title.trim() || !url.trim()) return;

		// Garante que a URL comece com http/https
		let formattedUrl = url.trim();
		if (!/^https?:\/\//i.test(formattedUrl)) {
			formattedUrl = `https://${formattedUrl}`;
		}

		onAdd({ title: title.trim(), url: formattedUrl });
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm animate-in fade-in duration-200">
			<div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
				<div className="flex items-center justify-between p-4 border-b border-zinc-800/50">
					<h3 className="text-sm font-semibold text-zinc-100">Adicionar Novo Favorito</h3>
					<button
						onClick={onClose}
						className="p-1 text-zinc-500 hover:text-zinc-300 rounded-lg hover:bg-zinc-800 transition-colors"
					>
						<X size={18} />
					</button>
				</div>

				<form onSubmit={handleSubmit} className="p-4 space-y-4">
					<div className="space-y-2">
						<label htmlFor="newtab-favorite-url" className="text-xs font-medium text-zinc-500">
							URL do Site
						</label>
						<input
							id="newtab-favorite-url"
							ref={inputRef}
							type="text"
							value={url}
							onChange={(e) => setUrl(e.target.value)}
							placeholder="ex: youtube.com"
							className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 transition-all"
						/>
					</div>

					<div className="space-y-2">
						<label htmlFor="newtab-favorite-title" className="text-xs font-medium text-zinc-500">
							Título
						</label>
						<input
							id="newtab-favorite-title"
							type="text"
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							placeholder="ex: YouTube"
							className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 transition-all"
						/>
					</div>

					<div className="pt-2 flex gap-3">
						<button
							type="button"
							onClick={onClose}
							className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
						>
							Cancelar
						</button>
						<button
							type="submit"
							disabled={!title.trim() || !url.trim()}
							className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium bg-zinc-100 text-zinc-950 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
						>
							Salvar
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
