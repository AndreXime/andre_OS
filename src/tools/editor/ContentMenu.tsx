import { useCemeteryStore } from "./store";

export default function ContextMenu() {
	const { menu, setMenu, setAddingType, deleteNode } = useCemeteryStore();

	if (!menu) return null;

	return (
		<div
			className="fixed z-[100] bg-[#252526] border border-zinc-700 shadow-xl py-1 rounded text-zinc-300 w-48"
			style={{ top: menu?.y, left: menu?.x }}
			onMouseLeave={() => setMenu(null)}
		>
			<button
				onClick={() => {
					setAddingType({ type: "file", parentId: menu?.parentId || null });
					setMenu(null);
				}}
				className="w-full text-left px-4 py-1.5 hover:bg-[#094771] hover:text-white text-xs"
			>
				Novo Arquivo
			</button>
			<button
				onClick={() => {
					setAddingType({ type: "folder", parentId: menu?.parentId || null });
					setMenu(null);
				}}
				className="w-full text-left px-4 py-1.5 hover:bg-[#094771] hover:text-white text-xs"
			>
				Nova Pasta
			</button>
			<div className="border-t border-zinc-700 my-1"></div>
			<button
				onClick={() => {
					if (menu?.parentId) deleteNode(menu.parentId);
					setMenu(null);
				}}
				className="w-full text-left px-4 py-1.5 hover:bg-red-900/40 text-xs text-red-400"
			>
				Excluir
			</button>
		</div>
	);
}
