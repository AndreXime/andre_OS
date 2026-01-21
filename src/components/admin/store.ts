import { atom, map, computed } from "nanostores";
import type { Post } from "@/database/types";

// --- STATE (Átomos) ---

// O estado dos dados principais
export const $items = atom<Post[]>([]);

// O estado da UI do formulário
export const $formState = map({
	editingId: null as number | null,
	activeTab: "editor", // 'editor' | 'list'
	currentType: "note",
	showSuccess: false,
});

// Estado derivado (Computed): Encontra o item atual baseado no ID
export const $editingItem = computed([$items, $formState], (items, form) => {
	return form.editingId ? items.find((i) => i.id === form.editingId) : undefined;
});

// --- ACTIONS ---

const defaultType = "note";

export function setItems(items: Post[]) {
	$items.set(items);
}

export function setActiveTab(tab: string) {
	$formState.setKey("activeTab", tab);
}

export function setCurrentType(type: string) {
	$formState.setKey("currentType", type);
}

export function startEditing(item: Post) {
	$formState.set({
		...$formState.get(),
		editingId: item.id,
		currentType: item.type,
		activeTab: "editor",
	});
	window.scrollTo({ top: 0, behavior: "smooth" });
}

export function cancelEditing() {
	$formState.setKey("editingId", null);
	$formState.setKey("currentType", defaultType);
}

export function deleteItem(id: number) {
	const { editingId } = $formState.get();

	if (confirm("Tem certeza que deseja deletar este post?")) {
		const currentItems = $items.get();
		$items.set(currentItems.filter((item) => item.id !== id));

		if (editingId === id) cancelEditing();
	}
}

export function saveItem(newItem: Post) {
	const currentItems = $items.get();
	const exists = currentItems.some((i) => i.id === newItem.id);

	if (exists) {
		$items.set(currentItems.map((item) => (item.id === newItem.id ? newItem : item)));
	} else {
		$items.set([newItem, ...currentItems]);
	}
}

export function triggerSuccess() {
	$formState.setKey("showSuccess", true);
	setTimeout(() => $formState.setKey("showSuccess", false), 3000);
}
