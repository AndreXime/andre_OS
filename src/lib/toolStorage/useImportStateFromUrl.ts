import { useEffect } from "react";
import { clearUrlHash, hasStateInUrl, importStateFromUrl } from "./stateUrl";
import type { ToolStorageEntry } from "./types";

export function useImportStateFromUrl(storage: ToolStorageEntry | undefined): void {
	useEffect(() => {
		if (!storage || !hasStateInUrl()) return;

		let cancelled = false;

		importStateFromUrl(storage)
			.then(() => {
				if (cancelled) return;
				clearUrlHash();
				window.alert("Estado importado do link com sucesso.");
			})
			.catch((err: unknown) => {
				if (cancelled) return;
				clearUrlHash();
				const message = err instanceof Error ? err.message : "Nao foi possivel importar o link.";
				window.alert(message);
			});

		return () => {
			cancelled = true;
		};
	}, [storage]);
}
