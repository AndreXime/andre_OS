import { createJsonPersistentAtom } from "@/lib/toolStorage/persistentAtom";
import type { ToolStorageEntry } from "@/lib/toolStorage/types";

export interface Note {
	readonly id: string;
	readonly title: string;
	readonly body: string;
	readonly createdAt: number;
	readonly updatedAt: number;
	readonly pinned: boolean;
}

export interface ScratchPadState {
	readonly notes: readonly Note[];
}

const SCRATCHPAD_STORAGE_KEY = "scratchpad:notes_v1";
const LEGACY_WEB_EDITOR_KEY = "webeditor:files";
const defaultState: ScratchPadState = { notes: [] };

interface LegacyFileNode {
	id: string;
	name: string;
	content: string;
	isFolder: boolean;
	parentId: string | null;
}

function newId(): string {
	return globalThis.crypto?.randomUUID?.() ?? `note-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function normalizeNote(raw: unknown): Note | null {
	if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
	const n = raw as Record<string, unknown>;
	if (typeof n.id !== "string" || n.id === "") return null;
	const title = typeof n.title === "string" ? n.title : "";
	const body = typeof n.body === "string" ? n.body : "";
	if (body.trim() === "" && title.trim() === "") return null;
	const createdAt = typeof n.createdAt === "number" && Number.isFinite(n.createdAt) ? n.createdAt : Date.now();
	const updatedAt = typeof n.updatedAt === "number" && Number.isFinite(n.updatedAt) ? n.updatedAt : createdAt;
	const pinned = n.pinned === true;
	return { id: n.id, title, body, createdAt, updatedAt, pinned };
}

function sortNotes(notes: Note[]): Note[] {
	return [...notes].sort((a, b) => {
		if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
		return b.updatedAt - a.updatedAt;
	});
}

function migrateLegacyFiles(raw: unknown): Note[] {
	if (!Array.isArray(raw)) return [];
	const notes: Note[] = [];
	for (const item of raw) {
		if (!item || typeof item !== "object" || Array.isArray(item)) continue;
		const file = item as LegacyFileNode;
		if (file.isFolder || typeof file.id !== "string") continue;
		const body = typeof file.content === "string" ? file.content : "";
		const title = typeof file.name === "string" ? file.name.replace(/\.[^.]+$/, "") : "";
		if (body.trim() === "" && title.trim() === "") continue;
		const now = Date.now();
		notes.push({
			id: file.id,
			title,
			body,
			createdAt: now,
			updatedAt: now,
			pinned: false,
		});
	}
	return sortNotes(notes);
}

function readLegacyNotes(): Note[] {
	if (typeof localStorage === "undefined") return [];
	const raw = localStorage.getItem(LEGACY_WEB_EDITOR_KEY);
	if (!raw) return [];
	try {
		const notes = migrateLegacyFiles(JSON.parse(raw) as unknown);
		if (notes.length > 0) localStorage.removeItem(LEGACY_WEB_EDITOR_KEY);
		return notes;
	} catch {
		return [];
	}
}

function normalizeState(raw: unknown): ScratchPadState {
	if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
		const legacy = readLegacyNotes();
		return legacy.length > 0 ? { notes: legacy } : defaultState;
	}
	const o = raw as Record<string, unknown>;
	if (!Array.isArray(o.notes)) {
		const legacy = readLegacyNotes();
		return legacy.length > 0 ? { notes: legacy } : defaultState;
	}
	const notes: Note[] = [];
	for (const item of o.notes) {
		const note = normalizeNote(item);
		if (note) notes.push(note);
	}
	if (notes.length === 0) {
		const legacy = readLegacyNotes();
		if (legacy.length > 0) return { notes: legacy };
	}
	return { notes: sortNotes(notes) };
}

export const scratchPad$ = createJsonPersistentAtom<ScratchPadState>({
	storageKey: SCRATCHPAD_STORAGE_KEY,
	defaultValue: defaultState,
	normalize: normalizeState,
});

export const scratchPadStorage: ToolStorageEntry = {
	toolId: "scratch_pad",
	keys: [SCRATCHPAD_STORAGE_KEY],
	atoms: { [SCRATCHPAD_STORAGE_KEY]: scratchPad$ },
};

export function displayTitle(note: Note): string {
	const t = note.title.trim();
	if (t !== "") return t;
	const firstLine = note.body
		.split("\n")
		.find((line) => line.trim() !== "")
		?.trim();
	if (firstLine) return firstLine.length > 80 ? `${firstLine.slice(0, 80)}…` : firstLine;
	return "Sem título";
}

export function createNote(): string {
	const now = Date.now();
	const note: Note = {
		id: newId(),
		title: "",
		body: "",
		createdAt: now,
		updatedAt: now,
		pinned: false,
	};
	const state = scratchPad$.get();
	scratchPad$.set({ notes: sortNotes([note, ...state.notes]) });
	return note.id;
}

export function updateNote(id: string, patch: Partial<Pick<Note, "title" | "body" | "pinned">>): void {
	const state = scratchPad$.get();
	const existing = state.notes.find((n) => n.id === id);
	if (!existing) return;

	const title = patch.title ?? existing.title;
	const body = patch.body ?? existing.body;
	if (title.trim() === "" && body.trim() === "") return;

	const nextNote: Note = {
		...existing,
		title,
		body,
		pinned: patch.pinned ?? existing.pinned,
		updatedAt: Date.now(),
	};
	const notes = sortNotes([nextNote, ...state.notes.filter((n) => n.id !== id)]);
	scratchPad$.set({ notes });
}

export function removeNote(id: string): void {
	const state = scratchPad$.get();
	scratchPad$.set({ notes: state.notes.filter((n) => n.id !== id) });
}

export function togglePin(id: string): void {
	const state = scratchPad$.get();
	const existing = state.notes.find((n) => n.id === id);
	if (!existing) return;
	updateNote(id, { pinned: !existing.pinned });
}
