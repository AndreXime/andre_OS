import { formatToMime, type OutputFormat } from "../domain";
import { canvasToBlob } from "./imageLoader";

const ALL_FORMATS: OutputFormat[] = ["png", "jpeg", "webp", "avif"];

let cachedSupport: Record<OutputFormat, boolean> | null = null;

async function canEncode(mime: string): Promise<boolean> {
	const canvas = document.createElement("canvas");
	canvas.width = 1;
	canvas.height = 1;

	const ctx = canvas.getContext("2d");
	if (!ctx) return false;

	ctx.fillStyle = "#000";
	ctx.fillRect(0, 0, 1, 1);

	try {
		const blob = await canvasToBlob(canvas, mime, 100);
		return blob.type === mime || blob.size > 0;
	} catch {
		return false;
	}
}

export async function detectFormatSupport(): Promise<Record<OutputFormat, boolean>> {
	if (cachedSupport) return cachedSupport;

	const entries = await Promise.all(
		ALL_FORMATS.map(async (format) => {
			const mime = formatToMime(format);
			const supported = await canEncode(mime);
			return [format, supported] as const;
		}),
	);

	cachedSupport = Object.fromEntries(entries) as Record<OutputFormat, boolean>;
	return cachedSupport;
}

export function isFormatSupported(
	support: Record<OutputFormat, boolean> | null,
	format: OutputFormat,
): boolean {
	if (!support) return format === "png" || format === "jpeg" || format === "webp";
	return support[format];
}
