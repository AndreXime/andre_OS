import { useCallback, useRef } from "react";
import { $progress, $progressLabel, setResult, setError, startProcessing } from "../store";
import { getOutputExtension, type OutputFormat } from "../domain";

function loadImage(file: File): Promise<HTMLImageElement> {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.onload = () => resolve(img);
		img.onerror = () => reject(new Error("Falha ao carregar imagem"));
		img.src = URL.createObjectURL(file);
	});
}

function canvasToBlob(canvas: HTMLCanvasElement, mime: string, quality: number): Promise<Blob> {
	return new Promise((resolve, reject) => {
		canvas.toBlob(
			(blob) => {
				if (!blob) return reject(new Error("Falha ao gerar imagem"));
				resolve(blob);
			},
			mime,
			quality / 100,
		);
	});
}

export function useImageProcessor() {
	const processingRef = useRef(false);

	const convert = useCallback(async (file: File, format: OutputFormat, quality: number) => {
		if (processingRef.current) return;
		processingRef.current = true;
		startProcessing("Convertendo imagem...");

		try {
			$progress.set(30);
			$progressLabel.set("Carregando imagem...");
			const img = await loadImage(file);

			$progress.set(60);
			$progressLabel.set("Convertendo...");

			const canvas = document.createElement("canvas");
			canvas.width = img.naturalWidth;
			canvas.height = img.naturalHeight;
			const ctx = canvas.getContext("2d");
			if (!ctx) throw new Error("Canvas nao suportado");
			ctx.drawImage(img, 0, 0);

			URL.revokeObjectURL(img.src);

			const ext = getOutputExtension(format);
			const mimeMap: Record<string, string> = {
				png: "image/png",
				jpg: "image/jpeg",
				jpeg: "image/jpeg",
				webp: "image/webp",
				bmp: "image/bmp",
				gif: "image/gif",
				avif: "image/avif",
			};
			const mime = mimeMap[ext] ?? "image/png";
			const needsQuality = mime === "image/jpeg" || mime === "image/webp";

			const blob = await canvasToBlob(canvas, mime, needsQuality ? quality : 100);
			setResult(blob);
		} catch (err) {
			setError((err as Error).message);
		} finally {
			processingRef.current = false;
		}
	}, []);

	const compress = useCallback(async (file: File, quality: number) => {
		if (processingRef.current) return;
		processingRef.current = true;
		startProcessing("Comprimindo imagem...");

		try {
			$progress.set(30);
			$progressLabel.set("Carregando imagem...");
			const img = await loadImage(file);

			$progress.set(60);
			$progressLabel.set("Comprimindo...");

			const canvas = document.createElement("canvas");
			canvas.width = img.naturalWidth;
			canvas.height = img.naturalHeight;
			const ctx = canvas.getContext("2d");
			if (!ctx) throw new Error("Canvas nao suportado");
			ctx.drawImage(img, 0, 0);

			URL.revokeObjectURL(img.src);

			const mime = file.type === "image/webp" ? "image/webp" : "image/jpeg";
			const blob = await canvasToBlob(canvas, mime, quality);
			setResult(blob);
		} catch (err) {
			setError((err as Error).message);
		} finally {
			processingRef.current = false;
		}
	}, []);

	return { convert, compress };
}
