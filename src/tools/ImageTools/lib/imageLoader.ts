export interface LoadedImage {
	bitmap: ImageBitmap;
	width: number;
	height: number;
	hasAlpha: boolean;
}

export function throwIfAborted(signal?: AbortSignal): void {
	if (signal?.aborted) {
		throw new DOMException("Operacao cancelada", "AbortError");
	}
}

export async function loadImageFromFile(file: File, signal?: AbortSignal): Promise<LoadedImage> {
	throwIfAborted(signal);

	let bitmap: ImageBitmap;
	try {
		bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
	} catch {
		bitmap = await createImageBitmap(file);
	}
	throwIfAborted(signal);

	const hasAlpha = await detectAlpha(bitmap, signal);

	return {
		bitmap,
		width: bitmap.width,
		height: bitmap.height,
		hasAlpha,
	};
}

async function detectAlpha(bitmap: ImageBitmap, signal?: AbortSignal): Promise<boolean> {
	throwIfAborted(signal);

	const maxSample = 64;
	const scale = Math.min(1, maxSample / Math.max(bitmap.width, bitmap.height));
	const width = Math.max(1, Math.round(bitmap.width * scale));
	const height = Math.max(1, Math.round(bitmap.height * scale));

	const canvas = document.createElement("canvas");
	canvas.width = width;
	canvas.height = height;

	const ctx = canvas.getContext("2d", { willReadFrequently: true });
	if (!ctx) return false;

	ctx.drawImage(bitmap, 0, 0, width, height);
	throwIfAborted(signal);

	const data = ctx.getImageData(0, 0, width, height).data;
	for (let i = 3; i < data.length; i += 4) {
		const alpha = data[i];
		if (alpha !== undefined && alpha < 255) return true;
	}
	return false;
}

export function drawToCanvas(bitmap: ImageBitmap, targetWidth: number, targetHeight: number): HTMLCanvasElement {
	const canvas = document.createElement("canvas");
	canvas.width = targetWidth;
	canvas.height = targetHeight;

	const ctx = canvas.getContext("2d");
	if (!ctx) throw new Error("Canvas nao suportado");

	ctx.drawImage(bitmap, 0, 0, targetWidth, targetHeight);
	return canvas;
}

export function canvasToBlob(
	canvas: HTMLCanvasElement,
	mime: string,
	quality: number,
	signal?: AbortSignal,
): Promise<Blob> {
	throwIfAborted(signal);

	return new Promise((resolve, reject) => {
		canvas.toBlob(
			(blob) => {
				if (signal?.aborted) {
					reject(new DOMException("Operacao cancelada", "AbortError"));
					return;
				}
				if (!blob) {
					reject(new Error(`Falha ao gerar imagem (${mime})`));
					return;
				}
				const actualType = blob.type || "image/png";
				if (actualType !== mime) {
					reject(
						new Error(
							`Seu navegador nao consegue exportar para ${mime.replace("image/", "").toUpperCase()}. Escolha outro formato.`,
						),
					);
					return;
				}
				resolve(blob);
			},
			mime,
			quality / 100,
		);
	});
}

export function releaseLoadedImage(loaded: LoadedImage): void {
	loaded.bitmap.close();
}
