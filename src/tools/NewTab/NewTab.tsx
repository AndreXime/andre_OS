import { useState, useEffect, type FormEvent } from "react";
import { useStore } from "@nanostores/react";
import { Search, Plus, Trash2, Command, Globe } from "lucide-react";
import { AddBookmarkModal } from "./Modal";
import { bookmarks$, addBookmark, removeBookmark, type Bookmark } from "./store";

export default function App() {
	const bookmarks = useStore(bookmarks$);
	const [isAdding, setIsAdding] = useState(false);
	const [time, setTime] = useState<Date>(new Date());

	// Atualiza o relógio
	useEffect(() => {
		const timer = setInterval(() => setTime(new Date()), 1000);
		return () => clearInterval(timer);
	}, []);

	const handleAddBookmark = (bookmark: Omit<Bookmark, "id">) => {
		addBookmark(bookmark);
		setIsAdding(false);
	};

	const handleDeleteBookmark = (id: string) => {
		removeBookmark(id);
	};

	const handleGoogleSearch = (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const q = new FormData(e.currentTarget).get("q");
		const query = typeof q === "string" ? q.trim() : "";
		const url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
		window.open(url, "_blank", "noopener,noreferrer");
	};

	// Saudação baseada na hora
	const hour = time.getHours();
	const greeting = hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";

	return (
		<div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-zinc-800 flex flex-col items-center justify-center p-6">
			{/* Container Principal */}
			<main className="w-full max-w-3xl flex flex-col gap-12 items-center animate-in fade-in zoom-in-95 duration-700">
				{/* Relógio e Saudação */}
				<div className="text-center space-y-2">
					<h1 className="text-6xl md:text-8xl font-light tracking-tighter text-zinc-100/90 tabular-nums">
						{time.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
					</h1>
					<p className="text-xl text-zinc-500 font-medium tracking-wide">{greeting}.</p>
				</div>

				{/* Barra de Busca do Google */}
				<form onSubmit={handleGoogleSearch} className="relative group w-full max-w-2xl">
					<div className="absolute z-10 inset-y-0 left-4 flex items-center pointer-events-none text-zinc-400 group-focus-within:text-zinc-100 transition-colors">
						<Search size={20} strokeWidth={2} />
					</div>
					<input
						type="text"
						name="q"
						placeholder="Pesquisar no Google ou digitar um URL"
						autoComplete="off"
						className="w-full bg-zinc-800 border border-zinc-600/90 rounded-full py-4 pl-12 pr-6 text-lg text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-zinc-500 focus:bg-zinc-700 transition-all shadow-xl shadow-black/30"
					/>
				</form>

				{/* Grid de Favoritos */}
				<div className="w-full max-w-2xl">
					<div className="flex items-center justify-between mb-6 px-2">
						<h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
							<Command size={14} /> Favoritos
						</h2>
						<button
							onClick={() => setIsAdding(true)}
							className="p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-full transition-all"
							title="Adicionar Favorito"
						>
							<Plus size={18} />
						</button>
					</div>

					<div className="grid w-full grid-cols-[repeat(auto-fit,minmax(120px,1fr))] gap-4">
						{bookmarks.map((bookmark) => (
							<BookmarkItem key={bookmark.id} bookmark={bookmark} onDelete={handleDeleteBookmark} />
						))}
					</div>
				</div>
			</main>

			{/* Modal de Adição */}
			{isAdding && <AddBookmarkModal onClose={() => setIsAdding(false)} onAdd={handleAddBookmark} />}
		</div>
	);
}

function BookmarkItem({ bookmark, onDelete }: { bookmark: Bookmark; onDelete: (id: string) => void }) {
	// Utiliza o serviço do Google para resgatar o favicon dinamicamente
	const faviconUrl = `https://www.google.com/s2/favicons?domain=${bookmark.url}&sz=128`;

	return (
		<div className="flex min-w-0 w-full justify-center">
			<div className="group relative w-full max-w-44">
				<a
					href={bookmark.url}
					className="flex w-full flex-col items-center justify-center gap-4 rounded-2xl border border-zinc-800/50 bg-zinc-900/40 p-5 outline-none transition-all aspect-square hover:border-zinc-700 hover:bg-zinc-800/80 focus-visible:ring-2 focus-visible:ring-zinc-600"
				>
					<div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border border-zinc-800/50 bg-zinc-950 p-2 shadow-inner transition-transform duration-300 group-hover:scale-110">
						<img
							src={faviconUrl}
							alt={bookmark.title}
							className="h-full w-full object-contain"
							onError={(e) => {
								(e.target as HTMLImageElement).style.display = "none";
								(e.target as HTMLImageElement).nextElementSibling?.classList.remove("hidden");
							}}
						/>
						<Globe className="hidden h-8 w-8 text-zinc-600" />
					</div>
					<span className="w-full truncate text-center text-sm font-medium text-zinc-400 group-hover:text-zinc-200">
						{bookmark.title}
					</span>
				</a>

				<button
					onClick={(e) => {
						e.preventDefault();
						e.stopPropagation();
						onDelete(bookmark.id);
					}}
					className="absolute right-2 top-2 z-10 scale-90 rounded-full border border-zinc-900 bg-red-500/10 p-1.5 text-red-500 opacity-0 transition-all hover:bg-red-500 hover:text-white group-hover:opacity-100 group-hover:scale-100"
				>
					<Trash2 size={12} />
				</button>
			</div>
		</div>
	);
}
