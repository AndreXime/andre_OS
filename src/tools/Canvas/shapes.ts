import type { ElementType } from "./types";

/** Formas geométricas do menu Formas (exclui text/image/path). */
export type GeometryShapeType =
	| "rect"
	| "circle"
	| "ellipse"
	| "triangle"
	| "diamond"
	| "pentagon"
	| "hexagon"
	| "star"
	| "line";

export interface ShapeMenuItem {
	readonly type: GeometryShapeType;
	readonly label: string;
}

export const SHAPE_MENU: readonly ShapeMenuItem[] = [
	{ type: "rect", label: "Retângulo" },
	{ type: "circle", label: "Círculo" },
	{ type: "ellipse", label: "Elipse" },
	{ type: "triangle", label: "Triângulo" },
	{ type: "diamond", label: "Losango" },
	{ type: "pentagon", label: "Pentágono" },
	{ type: "hexagon", label: "Hexágono" },
	{ type: "star", label: "Estrela" },
	{ type: "line", label: "Linha" },
] as const;

const CENTER_BASED: ReadonlySet<ElementType> = new Set([
	"circle",
	"ellipse",
	"triangle",
	"diamond",
	"pentagon",
	"hexagon",
	"star",
]);

export function isCenterBasedShape(type: ElementType): boolean {
	return CENTER_BASED.has(type);
}

export function isFillableShape(type: ElementType): boolean {
	return type !== "text" && type !== "image" && type !== "path" && type !== "line";
}

export function shapeLabel(type: ElementType): string {
	switch (type) {
		case "rect":
			return "Retângulo";
		case "circle":
			return "Círculo";
		case "ellipse":
			return "Elipse";
		case "triangle":
			return "Triângulo";
		case "diamond":
			return "Losango";
		case "pentagon":
			return "Pentágono";
		case "hexagon":
			return "Hexágono";
		case "star":
			return "Estrela";
		case "line":
			return "Linha";
		case "text":
			return "Texto";
		case "image":
			return "Imagem";
		case "path":
			return "Desenho";
		default:
			return "Elemento";
	}
}

export function regularPolygonSides(type: ElementType): number | null {
	switch (type) {
		case "triangle":
			return 3;
		case "diamond":
			return 4;
		case "pentagon":
			return 5;
		case "hexagon":
			return 6;
		default:
			return null;
	}
}
