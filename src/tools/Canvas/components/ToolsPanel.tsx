import { useStore } from "@nanostores/react";
import { ChevronDown, Download, ImagePlus, Pencil, Redo2, Shapes, Type, Undo2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toolBtnGhostClass, toolBtnPrimaryClass, toolIconBtnClass, toolLabelClass, toolPanelClass } from "@/lib/toolUi";
import { exportStagePng } from "../engine/exporter";
import { AddElementCommand, history } from "../engine/history";
import { type GeometryShapeType, SHAPE_MENU } from "../shapes";
import { canvasScene$, createElement, ELEMENT_WARN_COUNT, editorTool$, MAX_IMAGE_BYTES, setEditorTool } from "../store";
import type { CanvasStageHandle } from "./Stage";

interface ToolsPanelProps {
	stageHandleRef: React.RefObject<CanvasStageHandle | null>;
	onNotice: (message: string) => void;
}

export function ToolsPanel({ stageHandleRef, onNotice }: ToolsPanelProps) {
	const editorTool = useStore(editorTool$);
	const fileRef = useRef<HTMLInputElement>(null);
	const shapesMenuRef = useRef<HTMLDivElement>(null);
	const [shapesOpen, setShapesOpen] = useState(false);
	const [, setTick] = useState(0);

	useEffect(() => history.subscribe(() => setTick((n) => n + 1)), []);

	useEffect(() => {
		if (!shapesOpen) return;
		function onPointerDown(e: MouseEvent) {
			if (!shapesMenuRef.current?.contains(e.target as Node)) {
				setShapesOpen(false);
			}
		}
		document.addEventListener("mousedown", onPointerDown);
		return () => document.removeEventListener("mousedown", onPointerDown);
	}, [shapesOpen]);

	function addShape(type: GeometryShapeType | "text") {
		setEditorTool("select");
		const element = createElement(type);
		history.dispatch(new AddElementCommand(element));
		const count = Object.keys(canvasScene$.get().elements).length;
		if (count > ELEMENT_WARN_COUNT) {
			onNotice(`Mais de ${ELEMENT_WARN_COUNT} elementos: a performance pode cair.`);
		}
	}

	function handleExport() {
		const handle = stageHandleRef.current;
		const stage = handle?.getStage();
		if (!stage || !handle) {
			onNotice("Canvas ainda não está pronto.");
			return;
		}
		exportStagePng(stage, { hideNodes: handle.getOverlayNodes() });
	}

	function handleFileChange(fileList: FileList | null) {
		const file = fileList?.[0];
		if (!file) return;
		setEditorTool("select");
		if (file.size > MAX_IMAGE_BYTES) {
			onNotice("Imagem maior que 4 MB. Escolha um arquivo menor.");
			if (fileRef.current) fileRef.current.value = "";
			return;
		}

		const reader = new FileReader();
		reader.onload = () => {
			const src = typeof reader.result === "string" ? reader.result : "";
			if (!src) {
				onNotice("Não foi possível ler a imagem.");
				return;
			}
			const img = new window.Image();
			img.onload = () => {
				const maxSide = 480;
				const ratio = Math.min(1, maxSide / Math.max(img.width, img.height));
				const element = createElement("image", {
					src,
					width: Math.max(1, Math.round(img.width * ratio)),
					height: Math.max(1, Math.round(img.height * ratio)),
				});
				history.dispatch(new AddElementCommand(element));
			};
			img.onerror = () => onNotice("Não foi possível carregar a imagem.");
			img.src = src;
		};
		reader.onerror = () => onNotice("Não foi possível ler a imagem.");
		reader.readAsDataURL(file);
		if (fileRef.current) fileRef.current.value = "";
	}

	const drawActive = editorTool === "draw";

	return (
		<div className={`${toolPanelClass} flex flex-col gap-md`}>
			<div className="flex flex-col gap-3xs">
				<span className={toolLabelClass}>Adicionar</span>
				<div className="grid grid-cols-2 gap-2xs">
					<div ref={shapesMenuRef} className="relative">
						<button
							type="button"
							className={`${toolBtnGhostClass} w-full`}
							aria-expanded={shapesOpen}
							aria-haspopup="menu"
							onClick={() => setShapesOpen((open) => !open)}
						>
							<Shapes className="size-4" strokeWidth={2} />
							Formas
							<ChevronDown className="size-3.5 opacity-70" strokeWidth={2} />
						</button>
						{shapesOpen && (
							<div
								role="menu"
								className="absolute top-full left-0 z-20 mt-3xs max-h-64 min-w-full overflow-y-auto rounded-input border border-rule bg-paper shadow-sm"
							>
								{SHAPE_MENU.map((item) => (
									<button
										key={item.type}
										type="button"
										role="menuitem"
										className="flex w-full items-center gap-2xs px-sm py-2 text-left text-sm text-ink hover:bg-accent-bg"
										onClick={() => {
											addShape(item.type);
											setShapesOpen(false);
										}}
									>
										{item.label}
									</button>
								))}
							</div>
						)}
					</div>

					<button
						type="button"
						className={[toolBtnGhostClass, drawActive ? "border-accent-muted bg-accent-bg text-accent" : ""].join(" ")}
						aria-pressed={drawActive}
						onClick={() => setEditorTool(drawActive ? "select" : "draw")}
					>
						<Pencil className="size-4" strokeWidth={2} />
						Desenhar
					</button>

					<button type="button" className={toolBtnGhostClass} onClick={() => addShape("text")}>
						<Type className="size-4" strokeWidth={2} />
						Texto
					</button>
					<button
						type="button"
						className={toolBtnGhostClass}
						onClick={() => {
							setEditorTool("select");
							fileRef.current?.click();
						}}
					>
						<ImagePlus className="size-4" strokeWidth={2} />
						Imagem
					</button>
				</div>
				<input
					ref={fileRef}
					type="file"
					accept="image/*"
					className="hidden"
					onChange={(e) => handleFileChange(e.target.files)}
				/>
				{drawActive && (
					<p className="m-0 text-xs text-muted">Arraste no canvas para desenhar. Clique de novo para sair.</p>
				)}
			</div>

			<div className="flex flex-col gap-3xs">
				<span className={toolLabelClass}>Histórico</span>
				<div className="flex gap-2xs">
					<button
						type="button"
						className={`${toolIconBtnClass} border border-rule`}
						aria-label="Desfazer"
						disabled={!history.canUndo()}
						onClick={() => history.undo()}
					>
						<Undo2 className="size-4" strokeWidth={2} />
					</button>
					<button
						type="button"
						className={`${toolIconBtnClass} border border-rule`}
						aria-label="Refazer"
						disabled={!history.canRedo()}
						onClick={() => history.redo()}
					>
						<Redo2 className="size-4" strokeWidth={2} />
					</button>
				</div>
			</div>

			<button type="button" className={`${toolBtnPrimaryClass} w-full`} onClick={handleExport}>
				<Download className="size-4" strokeWidth={2} />
				Exportar PNG
			</button>
		</div>
	);
}
