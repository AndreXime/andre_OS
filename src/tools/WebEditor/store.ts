import { map } from "nanostores";

export interface FileNode {
	id: string;
	name: string;
	language: string;
	content: string;
	isFolder: boolean;
	parentId: string | null;
	children?: FileNode[];
}

export interface CemeteryState {
	files: FileNode[];
	selectedFile: FileNode | null;
	addingType: { type: "file" | "folder"; parentId: string | null } | null;
	menu: { x: number; y: number; parentId: string | null } | null;
}

const STORAGE_KEY = "webeditor:files";

const loadInitialFiles = (): FileNode[] => {
	if (typeof window === "undefined") return [];

	const saved = localStorage.getItem(STORAGE_KEY);
	if (saved) {
		try {
			return JSON.parse(saved);
		} catch (e) {
			console.error("Erro ao carregar arquivos do localStorage", e);
			return [];
		}
	}
	return [];
};

export const $editor = map<CemeteryState>({
	files: loadInitialFiles(),
	selectedFile: null,
	addingType: null,
	menu: null,
});

// Armazenamos a referência anterior para evitar escritas desnecessárias
// quando apenas o 'menu' ou 'selectedFile' mudar.
let previousFiles = $editor.get().files;

$editor.subscribe((state) => {
	if (state.files !== previousFiles) {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(state.files));
		previousFiles = state.files;
	}
});

export const setSelectedFile = (file: FileNode | null) => {
	$editor.setKey("selectedFile", file);
};

export const setAddingType = (val: { type: "file" | "folder"; parentId: string | null } | null) => {
	$editor.setKey("addingType", val);
};

export const setMenu = (val: { x: number; y: number; parentId: string | null } | null) => {
	$editor.setKey("menu", val);
};

export const createNode = (name: string) => {
	const { addingType, files, selectedFile } = $editor.get();
	const trimmedName = name.trim();

	if (!trimmedName || !addingType) {
		$editor.setKey("addingType", null);
		return;
	}

	// Validação de duplicados
	const fileExists = files.some((f) => f.name.toLowerCase() === trimmedName.toLowerCase());

	if (fileExists) {
		alert("Já existe um arquivo com este nome");
		return;
	}

	// Extração dinâmica de extensão
	const extension = trimmedName.split(".").pop()?.toLowerCase() || "";

	const languageMap: Record<string, string> = {
		go: "go",
		ts: "typescript",
		tsx: "typescript",
		js: "javascript",
		jsx: "javascript",
		py: "python",
		json: "json",
		md: "markdown",
		css: "css",
		html: "html",
	};

	const newNode: FileNode = {
		id: Date.now().toString(),
		name,
		isFolder: addingType.type === "folder",
		language: addingType.type === "folder" ? "" : languageMap[extension] || "plaintext",
		parentId: addingType.parentId,
		content: addingType.type === "folder" ? "" : "// O codigo vai aqui\n",
	};

	// Atualiza múltiplos valores do estado
	$editor.set({
		...$editor.get(),
		files: [...files, newNode],
		addingType: null,
		selectedFile: newNode.isFolder ? selectedFile : newNode,
	});
};

export const updateFileContent = (id: string, content: string) => {
	const { files, selectedFile } = $editor.get();

	if (!selectedFile) return;

	$editor.setKey(
		"files",
		files.map((f) => (f.id === id ? { ...f, content } : f)),
	);
};

export const deleteNode = (id: string) => {
	const currentState = $editor.get();
	const { files, selectedFile } = currentState;

	// Função auxiliar para encontrar descendentes
	const getAllDescendantIds = (parentId: string, allFiles: FileNode[]): string[] => {
		const children = allFiles.filter((f) => f.parentId === parentId);
		const childIds = children.map((c) => c.id);
		const descendantIds = childIds.flatMap((childId) => getAllDescendantIds(childId, allFiles));
		return [...childIds, ...descendantIds];
	};

	const idsToDelete = [id, ...getAllDescendantIds(id, files)];

	// Filtra os arquivos
	const newFiles = files.filter((f) => !idsToDelete.includes(f.id));

	// Verifica se o arquivo selecionado foi deletado
	const newSelectedFile = selectedFile && idsToDelete.includes(selectedFile.id) ? null : selectedFile;

	$editor.set({
		...currentState,
		files: newFiles,
		selectedFile: newSelectedFile,
	});
};
