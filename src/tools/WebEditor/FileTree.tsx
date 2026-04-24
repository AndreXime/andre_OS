import { useEffect, useState } from "react";
import { Folder, FileCode, ChevronRight, ChevronDown } from "lucide-react";
import { useStore } from "@nanostores/react";
import { $editor, createNode, setAddingType, setMenu, setSelectedFile, type FileNode } from "./store";

// Componente para cada item da árvore (Arquivo ou Pasta)
export default function FileItem({ node }: { node: FileNode }) {
	const [isOpen, setIsOpen] = useState(false);

	const { files, selectedFile, addingType } = useStore($editor);

	useEffect(() => {
		if (addingType?.parentId === node.id) {
			setIsOpen(true);
		}
	}, [addingType, node.id]);

	const children = files.filter((f) => f.parentId === node.id);
	const isSelected = selectedFile?.id === node.id;

	return (
		<div className="select-none">
			<div
				className={`flex items-center py-1 px-2 cursor-pointer rounded-sm ${
					isSelected
						? "bg-[color-mix(in_srgb,var(--primary)_15%,var(--card-bg))]"
						: "hover:bg-[color-mix(in_srgb,var(--card-bg)_70%,var(--background))]"
				}`}
				onClick={() => (node.isFolder ? setIsOpen(!isOpen) : setSelectedFile(node))}
				onContextMenu={(e) => {
					e.preventDefault();
					e.stopPropagation();
					setMenu({ x: e.clientX, y: e.clientY, parentId: node.id });
				}}
			>
				{/* COLUNA DA SETA: Largura fixa de 20px para manter o alinhamento */}
				<div className="w-5 flex shrink-0 items-center justify-center text-[var(--text)]">
					{node.isFolder && <span>{isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}</span>}
				</div>

				{/* COLUNA DO ÍCONE: Também com margem consistente */}
				<div className="flex items-center gap-2">
					{node.isFolder ? (
						<Folder size={16} className="text-[var(--primary)] shrink-0" />
					) : (
						<FileCode size={16} className="text-[var(--text)] shrink-0" />
					)}

					<span className="text-[13px] font-sans text-[var(--headline)] truncate">{node.name}</span>
				</div>
			</div>

			{/* FILHOS: Indentação baseada na largura da coluna da seta */}
			{node.isFolder && isOpen && (
				<div className="ml-3">
					{children.map((child) => (
						<FileItem key={child.id} node={child} />
					))}
					{addingType?.parentId === node.id && (
						<div className="px-2 py-1">
							<input
								placeholder={addingType.type === "file" ? "nome.ts" : "Nova pasta"}
								className="w-full bg-[var(--background)] border border-[var(--primary)] rounded px-2 py-1 text-xs text-[var(--card-text)] placeholder:text-[var(--text)]/60 outline-none focus:ring-1 focus:ring-[var(--primary)]/50"
								onBlur={() => setAddingType(null)}
								onKeyDown={(e) => e.key === "Enter" && createNode(e.currentTarget.value)}
							/>
						</div>
					)}
				</div>
			)}
		</div>
	);
}
