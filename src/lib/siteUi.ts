export const navLinkClass =
	"inline-flex min-h-11 items-center px-2xs font-mono text-sm text-muted no-underline transition-colors duration-150 ease-out hover:text-ink";

export const navLinkActiveClass = "rounded-input border border-accent-muted bg-accent-bg px-sm font-medium text-accent";

export const navLinkRssClass = "font-medium text-accent";

export const kindBadgeClass = {
	note: "inline-block rounded-sm bg-accent-bg px-1.5 py-0.5 font-mono text-xs tracking-label text-accent uppercase",
	tool: "inline-block rounded-sm bg-accent px-1.5 py-0.5 font-mono text-xs tracking-label text-accent-ink uppercase",
	link: "inline-block rounded-sm border border-accent-muted bg-transparent px-1.5 py-0.5 font-mono text-xs tracking-label text-accent uppercase",
} as const;

export const accentRailClass = "max-w-measure min-w-0 border-l-[3px] border-accent pl-md [overflow-wrap:anywhere]";
