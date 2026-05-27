import { atom, computed } from "nanostores";
import type { OperationType, OutputFormat, ImageDimensions } from "./domain";

export const $sourceFile = atom<File | null>(null);
export const $sourceUrl = atom<string | null>(null);
export const $sourceDimensions = atom<ImageDimensions | null>(null);

export const $resultBlob = atom<Blob | null>(null);
export const $resultUrl = atom<string | null>(null);

export const $activeOperation = atom<OperationType | null>(null);
export const $processing = atom(false);
export const $progress = atom(0);
export const $progressLabel = atom("");
export const $error = atom<string | null>(null);

export const $outputFormat = atom<OutputFormat>("png");
export const $quality = atom(80);

export const $hasSource = computed($sourceFile, (f) => f !== null);
export const $hasResult = computed($resultBlob, (b) => b !== null);

export function setSource(file: File) {
	clearResult();
	$error.set(null);

	const prevUrl = $sourceUrl.get();
	if (prevUrl) URL.revokeObjectURL(prevUrl);

	$sourceFile.set(file);
	const url = URL.createObjectURL(file);
	$sourceUrl.set(url);

	const img = new Image();
	img.onload = () => {
		$sourceDimensions.set({ width: img.naturalWidth, height: img.naturalHeight });
	};
	img.src = url;
}

export function setResult(blob: Blob) {
	const prevUrl = $resultUrl.get();
	if (prevUrl) URL.revokeObjectURL(prevUrl);
	$resultBlob.set(blob);
	$resultUrl.set(URL.createObjectURL(blob));
	$processing.set(false);
	$progress.set(100);
	$progressLabel.set("");
}

export function clearResult() {
	const prevUrl = $resultUrl.get();
	if (prevUrl) URL.revokeObjectURL(prevUrl);
	$resultBlob.set(null);
	$resultUrl.set(null);
	$progress.set(0);
	$progressLabel.set("");
}

export function clearAll() {
	clearResult();
	const prevSrcUrl = $sourceUrl.get();
	if (prevSrcUrl) URL.revokeObjectURL(prevSrcUrl);
	$sourceFile.set(null);
	$sourceUrl.set(null);
	$sourceDimensions.set(null);
	$activeOperation.set(null);
	$processing.set(false);
	$error.set(null);
}

export function startProcessing(label = "Processando...") {
	$processing.set(true);
	$progress.set(0);
	$progressLabel.set(label);
	$error.set(null);
	clearResult();
}

export function setError(msg: string) {
	$processing.set(false);
	$progress.set(0);
	$progressLabel.set("");
	$error.set(msg);
}
