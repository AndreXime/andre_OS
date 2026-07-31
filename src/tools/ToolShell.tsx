import type { ReactNode } from "react";
import { CopyLinkButton } from "@/lib/toolStorage/CopyLinkButton";
import type { ToolStorageEntry } from "@/lib/toolStorage/types";
import { useImportStateFromUrl } from "@/lib/toolStorage/useImportStateFromUrl";

export interface ToolShellProps {
	title: string;
	description?: string;
	icon?: ReactNode;
	storage?: ToolStorageEntry;
	actions?: ReactNode;
	children: ReactNode;
}

function HeaderActions({ storage, actions }: { storage?: ToolStorageEntry; actions?: ReactNode }) {
	if (!storage && !actions) return null;

	return (
		<div className="flex shrink-0 flex-wrap items-center gap-2xs">
			{storage && <CopyLinkButton storage={storage} />}
			{actions}
		</div>
	);
}

export function ToolShell({ title, description, icon, storage, actions, children }: ToolShellProps) {
	useImportStateFromUrl(storage);

	return (
		<div className="relative flex min-h-full w-full flex-col">
			<header className="container-page w-full border-b border-b-rule pb-md pt-lg">
				<div className="flex w-full flex-col gap-sm lg:flex-row lg:items-start lg:justify-between">
					<div className="flex min-w-0 flex-1 items-start gap-sm border-l-[3px] border-accent pl-md">
						{icon && (
							<div className="shrink-0 rounded-card border border-accent-muted bg-accent-bg p-2.5 text-accent">
								{icon}
							</div>
						)}
						<div className="flex min-w-0 flex-1 flex-col gap-2xs">
							<h1 className="m-0 font-display text-display-s font-semibold leading-snug tracking-display text-ink">
								{title}
							</h1>
							{description && <p className="m-0 leading-normal text-muted">{description}</p>}
						</div>
					</div>
					<HeaderActions {...(storage ? { storage } : {})} {...(actions ? { actions } : {})} />
				</div>
			</header>
			<main className="container-page flex flex-1 flex-col gap-md pb-3xl pt-md">{children}</main>
		</div>
	);
}
