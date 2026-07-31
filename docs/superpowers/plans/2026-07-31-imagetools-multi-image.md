# ImageTools Multi-Image Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Permitir fila de várias imagens no ImageTools, com edição do item ativo, lote nas selecionadas (mesmas configs), download individual ou ZIP.

**Architecture:** Remodelar o nanostore de “uma imagem” para lista de `ImageItem` + seleção + progresso de lote. Extrair processamento puro reutilizável; `batchRunner` limita concorrência (3 convert/compress, 1 bg-removal). ZIP via `fflate` com import dinâmico. UI: lista + painel (coluna até `md`, lado a lado em `lg`).

**Tech Stack:** React 19, nanostores, `@imgly/background-removal`, `fflate`, Astro tool shell existente.

**Spec:** `docs/superpowers/specs/2026-07-31-imagetools-multi-image-design.md`

## Global Constraints

- Textos e UI em português brasileiro (sem acentos quebrados no código existente: manter o padrão atual do arquivo, ex. “nao”, “imagem”)
- Sem em dashes / en dashes
- Zero `any`; `unknown` + narrowing
- Layout horizontal só a partir de `lg` (não `md`)
- Processamento 100% no browser
- Convert/compress: concorrência máx. 3; bg-removal: 1
- Arquivo inválido não entra na fila; `$error` lista rejeitados
- Download: 1 selecionada `done` → arquivo; ≥2 selecionadas `done` → ZIP
- Sem suíte de testes no repo: verificação = `npm run lint` + checklist manual do spec

---

## File map

| File | Responsibility |
|------|----------------|
| `domain.ts` | Tipos `ImageItem` / status; helpers de id, seleção, download naming |
| `store.ts` | Atoms da fila, seleção, batch; CRUD de itens; object URLs |
| `processImage.ts` (novo) | `convertFile` / `compressFile` / `removeBackgroundFile` puros (sem UI) |
| `batchRunner.ts` (novo) | Fila com concorrência + cancelamento |
| `zipDownload.ts` (novo) | Monta e dispara download ZIP |
| `hooks/useImageProcessor.ts` | Wrapper fino: processa `itemId` via store |
| `hooks/useBgRemoval.ts` | Preload + remoção por `itemId` |
| `ImageToolsView.tsx` | Lista, seleção, painel, ações lote/ZIP |
| `styles.css` | Thumbs / lista se necessário |
| `package.json` | Dependência `fflate` |

---

### Task 1: Domain types e helpers

**Files:**
- Modify: `src/tools/ImageTools/domain.ts`

**Interfaces:**
- Produces: `ImageItemStatus`, `ImageItem`, `createImageItemId()`, `getSelectedDoneItems()`, `buildZipEntryName()`

- [ ] **Step 1: Adicionar tipos e helpers em `domain.ts`**

No final de `domain.ts` (após os helpers existentes), adicionar:

```ts
export type ImageItemStatus =
	| "loading"
	| "ready"
	| "processing"
	| "done"
	| "error";

export interface ImageItem {
	id: string;
	file: File;
	sourceUrl: string;
	dimensions: ImageDimensions | null;
	hasAlpha: boolean;
	status: ImageItemStatus;
	resultBlob: Blob | null;
	resultUrl: string | null;
	error: string | null;
	lastOperation: OperationType | null;
}

export function createImageItemId(): string {
	if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
		return crypto.randomUUID();
	}
	return `img_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export function getSelectedDoneItems(
	items: ImageItem[],
	selectedIds: string[],
): ImageItem[] {
	const selected = new Set(selectedIds);
	return items.filter((item) => selected.has(item.id) && item.status === "done" && item.resultBlob);
}

