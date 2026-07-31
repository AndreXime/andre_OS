import { computeTargetSize, formatToMime, type OutputFormat } from "../domain";
import { $supportedFormats } from "../store";
import { bgRemovalConfig } from "./bgRemovalConfig";
import { isFormatSupported } from "./formatSupport";
import {
	canvasToBlob,
	drawToCanvas,
	loadImageFromFile,
	releaseLoadedImage,
	throwIfAborted,
} from "./imageLoader";

export async function convertFile(
	file: File,
	format: OutputFormat,
	quality: number,
	signal: AbortSignal,
): Promise<Blob> {
	const support = $supportedFormats.get();
	if (!isFormatSupported(support, format)) {
		throw new Error(`Seu navegador nao suporta conversao para ${format.toUpperCase()}. Escolha outro formato.`);
	}

	let loaded: Awaited<ReturnType<typeof loadImageFromFile>> | null = null;
	try {
		loaded = await loadImageFromFile(file, signal);
		throwIfAborted(signal);

		const canvas = drawToCanvas(loaded.bitmap, loaded.width, loaded.height);
		releaseLoadedImage(loaded);
		loaded = null;
		throwIfAborted(signal);

		const mime = formatToMime(format);
		const needsQuality = mime === "image/jpeg" || mime === "image/webp";
		return await canvasToBlob(canvas, mime, needsQuality ? quality : 100, signal);
	} catch (err) {
		if (loaded) releaseLoadedImage(loaded);
		throw err;
	}
}

export async function compressFile(
	file: File,
	quality: number,
	maxWidth: number,
	signal: AbortSignal,
): Promise<Blob> {
	let loaded: Awaited<ReturnType<typeof loadImageFromFile>> | null = null;
	try {
		loaded = await loadImageFromFile(file, signal);
		throwIfAborted(signal);

		const target = computeTargetSize(loaded.width, loaded.height, maxWidth);
		const canvas = drawToCanvas(loaded.bitmap, target.width, target.height);
		const hasAlpha = loaded.hasAlpha;
		releaseLoadedImage(loaded);
		loaded = null;
		throwIfAborted(signal);

		const support = $supportedFormats.get();
		let mime: string;
		if (hasAlpha) {
			mime = isFormatSupported(support, "webp") ? "image/webp" : "image/png";
		} else if (file.type === "image/webp" && isFormatSupported(support, "webp")) {
			mime = "image/webp";
		} else {
			mime = "image/jpeg";
		}

		const qualityValue = mime === "image/png" ? 100 : quality;
		return await canvasToBlob(canvas, mime, qualityValue, signal);
	} catch (err) {
		if (loaded) releaseLoadedImage(loaded);
		throw err;
	}
}

export async function removeBackgroundFile(
	file: File,
	onProgress?: (pct: number, label: string) => void,
): Promise<Blob> {
	const { removeBackground: imglyRemoveBackground } = await import("@imgly/background-removal");

	return imglyRemoveBackground(file, {
		...bgRemovalConfig,
		progress: (key, current, total) => {
			const pct = total > 0 ? Math.round((current / total) * 100) : 0;
			onProgress?.(pct, formatProgressKey(key));
		},
	});
}

function formatProgressKey(key: string): string {
	if (key.includes("fetch")) return "Baixando modelo...";
	if (key.includes("compute") || key.includes("inference")) return "Processando imagem...";
	if (key.includes("mask")) return "Gerando mascara...";
	return "Processando...";
}
