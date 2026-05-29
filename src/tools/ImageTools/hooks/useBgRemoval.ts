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
import { WORKER_IDLE_MS } from "../domain";
import { bgRemovalConfig } from "../bgRemovalConfig";

type WorkerMessage =
	| { type: "PROGRESS"; payload: { key: string; pct: number } }
	| { type: "RESULT"; payload: Blob }
	| { type: "ERROR"; payload: string };

export function useBgRemoval() {
	const workerRef = useRef<Worker | null>(null);
	const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const operationIdRef = useRef(0);
	const preloadAbortRef = useRef<AbortController | null>(null);

	const clearIdleTimer = useCallback(() => {
		if (idleTimerRef.current) {
			clearTimeout(idleTimerRef.current);
			idleTimerRef.current = null;
		}
	}, []);

	const scheduleWorkerIdle = useCallback(() => {
		clearIdleTimer();
		idleTimerRef.current = setTimeout(() => {
			workerRef.current?.terminate();
			workerRef.current = null;
		}, WORKER_IDLE_MS);
	}, [clearIdleTimer]);

	const getWorker = useCallback(() => {
		clearIdleTimer();

		if (!workerRef.current) {
			const w = new Worker(new URL("../workers/bg-removal.worker.ts", import.meta.url), {
				type: "module",
			});

			w.onerror = () => {
				if (isOperationCurrent(operationIdRef.current)) {
					setError("Falha no worker de remocao de fundo.", operationIdRef.current);
				}
				scheduleWorkerIdle();
			};

			w.onmessageerror = () => {
				if (isOperationCurrent(operationIdRef.current)) {
					setError("Resposta invalida do worker de remocao de fundo.", operationIdRef.current);
				}
				scheduleWorkerIdle();
			};

			w.onmessage = (e: MessageEvent<WorkerMessage>) => {
				const { type, payload } = e.data;
				const opId = operationIdRef.current;

				switch (type) {
					case "PROGRESS": {
						if (!isOperationCurrent(opId)) return;
						const { key, pct } = payload;
						setProgress(pct, formatProgressKey(key));
						break;
					}
					case "RESULT": {
						if (!isOperationCurrent(opId)) return;
						setResult(payload, opId);
						scheduleWorkerIdle();
						break;
					}
					case "ERROR": {
						if (!isOperationCurrent(opId)) return;
						setError(payload, opId);
						scheduleWorkerIdle();
						break;
					}
				}
			};

			workerRef.current = w;
		}

		return workerRef.current;
	}, [clearIdleTimer, scheduleWorkerIdle]);

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
		preloadAbortRef.current?.abort();
		const controller = new AbortController();
		preloadAbortRef.current = controller;

		void startPreload(controller.signal);

		return () => {
			controller.abort();
			clearIdleTimer();
			workerRef.current?.terminate();
			workerRef.current = null;
		};
	}, [startPreload, clearIdleTimer]);

	const cancel = useCallback(() => {
		workerRef.current?.postMessage({ type: "ABORT" });
		cancelProcessing();
		scheduleWorkerIdle();
	}, [scheduleWorkerIdle]);

	const retryPreload = useCallback(() => {
		preloadAbortRef.current?.abort();
		const controller = new AbortController();
		preloadAbortRef.current = controller;
		void startPreload(controller.signal);
	}, [startPreload]);

	const removeBackground = useCallback(
		(file: File) => {
			const modelReady = $modelPreloadStatus.get() === "ready";
			const { id } = beginOperation(modelReady ? "Processando imagem..." : "Carregando modelo de IA...");
			operationIdRef.current = id;

			const worker = getWorker();
			worker.postMessage({ type: "EXEC", payload: { imageBlob: file } });
		},
		[getWorker],
	);

	return { removeBackground, cancelBgRemoval: cancel, retryPreload };
}

function formatProgressKey(key: string): string {
	if (key.includes("fetch")) return "Baixando modelo...";
	if (key.includes("compute") || key.includes("inference")) return "Processando imagem...";
	if (key.includes("mask")) return "Gerando mascara...";
	return "Processando...";
}
