import { persistentAtom } from "@nanostores/persistent";
import { canSaveBlockFields } from "./plannerDomain";

export const WEEK_DAY_ORDER = [
	"mon",
	"tue",
	"wed",
	"thu",
	"fri",
	"sat",
	"sun",
] as const;

export type WeekDayId = (typeof WEEK_DAY_ORDER)[number];

export const WEEK_DAY_LABEL: Record<WeekDayId, string> = {
	mon: "Segunda",
	tue: "Terça",
	wed: "Quarta",
	thu: "Quinta",
	fri: "Sexta",
	sat: "Sábado",
	sun: "Domingo",
};

export interface WeekTimeBlock {
	readonly id: string;
	readonly start: string;
	readonly end: string;
	readonly title: string;
	/** Rascunho: editável. Depois de guardar, fica fixo (só apagar). */
	readonly saved: boolean;
	/** O mesmo `groupId` = um único “bloco lógico” espelhado nesse id em todos os dias. */
	readonly groupId: string | null;
}

export type WeekPlan = Record<WeekDayId, readonly WeekTimeBlock[]>;

function emptyPlan(): WeekPlan {
	return {
		mon: [],
		tue: [],
		wed: [],
		thu: [],
		fri: [],
		sat: [],
		sun: [],
	};
}

function normalizePlan(raw: unknown): WeekPlan {
	const base = emptyPlan();
	if (!raw || typeof raw !== "object" || Array.isArray(raw)) return base;

	for (const key of WEEK_DAY_ORDER) {
		const v = (raw as Record<string, unknown>)[key];
		if (!Array.isArray(v)) continue;
		const blocks: WeekTimeBlock[] = [];
		for (const item of v) {
			if (!item || typeof item !== "object") continue;
			const o = item as Record<string, unknown>;
			if (typeof o.id !== "string") continue;
			const start = typeof o.start === "string" ? o.start : "";
			const end = typeof o.end === "string" ? o.end : "";
			const hasSavedKey = "saved" in o;
			blocks.push({
				id: o.id,
				start,
				end,
				title: typeof o.title === "string" ? o.title : "",
				saved: hasSavedKey ? o.saved === true : true,
				groupId: typeof o.groupId === "string" ? o.groupId : null,
			});
		}
		(base as Record<WeekDayId, WeekTimeBlock[]>)[key] = blocks;
	}
	return base;
}

const defaultPlan = emptyPlan();

export const weekPlan$ = persistentAtom<WeekPlan>("week_planner_v1", defaultPlan, {
	encode: JSON.stringify,
	decode(value: string | null) {
		if (!value) return defaultPlan;
		try {
			return normalizePlan(JSON.parse(value) as unknown);
		} catch {
			return defaultPlan;
		}
	},
});

function replaceDay(plan: WeekPlan, day: WeekDayId, blocks: readonly WeekTimeBlock[]): WeekPlan {
	return { ...plan, [day]: [...blocks] as WeekTimeBlock[] };
}

function newBlockInGroup(groupId: string | null): WeekTimeBlock {
	const id = globalThis.crypto?.randomUUID?.() ?? `b-${Date.now()}-${Math.random().toString(16).slice(2)}`;
	return {
		id,
		start: "",
		end: "",
		title: "",
		saved: false,
		groupId,
	};
}

/** Cria o mesmo rascunho lógico no fim de **cada** dia: uma edição, guardar ou apagar aplica a todos. */
export function addWeekBlockToAllDays(): void {
	const plan = weekPlan$.get();
	const groupId = globalThis.crypto?.randomUUID?.() ?? `g-${Date.now()}`;
	let next: WeekPlan = plan;
	for (const d of WEEK_DAY_ORDER) {
		const block = newBlockInGroup(groupId);
		next = { ...next, [d]: [...next[d], block] } as WeekPlan;
	}
	weekPlan$.set(next);
}

export function updateWeekBlock(day: WeekDayId, id: string, patch: Partial<Pick<WeekTimeBlock, "start" | "end" | "title">>): void {
	const plan = weekPlan$.get();
	const block = plan[day].find((b) => b.id === id);
	if (!block || block.saved) return;
	if (block.groupId) {
		const g = block.groupId;
		let next: WeekPlan = plan;
		for (const d of WEEK_DAY_ORDER) {
			next = {
				...next,
				[d]: next[d].map((b) => (b.groupId === g && !b.saved ? { ...b, ...patch } : b)),
			} as WeekPlan;
		}
		weekPlan$.set(next);
		return;
	}
	const list = plan[day].map((b) => (b.id === id && !b.saved ? { ...b, ...patch } : b));
	weekPlan$.set(replaceDay(plan, day, list));
}

export function saveWeekBlock(day: WeekDayId, id: string): void {
	const plan = weekPlan$.get();
	const block = plan[day].find((b) => b.id === id);
	if (!block || block.saved) return;
	if (!canSaveBlockFields(block.start, block.end, block.title)) return;
	if (block.groupId) {
		const g = block.groupId;
		let next: WeekPlan = plan;
		for (const d of WEEK_DAY_ORDER) {
			next = {
				...next,
				[d]: next[d].map((b) => (b.groupId === g ? { ...b, saved: true } : b)),
			} as WeekPlan;
		}
		weekPlan$.set(next);
		return;
	}
	const list = plan[day].map((b) => (b.id === id ? { ...b, saved: true } : b));
	weekPlan$.set(replaceDay(plan, day, list));
}

export function removeWeekBlock(day: WeekDayId, id: string): void {
	const plan = weekPlan$.get();
	const block = plan[day].find((b) => b.id === id);
	if (!block) return;
	if (block.groupId) {
		const g = block.groupId;
		let next: WeekPlan = plan;
		for (const d of WEEK_DAY_ORDER) {
			next = { ...next, [d]: next[d].filter((b) => b.groupId !== g) } as WeekPlan;
		}
		weekPlan$.set(next);
		return;
	}
	const list = plan[day].filter((b) => b.id !== id);
	weekPlan$.set(replaceDay(plan, day, list));
}

function canMoveGroupInAllDays(plan: WeekPlan, groupId: string, direction: -1 | 1): boolean {
	for (const d of WEEK_DAY_ORDER) {
		const L = plan[d];
		const i = L.findIndex((b) => b.groupId === groupId);
		if (i === -1) return false;
		const j = i + direction;
		if (j < 0 || j >= L.length) return false;
	}
	return true;
}

export function moveWeekBlock(day: WeekDayId, blockId: string, direction: -1 | 1): void {
	const plan = weekPlan$.get();
	const list = plan[day];
	const block = list.find((b) => b.id === blockId);
	if (!block) return;
	if (block.groupId) {
		const g = block.groupId;
		if (!canMoveGroupInAllDays(plan, g, direction)) return;
		let next: WeekPlan = plan;
		for (const d of WEEK_DAY_ORDER) {
			const L = [...next[d]];
			const i = L.findIndex((b) => b.groupId === g);
			const j = i + direction;
			[L[i], L[j]] = [L[j], L[i]];
			next = replaceDay(next, d, L);
		}
		weekPlan$.set(next);
		return;
	}
	const local = [...list];
	const i = local.findIndex((b) => b.id === blockId);
	if (i === -1) return;
	const j = i + direction;
	if (j < 0 || j >= local.length) return;
	[local[i], local[j]] = [local[j], local[i]];
	weekPlan$.set(replaceDay(plan, day, local));
}
