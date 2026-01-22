import { map } from "nanostores";

// 1. Definição das Interfaces
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

// 2. Criação da Store (map)
// A convenção do Nanostores é usar o prefixo '$' para stores
export const $cemetery = map<CemeteryState>({
	files: [],
	selectedFile: null,
	addingType: null,
	menu: null,
});

// 3. Ações (Funções independentes)

export const setSelectedFile = (file: FileNode | null) => {
	$cemetery.setKey("selectedFile", file);
};

export const setAddingType = (val: { type: "file" | "folder"; parentId: string | null } | null) => {
	$cemetery.setKey("addingType", val);
};

export const setMenu = (val: { x: number; y: number; parentId: string | null } | null) => {
	$cemetery.setKey("menu", val);
};

export const createNode = (name: string) => {
	// .get() recupera o estado atual de forma síncrona (semelhante ao get() do Zustand)
	const { addingType, files, selectedFile } = $cemetery.get();
	const trimmedName = name.trim();

	if (!trimmedName || !addingType) {
		$cemetery.setKey("addingType", null);
		return;
	}

	// Validação de duplicados
	const fileExists = files.some((f) => f.name.toLowerCase() === trimmedName.toLowerCase());

	if (fileExists) {
		alert("Uma lápide com este nome já existe no cemitério!");
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
	$cemetery.set({
		...$cemetery.get(),
		files: [...files, newNode],
		addingType: null,
		selectedFile: newNode.isFolder ? selectedFile : newNode,
	});
};

export const updateFileContent = (id: string, content: string) => {
	const { files, selectedFile } = $cemetery.get();

	// Safety check simples
	if (!selectedFile) return;

	$cemetery.setKey(
		"files",
		files.map((f) => (f.id === id ? { ...f, content } : f)),
	);
};

export const deleteNode = (id: string) => {
	const currentState = $cemetery.get();
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

	$cemetery.set({
		...currentState,
		files: newFiles,
		selectedFile: newSelectedFile,
	});
};
