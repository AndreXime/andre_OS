import { useState } from "react";
import { Check, Link2 } from "lucide-react";
import { generateStateUrl, StateUrlTooLargeError } from "./stateUrl";
import type { ToolStorageEntry } from "./types";

const actionButtonClass =
	"inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium border border-[color:var(--card-border)] text-[color:var(--text)] hover:text-[color:var(--headline)] hover:border-[color:var(--primary)]/40 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--primary)]";

type CopyStatus = "idle" | "loading" | "copied" | "tooLarge" | "error";

function copyLinkLabel(status: CopyStatus): string {
	switch (status) {
		case "loading":
			return "Gerando...";
		case "copied":
			return "Copiado!";
		case "tooLarge":
			return "Grande demais";
		case "error":
			return "Erro";
		default:
			return "Copiar link";
	}
}

export function CopyLinkButton({ storage, className }: { storage: ToolStorageEntry; className?: string }) {
	const [status, setStatus] = useState<CopyStatus>("idle");
	const [statusHint, setStatusHint] = useState<string | undefined>(undefined);

	const handleCopy = async () => {
		setStatus("loading");
		setStatusHint(undefined);
		try {
			const url = await generateStateUrl(storage);
			if (!navigator.clipboard?.writeText) {
				throw new Error("Clipboard API indisponivel");
			}
			await navigator.clipboard.writeText(url);
			setStatus("copied");
			window.setTimeout(() => setStatus("idle"), 2000);
		} catch (err) {
			if (err instanceof StateUrlTooLargeError) {
				setStatus("tooLarge");
				setStatusHint(err.message);
				window.setTimeout(() => {
					setStatus("idle");
					setStatusHint(undefined);
				}, 3000);
				return;
			}
			setStatus("error");
			window.setTimeout(() => setStatus("idle"), 2000);
		}
	};

	return (
		<button
			type="button"
			onClick={() => void handleCopy()}
			disabled={status === "loading"}
			title={statusHint ?? "Copiar link com o estado atual"}
			className={className ?? actionButtonClass}
		>
			{status === "copied" ? <Check className="size-3.5" /> : <Link2 className="size-3.5" />}
			{copyLinkLabel(status)}
		</button>
	);
}
