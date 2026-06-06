import type { MouseEvent } from "react";
import { Code2, FilePlus, FolderPlus, Ghost } from "lucide-react";
import Editor from "@monaco-editor/react";
import { ToolShell } from "../ToolShell";
import FileTreeItem from "./FileTree";
import ContextMenu from "./ContentMenu";
import { useStore } from "@nanostores/react";
import { $editor, createNode, setAddingType, setMenu, updateFileContent, webEditorStorage } from "./store";

export default function WebEditor() {
	const { files, selectedFile, addingType } = useStore($editor);

	const handleContextMenu = (e: MouseEvent<HTMLElement>, parentId: string | null = null) => {
		e.preventDefault();
		e.stopPropagation();
		setMenu({ x: e.clientX, y: e.clientY, parentId });
	};

	return (
		<ToolShell
			variant="compact"
			title="Editor Web"
			description="Arquivos e pastas locais no navegador, com preview em tempo real."
			icon={<Code2 className="size-5" strokeWidth={2} />}
			storage={webEditorStorage}
		>
			<div
				className="flex flex-1 min-h-0 min-w-0 w-full text-[color:var(--headline)] font-sans"
				onClick={() => setMenu(null)}
			>
				<aside
					className="flex w-64 shrink-0 flex-col min-h-0 border-r border-[color:var(--card-border)] bg-[color:var(--card-bg)]"
					onContextMenu={(e) => handleContextMenu(e, null)}
				>
					<header className="p-3 border-b border-[color:var(--card-border)]/70 flex items-center justify-between">
						<span className="text-[10px] uppercase font-semibold text-[color:var(--text)] tracking-[0.14em]">
							Explorer
						</span>
						<div className="flex items-center gap-2">
							<button
								type="button"
								onClick={(e) => {
									e.stopPropagation();
									setAddingType({ type: "file", parentId: null });
								}}
								className="text-[color:var(--text)] hover:text-[color:var(--headline)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--primary)] rounded"
								title="Novo Arquivo"
							>
								<FilePlus size={17} />
							</button>
							<button
								type="button"
								onClick={(e) => {
									e.stopPropagation();
									setAddingType({ type: "folder", parentId: null });
								}}
								className="text-[color:var(--text)] hover:text-[color:var(--headline)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--primary)] rounded"
								title="Nova Pasta"
							>
								<FolderPlus size={17} />
							</button>
						</div>
					</header>
					{files.length === 0 && !addingType && (
						<span className="text-[11px] mt-2 uppercase font-semibold text-[color:var(--text)] tracking-[0.12em] text-center w-full">
							Nenhum arquivo
						</span>
					)}
					<nav className="flex-1 overflow-y-auto py-2 px-1">
						{addingType?.parentId === null && (
							<input
								placeholder="Nome do arquivo ou pasta"
								className="w-full bg-[color:var(--background)] border border-[color:var(--card-border)] rounded-lg px-2 py-1 text-xs text-[color:var(--card-text)] placeholder:text-[color:var(--text)]/60 outline-none mb-2 focus:ring-2 focus:ring-[color:var(--primary)]/50"
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

				<main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
					{selectedFile ? (
						<div className="min-h-0 flex-1">
							<Editor
								height="100%"
								theme="vs-dark"
								key={selectedFile.id}
								language={selectedFile.language}
								defaultValue={selectedFile.content}
								onChange={(val) => updateFileContent(selectedFile.id, val ?? "")}
								options={{ minimap: { enabled: false }, fontSize: 14, automaticLayout: true }}
							/>
						</div>
					) : (
						<div className="flex min-h-0 flex-1 flex-col items-center justify-center text-[color:var(--text)]/80 italic opacity-50">
							<Ghost size={60} strokeWidth={2} className="mb-2 text-[color:var(--primary)]" />
							<p className="font-mono text-lg tracking-tighter">Crie um arquivo para ler o código</p>
						</div>
					)}
				</main>

				<ContextMenu />
			</div>
		</ToolShell>
	);
}
