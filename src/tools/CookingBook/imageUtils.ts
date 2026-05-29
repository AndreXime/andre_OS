const MAX_INPUT_BYTES = 8 * 1024 * 1024;
const MAX_EDGE = 1400;
const JPEG_QUALITY = 0.82;

export async function compressImageFile(file: File): Promise<string> {
	if (!file.type.startsWith("image/")) {
		throw new Error("Escolha um arquivo de imagem (JPG, PNG, WebP…).");
	}
	if (file.size > MAX_INPUT_BYTES) {
		throw new Error("Imagem muito grande. Use uma foto de até 8 MB.");
	}

	const objectUrl = URL.createObjectURL(file);
	try {
		const img = await loadImage(objectUrl);
		const { width, height } = fitDimensions(img.naturalWidth, img.naturalHeight, MAX_EDGE);
		const canvas = document.createElement("canvas");
		canvas.width = width;
		canvas.height = height;
		const ctx = canvas.getContext("2d");
		if (!ctx) throw new Error("Não foi possível processar a imagem.");
		ctx.drawImage(img, 0, 0, width, height);
		const dataUrl = canvas.toDataURL("image/jpeg", JPEG_QUALITY);
		if (dataUrl.length > 1_800_000) {
			throw new Error("Foto ainda grande demais para salvar no navegador. Tente outra imagem.");
		}
		return dataUrl;
	} finally {
		URL.revokeObjectURL(objectUrl);
	}
}

function loadImage(src: string): Promise<HTMLImageElement> {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.onload = () => resolve(img);
		img.onerror = () => reject(new Error("Não foi possível ler a imagem."));
		img.src = src;
	});
}

function fitDimensions(w: number, h: number, maxEdge: number): { width: number; height: number } {
	if (w <= maxEdge && h <= maxEdge) return { width: w, height: h };
	const ratio = w / h;
	if (w >= h) return { width: maxEdge, height: Math.round(maxEdge / ratio) };
	return { width: Math.round(maxEdge * ratio), height: maxEdge };
}
