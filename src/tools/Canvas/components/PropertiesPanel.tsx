import { useStore } from "@nanostores/react";
import { AlignCenter, AlignLeft, AlignRight, ArrowDownToLine, ArrowUpToLine, MoveVertical } from "lucide-react";
import { toolBtnGhostClass, toolInputClass, toolLabelClass, toolPanelClass } from "@/lib/toolUi";
import { history, snapshotPatches, UpdateElementsCommand } from "../engine/history";
import { isFillableShape, shapeLabel } from "../shapes";
import { alignSelection, canvasScene$ } from "../store";
import type { AlignAxis, CanvasElement, ElementPatch } from "../types";

function selectedElements(scene: ReturnType<typeof canvasScene$.get>): CanvasElement[] {
	return scene.selection.map((id) => scene.elements[id]).filter((el): el is CanvasElement => Boolean(el));
}

function commitPatch(ids: string[], after: Record<string, ElementPatch>): void {
	const scene = canvasScene$.get();
	const fields = Object.keys(Object.values(after)[0] ?? {}) as (keyof ElementPatch)[];
	const before = snapshotPatches(scene, ids, fields);
	history.dispatch(new UpdateElementsCommand(before, after));
}

export function PropertiesPanel() {
	const scene = useStore(canvasScene$);
	const selected = selectedElements(scene);
	const primary = selected[0];

	if (!primary) {
		return (
			<div className={toolPanelClass}>
				<p className="m-0 text-sm text-muted">Selecione um elemento para editar propriedades.</p>
			</div>
		);
	}

	const multi = selected.length > 1;
	const ids = selected.map((el) => el.id);

	function patchAll(patch: ElementPatch): void {
		const after: Record<string, ElementPatch> = {};
		for (const id of ids) after[id] = patch;
		commitPatch(ids, after);
	}

	function align(axis: AlignAxis): void {
		const patches = alignSelection(axis);
		if (!patches) return;
		commitPatch(Object.keys(patches), patches);
	}

	return (
		<div className={`${toolPanelClass} flex flex-col gap-sm`}>
			<p className="m-0 font-mono text-xs uppercase tracking-label text-muted">
				{multi ? `${selected.length} selecionados` : shapeLabel(primary.type)}
			</p>

			<label className="flex flex-col gap-3xs">
				<span className={toolLabelClass}>Preenchimento</span>
				<input
					type="color"
					className={`${toolInputClass} h-10 p-1`}
					value={primary.fill?.startsWith("#") ? primary.fill : "#1a2330"}
					disabled={primary.type === "path" || primary.type === "line"}
					onChange={(e) => patchAll({ fill: e.target.value })}
				/>
			</label>

			{(isFillableShape(primary.type) || primary.type === "path" || primary.type === "line") && (
				<>
					<label className="flex flex-col gap-3xs">
						<span className={toolLabelClass}>Contorno</span>
						<input
							type="color"
							className={`${toolInputClass} h-10 p-1`}
							value={primary.stroke?.startsWith("#") ? primary.stroke : "#1a2330"}
							onChange={(e) => patchAll({ stroke: e.target.value })}
						/>
					</label>
					<label className="flex flex-col gap-3xs">
						<span className={toolLabelClass}>Espessura</span>
						<input
							type="number"
							min={0}
							max={40}
							className={toolInputClass}
							value={primary.strokeWidth ?? 0}
							onChange={(e) => patchAll({ strokeWidth: Number(e.target.value) || 0 })}
						/>
					</label>
				</>
			)}

			<label className="flex flex-col gap-3xs">
				<span className={toolLabelClass}>Opacidade</span>
				<input
					type="range"
					min={0}
					max={1}
					step={0.05}
					value={primary.opacity}
					onChange={(e) => patchAll({ opacity: Number(e.target.value) })}
				/>
			</label>

			{primary.type === "text" && !multi && (
				<label className="flex flex-col gap-3xs">
					<span className={toolLabelClass}>Conteúdo</span>
					<input
						type="text"
						className={toolInputClass}
						value={primary.content ?? ""}
						onChange={(e) => commitPatch([primary.id], { [primary.id]: { content: e.target.value } })}
					/>
				</label>
			)}

			<div className="flex flex-col gap-3xs">
				<span className={toolLabelClass}>Alinhar no canvas</span>
				<div className="flex flex-wrap gap-2xs">
					<button type="button" className={toolBtnGhostClass} aria-label="Esquerda" onClick={() => align("left")}>
						<AlignLeft className="size-4" strokeWidth={2} />
					</button>
					<button type="button" className={toolBtnGhostClass} aria-label="Centro" onClick={() => align("center")}>
						<AlignCenter className="size-4" strokeWidth={2} />
					</button>
					<button type="button" className={toolBtnGhostClass} aria-label="Direita" onClick={() => align("right")}>
						<AlignRight className="size-4" strokeWidth={2} />
					</button>
					<button type="button" className={toolBtnGhostClass} aria-label="Topo" onClick={() => align("top")}>
						<ArrowUpToLine className="size-4" strokeWidth={2} />
					</button>
					<button type="button" className={toolBtnGhostClass} aria-label="Meio" onClick={() => align("middle")}>
						<MoveVertical className="size-4" strokeWidth={2} />
					</button>
					<button type="button" className={toolBtnGhostClass} aria-label="Base" onClick={() => align("bottom")}>
						<ArrowDownToLine className="size-4" strokeWidth={2} />
					</button>
				</div>
			</div>
		</div>
	);
}
