import { atom } from "nanostores";
import { createJsonPersistentAtom } from "@/lib/toolStorage/persistentAtom";
import type { ToolStorageEntry } from "@/lib/toolStorage/types";
import { matchFormatId } from "./formats";
import type { AlignAxis, CanvasElement, EditorTool, ElementPatch, ElementType, SceneState } from "./types";

export const CANVAS_STORAGE_KEY = "canvas:scene_v1";
export const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
export const ELEMENT_WARN_COUNT = 100;
export const TRANSPARENT_BACKGROUND = "transparent";

export const editorTool$ = atom<EditorTool>("select");

export function setEditorTool(tool: EditorTool): void {
	editorTool$.set(tool);
}

export function isTransparentBackground(color: string): boolean {
	return color === TRANSPARENT_BACKGROUND || color === "rgba(0,0,0,0)" || color === "transparent";
}

export const defaultScene: SceneState = {
	canvas: {
		width: 1080,
		height: 1080,
		backgroundColor: "#ffffff",
		formatId: "square",
	},
	elements: {},
	selection: [],
};

function isFiniteNumber(value: unknown): value is number {
	return typeof value === "number" && Number.isFinite(value);
}

function normalizeElement(raw: unknown): CanvasElement | null {
	if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
	const o = raw as Record<string, unknown>;
	if (typeof o.id !== "string" || o.id === "") return null;
	const type = o.type;
	const allowed: ElementType[] = [
		"rect",
		"circle",
		"ellipse",
		"triangle",
		"diamond",
		"pentagon",
		"hexagon",
		"star",
		"line",
		"text",
		"image",
		"path",
	];
	if (typeof type !== "string" || !allowed.includes(type as ElementType)) return null;
	const elementType = type as ElementType;
	if (!isFiniteNumber(o.x) || !isFiniteNumber(o.y)) return null;
	if (!isFiniteNumber(o.width) || !isFiniteNumber(o.height)) return null;

	const element: CanvasElement = {
		id: o.id,
		type: elementType,
		x: o.x,
		y: o.y,
		width: Math.max(1, o.width),
		height: Math.max(1, o.height),
		rotation: isFiniteNumber(o.rotation) ? o.rotation : 0,
		scaleX: isFiniteNumber(o.scaleX) ? o.scaleX : 1,
		scaleY: isFiniteNumber(o.scaleY) ? o.scaleY : 1,
		zIndex: isFiniteNumber(o.zIndex) ? o.zIndex : 0,
		opacity: isFiniteNumber(o.opacity) ? Math.min(1, Math.max(0, o.opacity)) : 1,
		locked: o.locked === true,
		visible: o.visible !== false,
	};

	if (typeof o.fill === "string") element.fill = o.fill;
	if (typeof o.stroke === "string") element.stroke = o.stroke;
	if (isFiniteNumber(o.strokeWidth)) element.strokeWidth = o.strokeWidth;
	if (typeof o.content === "string") element.content = o.content;
	if (typeof o.src === "string") element.src = o.src;
	if (Array.isArray(o.points)) {
		const points = o.points.filter((p): p is number => isFiniteNumber(p));
		if (points.length >= 4) element.points = points;
	}

	return element;
}

export function normalizeScene(raw: unknown): SceneState {
	if (!raw || typeof raw !== "object" || Array.isArray(raw)) return defaultScene;
	const o = raw as Record<string, unknown>;

	const canvasRaw = o.canvas;
	const canvas =
		canvasRaw && typeof canvasRaw === "object" && !Array.isArray(canvasRaw)
			? (canvasRaw as Record<string, unknown>)
			: {};

	const width = isFiniteNumber(canvas.width) ? Math.max(1, canvas.width) : defaultScene.canvas.width;
	const height = isFiniteNumber(canvas.height) ? Math.max(1, canvas.height) : defaultScene.canvas.height;
	const backgroundColor =
		typeof canvas.backgroundColor === "string" && canvas.backgroundColor !== ""
			? canvas.backgroundColor
			: defaultScene.canvas.backgroundColor;
	const formatId =
		typeof canvas.formatId === "string" && canvas.formatId !== "" ? canvas.formatId : matchFormatId(width, height);

	const elements: Record<string, CanvasElement> = {};
	const elementsRaw = o.elements;
	if (elementsRaw && typeof elementsRaw === "object" && !Array.isArray(elementsRaw)) {
		for (const value of Object.values(elementsRaw as Record<string, unknown>)) {
			const el = normalizeElement(value);
			if (el) elements[el.id] = el;
		}
	}

	const selection: string[] = [];
	if (Array.isArray(o.selection)) {
		for (const id of o.selection) {
			if (typeof id === "string" && id in elements && !selection.includes(id)) {
				selection.push(id);
			}
		}
	}

	return {
		canvas: { width, height, backgroundColor, formatId },
		elements,
		selection,
	};
}

export const canvasScene$ = createJsonPersistentAtom<SceneState>({
	storageKey: CANVAS_STORAGE_KEY,
	defaultValue: defaultScene,
	normalize: normalizeScene,
});

export const canvasStorage: ToolStorageEntry = {
	toolId: "canvas",
	keys: [CANVAS_STORAGE_KEY],
	atoms: { [CANVAS_STORAGE_KEY]: canvasScene$ },
};

