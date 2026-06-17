import { useCallback, useEffect, useRef } from "react";
import {
	beginOperation,
	cancelProcessing,
	isOperationCurrent,
	setError,
	setProgress,
	setResult,
	$modelPreloadStatus,
	$modelPreloadProgress,
} from "../store";
import { bgRemovalConfig } from "../bgRemovalConfig";

export function useBgRemoval(shouldPreload = false) {
	const preloadAbortRef = useRef<AbortController | null>(null);
	const operationIdRef = useRef(0);

	const startPreload = useCallback(async (signal: AbortSignal) => {
		if ($modelPreloadStatus.get() === "ready") return;

		$modelPreloadStatus.set("loading");
		$modelPreloadProgress.set(0);

		try {
			const { preload } = await import("@imgly/background-removal");

			await preload({
				...bgRemovalConfig,
				progress: (_key, current, total) => {
					if (signal.aborted) return;
					const pct = total > 0 ? Math.round((current / total) * 100) : 0;
					$modelPreloadProgress.set(pct);
				},
			});

			if (signal.aborted) {
				$modelPreloadStatus.set("idle");
				return;
			}

			$modelPreloadStatus.set("ready");
			$modelPreloadProgress.set(100);
		} catch {
			if (signal.aborted) {
				$modelPreloadStatus.set("idle");
				return;
			}
			$modelPreloadStatus.set("error");
			$modelPreloadProgress.set(0);
		}
	}, []);

	useEffect(() => {
		if (!shouldPreload) return;

		preloadAbortRef.current?.abort();
		const controller = new AbortController();
		preloadAbortRef.current = controller;

		void startPreload(controller.signal);

		return () => {
			controller.abort();
		};
	}, [shouldPreload, startPreload]);

	const retryPreload = useCallback(() => {
		preloadAbortRef.current?.abort();
		const controller = new AbortController();
		preloadAbortRef.current = controller;
		void startPreload(controller.signal);
	}, [startPreload]);

	const removeBackground = useCallback((file: File) => {
		const modelReady = $modelPreloadStatus.get() === "ready";
		const { id } = beginOperation(modelReady ? "Processando imagem..." : "Carregando modelo de IA...");
		operationIdRef.current = id;

		void (async () => {
			try {
				const { removeBackground: imglyRemoveBackground } = await import("@imgly/background-removal");

				const blob = await imglyRemoveBackground(file, {
					...bgRemovalConfig,
					progress: (key, current, total) => {
						if (!isOperationCurrent(operationIdRef.current)) return;
						const pct = total > 0 ? Math.round((current / total) * 100) : 0;
						setProgress(pct, formatProgressKey(key));
					},
				});

				if (!isOperationCurrent(operationIdRef.current)) return;
				setResult(blob, operationIdRef.current);
			} catch (err) {
				if (!isOperationCurrent(operationIdRef.current)) return;
				const message =
					err instanceof Error && err.message
						? err.message
						: "Falha ao remover fundo da imagem.";
				setError(message, operationIdRef.current);
			}
		})();
	}, []);

	return { removeBackground, cancelBgRemoval: cancelProcessing, retryPreload };
}

function formatProgressKey(key: string): string {
	if (key.includes("fetch")) return "Baixando modelo...";
	if (key.includes("compute") || key.includes("inference")) return "Processando imagem...";
	if (key.includes("mask")) return "Gerando mascara...";
	return "Processando...";
}
