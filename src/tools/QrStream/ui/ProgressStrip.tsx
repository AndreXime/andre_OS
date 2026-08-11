import { toolLabelClass } from "@/lib/toolUi";

export interface ProgressStripProps {
	readonly received: number;
	readonly total: number;
	readonly missingCount: number;
}

export function ProgressStrip({ received, total, missingCount }: ProgressStripProps) {
	const ratio = total > 0 ? Math.min(1, received / total) : 0;
	const percent = Math.round(ratio * 100);

	return (
		<div className="flex flex-col gap-2xs">
			<div className="flex items-baseline justify-between gap-sm">
				<span className={toolLabelClass}>Progresso</span>
				<span className="font-mono text-xs text-muted">
					{total > 0 ? `${received}/${total} · ${percent}%` : "aguardando frames"}
				</span>
			</div>
			<div className="h-2 w-full overflow-hidden rounded-input bg-paper-3">
				<div className="h-full bg-accent transition-[width] duration-150 ease-out" style={{ width: `${percent}%` }} />
			</div>
			{total > 0 && missingCount > 0 && (
				<p className="m-0 font-mono text-xs text-muted">
					Faltam {missingCount} frame{missingCount === 1 ? "" : "s"}
				</p>
			)}
		</div>
	);
}
