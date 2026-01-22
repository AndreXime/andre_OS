import { Ghost } from "lucide-preact";
import Editor from "@monaco-editor/react";
import FileTreeItem from "./FileTree";
import ContextMenu from "./ContentMenu";
import { useStore } from "@nanostores/preact";
import { $cemetery, createNode, setAddingType, setMenu, updateFileContent } from "./store";

export default function WebEditor() {
	const { files, selectedFile, addingType } = useStore($cemetery);

	const handleContextMenu = (e: MouseEvent, parentId: string | null = null) => {
		e.preventDefault();
		setMenu({ x: e.clientX, y: e.clientY, parentId });
	};

	return (
		<div
			className="flex h-screen w-full min-w-[600px] overflow-scroll bg-[#1e1e1e] text-white font-sans"
			onClick={() => setMenu(null)}
		>
			{/* SIDEBAR */}
			<aside
				className="w-64 border-r border-zinc-800 bg-[#181818] flex flex-col"
				onContextMenu={(e) => handleContextMenu(e, null)}
			>
				<header className="p-3 border-b border-zinc-800/50 flex items-center justify-center">
					<span className="text-[11px] uppercase font-bold text-zinc-500 tracking-widest">File Explorer</span>
				</header>
				{files.length === 0 && !addingType && (
					<span className="text-[11px] mt-2 uppercase font-bold text-zinc-500 tracking-widest text-center w-full">
						Nenhum arquivo
					</span>
				)}
				<nav className="flex-1 overflow-y-auto py-2 px-1">
					{addingType?.parentId === null && (
						<input
							placeholder="nome.ts"
							className="w-full bg-[#3c3c3c] border border-blue-500 rounded px-2 py-1 text-xs outline-none mb-2"
							onKeyDown={(e) => e.key === "Enter" && createNode(e.currentTarget.value)}
							onBlur={() => setAddingType(null)}
						/>
					)}
					{files
						.filter((node) => node.parentId === null)
						.map((node) => (
							<FileTreeItem key={node.id} node={node} />
						))}
				</nav>
			</aside>

			{/* EDITOR */}
			<main className="flex-1">
				{selectedFile ? (
					<Editor
						height="100%"
						theme="vs-dark"
						key={selectedFile.id}
						language={selectedFile.language}
						defaultValue={selectedFile.content}
						onChange={(val: string) => updateFileContent(selectedFile.id, val || "")}
						options={{ minimap: { enabled: false }, fontSize: 14, automaticLayout: true }}
					/>
				) : (
					<div className="h-full flex flex-col items-center justify-center text-zinc-400 italic opacity-50">
						<Ghost size={48} strokeWidth={2} className="mb-2 text-purple-500" />
						<p className="text-sm font-mono tracking-tighter ">Escolha uma arquivo para ler o código</p>
					</div>
				)}
			</main>

			<ContextMenu />
		</div>
	);
}
