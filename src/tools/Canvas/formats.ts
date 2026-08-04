export type CanvasFormatId = "square" | "a4-portrait" | "a4-landscape" | "story" | "widescreen" | "post-4-5";

export interface CanvasFormat {
	readonly id: CanvasFormatId;
	readonly label: string;
	readonly width: number;
	readonly height: number;
}

/** Dimensões em px (~150 DPI para A4; redes em 1080). */
export const CANVAS_FORMATS: readonly CanvasFormat[] = [
	{ id: "square", label: "Quadrado (1:1)", width: 1080, height: 1080 },
	{ id: "a4-portrait", label: "A4 retrato", width: 1240, height: 1754 },
	{ id: "a4-landscape", label: "A4 paisagem", width: 1754, height: 1240 },
	{ id: "story", label: "Story (9:16)", width: 1080, height: 1920 },
	{ id: "widescreen", label: "Paisagem (16:9)", width: 1920, height: 1080 },
	{ id: "post-4-5", label: "Post (4:5)", width: 1080, height: 1350 },
] as const;

export function formatById(id: string): CanvasFormat | undefined {
	return CANVAS_FORMATS.find((format) => format.id === id);
}

export function matchFormatId(width: number, height: number): CanvasFormatId | "custom" {
	const match = CANVAS_FORMATS.find((format) => format.width === width && format.height === height);
	return match?.id ?? "custom";
}
