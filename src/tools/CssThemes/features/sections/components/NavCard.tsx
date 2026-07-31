import { cn } from "../../../lib/cn";

interface NavCardProps {
	title: string;
	description?: string;
	meta?: string;
	selected?: boolean;
	onClick: () => void;
}

export function NavCard({ title, description, meta, selected = false, onClick }: NavCardProps) {
	return (
		<button
			type="button"
			onClick={onClick}
			className={cn(
				"flex min-w-0 cursor-pointer flex-col items-start gap-2 rounded-ct-lg border bg-ct-background p-4 text-left",
				"transition-all duration-150 hover:-translate-y-0.5 hover:border-ct-primary/40 hover:shadow-md active:translate-y-0",
				selected ? "border-ct-primary shadow-[0_0_0_1px_var(--ct-color-primary)]" : "border-ct-border",
			)}
		>
			{meta && <span className="text-[0.65rem] font-semibold uppercase tracking-wider text-ct-primary">{meta}</span>}
			<strong className="text-sm leading-snug text-ct-foreground">{title}</strong>
			{description && <small className="text-xs leading-relaxed text-ct-muted-foreground">{description}</small>}
		</button>
	);
}
