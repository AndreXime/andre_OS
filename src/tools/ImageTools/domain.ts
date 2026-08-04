export const ACCEPTED_EXTENSIONS = ".png,.jpg,.jpeg,.webp,.avif";

export const ACCEPTED_FORMATS_LABEL = "PNG, JPEG, WebP, AVIF";

export const MAX_FILE_BYTES = 25 * 1024 * 1024;
export const MAX_DIMENSION = 8192;

export const BG_REMOVAL_MODEL = "isnet_fp16" as const;

export type ModelPreloadStatus = "idle" | "loading" | "ready" | "error";

export const COMPRESS_MAX_WIDTH_OPTIONS = [
	{ value: 0, label: "Original" },
	{ value: 1280, label: "1280px" },
	{ value: 1920, label: "1920px" },
	{ value: 2560, label: "2560px" },
] as const;

export type OutputFormat = "png" | "jpeg" | "webp" | "avif";

export type OperationType = "convert" | "compress" | "bg-removal";

export interface ImageDimensions {
	width: number;
	height: number;
}

const OUTPUT_FORMATS: OutputFormat[] = ["png", "jpeg", "webp", "avif"];

const MIME_TO_EXTENSION: Record<string, string> = {
	"image/png": "png",
	"image/jpeg": "jpg",
	"image/webp": "webp",
	"image/avif": "avif",
};

const FORMAT_TO_MIME: Record<OutputFormat, string> = {
	png: "image/png",
	jpeg: "image/jpeg",
	webp: "image/webp",
	avif: "image/avif",
};

const UNSUPPORTED_MIME_TYPES: Record<string, string> = {
	"image/gif": "GIF",
	"image/bmp": "BMP",
	"image/tiff": "TIFF",
	"image/x-tiff": "TIFF",
};

export function isOutputFormat(value: unknown): value is OutputFormat {
	return typeof value === "string" && OUTPUT_FORMATS.includes(value as OutputFormat);
}

export function isCompressMaxWidth(value: number): boolean {
	return COMPRESS_MAX_WIDTH_OPTIONS.some((opt) => opt.value === value);
}

export function clampQuality(value: number): number {
	if (Number.isNaN(value)) return 80;
	return Math.min(100, Math.max(1, Math.round(value)));
}

export function getOutputExtension(format: OutputFormat): string {
	return format === "jpeg" ? "jpg" : format;
}

export function formatToMime(format: OutputFormat): string {
	return FORMAT_TO_MIME[format];
}

export function extensionFromMime(mime: string): string {
	return MIME_TO_EXTENSION[mime] ?? "png";
}

export function formatFileSize(bytes: number): string {
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
	return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const IMGLY_DECODE_MIMES = new Set(["image/png", "image/jpeg", "image/webp", "application/octet-stream"]);

export function sniffImageMime(bytes: Uint8Array): string | null {
	if (bytes.length >= 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) {
		return "image/png";
	}
	if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
		return "image/jpeg";
	}
	if (
		bytes.length >= 12 &&
		bytes[0] === 0x52 &&
		bytes[1] === 0x49 &&
		bytes[2] === 0x46 &&
		bytes[3] === 0x46 &&
		bytes[8] === 0x57 &&
		bytes[9] === 0x45 &&
		bytes[10] === 0x42 &&
		bytes[11] === 0x50
	) {
		return "image/webp";
	}
	// ftyp....avif / avis
	if (bytes.length >= 12 && bytes[4] === 0x66 && bytes[5] === 0x74 && bytes[6] === 0x79 && bytes[7] === 0x70) {
		const brand = String.fromCharCode(bytes[8] ?? 0, bytes[9] ?? 0, bytes[10] ?? 0, bytes[11] ?? 0);
		if (brand === "avif" || brand === "avis" || brand === "mif1") return "image/avif";
	}
	return null;
}

export function isImglyDecodableMime(mime: string): boolean {
	return IMGLY_DECODE_MIMES.has(mime);
}

export function validateImageFile(file: File): string | null {
	const unsupported = UNSUPPORTED_MIME_TYPES[file.type];
	if (unsupported) {
		return `${unsupported} nao e suportado. Use PNG, JPEG, WebP ou AVIF.`;
	}
	if (file.type && !file.type.startsWith("image/")) {
		return "Arquivo selecionado nao e uma imagem valida.";
	}
	if (file.size > MAX_FILE_BYTES) {
		return `Arquivo muito grande. O limite e ${formatFileSize(MAX_FILE_BYTES)}.`;
	}
	return null;
}

export function formatImageProcessingError(err: unknown, fallback: string): string {
	if (!(err instanceof Error) || !err.message) return fallback;
	const message = err.message;
	const lower = message.toLowerCase();
	if (lower.includes("encode") || err.name === "EncodingError") {
		return "Falha ao gerar a imagem de saida neste navegador. Tente PNG ou JPEG, ou outro navegador.";
	}
	if (lower.includes("invalid format") || lower.includes("unsupported")) {
		return "Formato de imagem nao suportado para esta operacao. Use PNG, JPEG ou WebP.";
	}
	return message;
}

export function validateDimensions(width: number, height: number): string | null {
	if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
		return `Dimensoes muito grandes. O limite e ${MAX_DIMENSION}px por lado.`;
	}
	return null;
}

export function computeTargetSize(width: number, height: number, maxWidth: number): { width: number; height: number } {
	if (maxWidth <= 0 || width <= maxWidth) {
		return { width, height };
	}
	const ratio = maxWidth / width;
	return { width: maxWidth, height: Math.round(height * ratio) };
}

export function buildDownloadFilename(
	sourceName: string,
	resultBlob: Blob,
	operation: OperationType,
	outputFormat?: OutputFormat,
): string {
	const dotIdx = sourceName.lastIndexOf(".");
	const baseName = dotIdx > 0 ? sourceName.slice(0, dotIdx) : sourceName;
	const suffix = operation === "convert" ? "convertido" : operation === "compress" ? "comprimido" : "sem_fundo";

	let ext: string;
	if (operation === "convert" && outputFormat) {
		ext = getOutputExtension(outputFormat);
	} else if (operation === "bg-removal") {
		ext = "png";
	} else {
		ext = extensionFromMime(resultBlob.type);
	}

	return `${baseName}_${suffix}.${ext}`;
}

export function buildSizeDiffLabel(originalBytes: number, resultBytes: number): string {
	if (originalBytes <= 0) return "";

	const diff = resultBytes - originalBytes;
	const diffAbs = Math.abs(diff);
	const pct = (diffAbs / originalBytes) * 100;
	const pctLabel = pct >= 0.1 ? `${pct.toFixed(1)}%` : "<0.1%";

	if (diff === 0) return "Mesmo tamanho que o original";

	if (diff < 0) {
		return `Economia: ${formatFileSize(diffAbs)} (${pctLabel})`;
	}

	return `Aumento: ${formatFileSize(diffAbs)} (${pctLabel})`;
}

export type ImageItemStatus = "loading" | "ready" | "processing" | "done" | "error";

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

export function getSelectedDoneItems(items: ImageItem[], selectedIds: string[]): ImageItem[] {
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
