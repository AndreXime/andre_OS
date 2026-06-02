export const fieldLabelClass =
	"text-[10px] font-medium uppercase tracking-[0.14em] text-[color:var(--text)]/80";

export const inputClass =
	"w-full min-h-10 rounded-lg border border-[color:var(--card-border)] bg-[color:var(--card-bg)] px-3 py-2 text-sm text-[color:var(--headline)] placeholder:text-[color:var(--text)]/70 focus:outline-none focus:ring-2 focus:ring-[color:var(--primary)] focus:border-[color:var(--primary)] transition-shadow";

export const tabBarClass =
	"flex gap-1 p-1 rounded-xl border border-[color:var(--card-border)] bg-[color:var(--card-bg)]";

export function segmentTabClass(active: boolean): string {
	return [
		"flex-1 py-2 text-sm font-semibold rounded-lg transition-all",
		active
			? "bg-[color:var(--primary)] text-[color:var(--primary-text)] shadow-sm"
			: "text-[color:var(--text)] hover:text-[color:var(--headline)] hover:bg-[color-mix(in_srgb,var(--primary)_8%,transparent)]",
	].join(" ");
}
