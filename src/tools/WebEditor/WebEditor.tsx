import { FilePlus, FolderPlus, Ghost } from "lucide-react";
import Editor from "@monaco-editor/react";
import FileTreeItem from "./FileTree";
import ContextMenu from "./ContentMenu";
import { useStore } from "@nanostores/react";
import { $editor, createNode, setAddingType, setMenu, updateFileContent } from "./store";

export default function WebEditor() {
	const { files, selectedFile, addingType } = useStore($editor);

	const handleContextMenu = (e: React.MouseEvent<HTMLElement>, parentId: string | null = null) => {
		e.preventDefault();
		e.stopPropagation();
		setMenu({ x: e.clientX, y: e.clientY, parentId });
	};

	return (
		<div
			className="flex flex-1 w-full min-w-[600px] bg-[var(--background)] text-[var(--headline)] font-sans"
			onClick={() => setMenu(null)}
		>
			<aside
				className="w-64 border-r border-[var(--card-border)] bg-[var(--card-bg)] flex flex-col"
				onContextMenu={(e) => handleContextMenu(e, null)}
			>
				<header className="p-3 border-b border-[var(--card-border)]/70 flex items-center justify-between">
					<span className="text-[12px] uppercase font-bold text-[var(--text)] tracking-widest">Explorer</span>
					<div className="flex items-center gap-2">
						<button
							onClick={(e) => {
								e.stopPropagation();
								setAddingType({ type: "file", parentId: null });
							}}
							className="text-[var(--text)] hover:text-[var(--headline)] transition-colors"
							title="Novo Arquivo"
						>
							<FilePlus size={17} />
						</button>
						<button
							onClick={(e) => {
								e.stopPropagation();
								setAddingType({ type: "folder", parentId: null });
							}}
							className="text-[var(--text)] hover:text-[var(--headline)] transition-colors"
							title="Nova Pasta"
						>
							<FolderPlus size={17} />
						</button>
					</div>
				</header>
				{files.length === 0 && !addingType && (
					<span className="text-[11px] mt-2 uppercase font-bold text-[var(--text)] tracking-widest text-center w-full">
						Nenhum arquivo
					</span>
				)}
				<nav className="flex-1 overflow-y-auto py-2 px-1">
					{addingType?.parentId === null && (
						<input
							placeholder="Nome do arquivo ou pasta"
							className="w-full bg-[var(--background)] border border-[var(--primary)] rounded px-2 py-1 text-xs text-[var(--card-text)] placeholder:text-[var(--text)]/60 outline-none mb-2 focus:ring-1 focus:ring-[var(--primary)]/50"
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
						onChange={(val) => updateFileContent(selectedFile.id, val ?? "")}
						options={{ minimap: { enabled: false }, fontSize: 14, automaticLayout: true }}
					/>
				) : (
					<div className="h-full flex flex-col items-center justify-center text-[var(--text)]/80 italic opacity-50">
						<Ghost size={60} strokeWidth={2} className="mb-2 text-[var(--primary)]" />
						<p className="font-mono text-lg tracking-tighter">Crie um arquivo para ler o código</p>
					</div>
				)}
			</main>

			<ContextMenu />
		</div>
	);
}
