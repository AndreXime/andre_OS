import { atom, computed } from "nanostores";
import {
	type ImageItem,
	type ModelPreloadStatus,
	type OperationType,
	type OutputFormat,
	createImageItemId,
	validateDimensions,
	validateImageFile,
} from "./domain";
import { loadImageFromFile, releaseLoadedImage } from "./lib/imageLoader";

export const $items = atom<ImageItem[]>([]);
export const $activeItemId = atom<string | null>(null);
export const $selectedIds = atom<string[]>([]);

export const $activeOperation = atom<OperationType | null>(null);
export const $outputFormat = atom<OutputFormat>("png");
export const $quality = atom(80);
export const $compressMaxWidth = atom(0);
export const $supportedFormats = atom<Record<OutputFormat, boolean> | null>(null);
export const $modelPreloadStatus = atom<ModelPreloadStatus>("idle");
export const $modelPreloadProgress = atom(0);
export const $error = atom<string | null>(null);

export interface BatchProgress {
	current: number;
	total: number;
	label: string;
}

export const $batchRunning = atom(false);
export const $batchProgress = atom<BatchProgress>({ current: 0, total: 0, label: "" });

export const $activeItem = computed([$items, $activeItemId], (items, id) =>
	id ? (items.find((i) => i.id === id) ?? null) : null,
);

export const $hasItems = computed($items, (items) => items.length > 0);

let batchGeneration = 0;
const itemAbortControllers = new Map<string, AbortController>();

export function getItem(id: string): ImageItem | undefined {
	return $items.get().find((i) => i.id === id);
}

export function patchItem(id: string, patch: Partial<ImageItem>): void {
	$items.set($items.get().map((item) => (item.id === id ? { ...item, ...patch } : item)));
}

function revokeItemUrls(item: ImageItem): void {
	if (item.sourceUrl) URL.revokeObjectURL(item.sourceUrl);
	if (item.resultUrl) URL.revokeObjectURL(item.resultUrl);
}

export function abortItem(id: string): void {
	const controller = itemAbortControllers.get(id);
	if (controller) {
		controller.abort();
		itemAbortControllers.delete(id);
	}
}

export function beginItemOperation(
	id: string,
	label: string,
): { signal: AbortSignal; batchId: number } | null {
	const item = getItem(id);
	if (!item) return null;

	abortItem(id);
	const controller = new AbortController();
	itemAbortControllers.set(id, controller);

	const prevUrl = item.resultUrl;
	if (prevUrl) URL.revokeObjectURL(prevUrl);

	patchItem(id, {
		status: "processing",
		error: null,
		resultBlob: null,
		resultUrl: null,
	});

	if (!$batchRunning.get()) {
		$batchProgress.set({ current: 0, total: 1, label });
	}

	return { signal: controller.signal, batchId: batchGeneration };
}

export function isItemOperationCurrent(id: string, batchId: number): boolean {
	return (
		batchId === batchGeneration &&
		itemAbortControllers.has(id) &&
		!(itemAbortControllers.get(id)?.signal.aborted ?? true)
	);
}

export function finishItemOperation(id: string): void {
	itemAbortControllers.delete(id);
}

export function setItemResult(
	id: string,
	blob: Blob,
	operation: OperationType,
	batchId: number,
): void {
	if (!isItemOperationCurrent(id, batchId)) return;
	const url = URL.createObjectURL(blob);
	patchItem(id, {
		status: "done",
		resultBlob: blob,
		resultUrl: url,
		lastOperation: operation,
		error: null,
	});
	finishItemOperation(id);
}

export function setItemError(id: string, message: string, batchId: number): void {
	if (!isItemOperationCurrent(id, batchId)) return;
	patchItem(id, {
		status: "error",
		error: message,
		resultBlob: null,
		resultUrl: null,
	});
	finishItemOperation(id);
}

export function beginBatch(total: number, label: string): number {
	batchGeneration += 1;
	$batchRunning.set(true);
	$batchProgress.set({ current: 0, total, label });
	$error.set(null);
	return batchGeneration;
}

export function bumpBatchProgress(label: string): void {
	const prev = $batchProgress.get();
	$batchProgress.set({
		current: Math.min(prev.current + 1, prev.total),
		total: prev.total,
		label,
	});
}

export function finishBatch(batchId: number): void {
	if (batchId !== batchGeneration) return;
	$batchRunning.set(false);
	$batchProgress.set({ current: 0, total: 0, label: "" });
}

export function isBatchCurrent(batchId: number): boolean {
	return batchId === batchGeneration;
}

export function cancelAll(): void {
	batchGeneration += 1;
	for (const id of [...itemAbortControllers.keys()]) {
		const item = getItem(id);
		abortItem(id);
		if (item?.status === "processing") {
			patchItem(id, {
				status: "ready",
				error: null,
			});
		}
	}
	$batchRunning.set(false);
	$batchProgress.set({ current: 0, total: 0, label: "" });
}

export function setActiveItem(id: string | null): void {
	$activeItemId.set(id);
}

/** Modo sozinho: foca o item e deixa so ele selecionado (checkbox marcado). */
export function selectSolo(id: string): void {
	if (!getItem(id)) return;
	$activeItemId.set(id);
	$selectedIds.set([id]);
}

function ensureAtLeastOneSelected(): void {
	const items = $items.get();
	if (items.length === 0) {
		$selectedIds.set([]);
		return;
	}

	const valid = $selectedIds.get().filter((id) => items.some((item) => item.id === id));
	if (valid.length > 0) {
		if (valid.length !== $selectedIds.get().length) {
			$selectedIds.set(valid);
		}
		return;
	}

	const activeId = $activeItemId.get();
	const fallback =
		activeId && items.some((item) => item.id === activeId) ? activeId : (items[0]?.id ?? null);
	$selectedIds.set(fallback ? [fallback] : []);
}