export function newElementId(): string {
	return globalThis.crypto?.randomUUID?.() ?? `el-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function nextZIndex(elements: Record<string, CanvasElement>): number {
	let max = 0;
	for (const el of Object.values(elements)) {
		if (el.zIndex > max) max = el.zIndex;
	}
	return max + 1;
}

export function createElement(type: ElementType, extras?: Partial<CanvasElement>): CanvasElement {
	const scene = canvasScene$.get();
	const id = extras?.id ?? newElementId();
	const width = extras?.width ?? (type === "text" ? 280 : 160);
	const height = extras?.height ?? (type === "text" ? 48 : 160);
	const x = extras?.x ?? Math.round(scene.canvas.width / 2 - width / 2);
	const y = extras?.y ?? Math.round(scene.canvas.height / 2 - height / 2);

	const base: CanvasElement = {
		id,
		type,
		x,
		y,
		width,
		height,
		rotation: extras?.rotation ?? 0,
		scaleX: extras?.scaleX ?? 1,
		scaleY: extras?.scaleY ?? 1,
		zIndex: extras?.zIndex ?? nextZIndex(scene.elements),
		opacity: extras?.opacity ?? 1,
		locked: extras?.locked ?? false,
		visible: extras?.visible ?? true,
	};

	if (type === "rect") {
		base.fill = extras?.fill ?? "#d7e0ea";
		base.stroke = extras?.stroke ?? "#1a2330";
		base.strokeWidth = extras?.strokeWidth ?? 2;
	} else if (type === "circle" || type === "ellipse") {
		base.fill = extras?.fill ?? "#e8a06a";
		base.stroke = extras?.stroke ?? "#1a2330";
		base.strokeWidth = extras?.strokeWidth ?? 2;
	} else if (
		type === "triangle" ||
		type === "diamond" ||
		type === "pentagon" ||
		type === "hexagon" ||
		type === "star"
	) {
		base.fill = extras?.fill ?? "#7eb0c8";
		base.stroke = extras?.stroke ?? "#1a2330";
		base.strokeWidth = extras?.strokeWidth ?? 2;
	} else if (type === "line") {
		base.stroke = extras?.stroke ?? "#1a2330";
		base.strokeWidth = extras?.strokeWidth ?? 3;
		base.points = extras?.points ?? [0, height / 2, width, height / 2];
	} else if (type === "text") {
		base.fill = extras?.fill ?? "#1a2330";
		base.content = extras?.content ?? "Texto";
	} else if (type === "image") {
		base.src = extras?.src ?? "";
	} else if (type === "path") {
		base.stroke = extras?.stroke ?? "#1a2330";
		base.strokeWidth = extras?.strokeWidth ?? 3;
		base.points = extras?.points ?? [0, 0, 1, 1];
	}

	if (extras?.fill !== undefined) base.fill = extras.fill;
	if (extras?.stroke !== undefined) base.stroke = extras.stroke;
	if (extras?.strokeWidth !== undefined) base.strokeWidth = extras.strokeWidth;
	if (extras?.content !== undefined) base.content = extras.content;
	if (extras?.src !== undefined) base.src = extras.src;
	if (extras?.points !== undefined) base.points = extras.points;

	return base;
}

export function setScene(scene: SceneState): void {
	canvasScene$.set(scene);
}

export function patchSceneLive(updater: (scene: SceneState) => SceneState): void {
	canvasScene$.set(updater(canvasScene$.get()));
}

export function setSelection(ids: string[]): void {
	const scene = canvasScene$.get();
	const selection = ids.filter((id) => id in scene.elements);
	canvasScene$.set({ ...scene, selection });
}

export function applyElementPatches(patches: Record<string, ElementPatch>): void {
	const scene = canvasScene$.get();
	const elements = { ...scene.elements };
	for (const [id, patch] of Object.entries(patches)) {
		const current = elements[id];
		if (!current) continue;
		elements[id] = { ...current, ...patch };
	}
	canvasScene$.set({ ...scene, elements });
}

export function sortedElements(elements: Record<string, CanvasElement>): CanvasElement[] {
	return Object.values(elements).sort((a, b) => a.zIndex - b.zIndex);
}

export function alignSelection(axis: AlignAxis): Record<string, ElementPatch> | null {
	const scene = canvasScene$.get();
	const selected = scene.selection
		.map((id) => scene.elements[id])
		.filter((el): el is CanvasElement => el !== undefined && !el.locked);
	if (selected.length === 0) return null;

	const { width, height } = scene.canvas;
	const patches: Record<string, ElementPatch> = {};

	for (const el of selected) {
		const w = el.width * el.scaleX;
		const h = el.height * el.scaleY;
		if (axis === "left") patches[el.id] = { x: 0 };
		else if (axis === "center") patches[el.id] = { x: Math.round((width - w) / 2) };
		else if (axis === "right") patches[el.id] = { x: Math.round(width - w) };
		else if (axis === "top") patches[el.id] = { y: 0 };
		else if (axis === "middle") patches[el.id] = { y: Math.round((height - h) / 2) };
		else if (axis === "bottom") patches[el.id] = { y: Math.round(height - h) };
	}

	return patches;
}
