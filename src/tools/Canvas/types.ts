export type ElementType =
	| "rect"
	| "circle"
	| "ellipse"
	| "triangle"
	| "diamond"
	| "pentagon"
	| "hexagon"
	| "star"
	| "line"
	| "text"
	| "image"
	| "path";

export interface CanvasElement {
	id: string;
	type: ElementType;
	x: number;
	y: number;
	width: number;
	height: number;
	rotation: number;
	scaleX: number;
	scaleY: number;
	zIndex: number;
	opacity: number;
	locked: boolean;
	visible: boolean;
	fill?: string;
	stroke?: string;
	strokeWidth?: number;
	content?: string;
	src?: string;
	/** Pontos relativos a (x, y) para type path: [x1, y1, x2, y2, ...] */
	points?: number[];
}

export interface SceneCanvas {
	width: number;
	height: number;
	backgroundColor: string;
	/** Preset ativo; `custom` se dimensões não batem com nenhum formato. */
	formatId: string;
}

export interface SceneState {
	canvas: SceneCanvas;
	elements: Record<string, CanvasElement>;
	selection: string[];
}

export interface ElementPatch {
	x?: number;
	y?: number;
	width?: number;
	height?: number;
	rotation?: number;
	scaleX?: number;
	scaleY?: number;
	zIndex?: number;
	opacity?: number;
	locked?: boolean;
	visible?: boolean;
	fill?: string;
	stroke?: string;
	strokeWidth?: number;
	content?: string;
	src?: string;
	points?: number[];
}

export type AlignAxis = "left" | "center" | "right" | "top" | "middle" | "bottom";
export type EditorTool = "select" | "draw";
