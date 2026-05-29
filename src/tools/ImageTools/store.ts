import { atom, computed } from "nanostores";
import { persistentAtom } from "@nanostores/persistent";
import { loadImageFromFile, releaseLoadedImage } from "./imageLoader";
import {
	type OperationType,
	type OutputFormat,
	type ImageDimensions,
	type ModelPreloadStatus,
	validateImageFile,
	validateDimensions,
	isOutputFormat,
	isCompressMaxWidth,
	clampQuality,
} from "./domain";

export const $sourceFile = atom<File | null>(null);
export const $sourceUrl = atom<string | null>(null);
export const $sourceDimensions = atom<ImageDimensions | null>(null);
export const $sourceHasAlpha = atom(false);
export const $sourceLoading = atom(false);

export const $resultBlob = atom<Blob | null>(null);
export const $resultUrl = atom<string | null>(null);

export const $activeOperation = atom<OperationType | null>(null);
export const $processing = atom(false);
export const $progress = atom(0);
export const $progressLabel = atom("");
export const $error = atom<string | null>(null);

export const $outputFormat = persistentAtom<OutputFormat>("image_tools_format_v1", "png", {
	encode: String,
	decode: (value) => (isOutputFormat(value) ? value : "png"),
});

export const $quality = persistentAtom<number>("image_tools_quality_v1", 80, {
	encode: String,
	decode: (value) => clampQuality(Number(value)),
});

export const $compressMaxWidth = persistentAtom<number>("image_tools_max_width_v1", 0, {
	encode: String,
	decode: (value) => {
		const parsed = Number(value);
		return isCompressMaxWidth(parsed) ? parsed : 0;
	},
});

export const $supportedFormats = atom<Record<OutputFormat, boolean> | null>(null);

export const $modelPreloadStatus = atom<ModelPreloadStatus>("idle");
export const $modelPreloadProgress = atom(0);

export const $hasSource = computed($sourceFile, (f) => f !== null);
export const $hasResult = computed($resultBlob, (b) => b !== null);

let currentAbortController: AbortController | null = null;
let currentOperationId = 0;

export function beginOperation(label: string): { signal: AbortSignal; id: number } {
	cancelProcessing();

	currentAbortController = new AbortController();
	currentOperationId += 1;
	const id = currentOperationId;

	$processing.set(true);
	$progress.set(0);
	$progressLabel.set(label);
	$error.set(null);
	clearResult();

	return { signal: currentAbortController.signal, id };
}

export function cancelProcessing(): void {
	currentAbortController?.abort();
	currentAbortController = null;

	if ($processing.get()) {
		$processing.set(false);
		$progress.set(0);
		$progressLabel.set("");
	}
}

export function isOperationCurrent(id: number): boolean {
	return id === currentOperationId && currentAbortController !== null && !currentAbortController.signal.aborted;
}

export function setProgress(pct: number, label: string): void {
	$progress.set(pct);
	$progressLabel.set(label);
}

export function finishOperation(id: number): void {
	if (id === currentOperationId) {
		currentAbortController = null;
	}
}

function applyLoadedSource(file: File, loaded: Awaited<ReturnType<typeof loadImageFromFile>>): void {
	cancelProcessing();

	const prevSrcUrl = $sourceUrl.get();
	if (prevSrcUrl) URL.revokeObjectURL(prevSrcUrl);

	clearResult();
	$activeOperation.set(null);
	$error.set(null);

	const url = URL.createObjectURL(file);
	$sourceFile.set(file);
	$sourceUrl.set(url);
	$sourceDimensions.set({ width: loaded.width, height: loaded.height });
	$sourceHasAlpha.set(loaded.hasAlpha);
	releaseLoadedImage(loaded);
}

export async function setSource(file: File): Promise<void> {
	const fileError = validateImageFile(file);
	if (fileError) {
		$error.set(fileError);
		return;
	}

	$sourceLoading.set(true);
	$error.set(null);

	try {
		const loaded = await loadImageFromFile(file);
		const dimError = validateDimensions(loaded.width, loaded.height);
		if (dimError) {
			releaseLoadedImage(loaded);
			$error.set(dimError);
			return;
		}

		applyLoadedSource(file, loaded);
	} catch (err) {
		if ((err as Error).name !== "AbortError") {
			$error.set((err as Error).message || "Falha ao carregar imagem");
		}
	} finally {
		$sourceLoading.set(false);
	}
}

export async function setSourceFromBlob(blob: Blob, filename: string): Promise<void> {
	const file = new File([blob], filename, { type: blob.type || "image/png" });
	await setSource(file);
}

export function setResult(blob: Blob, operationId: number): void {
	if (!isOperationCurrent(operationId)) return;

	const prevUrl = $resultUrl.get();
	if (prevUrl) URL.revokeObjectURL(prevUrl);

	$resultBlob.set(blob);
	$resultUrl.set(URL.createObjectURL(blob));
	$processing.set(false);
	$progress.set(100);
	$progressLabel.set("");
	currentAbortController = null;
}

export function clearResult(): void {
	const prevUrl = $resultUrl.get();
	if (prevUrl) URL.revokeObjectURL(prevUrl);
	$resultBlob.set(null);
	$resultUrl.set(null);
	$progress.set(0);
	$progressLabel.set("");
}

export function clearAll(): void {
	cancelProcessing();

	const prevSrcUrl = $sourceUrl.get();
	if (prevSrcUrl) URL.revokeObjectURL(prevSrcUrl);

	clearResult();
	$sourceFile.set(null);
	$sourceUrl.set(null);
	$sourceDimensions.set(null);
	$sourceHasAlpha.set(false);
	$activeOperation.set(null);
	$error.set(null);
}

export function setError(msg: string, operationId?: number): void {
	if (operationId !== undefined && !isOperationCurrent(operationId)) return;

	$processing.set(false);
	$progress.set(0);
	$progressLabel.set("");
	$error.set(msg);
	currentAbortController = null;
}

export function isAbortError(err: unknown): boolean {
	return err instanceof DOMException && err.name === "AbortError";
}
