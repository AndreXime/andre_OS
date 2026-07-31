import { useCallback, useEffect, useRef } from "react";
import { mapPool } from "../lib/batchRunner";
import { bgRemovalConfig } from "../lib/bgRemovalConfig";
import { removeBackgroundFile } from "../lib/processImage";
import {
	$batchProgress,
	$modelPreloadProgress,
	$modelPreloadStatus,
	$selectedIds,
	beginBatch,
	beginItemOperation,
	bumpBatchProgress,
	cancelAll,
	finishBatch,
	finishItemOperation,
	getItem,
	isBatchCurrent,
	isItemOperationCurrent,
	setItemError,
	setItemResult,
} from "../store";

export function useBgRemoval(shouldPreload = false) {
	const preloadAbortRef = useRef<AbortController | null>(null);

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

	const removeBackground = useCallback((itemId: string) => {
		const item = getItem(itemId);
		if (!item) return;

		const modelReady = $modelPreloadStatus.get() === "ready";
		const started = beginItemOperation(
			itemId,
			modelReady ? "Processando imagem..." : "Carregando modelo de IA...",
		);
		if (!started) return;
		const { batchId } = started;

		$batchProgress.set({
			current: 0,
			total: 1,
			label: modelReady ? "Processando imagem..." : "Carregando modelo de IA...",
		});

		void (async () => {
			try {
				const blob = await removeBackgroundFile(item.file, (pct, label) => {
					if (!isItemOperationCurrent(itemId, batchId)) return;
					$batchProgress.set({ current: 0, total: 1, label });
					void pct;
				});

				if (!isItemOperationCurrent(itemId, batchId)) return;
				setItemResult(itemId, blob, "bg-removal", batchId);
			} catch (err) {
				if (!isItemOperationCurrent(itemId, batchId)) return;
				const message =
					err instanceof Error && err.message
						? err.message
						: "Falha ao remover fundo da imagem.";
				setItemError(itemId, message, batchId);
			} finally {
				finishItemOperation(itemId);
			}
		})();
	}, []);

	const runBgRemovalBatchOnSelected = useCallback(async () => {
		const ids = $selectedIds.get().filter((id) => {
			const item = getItem(id);
			return item && item.status !== "loading";
		});
		if (ids.length === 0) return;

		const label = "Removendo fundo (lote)...";
		const batchId = beginBatch(ids.length, label);

		await mapPool(
			ids,
			1,
			async (itemId) => {
				if (!isBatchCurrent(batchId)) return;
				const item = getItem(itemId);
				if (!item) {
					bumpBatchProgress(label);
					return;
				}

				const started = beginItemOperation(itemId, label);
				if (!started || !isBatchCurrent(batchId)) {
					bumpBatchProgress(label);
					return;
				}

				try {
					const blob = await removeBackgroundFile(item.file, (_pct, progressLabel) => {
						if (!isItemOperationCurrent(itemId, batchId) || !isBatchCurrent(batchId)) return;
						const prev = $batchProgress.get();
						$batchProgress.set({ ...prev, label: progressLabel });
					});

					if (!isItemOperationCurrent(itemId, batchId) || !isBatchCurrent(batchId)) return;
					setItemResult(itemId, blob, "bg-removal", batchId);
				} catch (err) {
					if (!isBatchCurrent(batchId)) {
						finishItemOperation(itemId);
						return;
					}
					const message =
						err instanceof Error && err.message
							? err.message
							: "Falha ao remover fundo da imagem.";
					setItemError(itemId, message, batchId);
				} finally {
					finishItemOperation(itemId);
					if (isBatchCurrent(batchId)) {
						bumpBatchProgress(label);
					}
				}
			},
			() => isBatchCurrent(batchId),
		);

		finishBatch(batchId);
	}, []);

	return {
		removeBackground,
		runBgRemovalBatchOnSelected,
		cancelBgRemoval: cancelAll,
		retryPreload,
	};
}
