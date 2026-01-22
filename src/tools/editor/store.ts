import { create } from "zustand";

export interface FileNode {
	id: string;
	name: string;
	language: string;
	content: string;
	isFolder: boolean;
	parentId: string | null;
	children?: FileNode[];
}

interface CemeteryState {
	files: FileNode[];
	selectedFile: FileNode | null;
	addingType: { type: "file" | "folder"; parentId: string | null } | null;
	menu: { x: number; y: number; parentId: string | null } | null;

	// Ações
	setSelectedFile: (file: FileNode | null) => void;
	setAddingType: (val: { type: "file" | "folder"; parentId: string | null } | null) => void;
	setMenu: (val: { x: number; y: number; parentId: string | null } | null) => void;

	createNode: (name: string) => void;
	updateFileContent: (id: string, content: string) => void;
	deleteNode: (id: string) => void;
}

export const useCemeteryStore = create<CemeteryState>((set, get) => ({
	files: [],
	selectedFile: null,
	user: null,
	addingType: null,
	menu: null,

	setSelectedFile: (selectedFile) => set({ selectedFile }),
	setAddingType: (addingType) => set({ addingType }),
	setMenu: (menu) => set({ menu }),

	createNode: (name) => {
		const { addingType, files } = get();
		const trimmedName = name.trim();

		if (!trimmedName || !addingType) {
			set({
				addingType: null,
			});
			return;
		}

		// 2. Validação de duplicados (Case-insensitive)
		const fileExists = files.some((f) => f.name.toLowerCase() === trimmedName.toLowerCase());

		if (fileExists) {
			alert("Uma lápide com este nome já existe no cemitério!");
			return;
		}

		// 3. Extração dinâmica de extensão
		// Pega tudo após o último ponto. Se não houver, assume 'plaintext'
		const extension = trimmedName.split(".").pop()?.toLowerCase() || "";

		// Mapeamento simples de extensões para linguagens do Monaco
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

		set({
			files: [...files, newNode],
			addingType: null,
			selectedFile: newNode.isFolder ? get().selectedFile : newNode,
		});
	},

	updateFileContent: (id, content) => {
		const { selectedFile } = get();
		if (!selectedFile) return;

		set((state) => ({
			files: state.files.map((f) => (f.id === id ? { ...f, content } : f)),
		}));
	},

	deleteNode: (id) =>
		set((state) => {
			// Função auxiliar para encontrar todos os IDs descendentes
			const getAllDescendantIds = (parentId: string, allFiles: FileNode[]): string[] => {
				const children = allFiles.filter((f) => f.parentId === parentId);
				const childIds = children.map((c) => c.id);

				// Recursão para pegar os netos, bisnetos, etc.
				const descendantIds = childIds.flatMap((childId) => getAllDescendantIds(childId, allFiles));

				return [...childIds, ...descendantIds];
			};

			const idsToDelete = [id, ...getAllDescendantIds(id, state.files)];

			return {
				files: state.files.filter((f) => !idsToDelete.includes(f.id)),
				// Se o arquivo selecionado estiver na lista de exclusão, desselecione
				selectedFile: state.selectedFile && idsToDelete.includes(state.selectedFile.id) ? null : state.selectedFile,
			};
		}),
}));
