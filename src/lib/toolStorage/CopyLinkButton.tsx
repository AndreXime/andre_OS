import { Check, Link2 } from "lucide-react";
import { useState } from "react";
import { toolBtnGhostClass } from "@/lib/toolUi";
import { generateStateUrl, StateUrlTooLargeError } from "./stateUrl";
import type { ToolStorageEntry } from "./types";

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
			className={className ?? toolBtnGhostClass}
		>
			{status === "copied" ? <Check className="size-3.5" /> : <Link2 className="size-3.5" />}
			{copyLinkLabel(status)}
		</button>
	);
}
