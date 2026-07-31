import { useCallback } from "react";
import type { OutputFormat } from "../domain";
import { mapPool } from "../lib/batchRunner";
import { compressFile, convertFile } from "../lib/processImage";
import {
	$batchProgress,
	$selectedIds,
	beginBatch,
	beginItemOperation,
	bumpBatchProgress,
	finishBatch,
	finishItemOperation,
	getItem,
	isAbortError,
	isBatchCurrent,
	isItemOperationCurrent,
	setItemError,
	setItemResult,
} from "../store";

const CONVERT_COMPRESS_CONCURRENCY = 3;

export function useImageProcessor() {
	const convert = useCallback(async (itemId: string, format: OutputFormat, quality: number) => {
		const item = getItem(itemId);
		if (!item) return;

		const started = beginItemOperation(itemId, "Convertendo imagem...");
		if (!started) return;
		const { signal, batchId } = started;

		try {
			$batchProgress.set({ current: 0, total: 1, label: "Convertendo imagem..." });
			const blob = await convertFile(item.file, format, quality, signal);
			if (!isItemOperationCurrent(itemId, batchId)) return;
			setItemResult(itemId, blob, "convert", batchId);
		} catch (err) {
			if (isAbortError(err)) {
				finishItemOperation(itemId);
				return;
			}
			setItemError(itemId, (err as Error).message || "Falha ao converter imagem", batchId);
		} finally {
			finishItemOperation(itemId);
		}
	}, []);

	const compress = useCallback(async (itemId: string, quality: number, maxWidth: number) => {
		const item = getItem(itemId);
		if (!item) return;

		const started = beginItemOperation(itemId, "Comprimindo imagem...");
		if (!started) return;
		const { signal, batchId } = started;

		try {
			$batchProgress.set({ current: 0, total: 1, label: "Comprimindo imagem..." });
			const blob = await compressFile(item.file, quality, maxWidth, signal);
			if (!isItemOperationCurrent(itemId, batchId)) return;
			setItemResult(itemId, blob, "compress", batchId);
		} catch (err) {
			if (isAbortError(err)) {
				finishItemOperation(itemId);
				return;
			}
			setItemError(itemId, (err as Error).message || "Falha ao comprimir imagem", batchId);
		} finally {
			finishItemOperation(itemId);
		}
	}, []);

	const runBatchOnSelected = useCallback(
		async (
			operation: "convert" | "compress",
			options: { format: OutputFormat; quality: number; maxWidth: number },
		) => {
			const selected = $selectedIds.get();
			const ids = selected.filter((id) => {
				const item = getItem(id);
				return item && item.status !== "loading";
			});
			if (ids.length === 0) return;

			const label = operation === "convert" ? "Convertendo lote..." : "Comprimindo lote...";
			const batchId = beginBatch(ids.length, label);

			await mapPool(
				ids,
				CONVERT_COMPRESS_CONCURRENCY,
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
					const { signal } = started;

					try {
						const blob =
							operation === "convert"
								? await convertFile(item.file, options.format, options.quality, signal)
								: await compressFile(item.file, options.quality, options.maxWidth, signal);

						if (!isItemOperationCurrent(itemId, batchId) || !isBatchCurrent(batchId)) return;
						setItemResult(itemId, blob, operation, batchId);
					} catch (err) {
						if (isAbortError(err) || !isBatchCurrent(batchId)) {
							finishItemOperation(itemId);
							return;
						}
						setItemError(
							itemId,
							(err as Error).message ||
								(operation === "convert" ? "Falha ao converter imagem" : "Falha ao comprimir imagem"),
							batchId,
						);
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
		},
		[],
	);

	return { convert, compress, runBatchOnSelected };
}
