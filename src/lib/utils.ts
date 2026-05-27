export const formatDate = (date: Date) =>
	new Intl.DateTimeFormat("pt-BR", {
		day: "2-digit",
		month: "short",
		year: "numeric",
	}).format(date);

export const getThemeClasses = (toolType: string) => {
	switch (toolType) {
		case "tool":
			return {
				borderClass: "border-[var(--color-border)]",
				bgClass: "bg-[color-mix(in_oklch,var(--color-accent-bg)_55%,transparent_45%)]",
				badgeClass: "ui-pill",
				markerClass: "text-[var(--color-accent)]",
			};
		case "note":
			return {
				borderClass: "border-[var(--color-border)]",
				bgClass: "bg-[color-mix(in_oklch,var(--color-surface-2)_85%,transparent_15%)]",
				badgeClass: "ui-pill",
				markerClass: "text-[color-mix(in_oklch,var(--color-accent)_55%,var(--color-muted)_45%)]",
			};
		case "link":
			return {
				borderClass: "border-[var(--color-border)]",
				bgClass: "bg-[color-mix(in_oklch,var(--color-surface-2)_85%,transparent_15%)]",
				badgeClass: "ui-pill",
				markerClass: "text-[color-mix(in_oklch,var(--color-accent)_45%,var(--color-muted)_55%)]",
			};

		default:
			return {
				borderClass: "border-[var(--color-border)]",
				bgClass: "bg-[color-mix(in_oklch,var(--color-surface-1)_85%,transparent_15%)]",
				badgeClass: "ui-pill",
				markerClass: "text-[var(--color-dim)]",
			};
	}
};
