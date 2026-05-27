export const ACCEPTED_EXTENSIONS = ".png,.jpg,.jpeg,.webp,.gif,.bmp,.tiff,.avif";

export type OutputFormat = "png" | "jpeg" | "webp" | "avif" | "bmp" | "gif";

export type OperationType = "convert" | "compress" | "bg-removal";

export interface ImageDimensions {
	width: number;
	height: number;
}

export function getOutputExtension(format: OutputFormat): string {
	return format === "jpeg" ? "jpg" : format;
}

export function formatFileSize(bytes: number): string {
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
	return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
