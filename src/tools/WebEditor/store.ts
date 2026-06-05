import { createJsonPersistentAtom } from "@/lib/toolStorage/persistentAtom";
import type { ToolStorageEntry } from "@/lib/toolStorage/types";
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

const WEB_EDITOR_FILES_KEY = "webeditor:files";

function normalizeFiles(raw: unknown): FileNode[] {
	if (!Array.isArray(raw)) return [];
	return raw as FileNode[];
}

export const webEditorFiles$ = createJsonPersistentAtom<FileNode[]>({
	storageKey: WEB_EDITOR_FILES_KEY,
	defaultValue: [],
	normalize: normalizeFiles,
});

export const webEditorStorage: ToolStorageEntry = {
	toolId: "web_editor",
	keys: [WEB_EDITOR_FILES_KEY],
	atoms: { [WEB_EDITOR_FILES_KEY]: webEditorFiles$ },
};

export const $editor = map<CemeteryState>({
	files: webEditorFiles$.get(),
	selectedFile: null,
	addingType: null,
	menu: null,
});

webEditorFiles$.subscribe((files) => {
	$editor.setKey("files", [...files]);
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

	const fileExists = files.some((f) => f.name.toLowerCase() === trimmedName.toLowerCase());

	if (fileExists) {
		alert("Já existe um arquivo com este nome");
		return;
	}

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

	const nextFiles = [...files, newNode];
	webEditorFiles$.set(nextFiles);
	$editor.set({
		...$editor.get(),
		addingType: null,
		selectedFile: newNode.isFolder ? selectedFile : newNode,
	});
};

export const updateFileContent = (id: string, content: string) => {
	const { files, selectedFile } = $editor.get();

	if (!selectedFile) return;

	webEditorFiles$.set(files.map((f) => (f.id === id ? { ...f, content } : f)));
};

export const deleteNode = (id: string) => {
	const currentState = $editor.get();
	const { files, selectedFile } = currentState;

	const getAllDescendantIds = (parentId: string, allFiles: FileNode[]): string[] => {
		const children = allFiles.filter((f) => f.parentId === parentId);
		const childIds = children.map((c) => c.id);
		const descendantIds = childIds.flatMap((childId) => getAllDescendantIds(childId, allFiles));
		return [...childIds, ...descendantIds];
	};

	const idsToDelete = [id, ...getAllDescendantIds(id, files)];
	const newFiles = files.filter((f) => !idsToDelete.includes(f.id));
	const newSelectedFile = selectedFile && idsToDelete.includes(selectedFile.id) ? null : selectedFile;

	webEditorFiles$.set(newFiles);
	$editor.set({
		...currentState,
		selectedFile: newSelectedFile,
	});
};
