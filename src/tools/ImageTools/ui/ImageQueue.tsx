import { CheckSquare, ImagePlus, Square } from "lucide-react";
import type { ImageItem } from "../domain";
import { ACCEPTED_EXTENSIONS } from "../domain";
import { clearAll, clearSelection, removeItem, selectAll, selectSolo, toggleSelected } from "../store";
import { ImageListItem } from "./components";

export function ImageQueue({
	items,
	activeItemId,
	selectedIds,
	anyProcessing,
	addMoreInputRef,
	onFileSelect,
}: {
	items: ImageItem[];
	activeItemId: string | null;
	selectedIds: string[];
	anyProcessing: boolean;
	addMoreInputRef: React.RefObject<HTMLInputElement | null>;
	onFileSelect: (files: FileList | null) => void;
}) {
	return (
		<aside className="w-full space-y-3">
			<div className="flex flex-wrap items-center gap-2">
				<button
					type="button"
					onClick={selectAll}
					className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-sm text-muted hover:text-ink hover:bg-paper-2 transition-colors cursor-pointer"
				>
					<CheckSquare className="w-5 h-5" aria-hidden="true" />
					Selecionar todas
				</button>
				<button
					type="button"
					onClick={clearSelection}
					className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-sm text-muted hover:text-ink hover:bg-paper-2 transition-colors cursor-pointer"
				>
					<Square className="w-5 h-5" aria-hidden="true" />
					Limpar selecao
				</button>
				<button
					type="button"
					onClick={clearAll}
					className="ml-auto px-2.5 py-1.5 rounded-md text-sm text-muted hover:text-ink hover:bg-paper-2 transition-colors cursor-pointer"
				>
					Limpar tudo
				</button>
			</div>

			<ul className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-2 max-h-[40vh] overflow-y-auto">
				{items.map((item) => (
					<ImageListItem
						key={item.id}
						item={item}
						active={activeItemId === item.id}
						selected={selectedIds.includes(item.id)}
						onSelect={() => selectSolo(item.id)}
						onToggleSelected={() => toggleSelected(item.id)}
						onRemove={() => removeItem(item.id)}
					/>
				))}
			</ul>

			<button
				type="button"
				onClick={() => addMoreInputRef.current?.click()}
				disabled={anyProcessing}
				className="w-full flex items-center justify-center gap-2 text-sm font-medium py-3 rounded-lg bg-accent text-accent-ink hover:brightness-110 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
			>
				<ImagePlus className="w-5 h-5" aria-hidden="true" />
				Adicionar imagens
			</button>
			<input
				ref={addMoreInputRef}
				type="file"
				accept={ACCEPTED_EXTENSIONS}
				multiple
				className="hidden"
				onChange={(e) => void onFileSelect(e.target.files)}
			/>
		</aside>
	);
}
