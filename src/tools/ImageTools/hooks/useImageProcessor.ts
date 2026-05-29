import { useCallback } from "react";
import {
	beginOperation,
	finishOperation,
	isAbortError,
	isOperationCurrent,
	setError,
	setProgress,
	setResult,
	$supportedFormats,
} from "../store";
import { computeTargetSize, formatToMime, type OutputFormat } from "../domain";
import { isFormatSupported } from "../formatSupport";
import {
	canvasToBlob,
	drawToCanvas,
	loadImageFromFile,
	releaseLoadedImage,
	throwIfAborted,
} from "../imageLoader";

export function useImageProcessor() {
	const convert = useCallback(async (file: File, format: OutputFormat, quality: number) => {
		const support = $supportedFormats.get();
		if (!isFormatSupported(support, format)) {
			setError(`Seu navegador nao suporta conversao para ${format.toUpperCase()}. Escolha outro formato.`);
			return;
		}

		const { signal, id } = beginOperation("Convertendo imagem...");
		let loaded: Awaited<ReturnType<typeof loadImageFromFile>> | null = null;

		try {
			setProgress(15, "Carregando imagem...");
			loaded = await loadImageFromFile(file, signal);
			throwIfAborted(signal);

			setProgress(45, "Preparando canvas...");
			const canvas = drawToCanvas(loaded.bitmap, loaded.width, loaded.height);
			releaseLoadedImage(loaded);
			loaded = null;
			throwIfAborted(signal);

			const mime = formatToMime(format);
			const needsQuality = mime === "image/jpeg" || mime === "image/webp";

			setProgress(75, "Encodando imagem...");
			const blob = await canvasToBlob(canvas, mime, needsQuality ? quality : 100, signal);

			if (!isOperationCurrent(id)) return;
			setResult(blob, id);
		} catch (err) {
			if (loaded) releaseLoadedImage(loaded);
			if (isAbortError(err)) return;
			setError((err as Error).message, id);
		} finally {
			finishOperation(id);
		}
	}, []);

	const compress = useCallback(async (file: File, quality: number, maxWidth: number) => {
		const { signal, id } = beginOperation("Comprimindo imagem...");
		let loaded: Awaited<ReturnType<typeof loadImageFromFile>> | null = null;

		try {
			setProgress(15, "Carregando imagem...");
			loaded = await loadImageFromFile(file, signal);
			throwIfAborted(signal);

			const target = computeTargetSize(loaded.width, loaded.height, maxWidth);

			setProgress(45, "Preparando canvas...");
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

			setProgress(75, "Encodando imagem...");
			const blob = await canvasToBlob(canvas, mime, qualityValue, signal);

			if (!isOperationCurrent(id)) return;
			setResult(blob, id);
		} catch (err) {
			if (loaded) releaseLoadedImage(loaded);
			if (isAbortError(err)) return;
			setError((err as Error).message, id);
		} finally {
			finishOperation(id);
		}
	}, []);

	return { convert, compress };
}