export function buildZipEntryName(item: ImageItem, outputFormat?: OutputFormat): string {
	if (!item.resultBlob || !item.lastOperation) {
		return item.file.name;
	}
	return buildDownloadFilename(
		item.file.name,
		item.resultBlob,
		item.lastOperation,
		item.lastOperation === "convert" ? outputFormat : undefined,
	);
}
```

- [ ] **Step 2: Lint**

Run: `npx biome lint src/tools/ImageTools/domain.ts`
Expected: sem erros

- [ ] **Step 3: Commit**

```bash
git add src/tools/ImageTools/domain.ts
git commit -m "feat(ImageTools): tipos e helpers para fila multi-imagem"
```

---

### Task 2: Remodelar store para lista de itens

**Files:**
- Modify: `src/tools/ImageTools/store.ts` (substituir modelo single-source)

**Interfaces:**
- Consumes: `ImageItem`, `createImageItemId`, validators de `domain.ts`
- Produces: `$items`, `$activeItemId`, `$selectedIds`, `$batchRunning`, `$batchProgress`, `$activeOperation`, configs, `$error`, `$supportedFormats`, model preload atoms; `addSources`, `removeItem`, `clearAll`, `setActiveItem`, `toggleSelected`, `selectAll`, `clearSelection`, `patchItem`, `setItemResult`, `setItemError`, `beginItemOperation`, `beginBatch`, `finishBatch`, `cancelAll`, `isBatchCurrent`, getters derivados

- [ ] **Step 1: Reescrever `store.ts`**

Substituir o conteúdo por um store baseado em lista. Pontos obrigatórios:

```ts
import { atom, computed } from "nanostores";
import { loadImageFromFile, releaseLoadedImage } from "./imageLoader";
import {
	type ImageItem,
	type OperationType,
	type OutputFormat,
	type ImageDimensions,
	type ModelPreloadStatus,
	createImageItemId,
	validateImageFile,
	validateDimensions,
} from "./domain";

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
		!itemAbortControllers.get(id)?.signal.aborted
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
		abortItem(id);
		const item = getItem(id);
		if (item?.status === "processing") {
			patchItem(id, {
				status: item.resultBlob ? "done" : "ready",
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

export function toggleSelected(id: string): void {
	const current = $selectedIds.get();
	$selectedIds.set(current.includes(id) ? current.filter((x) => x !== id) : [...current, id]);
}

export function selectAll(): void {
	$selectedIds.set($items.get().map((i) => i.id));
}

export function clearSelection(): void {
	$selectedIds.set([]);
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

	if ($activeItemId.get() && !getItem($activeItemId.get()!)) {
		$activeItemId.set($items.get()[0]?.id ?? null);
	}
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
}

export async function replaceItemWithBlob(
	id: string,
	blob: Blob,
	filename: string,
): Promise<void> {
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
```

Remover exports legados (`$sourceFile`, `setSource`, `beginOperation`, etc.). Quem ainda importa vai quebrar até as tasks seguintes.

Nota: em `cancelAll`, se o item estava `processing` sem resultado prévio, status volta para `ready` (spec: fila não processada). Não restaurar `resultBlob` antigo se já tinha sido limpo no `beginItemOperation`.

- [ ] **Step 2: Commit**

```bash
git add src/tools/ImageTools/store.ts
git commit -m "feat(ImageTools): store com fila, seleção e lote"
```

---

### Task 3: Extrair processamento puro + batchRunner + zip

**Files:**
- Create: `src/tools/ImageTools/processImage.ts`
- Create: `src/tools/ImageTools/batchRunner.ts`
- Create: `src/tools/ImageTools/zipDownload.ts`
- Modify: `package.json` (add `fflate`)

**Interfaces:**
- Consumes: `imageLoader`, `domain`, `formatSupport`, `bgRemovalConfig`, store patch APIs
- Produces:
  - `convertFile(file, format, quality, signal): Promise<Blob>`
  - `compressFile(file, quality, maxWidth, signal): Promise<Blob>`
  - `removeBackgroundFile(file, onProgress?, signal?): Promise<Blob>`
  - `runBatch(options): Promise<void>`
  - `downloadProcessedZip(items, outputFormat?): Promise<void>`

- [ ] **Step 1: Instalar fflate**

```bash
npm install fflate
```

- [ ] **Step 2: Criar `processImage.ts`**

Mover a lógica de canvas/encode de `useImageProcessor` e a chamada imgly de `useBgRemoval` para funções exportadas que recebem `AbortSignal` e retornam `Blob`. Não tocar no store aqui.

`removeBackgroundFile`: `@imgly/background-removal` pode não aceitar AbortSignal nativo; documentar que cancelamento no store aborta o tracking (`isItemOperationCurrent`) e ignora o resultado mesmo se a promise resolver.

- [ ] **Step 3: Criar `batchRunner.ts`**

```ts
export interface BatchJob {
	itemId: string;
	run: (signal: AbortSignal) => Promise<void>;
}

export async function runWithConcurrency(
	jobs: BatchJob[],
	concurrency: number,
	shouldContinue: () => boolean,
): Promise<void> {
	let index = 0;

	async function worker(): Promise<void> {
		while (shouldContinue()) {
			const current = index;
			index += 1;
			if (current >= jobs.length) return;
			const job = jobs[current];
			if (!job) return;
			// signal is provided by beginItemOperation inside job.run's caller pattern
			await job.run(new AbortController().signal);
		}
	}

	const workers = Array.from({ length: Math.min(concurrency, jobs.length) }, () => worker());
	await Promise.all(workers);
}
```

Ajustar para o padrão real: cada `job.run` chama `beginItemOperation` internamente (via hooks/orchestrator) e usa o signal retornado. Preferir API:

```ts
export async function mapPool<T>(
	items: T[],
	concurrency: number,
	worker: (item: T) => Promise<void>,
	shouldContinue: () => boolean,
): Promise<void> {
	let next = 0;
	async function runWorker(): Promise<void> {
		while (shouldContinue()) {
			const i = next++;
			if (i >= items.length) return;
			const item = items[i];
			if (item === undefined) return;
			await worker(item);
		}
	}
	await Promise.all(
		Array.from({ length: Math.max(1, Math.min(concurrency, items.length)) }, () => runWorker()),
	);
}
```

- [ ] **Step 4: Criar `zipDownload.ts`**

```ts
import { getSelectedDoneItems, buildZipEntryName, type ImageItem, type OutputFormat } from "./domain";

export async function downloadProcessedZip(
	items: ImageItem[],
	selectedIds: string[],
	outputFormat?: OutputFormat,
): Promise<void> {
	const done = getSelectedDoneItems(items, selectedIds);
	if (done.length < 2) return;

	const { zipSync } = await import("fflate");
	const files: Record<string, Uint8Array> = {};
	const usedNames = new Map<string, number>();

	for (const item of done) {
		if (!item.resultBlob) continue;
		let name = buildZipEntryName(item, outputFormat);
		const count = usedNames.get(name) ?? 0;
		usedNames.set(name, count + 1);
		if (count > 0) {
			const dot = name.lastIndexOf(".");
			name =
				dot > 0
					? `${name.slice(0, dot)}_${count}${name.slice(dot)}`
					: `${name}_${count}`;
		}
		const buffer = new Uint8Array(await item.resultBlob.arrayBuffer());
		files[name] = buffer;
	}

	const zipped = zipSync(files);
	const blob = new Blob([zipped], { type: "application/zip" });
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = "imagens_processadas.zip";
	a.click();
	URL.revokeObjectURL(url);
}
```

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json src/tools/ImageTools/processImage.ts src/tools/ImageTools/batchRunner.ts src/tools/ImageTools/zipDownload.ts
git commit -m "feat(ImageTools): processamento puro, pool de lote e ZIP"
```

---

### Task 4: Adaptar hooks para `itemId`

**Files:**
- Modify: `src/tools/ImageTools/hooks/useImageProcessor.ts`
- Modify: `src/tools/ImageTools/hooks/useBgRemoval.ts`

**Interfaces:**
- Consumes: `processImage.ts`, store item APIs
- Produces:
  - `convert(itemId, format, quality)`
  - `compress(itemId, quality, maxWidth)`
  - `removeBackground(itemId)`
  - `processItem(itemId, operation, configs)` helper interno reutilizável pelo lote
  - `runBatchOnSelected(operation, configs)`

- [ ] **Step 1: Reescrever `useImageProcessor.ts`**

Usar `convertFile`/`compressFile`; `beginItemOperation` / `setItemResult` / `setItemError`. Exportar também `runBatchOnSelected` que:

1. Lê `$selectedIds` e `$items`
2. `beginBatch(ids.length, label)`
3. `mapPool` com concurrency 3
4. Para cada id: processa, `bumpBatchProgress`, respeita `isBatchCurrent`
5. `finishBatch`

- [ ] **Step 2: Reescrever `useBgRemoval.ts`**

Manter preload. `removeBackground(itemId)` usa `removeBackgroundFile`. Exportar `runBgRemovalBatchOnSelected` com concurrency 1 via `mapPool`.

- [ ] **Step 3: Commit**

```bash
git add src/tools/ImageTools/hooks/useImageProcessor.ts src/tools/ImageTools/hooks/useBgRemoval.ts
git commit -m "feat(ImageTools): hooks processam por itemId e lote"
```

---

### Task 5: UI multi-imagem

**Files:**
- Modify: `src/tools/ImageTools/ImageToolsView.tsx`
- Modify: `src/tools/ImageTools/styles.css` (se thumbs precisarem)

**Interfaces:**
- Consumes: novo store, hooks, `zipDownload`, `getSelectedDoneItems`

- [ ] **Step 1: Atualizar UploadZone**

- `multiple` no `<input>`
- Texto: “Arraste imagens ou clique para selecionar”
- `addSources(files)` em vez de `setSource`

- [ ] **Step 2: Layout com itens**

Quando `$hasItems`:

```
<div className="flex flex-col gap-4 lg:flex-row lg:items-start">
  <aside> /* lista */ </aside>
  <div className="flex-1"> /* painel ativo */ </div>
</div>
```

Lista:
- Botões “Selecionar todas” / “Limpar seleção”
- “Adicionar imagens” (mesmo input multiple)
- Por item: checkbox, thumb (`sourceUrl`), nome truncado, badge de status, botão remover
- Clique no row (não checkbox) → `setActiveItem`
- Item ativo com outline accent

Painel:
- Preview do `$activeItem` (source + result se `done`)
- Operações + configs (como hoje)
- Botão **Aplicar** → item ativo
- Botão **Aplicar nas selecionadas** → desabilitado se `selectedIds.length === 0` ou batch running
- Progresso: se `$batchRunning`, mostrar `current/total` + label; senão progresso do item ativo se `processing`
- Cancelar → `cancelAll`
- Resultado / download:
  - `doneSelected = getSelectedDoneItems(...)`
  - se `doneSelected.length === 1` → Baixar (usa resultUrl do item)
  - se `doneSelected.length >= 2` → Baixar ZIP
  - “Usar como nova imagem” só no ativo com result

Empty state: UploadZone quando `!$hasItems`.

Manter `ModelPreloadBanner`, a11y `aria-live`, e padrão visual existente (sem cards extras desnecessários).

- [ ] **Step 3: Lint + check**

```bash
npm run lint
```

Expected: passa (ou só erros pré-existentes fora de ImageTools)

- [ ] **Step 4: Commit**

```bash
git add src/tools/ImageTools/ImageToolsView.tsx src/tools/ImageTools/styles.css
git commit -m "feat(ImageTools): UI de fila, lote e download ZIP"
```

---

### Task 6: Verificação manual e polish

**Files:** éventuais fixes pontuais

- [ ] **Step 1: Checklist manual** (dev server `npm run dev`)

1. Upload 1 e N arquivos
2. Aplicar no ativo vs nas selecionadas
3. Cancelar no meio do lote (convert e bg-removal)
4. Download 1 vs ZIP ≥2
5. Bg-removal em lote sequencial
6. Remover item / limpar tudo
7. Layout mobile e `lg`
8. Arquivo inválido rejeitado com `$error`

- [ ] **Step 2: Corrigir bugs encontrados e commit se houver diff**

```bash
git commit -m "fix(ImageTools): ajustes pos-verificacao multi-imagem"
```

---

## Spec coverage

| Spec | Task |
|------|------|
| Fila + item ativo | 2, 5 |
| Lote mesmas configs / só selecionadas | 4, 5 |
| Concorrência 3 / bg 1 | 3, 4 |
| Download 1 vs ZIP | 3, 5 |
| fflate dinâmico | 3 |
| Inválidos fora da fila | 2 |
| Cancelamento lote | 2, 4, 5 |
| Layout lg | 5 |
| Verificação | 6 |
