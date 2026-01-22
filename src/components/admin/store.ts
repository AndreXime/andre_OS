import { atom, map, computed } from "nanostores";
import type { Post } from "@/database/types";
import { actions } from "astro:actions";

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

export const $draft = map({
	title: "",
	description: "",
	content: "",
	tags: "", // Armazenamos como string ("tag1, tag2") para facilitar o input
	url: "",
	status: "",
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

export function updateDraft(field: keyof ReturnType<typeof $draft.get>, value: string) {
	$draft.setKey(field, value);
}

// NOVA ACTION: Reseta o draft para vazio
export function resetDraft() {
	$draft.set({
		title: "",
		description: "",
		content: "",
		tags: "",
		url: "",
		status: "",
	});
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

	$draft.set({
		title: item.title,
		description: item.description,
		content: item.content || "",
		tags: item.tags.join(", "),
		url: item.url || "",
		status: item.status || "",
	});
}

export function cancelEditing() {
	$formState.setKey("editingId", null);
	$formState.setKey("currentType", defaultType);
	resetDraft();
}

export async function deleteItem(id: number) {
	const { editingId } = $formState.get();

	if (!confirm("Tem certeza que deseja deletar este post?")) return;

	const { error } = await actions.deletePost({ id });

	if (error) {
		console.error("Erro ao deletar:", error);
		alert("Não foi possível deletar o post.");
		return;
	}

	const currentItems = $items.get();
	$items.set(currentItems.filter((item) => item.id !== id));

	if (editingId === id) cancelEditing();
}

export async function saveItem(postData: Post) {
	const { data, error } = await actions.savePost(postData);

	if (error || !data.post) {
		console.error("Erro de validação ou servidor:", error);
		alert("Erro ao salvar o post. Verifique o console.");
		return;
	}

	const currentItems = $items.get();
	const exists = currentItems.some((i) => i.id === postData.id);

	if (exists) {
		$items.set(currentItems.map((item) => (item.id === postData.id ? postData : item)));
	} else {
		$items.set([data.post, ...currentItems]);
	}
}

export function triggerSuccess() {
	$formState.setKey("showSuccess", true);
	setTimeout(() => $formState.setKey("showSuccess", false), 3000);
}
