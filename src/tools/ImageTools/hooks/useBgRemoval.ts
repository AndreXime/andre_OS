import { useCallback, useEffect, useRef } from "react";
import { $progress, $progressLabel, setResult, setError, startProcessing } from "../store";

export function useBgRemoval() {
	const workerRef = useRef<Worker | null>(null);

	useEffect(() => {
		return () => {
			workerRef.current?.terminate();
		};
	}, []);

	const getWorker = useCallback(() => {
		if (!workerRef.current) {
			const w = new Worker(new URL("../workers/bg-removal.worker.ts", import.meta.url), { type: "module" });
			w.onmessage = (e: MessageEvent) => {
				const { type, payload } = e.data;
				switch (type) {
					case "PROGRESS": {
						const { key, pct } = payload as { key: string; pct: number };
						$progress.set(pct);
						$progressLabel.set(formatProgressKey(key));
						break;
					}
					case "RESULT":
						setResult(payload as Blob);
						break;
					case "ERROR":
						setError(payload as string);
						break;
				}
			};
			workerRef.current = w;
		}
		return workerRef.current;
	}, []);

	const removeBackground = useCallback(
		(file: File) => {
			startProcessing("Carregando modelo de IA...");
			const worker = getWorker();
			worker.postMessage({ type: "EXEC", payload: { imageBlob: file } });
		},
		[getWorker],
	);

	return { removeBackground };
}

function formatProgressKey(key: string): string {
	if (key.includes("fetch")) return "Baixando modelo...";
	if (key.includes("compute") || key.includes("inference")) return "Processando imagem...";
	if (key.includes("mask")) return "Gerando mascara...";
	return "Processando...";
}
