import { FilePlus, FolderPlus, Ghost } from "lucide-preact";
import Editor from "@monaco-editor/react";
import FileTreeItem from "./FileTree";
import ContextMenu from "./ContentMenu";
import { useStore } from "@nanostores/preact";
import { $editor, createNode, setAddingType, setMenu, updateFileContent } from "./store";

export default function WebEditor() {
	const { files, selectedFile, addingType } = useStore($editor);

	const handleContextMenu = (e: MouseEvent, parentId: string | null = null) => {
		e.preventDefault();
		e.stopPropagation();
		setMenu({ x: e.clientX, y: e.clientY, parentId });
	};

	return (
		<div className="flex flex-1 w-full min-w-[600px] bg-[#1e1e1e] text-white font-sans" onClick={() => setMenu(null)}>
			<aside
				className="w-64 border-r border-zinc-800 bg-[#181818] flex flex-col"
				onContextMenu={(e) => handleContextMenu(e, null)}
			>
				<header className="p-3 border-b border-zinc-800/50 flex items-center justify-between">
					<span className="text-[12px] uppercase font-bold text-zinc-500 tracking-widest">Explorer</span>
					<div className="flex items-center gap-2">
						<button
							onClick={(e) => {
								e.stopPropagation();
								setAddingType({ type: "file", parentId: null });
							}}
							className="text-zinc-500 hover:text-white transition-colors"
							title="Novo Arquivo"
						>
							<FilePlus size={17} />
						</button>
						<button
							onClick={(e) => {
								e.stopPropagation();
								setAddingType({ type: "folder", parentId: null });
							}}
							className="text-zinc-500 hover:text-white transition-colors"
							title="Nova Pasta"
						>
							<FolderPlus size={17} />
						</button>
					</div>
				</header>
				{files.length === 0 && !addingType && (
					<span className="text-[11px] mt-2 uppercase font-bold text-zinc-500 tracking-widest text-center w-full">
						Nenhum arquivo
					</span>
				)}
				<nav className="flex-1 overflow-y-auto py-2 px-1">
					{addingType?.parentId === null && (
						<input
							placeholder="Nome do arquivo ou pasta"
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
						<Ghost size={60} strokeWidth={2} className="mb-2 text-purple-500" />
						<p className="font-mono text-lg tracking-tighter ">Crie um arquivo para ler o código</p>
					</div>
				)}
			</main>

			<ContextMenu />
		</div>
	);
}
