import { createJsonPersistentAtom } from "@/lib/toolStorage/persistentAtom";
import type { ToolStorageEntry } from "@/lib/toolStorage/types";

export interface Recipe {
	readonly id: string;
	readonly title: string;
	readonly body: string;
	readonly photoDataUrl?: string;
	readonly createdAt: number;
	readonly updatedAt: number;
}

export interface CookingBookState {
	readonly recipes: readonly Recipe[];
}

const COOKING_BOOK_STORAGE_KEY = "cooking_book_v1";
const defaultState: CookingBookState = { recipes: [] };

function newId(): string {
	return globalThis.crypto?.randomUUID?.() ?? `recipe-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function normalizeRecipe(raw: unknown): Recipe | null {
	if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
	const r = raw as Record<string, unknown>;
	if (typeof r.id !== "string" || r.id === "") return null;
	const title = typeof r.title === "string" ? r.title : "";
	const body = typeof r.body === "string" ? r.body : "";
	if (body.trim() === "" && title.trim() === "") return null;
	const createdAt = typeof r.createdAt === "number" && Number.isFinite(r.createdAt) ? r.createdAt : Date.now();
	const updatedAt = typeof r.updatedAt === "number" && Number.isFinite(r.updatedAt) ? r.updatedAt : createdAt;
	const photo =
		typeof r.photoDataUrl === "string" && r.photoDataUrl.startsWith("data:image/") ? r.photoDataUrl : undefined;
	const base = { id: r.id, title, body, createdAt, updatedAt };
	return photo ? { ...base, photoDataUrl: photo } : base;
}

function normalizeState(raw: unknown): CookingBookState {
	if (!raw || typeof raw !== "object" || Array.isArray(raw)) return defaultState;
	const o = raw as Record<string, unknown>;
	if (!Array.isArray(o.recipes)) return defaultState;
	const recipes: Recipe[] = [];
	for (const item of o.recipes) {
		const recipe = normalizeRecipe(item);
		if (recipe) recipes.push(recipe);
	}
	recipes.sort((a, b) => b.updatedAt - a.updatedAt);
	return { recipes };
}

export const cookingBook$ = createJsonPersistentAtom<CookingBookState>({
	storageKey: COOKING_BOOK_STORAGE_KEY,
	defaultValue: defaultState,
	normalize: normalizeState,
});

export const cookingBookStorage: ToolStorageEntry = {
	toolId: "cooking_book",
	keys: [COOKING_BOOK_STORAGE_KEY],
	atoms: { [COOKING_BOOK_STORAGE_KEY]: cookingBook$ },
};

export function displayTitle(recipe: Recipe): string {
	const t = recipe.title.trim();
	if (t !== "") return t;
	const firstLine = recipe.body.split("\n").find((line) => line.trim() !== "")?.trim();
	if (firstLine) return firstLine.length > 80 ? `${firstLine.slice(0, 80)}…` : firstLine;
	return "Sem título";
}

export function saveRecipe(input: {
	readonly id?: string;
	readonly title: string;
	readonly body: string;
	readonly photoDataUrl?: string | undefined;
}): string {
	const body = input.body;
	if (body.trim() === "" && input.title.trim() === "") return "";

	const now = Date.now();
	const state = cookingBook$.get();

	if (input.id) {
		const existing = state.recipes.find((r) => r.id === input.id);
		if (!existing) return "";
		const nextRecipe: Recipe = {
			id: input.id,
			title: input.title,
			body,
			createdAt: existing.createdAt,
			updatedAt: now,
			...(input.photoDataUrl ? { photoDataUrl: input.photoDataUrl } : {}),
		};
		const recipes = [nextRecipe, ...state.recipes.filter((r) => r.id !== input.id)].sort((a, b) => b.updatedAt - a.updatedAt);
		cookingBook$.set({ recipes });
		return input.id;
	}

	const id = newId();
	const nextRecipe: Recipe = {
		id,
		title: input.title,
		body,
		createdAt: now,
		updatedAt: now,
		...(input.photoDataUrl ? { photoDataUrl: input.photoDataUrl } : {}),
	};
	cookingBook$.set({ recipes: [nextRecipe, ...state.recipes] });
	return id;
}

export function removeRecipe(id: string): void {
	const state = cookingBook$.get();
	const next = state.recipes.filter((r) => r.id !== id);
	if (next.length === state.recipes.length) return;
	cookingBook$.set({ recipes: next });
}

export function clearAllRecipes(): void {
	cookingBook$.set(defaultState);
}

export function duplicateRecipe(id: string): string {
	const state = cookingBook$.get();
	const source = state.recipes.find((r) => r.id === id);
	if (!source) return "";

	const now = Date.now();
	const copyTitle = source.title.trim() === "" ? "" : `${source.title.trim()} (cópia)`;
	const next: Recipe = {
		id: newId(),
		title: copyTitle,
		body: source.body,
		createdAt: now,
		updatedAt: now,
		...(source.photoDataUrl ? { photoDataUrl: source.photoDataUrl } : {}),
	};
	cookingBook$.set({ recipes: [next, ...state.recipes] });
	return next.id;
}
