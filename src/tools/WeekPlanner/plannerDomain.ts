import { WEEK_DAY_ORDER, type WeekDayId, type WeekPlan } from "./store";

// --- time (início/fim vazios = "sem hora" — basta título, ou uma só ponta) ---

export function hasTime(t: string): boolean {
	return t.trim() !== "";
}

export function toMinutes(t: string): number {
	if (!hasTime(t)) return 0;
	const [h, m] = t.split(":").map(Number);
	if (Number.isNaN(h)) return 0;
	return h * 60 + (m || 0);
}

/** Só rejeita quando início e fim estão ambos preenchidos e fim ≤ início. */
export function isTimeRangeOk(start: string, end: string): boolean {
	if (!hasTime(start) || !hasTime(end)) return true;
	return toMinutes(end) > toMinutes(start);
}

/** @deprecated Nome antigo: usar isTimeRangeOk. */
export function isEndAfterStart(start: string, end: string): boolean {
	return isTimeRangeOk(start, end);
}

export function blockSpanMinutes(start: string, end: string): number {
	if (!hasTime(start) || !hasTime(end)) return 0;
	if (toMinutes(end) <= toMinutes(start)) return 0;
	return toMinutes(end) - toMinutes(start);
}

/** Pode guardar: intervalo coerente se tiver as duas horas; e pelo menos uma de início, fim ou título. */
export function canSaveBlockFields(start: string, end: string, title: string): boolean {
	if (!isTimeRangeOk(start, end)) return false;
	if (!hasTime(start) && !hasTime(end) && title.trim() === "") return false;
	return true;
}

export function formatDuration(mins: number): string {
	if (mins <= 0) return "0 min";
	const h = Math.floor(mins / 60);
	const m = mins % 60;
	if (h === 0) return `${m} min`;
	if (m === 0) return `${h}h`;
	return `${h}h ${m}min`;
}

export function getWeekStats(plan: WeekPlan) {
	const countedGroups = new Set<string>();
	let blocks = 0;
	let minutes = 0;
	for (const d of WEEK_DAY_ORDER) {
		for (const b of plan[d]) {
			if (!b.saved) continue;
			if (b.groupId) {
				if (countedGroups.has(b.groupId)) continue;
				countedGroups.add(b.groupId);
			}
			blocks += 1;
			minutes += blockSpanMinutes(b.start, b.end);
		}
	}
	return { blocks, minutes, hoursLabel: formatDuration(minutes) };
}

// --- day theme (Tailwind) ---

export interface DayTheme {
	readonly border: string;
	readonly topGradient: string;
	readonly bar: string;
	readonly chip: string;
}

export const DAY_THEME: Record<WeekDayId, DayTheme> = {
	mon: {
		border: "border-red-500/25",
		topGradient: "from-red-500/50 via-red-400/18 to-transparent",
		bar: "from-red-400 to-red-600/85",
		chip: "bg-red-950/85 text-red-200/90 border-red-500/20",
	},
	tue: {
		border: "border-yellow-500/25",
		topGradient: "from-yellow-500/45 via-yellow-400/12 to-transparent",
		bar: "from-yellow-400 to-amber-500/80",
		chip: "bg-yellow-950/85 text-yellow-200/90 border-yellow-500/25",
	},
	wed: {
		border: "border-emerald-500/25",
		topGradient: "from-emerald-500/50 via-emerald-400/15 to-transparent",
		bar: "from-emerald-400 to-emerald-600/85",
		chip: "bg-emerald-950/85 text-emerald-200/90 border-emerald-500/20",
	},
	thu: {
		border: "border-cyan-500/25",
		topGradient: "from-cyan-500/50 via-cyan-400/15 to-transparent",
		bar: "from-cyan-400 to-cyan-600/85",
		chip: "bg-cyan-950/85 text-cyan-200/90 border-cyan-500/20",
	},
	fri: {
		border: "border-blue-800/35",
		topGradient: "from-blue-900/55 via-blue-800/20 to-transparent",
		bar: "from-blue-600 to-blue-900/90",
		chip: "bg-blue-950/90 text-blue-200/90 border-blue-700/35",
	},
	sat: {
		border: "border-violet-500/25",
		topGradient: "from-violet-500/50 via-violet-400/15 to-transparent",
		bar: "from-violet-400 to-purple-500/80",
		chip: "bg-violet-950/85 text-violet-200/90 border-violet-500/20",
	},
	sun: {
		border: "border-pink-500/25",
		topGradient: "from-pink-500/50 via-pink-400/15 to-transparent",
		bar: "from-pink-400 to-rose-500/80",
		chip: "bg-pink-950/85 text-pink-200/90 border-pink-500/20",
	},
};