export function toggleSelected(id: string): void {
	const current = $selectedIds.get();
	if (current.includes(id)) {
		if (current.length <= 1) return;
		$selectedIds.set(current.filter((x) => x !== id));
		return;
	}
	$selectedIds.set([...current, id]);
	$activeItemId.set(id);
}

export function selectAll(): void {
	$selectedIds.set($items.get().map((i) => i.id));
}

export function clearSelection(): void {
	const items = $items.get();
	if (items.length === 0) {
		$selectedIds.set([]);
		return;
	}
	const activeId = $activeItemId.get();
	const keep =
		activeId && items.some((item) => item.id === activeId) ? activeId : (items[0]?.id ?? null);
	$selectedIds.set(keep ? [keep] : []);
}

export async function addSources(files: FileList | File[]): Promise<void> {
	const list = Array.from(files);
	const rejected: string[] = [];
	const accepted: File[] = [];

	for (const file of list) {
		const fileError = validateImageFile(file);
		if (fileError) {
			rejected.push(file.name);
			continue;
		}
		accepted.push(file);
	}

	if (rejected.length > 0) {
		$error.set(
			rejected.length === 1
				? `Arquivo ignorado: ${rejected[0]}`
				: `${rejected.length} arquivos ignorados: ${rejected.join(", ")}`,
		);
	} else {
		$error.set(null);
	}

	if (accepted.length === 0) return;

	const placeholders: ImageItem[] = accepted.map((file) => ({
		id: createImageItemId(),
		file,
		sourceUrl: URL.createObjectURL(file),
		dimensions: null,
		hasAlpha: false,
		status: "loading",
		resultBlob: null,
		resultUrl: null,
		error: null,
		lastOperation: null,
	}));

	$items.set([...$items.get(), ...placeholders]);
	if (!$activeItemId.get()) {
		$activeItemId.set(placeholders[0]?.id ?? null);
	}
	if ($selectedIds.get().length === 0) {
		$selectedIds.set(placeholders.map((p) => p.id));
	}

	await Promise.all(
		placeholders.map(async (placeholder) => {
			try {
				const loaded = await loadImageFromFile(placeholder.file);
				const dimError = validateDimensions(loaded.width, loaded.height);
				if (dimError) {
					releaseLoadedImage(loaded);
					URL.revokeObjectURL(placeholder.sourceUrl);
					$items.set($items.get().filter((i) => i.id !== placeholder.id));
					const prev = $error.get();
					const msg = `${placeholder.file.name}: ${dimError}`;
					$error.set(prev ? `${prev}; ${msg}` : msg);
					return;
				}
				patchItem(placeholder.id, {
					status: "ready",
					dimensions: { width: loaded.width, height: loaded.height },
					hasAlpha: loaded.hasAlpha,
				});
				releaseLoadedImage(loaded);
			} catch (err) {
				URL.revokeObjectURL(placeholder.sourceUrl);
				$items.set($items.get().filter((i) => i.id !== placeholder.id));
				const msg = `${placeholder.file.name}: ${(err as Error).message || "Falha ao carregar"}`;
				const prev = $error.get();
				$error.set(prev ? `${prev}; ${msg}` : msg);
			}
		}),
	);

	const activeId = $activeItemId.get();
	if (activeId && !getItem(activeId)) {
		$activeItemId.set($items.get()[0]?.id ?? null);
	}
	ensureAtLeastOneSelected();
}

export function removeItem(id: string): void {
	abortItem(id);
	const item = getItem(id);
	if (item) revokeItemUrls(item);
	$items.set($items.get().filter((i) => i.id !== id));
	$selectedIds.set($selectedIds.get().filter((x) => x !== id));
	if ($activeItemId.get() === id) {
		$activeItemId.set($items.get()[0]?.id ?? null);
	}
	ensureAtLeastOneSelected();
}

export async function replaceItemWithBlob(id: string, blob: Blob, filename: string): Promise<void> {
	const file = new File([blob], filename, { type: blob.type || "image/png" });
	const item = getItem(id);
	if (!item) return;

	abortItem(id);
	revokeItemUrls(item);

	const sourceUrl = URL.createObjectURL(file);
	patchItem(id, {
		file,
		sourceUrl,
		dimensions: null,
		hasAlpha: false,
		status: "loading",
		resultBlob: null,
		resultUrl: null,
		error: null,
		lastOperation: null,
	});

	try {
		const loaded = await loadImageFromFile(file);
		const dimError = validateDimensions(loaded.width, loaded.height);
		if (dimError) {
			releaseLoadedImage(loaded);
			setItemErrorAfterLoad(id, dimError);
			return;
		}
		patchItem(id, {
			status: "ready",
			dimensions: { width: loaded.width, height: loaded.height },
			hasAlpha: loaded.hasAlpha,
		});
		releaseLoadedImage(loaded);
	} catch (err) {
		setItemErrorAfterLoad(id, (err as Error).message || "Falha ao carregar");
	}
}

function setItemErrorAfterLoad(id: string, message: string): void {
	const item = getItem(id);
	if (item?.sourceUrl) URL.revokeObjectURL(item.sourceUrl);
	patchItem(id, {
		status: "error",
		error: message,
		sourceUrl: "",
		dimensions: null,
	});
}

export function clearAll(): void {
	cancelAll();
	for (const item of $items.get()) {
		revokeItemUrls(item);
	}
	$items.set([]);
	$activeItemId.set(null);
	$selectedIds.set([]);
	$activeOperation.set(null);
	$error.set(null);
}

export function isAbortError(err: unknown): boolean {
	return err instanceof DOMException && err.name === "AbortError";
}
