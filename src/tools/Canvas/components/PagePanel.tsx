import { useStore } from "@nanostores/react";
import { ChevronDown } from "lucide-react";
import { useRef } from "react";
import { toolInputClass, toolLabelClass, toolPanelClass } from "@/lib/toolUi";
import { history, ResizeCanvasCommand, SetCanvasBackgroundCommand } from "../engine/history";
import { CANVAS_FORMATS, formatById, matchFormatId } from "../formats";
import { canvasScene$, isTransparentBackground, TRANSPARENT_BACKGROUND } from "../store";

export function PagePanel() {
	const scene = useStore(canvasScene$);
	const lastSolidColorRef = useRef(
		isTransparentBackground(scene.canvas.backgroundColor) ? "#ffffff" : scene.canvas.backgroundColor,
	);

	const formatValue = formatById(scene.canvas.formatId)?.id ?? matchFormatId(scene.canvas.width, scene.canvas.height);
	const currentFormat = formatById(formatValue);
	const formatSummary = currentFormat
		? `${currentFormat.label} (${currentFormat.width}x${currentFormat.height})`
		: `Personalizado (${scene.canvas.width}x${scene.canvas.height})`;

	const transparent = isTransparentBackground(scene.canvas.backgroundColor);
	const solidColor = transparent
		? lastSolidColorRef.current.startsWith("#")
			? lastSolidColorRef.current
			: "#ffffff"
		: scene.canvas.backgroundColor.startsWith("#")
			? scene.canvas.backgroundColor
			: "#ffffff";

	function handleFormatChange(formatId: string) {
		if (formatId === "custom") return;
		const format = formatById(formatId);
		if (!format) return;
		if (format.width === scene.canvas.width && format.height === scene.canvas.height) return;

		history.dispatch(
			new ResizeCanvasCommand(
				{
					width: scene.canvas.width,
					height: scene.canvas.height,
					formatId: scene.canvas.formatId,
				},
				{
					width: format.width,
					height: format.height,
					formatId: format.id,
				},
			),
		);
	}

	function setBackground(color: string) {
		if (color === scene.canvas.backgroundColor) return;
		if (!isTransparentBackground(color) && color.startsWith("#")) {
			lastSolidColorRef.current = color;
		}
		history.dispatch(new SetCanvasBackgroundCommand(scene.canvas.backgroundColor, color));
	}

	return (
		<div className={`${toolPanelClass} flex flex-col gap-md`}>
			<label className="flex flex-col gap-3xs">
				<span className={toolLabelClass}>Formato</span>
				<span className="relative block">
					<span aria-hidden className={`${toolInputClass} pointer-events-none relative flex items-center pr-10`}>
						<span className="truncate text-ink">{formatSummary}</span>
						<ChevronDown
							className="pointer-events-none absolute top-1/2 right-sm size-4 -translate-y-1/2 text-muted"
							strokeWidth={2}
						/>
					</span>
					<select
						className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
						value={formatValue}
						onChange={(e) => handleFormatChange(e.target.value)}
						aria-label="Formato da página"
					>
						{CANVAS_FORMATS.map((format) => (
							<option key={format.id} value={format.id}>
								{format.label} ({format.width}x{format.height})
							</option>
						))}
						{formatValue === "custom" && (
							<option value="custom">
								Personalizado ({scene.canvas.width}x{scene.canvas.height})
							</option>
						)}
					</select>
				</span>
			</label>

			<div className="flex flex-col gap-sm">
				<span className={toolLabelClass}>Fundo</span>

				<label className="flex cursor-pointer items-center gap-2xs text-sm text-ink">
					<input
						type="checkbox"
						className="size-4 accent-accent"
						checked={transparent}
						onChange={(e) => {
							if (e.target.checked) {
								setBackground(TRANSPARENT_BACKGROUND);
							} else {
								setBackground(lastSolidColorRef.current.startsWith("#") ? lastSolidColorRef.current : "#ffffff");
							}
						}}
					/>
					Fundo transparente
				</label>

				<label className={`flex flex-col gap-3xs ${transparent ? "opacity-50" : ""}`}>
					<span className="text-sm text-muted">Cor de fundo</span>
					<input
						type="color"
						className={`${toolInputClass} h-10 cursor-pointer p-1 disabled:cursor-not-allowed`}
						value={solidColor}
						disabled={transparent}
						onChange={(e) => setBackground(e.target.value)}
						aria-label="Cor de fundo da página"
					/>
				</label>
			</div>
		</div>
	);
}
