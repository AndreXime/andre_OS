import { cn } from "../../lib/cn";
import { ACME } from "./data";

export function AcmeStatsGrid({ className }: { className?: string }) {
	return (
		<div
			className={cn(
				"grid grid-cols-1 gap-px border border-ct-border bg-ct-border sm:grid-cols-2 lg:grid-cols-4",
				className,
			)}
		>
			{ACME.stats.map((stat) => (
				<div key={stat.label} className="bg-ct-background px-6 py-6">
					<p className="font-ct-heading text-3xl font-bold text-ct-foreground">{stat.value}</p>
					<p className="mt-1 text-sm font-medium text-ct-foreground">{stat.label}</p>
					<p className="mt-0.5 text-xs text-ct-muted-foreground">{stat.detail}</p>
				</div>
			))}
		</div>
	);
}
