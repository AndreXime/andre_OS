import type { ReactNode } from "react";
import { CopyLinkButton } from "@/lib/toolStorage/CopyLinkButton";
import { useImportStateFromUrl } from "@/lib/toolStorage/useImportStateFromUrl";
import type { ToolStorageEntry } from "@/lib/toolStorage/types";

export interface ToolShellProps {
	title: string;
	description?: string;
	icon?: ReactNode;
	storage?: ToolStorageEntry;
	actions?: ReactNode;
	children: ReactNode;
	variant?: "default" | "compact";
}

function HeaderActions({ storage, actions }: { storage?: ToolStorageEntry; actions?: ReactNode }) {
	if (!storage && !actions) return null;

	return (
		<div className="flex flex-wrap items-center gap-2 shrink-0">
			{storage && <CopyLinkButton storage={storage} />}
			{actions}
		</div>
	);
}

export function ToolShell({
	title,
	description,
	icon,
	storage,
	actions,
	children,
	variant = "default",
}: ToolShellProps) {
	useImportStateFromUrl(storage);

	if (variant === "compact") {
		return (
			<div className="flex flex-1 flex-col min-h-0 w-full min-w-0">
				<header className="shrink-0 border-b border-[color:var(--card-border)] px-4 py-3 md:px-6 flex items-center gap-3 w-full">
					{icon && (
						<div className="shrink-0 rounded-lg border border-[color:var(--card-border)] bg-[color:var(--card-bg)] p-2 text-[color:var(--primary)]">
							{icon}
						</div>
					)}
					<div className="min-w-0 flex flex-col gap-0.5 flex-1">
						<h1 className="text-base font-bold text-[color:var(--headline)] tracking-tight">{title}</h1>
						{description && <p className="text-xs text-[color:var(--text)] truncate hidden sm:block">{description}</p>}
					</div>
					<HeaderActions {...(storage ? { storage } : {})} {...(actions ? { actions } : {})} />
				</header>
				<main className="flex flex-1 min-h-0 min-w-0 flex-col">{children}</main>
			</div>
		);
	}

	return (
		<div className="relative w-full min-h-full flex flex-col">
			<header className="os-chrome-inner pt-6 pb-3 md:pt-8 md:pb-4">
				<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
					<div className="flex items-start gap-3 min-w-0">
						{icon && (
							<div className="shrink-0 rounded-xl border border-[color:var(--card-border)] bg-[color:var(--card-bg)] p-2.5 text-[color:var(--primary)] shadow-inner shadow-black/20">
								{icon}
							</div>
						)}
						<div className="flex flex-col gap-2 max-w-3xl min-w-0">
							<h1 className="text-3xl sm:text-4xl font-bold text-[color:var(--headline)] tracking-tight">{title}</h1>
							{description && (
								<p className="text-sm sm:text-[15px] text-[color:var(--text)] leading-relaxed">{description}</p>
							)}
						</div>
					</div>
					<HeaderActions {...(storage ? { storage } : {})} {...(actions ? { actions } : {})} />
				</div>
			</header>
			<main className="os-chrome-inner pb-12 flex flex-col gap-4 flex-1">{children}</main>
		</div>
	);
}
