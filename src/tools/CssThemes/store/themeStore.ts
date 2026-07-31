import { createJsonPersistentAtom } from "@/lib/toolStorage/persistentAtom";
import type { ToolStorageEntry } from "@/lib/toolStorage/types";
import { applyCssVariables, clearCssVariables, tokensToCssVariables } from "../tokens/css-variables";
import { getPresetById } from "../tokens/presets";
import { resolvePresetTokens } from "../tokens/resolve";
import type { ColorTokens, DesignTokens } from "../tokens/types";
import { DEFAULT_TOKENS } from "../tokens/types";

export interface CssThemesState {
	readonly activePresetId: string;
	readonly presetOverrides: Readonly<Record<string, DesignTokens>>;
}

const STORAGE_KEY = "css_themes:state_v1";
const LEGACY_KEY = "plastik-theme";

const defaultState: CssThemesState = {
	activePresetId: "default",
	presetOverrides: {},
};

function isDesignTokens(value: unknown): value is DesignTokens {
	if (!value || typeof value !== "object") return false;
	const t = value as Record<string, unknown>;
	return (
		typeof t.colors === "object" &&
		t.colors !== null &&
		typeof t.typography === "object" &&
		t.typography !== null &&
		typeof t.spacing === "object" &&
		t.spacing !== null
	);
}

function normalizeOverrides(raw: unknown): Record<string, DesignTokens> {
	if (!raw || typeof raw !== "object") return {};
	const out: Record<string, DesignTokens> = {};
	for (const [id, tokens] of Object.entries(raw as Record<string, unknown>)) {
		if (isDesignTokens(tokens)) out[id] = tokens;
	}
	return out;
}

function normalizeState(raw: unknown): CssThemesState {
	if (!raw || typeof raw !== "object") return defaultState;
	const s = raw as Record<string, unknown>;
	const activePresetId =
		typeof s.activePresetId === "string" && s.activePresetId !== "custom" ? s.activePresetId : "default";
	const presetOverrides = normalizeOverrides(s.presetOverrides);

	if (s.activePresetId === "custom" && isDesignTokens(s.customTokens)) {
		presetOverrides.default = s.customTokens;
	}

	const preset = getPresetById(activePresetId);
	return {
		activePresetId: preset ? activePresetId : "default",
		presetOverrides,
	};
}

function migrateLegacyIntoStorage(): void {
	if (typeof localStorage === "undefined") return;
	if (localStorage.getItem(STORAGE_KEY)) return;
	const legacyRaw = localStorage.getItem(LEGACY_KEY);
	if (!legacyRaw) return;
	try {
		const parsed = JSON.parse(legacyRaw) as unknown;
		const state =
			parsed && typeof parsed === "object" && "state" in parsed && (parsed as { state: unknown }).state
				? (parsed as { state: unknown }).state
				: parsed;
		localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizeState(state)));
	} catch {
		/* ignore legacy corrupt */
	}
}

migrateLegacyIntoStorage();

export const cssThemes$ = createJsonPersistentAtom<CssThemesState>({
	storageKey: STORAGE_KEY,
	defaultValue: defaultState,
	normalize: normalizeState,
});

export const cssThemesStorage: ToolStorageEntry = {
	toolId: "css_themes",
	keys: [STORAGE_KEY],
	atoms: { [STORAGE_KEY]: cssThemes$ },
};

function getBaseTokens(presetId: string): DesignTokens {
	return getPresetById(presetId)?.tokens ?? DEFAULT_TOKENS;
}

export function getTokens(state: CssThemesState = cssThemes$.get()): DesignTokens {
	return resolvePresetTokens(state.activePresetId, state.presetOverrides);
}

export function getPresetTokens(presetId: string, state: CssThemesState = cssThemes$.get()): DesignTokens {
	return resolvePresetTokens(presetId, state.presetOverrides);
}

export function setPreset(presetId: string): void {
	const preset = getPresetById(presetId);
	if (!preset) return;
	cssThemes$.set({
		...cssThemes$.get(),
		activePresetId: presetId,
	});
}

export function updateColor(key: keyof ColorTokens, value: string): void {
	const state = cssThemes$.get();
	const current = resolvePresetTokens(state.activePresetId, state.presetOverrides);
	const next: DesignTokens = {
		...current,
		colors: { ...current.colors, [key]: value },
	};
	cssThemes$.set({
		...state,
		presetOverrides: {
			...state.presetOverrides,
			[state.activePresetId]: next,
		},
	});
}

export function resetTokens(): void {
	const state = cssThemes$.get();
	const { [state.activePresetId]: _removed, ...rest } = state.presetOverrides;
	cssThemes$.set({
		...state,
		presetOverrides: rest,
	});
}

export function syncThemeToRoot(root: HTMLElement = document.documentElement): void {
	applyCssVariables(tokensToCssVariables(getTokens()), root);
}

export function clearThemeFromRoot(root: HTMLElement = document.documentElement): void {
	clearCssVariables(tokensToCssVariables(getTokens()), root);
}

export { getBaseTokens };
