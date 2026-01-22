import type { Post } from "@/database/types";
import { List, LogOut, PenTool } from "lucide-preact";
import { useEffect } from "preact/hooks";
import { $items, $formState, setItems, setActiveTab } from "./store";
import { useStore } from "@nanostores/preact";
import AdminEditor from "./Editor";
import AdminList from "./List";

export default function AdminView({ posts }: { posts: Post[] }) {
	const items = useStore($items);
	const { editingId, activeTab } = useStore($formState);

	useEffect(() => {
		setItems(posts);
	}, [posts, setItems]);

	return (
		<div className="min-h-screen bg-zinc-950 text-zinc-300 font-sans flex flex-col">
			<header className="bg-zinc-900/80 border-b border-zinc-800 h-14 flex items-center px-6 justify-between sticky top-0 z-50 backdrop-blur-md">
				<div className="flex items-center gap-3">
					<div className="w-3 h-3 bg-red-500 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div>
					<span className="font-mono font-bold text-zinc-100 tracking-tight">andre_OS</span>
					<span className="text-xs bg-red-950 text-red-400 border border-red-900 px-2 py-0.5 rounded font-mono">
						ADMIN
					</span>
				</div>
				<a
					href={"/admin?action=logout"}
					className="flex items-center gap-2 text-sm font-mono text-zinc-500 hover:text-white transition-colors"
				>
					<LogOut size={15} /> Logout
				</a>
			</header>

			<main className="flex-1 max-w-5xl mx-auto w-full p-6 md:p-12 flex flex-col">
				<div className="flex gap-6 border-b border-zinc-800 mb-8">
					<button
						onClick={() => setActiveTab("editor")}
						className={`flex-1 pb-3 text-sm font-medium transition-colors border-b-2 flex items-center gap-2 ${
							activeTab === "editor"
								? "border-red-500 text-zinc-100"
								: "border-transparent text-zinc-500 hover:text-zinc-300 hover:border-zinc-800"
						}`}
					>
						<PenTool size={16} />
						{editingId ? `Editando Post` : "Criar Novo Post"}
					</button>
					<button
						onClick={() => setActiveTab("list")}
						className={`flex-1 pb-3 text-sm font-medium transition-colors border-b-2 flex items-center gap-2 ${
							activeTab === "list"
								? "border-red-500 text-zinc-100"
								: "border-transparent text-zinc-500 hover:text-zinc-300 hover:border-zinc-800"
						}`}
					>
						<List size={16} />
						Gerenciar Posts ({items.length})
					</button>
				</div>

				{/* EDITOR TAB */}
				{activeTab === "editor" && <AdminEditor />}

				{activeTab === "list" && <AdminList />}
			</main>
		</div>
	);
}
