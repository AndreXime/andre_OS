import { applyElementPatches, canvasScene$, setScene } from "../store";
import type { CanvasElement, ElementPatch, SceneState } from "../types";

export interface Command {
	execute(): void;
	undo(): void;
}

type Listener = () => void;

export class HistoryManager {
	private undoStack: Command[] = [];
	private redoStack: Command[] = [];
	private listeners = new Set<Listener>();

	dispatch(command: Command): void {
		command.execute();
		this.undoStack.push(command);
		this.redoStack = [];
		this.notify();
	}

	undo(): void {
		const cmd = this.undoStack.pop();
		if (!cmd) return;
		cmd.undo();
		this.redoStack.push(cmd);
		this.notify();
	}

	redo(): void {
		const cmd = this.redoStack.pop();
		if (!cmd) return;
		cmd.execute();
		this.undoStack.push(cmd);
		this.notify();
	}

	canUndo(): boolean {
		return this.undoStack.length > 0;
	}

	canRedo(): boolean {
		return this.redoStack.length > 0;
	}

	subscribe(listener: Listener): () => void {
		this.listeners.add(listener);
		return () => {
			this.listeners.delete(listener);
		};
	}

	private notify(): void {
		for (const listener of this.listeners) listener();
	}
}

export const history = new HistoryManager();

export class AddElementCommand implements Command {
	constructor(private readonly element: CanvasElement) {}

	execute(): void {
		const scene = canvasScene$.get();
		setScene({
			...scene,
			elements: { ...scene.elements, [this.element.id]: this.element },
			selection: [this.element.id],
		});
	}

	undo(): void {
		const scene = canvasScene$.get();
		const elements = { ...scene.elements };
		delete elements[this.element.id];
		setScene({
			...scene,
			elements,
			selection: scene.selection.filter((id) => id !== this.element.id),
		});
	}
}

export class DeleteElementsCommand implements Command {
	private readonly removed: CanvasElement[];
	private readonly prevSelection: string[];

	constructor(ids: string[]) {
		const scene = canvasScene$.get();
		this.prevSelection = [...scene.selection];
		this.removed = ids
			.map((id) => scene.elements[id])
			.filter((el): el is CanvasElement => el !== undefined && !el.locked);
	}

	execute(): void {
		if (this.removed.length === 0) return;
		const scene = canvasScene$.get();
		const elements = { ...scene.elements };
		const removedIds = new Set(this.removed.map((el) => el.id));
		for (const id of removedIds) delete elements[id];
		setScene({
			...scene,
			elements,
			selection: scene.selection.filter((id) => !removedIds.has(id)),
		});
	}

	undo(): void {
		if (this.removed.length === 0) return;
		const scene = canvasScene$.get();
		const elements = { ...scene.elements };
		for (const el of this.removed) elements[el.id] = el;
		setScene({
			...scene,
			elements,
			selection: this.prevSelection.filter((id) => id in elements),
		});
	}
}

export class UpdateElementsCommand implements Command {
	constructor(
		private readonly before: Record<string, ElementPatch>,
		private readonly after: Record<string, ElementPatch>,
	) {}

	execute(): void {
		applyElementPatches(this.after);
	}

	undo(): void {
		applyElementPatches(this.before);
	}
}

export class ReorderElementCommand implements Command {
	private readonly beforeZ: number;
	private readonly afterZ: number;

	constructor(
		private readonly elementId: string,
		direction: "up" | "down",
	) {
		const scene = canvasScene$.get();
		const current = scene.elements[elementId];
		this.beforeZ = current?.zIndex ?? 0;
		this.afterZ = direction === "up" ? this.beforeZ + 1 : this.beforeZ - 1;
	}

	execute(): void {
		this.applyZ(this.afterZ);
	}

	undo(): void {
		this.applyZ(this.beforeZ);
	}

	private applyZ(zIndex: number): void {
		const scene = canvasScene$.get();
		const el = scene.elements[this.elementId];
		if (!el) return;
		setScene({
			...scene,
			elements: {
				...scene.elements,
				[this.elementId]: { ...el, zIndex },
			},
		});
	}
}

export class ResizeCanvasCommand implements Command {
	constructor(
		private readonly before: { width: number; height: number; formatId: string },
		private readonly after: { width: number; height: number; formatId: string },
	) {}

	execute(): void {
		this.apply(this.after);
	}

	undo(): void {
		this.apply(this.before);
	}

	private apply(size: { width: number; height: number; formatId: string }): void {
		const scene = canvasScene$.get();
		setScene({
			...scene,
			canvas: {
				...scene.canvas,
				width: size.width,
				height: size.height,
				formatId: size.formatId,
			},
		});
	}
}

export class SetCanvasBackgroundCommand implements Command {
	constructor(
		private readonly beforeColor: string,
		private readonly afterColor: string,
	) {}

	execute(): void {
		this.apply(this.afterColor);
	}

	undo(): void {
		this.apply(this.beforeColor);
	}

	private apply(backgroundColor: string): void {
		const scene = canvasScene$.get();
		setScene({
			...scene,
			canvas: {
				...scene.canvas,
				backgroundColor,
			},
		});
	}
}

export function snapshotPatches(
	scene: SceneState,
	ids: string[],
	fields: (keyof ElementPatch)[],
): Record<string, ElementPatch> {
	const patches: Record<string, ElementPatch> = {};
	for (const id of ids) {
		const el = scene.elements[id];
		if (!el) continue;
		const patch: ElementPatch = {};
		for (const field of fields) {
			const value = el[field];
			if (value !== undefined) {
				(patch as Record<string, unknown>)[field] = value;
			}
		}
		patches[id] = patch;
	}
	return patches;
}
