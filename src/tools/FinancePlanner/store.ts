import { createJsonPersistentAtom } from "@/lib/toolStorage/persistentAtom";
import type { ToolStorageEntry } from "@/lib/toolStorage/types";
import { normalizeName, type SubscriptionItem } from "./domain";

export interface FinancePlannerState {
	readonly items: readonly SubscriptionItem[];
}

const FINANCE_PLANNER_STORAGE_KEY = "finance_planner_v1";
const defaultState: FinancePlannerState = { items: [] };

function normalizeState(raw: unknown): FinancePlannerState {
	if (!raw || typeof raw !== "object" || Array.isArray(raw)) return defaultState;
	const o = raw as Record<string, unknown>;
	const itemsRaw = o.items;
	if (!Array.isArray(itemsRaw)) return defaultState;

	const items: SubscriptionItem[] = [];
	for (const it of itemsRaw) {
		if (!it || typeof it !== "object" || Array.isArray(it)) continue;
		const r = it as Record<string, unknown>;
		if (typeof r.id !== "string") continue;
		const name = typeof r.name === "string" ? normalizeName(r.name) : "";
		const monthlyCents = typeof r.monthlyCents === "number" ? Math.round(r.monthlyCents) : NaN;
		if (!Number.isFinite(monthlyCents) || monthlyCents < 0) continue;
		if (name === "") continue;
		items.push({ id: r.id, name, monthlyCents });
	}
	return { items };
}

export const financePlanner$ = createJsonPersistentAtom<FinancePlannerState>({
	storageKey: FINANCE_PLANNER_STORAGE_KEY,
	defaultValue: defaultState,
	normalize: normalizeState,
});

export const financePlannerStorage: ToolStorageEntry = {
	toolId: "finance_planner",
	keys: [FINANCE_PLANNER_STORAGE_KEY],
	atoms: { [FINANCE_PLANNER_STORAGE_KEY]: financePlanner$ },
};

function newId(prefix: string): string {
	return globalThis.crypto?.randomUUID?.() ?? `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function addSubscriptionItem(name: string, monthlyCents: number): void {
	const normalizedName = normalizeName(name);
	if (normalizedName === "") return;
	if (!Number.isFinite(monthlyCents) || monthlyCents < 0) return;

	const state = financePlanner$.get();
	const next: FinancePlannerState = {
		items: [{ id: newId("sub"), name: normalizedName, monthlyCents: Math.round(monthlyCents) }, ...state.items],
	};
	financePlanner$.set(next);
}

export function removeSubscriptionItem(id: string): void {
	const state = financePlanner$.get();
	const next = state.items.filter((it) => it.id !== id);
	if (next.length === state.items.length) return;
	financePlanner$.set({ items: next });
}

export function clearAllSubscriptionItems(): void {
	financePlanner$.set(defaultState);
}

