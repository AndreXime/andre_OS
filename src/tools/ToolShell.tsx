import type { ReactNode } from "react";

export interface ToolShellProps {
	readonly title: string;
	readonly description?: string;
	readonly icon?: ReactNode;
	readonly actions?: ReactNode;
	readonly children: ReactNode;
	readonly variant?: "default" | "compact";
}

export function ToolShell({ title, description, icon, actions, children, variant = "default" }: ToolShellProps) {
	if (variant === "compact") {
		return (
			<div className="flex flex-col min-h-dvh w-full bg-[color:var(--background)]">
				<header className="shrink-0 border-b border-[color:var(--card-border)] px-4 py-3 md:px-6 flex items-center gap-3">
					{icon && (
						<div className="shrink-0 rounded-lg border border-[color:var(--card-border)] bg-[color:var(--card-bg)] p-2 text-[color:var(--primary)]">
							{icon}
						</div>
					)}
					<div className="min-w-0 flex flex-col gap-0.5 flex-1">
						<h1 className="text-base font-bold text-[color:var(--headline)] tracking-tight">{title}</h1>
						{description && <p className="text-xs text-[color:var(--text)] truncate hidden sm:block">{description}</p>}
					</div>
					{actions && <div className="flex flex-wrap items-center gap-2 shrink-0">{actions}</div>}
				</header>
				<main className="flex flex-1 min-h-0 flex-col">{children}</main>
			</div>
		);
	}

	return (
		<div className="relative w-full min-h-dvh mx-auto flex flex-col bg-[color:var(--background)]">
			<header className="container mx-auto w-full max-w-6xl px-4 pt-6 pb-3 md:px-8 md:pt-8 md:pb-4">
				<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
					<div className="flex items-start gap-3 min-w-0">
						{icon && (
							<div className="shrink-0 rounded-xl border border-[color:var(--card-border)] bg-[color:var(--card-bg)] p-2.5 text-[color:var(--primary)] shadow-inner shadow-black/20">
								{icon}
							</div>
						)}
						<div className="flex flex-col gap-2 max-w-2xl min-w-0">
							<h1 className="text-3xl sm:text-4xl font-bold text-[color:var(--headline)] tracking-tight">{title}</h1>
							{description && (
								<p className="text-sm sm:text-[15px] text-[color:var(--text)] leading-relaxed">{description}</p>
							)}
						</div>
					</div>
					{actions && <div className="flex flex-wrap items-center gap-2 shrink-0">{actions}</div>}
				</div>
			</header>
			<main className="container mx-auto w-full max-w-6xl px-4 pb-12 md:px-8 flex flex-col gap-4 flex-1">
				{children}
			</main>
		</div>
	);
}
