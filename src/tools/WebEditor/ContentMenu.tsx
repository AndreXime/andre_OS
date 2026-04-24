import { useStore } from "@nanostores/react";
import { $editor, deleteNode, setAddingType, setMenu } from "./store";

export default function ContextMenu() {
	const { menu } = useStore($editor);

	if (!menu) return null;

	return (
		<div
			className="fixed z-[100] bg-[var(--card-bg)] border border-[var(--card-border)] shadow-xl py-1 rounded text-[var(--card-text)] w-48"
			style={{ top: menu?.y, left: menu?.x }}
			onMouseLeave={() => setMenu(null)}
		>
			<button
				onClick={() => {
					setAddingType({ type: "file", parentId: menu?.parentId || null });
					setMenu(null);
				}}
				className="w-full text-left px-4 py-1.5 hover:bg-[color-mix(in_srgb,var(--primary)_18%,var(--card-bg))] hover:text-[var(--headline)] text-xs"
			>
				Novo Arquivo
			</button>
			<button
				onClick={() => {
					setAddingType({ type: "folder", parentId: menu?.parentId || null });
					setMenu(null);
				}}
				className="w-full text-left px-4 py-1.5 hover:bg-[color-mix(in_srgb,var(--primary)_18%,var(--card-bg))] hover:text-[var(--headline)] text-xs"
			>
				Nova Pasta
			</button>
			<div className="border-t border-[var(--card-border)] my-1"></div>
			<button
				onClick={() => {
					if (menu?.parentId) deleteNode(menu.parentId);
					setMenu(null);
				}}
				className="w-full text-left px-4 py-1.5 hover:bg-[color-mix(in_srgb,var(--primary)_12%,#0000)] text-xs text-[var(--primary)]"
			>
				Excluir
			</button>
		</div>
	);
}
