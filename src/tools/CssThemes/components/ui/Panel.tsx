import { cn } from "../../lib/cn";

interface PanelProps {
	title: string;
	description?: string;
	action?: React.ReactNode;
	children: React.ReactNode;
	className?: string;
}

export function Panel({ title, description, action, children, className }: PanelProps) {
	return (
		<section className={cn("mb-4 rounded-ct-md border border-ct-border bg-ct-background p-5", className)}>
			<div
				className={cn("mb-4 flex flex-col gap-3", action ? "sm:flex-row sm:items-start sm:justify-between" : undefined)}
			>
				<div>
					<h2 className="font-ct-heading text-lg font-semibold">{title}</h2>
					{description && <p className="mt-1 text-sm text-ct-muted-foreground">{description}</p>}
				</div>
				{action}
			</div>
			{children}
		</section>
	);
}
