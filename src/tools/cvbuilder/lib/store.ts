import { computed } from "nanostores";
import { persistentAtom } from "@nanostores/persistent";
import { parseResumeMarkdown } from "./parserMd";
import defaultCV from "../markdown/cvExample.md?raw";

export interface Resume {
	id: string;
	name: string;
	data: string;
	selected: boolean;
}

const defaultState: Resume[] = [
	{
		id: "default",
		name: "Currículo Padrão",
		data: defaultCV,
		selected: true,
	},
];

export const resumes$ = persistentAtom<Resume[]>("resume_list", defaultState, {
	encode: JSON.stringify,
	decode(value: string | null) {
		if (!value) return defaultState;
		try {
			let parsed: Resume[] = JSON.parse(value);

			if (parsed.length === 0) return defaultState;

			// Se não tiver nenhum selecionado ou mais de um selecionado
			let selectedIndex = parsed.findIndex((r) => r.selected);
			if (selectedIndex === -1) selectedIndex = 0;

			parsed = parsed.map((r, index) => ({ ...r, selected: index === selectedIndex }));

			return parsed;
		} catch {
			return defaultState;
		}
	},
});

export const masterProfile$ = persistentAtom<string>("resume_profile", "", {
	encode: JSON.stringify,
	decode: (value: string | null) => (value ? JSON.parse(value) : ""),
});

export const jobDescription$ = persistentAtom<string>("resume_job_description", "", {
	encode: JSON.stringify,
	decode: (value: string | null) => (value ? JSON.parse(value) : ""),
});

// --- Computed Values ---

export function updateMasterProfile(content: string) {
	masterProfile$.set(content);
}

export function updateJobDescription(content: string) {
	jobDescription$.set(content);
}

// Encontra o currículo onde selected === true
export const activeResume$ = computed(resumes$, (resumes: Resume[]) => {
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

export function updateResumeContent(content: string) {
	const list = resumes$.get();

	// Atualiza o conteúdo APENAS do currículo selecionado
	const updatedList = list.map((r: Resume) => (r.selected ? { ...r, data: content } : r));

	resumes$.set(updatedList);
}

export function createNewResume() {
	const name = prompt("Nome do novo currículo:");
	if (!name) return;

	const newList = resumes$.get().map((r: Resume) => ({ ...r, selected: false })); // Desmarca todos

	const newResume: Resume = {
		id: crypto.randomUUID(),
		name,
		data: defaultCV,
		selected: true, // O novo nasce selecionado
	};

	const finalList = [...newList, newResume];

	resumes$.set(finalList);
}

export function deleteResume(id: string) {
	const list = resumes$.get();
	if (list.length <= 1) {
		alert("Você precisa manter pelo menos um currículo.");
		return;
	}

	if (!confirm("Tem certeza que deseja deletar este currículo?")) return;

	// Se estamos deletando o selecionado, precisamos passar a coroa para outro
	const isDeletingSelected = list.find((r: Resume) => r.id === id)?.selected;

	const newList = list.filter((r: Resume) => r.id !== id);

	if (isDeletingSelected) {
		// Seleciona o primeiro da lista restante
		newList[0] = { ...newList[0], selected: true };
	}

	resumes$.set(newList);
}

export function setActiveResume(id: string) {
	const list = resumes$.get();

	// Percorre a lista: se o ID bater, selected=true, senão selected=false
	const updatedList = list.map((r: Resume) => ({
		...r,
		selected: r.id === id,
	}));

	resumes$.set(updatedList);
}

export function resetActiveResume() {
	if (confirm("Deseja voltar ao modelo padrão? Isso apagará suas alterações atuais neste currículo.")) {
		updateResumeContent(defaultCV);
	}
}

export function printResume() {
	const parsed = parsedContent$.get();
	const nome = parsed?.header?.name?.trim() || "Currículo";
	const role = parsed?.header?.role?.trim() || "";
	const printTitle = role ? `${nome} - ${role}` : nome;

	const previousTitle = document.title;
	document.title = printTitle;
	window.print();
	document.title = previousTitle;
}
