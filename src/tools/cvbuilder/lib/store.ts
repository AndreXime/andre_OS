import { atom, computed } from "nanostores";
import { parseResumeMarkdown } from "./parserMd";
import defaultCV from "../markdown/cvExample.md?raw";

export interface Resume {
	id: string;
	name: string;
	data: string;
	selected: boolean;
}

const STORAGE_KEY = "resume_list";
const STORAGE_KEY_PROFILE = "resume_profile";

const defaultState: Resume[] = [
	{
		id: "default",
		name: "Currículo Padrão",
		data: defaultCV,
		selected: true,
	},
];

export const resumes$ = atom<Resume[]>(defaultState);
export const masterProfile$ = atom<string>("");

export function initFromStorage() {
	if (typeof window === "undefined") return;

	const saved = localStorage.getItem(STORAGE_KEY);
	if (saved) {
		try {
			let parsed: Resume[] = JSON.parse(saved);

			// Migração: Garante selected
			if (!parsed.some((r) => r.selected)) {
				parsed = parsed.map((r, index) => ({ ...r, selected: index === 0 }));
			}

			// Migração: Garante apenas um selected
			const selectedCount = parsed.filter((r) => r.selected).length;
			if (selectedCount !== 1) {
				// Se tiver 0 ou mais de 1, reseta para o primeiro
				parsed = parsed.map((r, i) => ({ ...r, selected: i === 0 }));
			}

			resumes$.set(parsed);
		} catch (e) {
			console.error("Erro ao carregar currículos:", e);
		}
	}

	const savedProfile = localStorage.getItem(STORAGE_KEY_PROFILE);
	if (savedProfile) {
		masterProfile$.set(savedProfile);
	}
}

// --- Computed Values ---

export function updateMasterProfile(content: string) {
	masterProfile$.set(content);
	if (typeof window !== "undefined") {
		localStorage.setItem(STORAGE_KEY_PROFILE, content);
	}
}

// Encontra o currículo onde selected === true
export const activeResume$ = computed(resumes$, (resumes) => {
	return resumes.find((r) => r.selected) || defaultState[0];
});

export const parsedContent$ = computed(activeResume$, (resume) => {
	if (!resume) return null;
	try {
		return parseResumeMarkdown(resume.data);
	} catch (e) {
		console.error("Erro ao parsear markdown", e);
		return null;
	}
});

// --- Actions ---

function saveToStorage(list: Resume[]) {
	if (typeof window !== "undefined") {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
	}
}

export function updateResumeContent(content: string) {
	const list = resumes$.get();

	// Atualiza o conteúdo APENAS do currículo selecionado
	const updatedList = list.map((r) => (r.selected ? { ...r, data: content } : r));

	resumes$.set(updatedList);
	saveToStorage(updatedList);
}

export function createNewResume() {
	const name = prompt("Nome do novo currículo:");
	if (!name) return;

	const newList = resumes$.get().map((r) => ({ ...r, selected: false })); // Desmarca todos

	const newResume: Resume = {
		id: crypto.randomUUID(),
		name,
		data: defaultCV,
		selected: true, // O novo nasce selecionado
	};

	const finalList = [...newList, newResume];

	resumes$.set(finalList);
	saveToStorage(finalList);
}

export function deleteResume(id: string) {
	const list = resumes$.get();
	if (list.length <= 1) {
		alert("Você precisa manter pelo menos um currículo.");
		return;
	}

	if (!confirm("Tem certeza que deseja deletar este currículo?")) return;

	// Se estamos deletando o selecionado, precisamos passar a coroa para outro
	const isDeletingSelected = list.find((r) => r.id === id)?.selected;

	let newList = list.filter((r) => r.id !== id);

	if (isDeletingSelected) {
		// Seleciona o primeiro da lista restante
		newList[0] = { ...newList[0], selected: true };
	}

	resumes$.set(newList);
	saveToStorage(newList);
}

export function setActiveResume(id: string) {
	const list = resumes$.get();

	// Percorre a lista: se o ID bater, selected=true, senão selected=false
	const updatedList = list.map((r) => ({
		...r,
		selected: r.id === id,
	}));

	resumes$.set(updatedList);
	saveToStorage(updatedList);
}

export function resetActiveResume() {
	if (confirm("Deseja voltar ao modelo padrão? Isso apagará suas alterações atuais neste currículo.")) {
		updateResumeContent(defaultCV);
	}
}
