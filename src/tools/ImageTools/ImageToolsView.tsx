import { useCallback, useRef, useState } from "react";
import { useStore } from "@nanostores/react";
import {
	Upload,
	Download,
	X,
	Scissors,
	SlidersHorizontal,
	FileOutput,
	Loader2,
	ArrowLeft,
} from "lucide-react";
import {
	$sourceFile,
	$sourceUrl,
	$sourceDimensions,
	$resultUrl,
	$resultBlob,
	$activeOperation,
	$processing,
	$progress,
	$progressLabel,
	$error,
	$outputFormat,
	$quality,
	setSource,
	clearAll,
	clearResult,
} from "./store";
import { useImageProcessor } from "./hooks/useImageProcessor";
import { useBgRemoval } from "./hooks/useBgRemoval";
import {
	ACCEPTED_EXTENSIONS,
	formatFileSize,
	type OperationType,
	type OutputFormat,
} from "./domain";

const OPERATIONS: { id: OperationType; label: string; icon: typeof Upload }[] = [
	{ id: "convert", label: "Converter", icon: FileOutput },
	{ id: "compress", label: "Comprimir", icon: SlidersHorizontal },
	{ id: "bg-removal", label: "Remover Fundo", icon: Scissors },
];

export default function ImageToolsView() {
	const sourceFile = useStore($sourceFile);
	const sourceUrl = useStore($sourceUrl);
	const sourceDimensions = useStore($sourceDimensions);
	const resultUrl = useStore($resultUrl);
	const resultBlob = useStore($resultBlob);
	const activeOperation = useStore($activeOperation);
	const processing = useStore($processing);
	const progress = useStore($progress);
	const progressLabel = useStore($progressLabel);
	const error = useStore($error);
	const outputFormat = useStore($outputFormat);
	const quality = useStore($quality);

	const { convert, compress } = useImageProcessor();
	const { removeBackground } = useBgRemoval();
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleFileSelect = useCallback((files: FileList | null) => {
		const file = files?.[0];
		if (!file) return;
		setSource(file);
	}, []);

	const handleDrop = useCallback(
		(e: React.DragEvent) => {
			e.preventDefault();
			handleFileSelect(e.dataTransfer.files);
		},
		[handleFileSelect],
	);

	const handleDownload = useCallback(() => {
		if (!resultBlob || !resultUrl) return;
		if (!sourceFile) return;
		const a = document.createElement("a");
		a.href = resultUrl;
		const originalName = sourceFile.name;
		const dotIdx = originalName.lastIndexOf(".");
		const baseName = dotIdx > 0 ? originalName.slice(0, dotIdx) : originalName;
		const ext = activeOperation === "convert" ? outputFormat : (dotIdx > 0 ? originalName.slice(dotIdx + 1) : "png");
		const suffix =
			activeOperation === "convert" ? "convertido" : activeOperation === "compress" ? "comprimido" : "sem_fundo";
		a.download = `${baseName}_${suffix}.${ext}`;
		a.click();
	}, [resultBlob, resultUrl, activeOperation, outputFormat, sourceFile]);

	const handleExecute = useCallback(async () => {
		if (!sourceFile) return;

		switch (activeOperation) {
			case "convert":
				await convert(sourceFile, outputFormat, quality);
				break;
			case "compress":
				await compress(sourceFile, quality);
				break;
			case "bg-removal":
				removeBackground(sourceFile);
				break;
		}
	}, [sourceFile, activeOperation, outputFormat, quality, convert, compress, removeBackground]);

	if (!sourceFile || !sourceUrl) {
		return <UploadZone onFileSelect={handleFileSelect} onDrop={handleDrop} fileInputRef={fileInputRef} />;
	}

	return (
		<div className="flex flex-col gap-4 w-full">
			{/* Header */}
			<div className="flex items-center justify-between gap-3 flex-wrap">
				<button
					onClick={clearAll}
					className="flex items-center gap-1.5 text-sm text-[var(--text)] hover:text-[var(--headline)] transition-colors cursor-pointer"
				>
					<ArrowLeft className="w-4 h-4" />
					Nova imagem
				</button>
				<div className="flex items-center gap-2 text-xs text-[var(--text)]">
					<span>{sourceFile.name}</span>
					<span className="opacity-50">|</span>
					<span>{formatFileSize(sourceFile.size)}</span>
					{sourceDimensions && (
						<>
							<span className="opacity-50">|</span>
							<span>
								{sourceDimensions.width}x{sourceDimensions.height}
							</span>
						</>
					)}
				</div>
			</div>

			{/* Preview */}
			<div className="relative bg-[var(--background)] border border-[var(--card-border)]/30 rounded-lg overflow-hidden min-h-48">
				<div className="checkered-bg absolute inset-0" />
				{resultUrl ? (
					<div className="relative flex flex-col lg:flex-row gap-2 p-2">
						<div className="relative flex-1 flex items-center justify-center bg-black/10 rounded-md overflow-hidden min-h-48 max-h-[50vh]">
							<img src={sourceUrl} alt="Original" className="max-w-full max-h-[50vh] object-contain" />
							<span className="absolute top-2 left-2 text-[10px] bg-black/50 text-white px-1.5 py-0.5 rounded">
								Original
							</span>
						</div>
						<div className="relative flex-1 flex items-center justify-center bg-black/10 rounded-md overflow-hidden min-h-48 max-h-[50vh]">
							<img src={resultUrl} alt="Resultado" className="max-w-full max-h-[50vh] object-contain" />
							<span className="absolute top-2 left-2 text-[10px] bg-black/50 text-white px-1.5 py-0.5 rounded">
								Resultado
							</span>
						</div>
					</div>
				) : (
					<img
						src={sourceUrl}
						alt="Original"
						className="relative max-w-full max-h-[50vh] object-contain mx-auto"
					/>
				)}
			</div>

			{/* Progress bar */}
			{processing && (
				<div className="space-y-1.5">
					<div className="flex items-center justify-between text-xs text-[var(--text)]">
						<span className="flex items-center gap-1.5">
							<Loader2 className="w-3.5 h-3.5 animate-spin text-[var(--primary)]" />
							{progressLabel}
						</span>
						<span>{progress}%</span>
					</div>
					<div className="h-1.5 bg-[var(--background)] rounded-full overflow-hidden">
						<div
							className="h-full bg-[var(--primary)] rounded-full transition-all duration-300"
							style={{ width: `${progress}%` }}
						/>
					</div>
				</div>
			)}

			{/* Error */}
			{error && (
				<div className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2 flex items-center justify-between">
					<span>{error}</span>
					<button onClick={() => $error.set(null)} className="cursor-pointer">
						<X className="w-4 h-4" />
					</button>
				</div>
			)}

			{/* Result info + download */}
			{resultBlob && (
				<div className="flex items-center justify-between bg-emerald-400/10 border border-emerald-400/20 rounded-lg px-3 py-2">
					<div className="text-sm text-emerald-400">
						<div>Resultado: {formatFileSize(resultBlob.size)}</div>
						{sourceFile && (
							<div className="text-xs text-emerald-400/80">
								{buildSizeDiffLabel(sourceFile.size, resultBlob.size)}
							</div>
						)}
					</div>
					<button
						onClick={handleDownload}
						className="flex items-center gap-1.5 text-sm font-medium text-[var(--primary)] hover:text-[var(--headline)] transition-colors cursor-pointer"
					>
						<Download className="w-4 h-4" />
						Baixar
					</button>
				</div>
			)}

			{/* Operations */}
			<div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
				{OPERATIONS.map((op) => {
					const Icon = op.icon;
					const isActive = activeOperation === op.id;
					return (
						<button
							key={op.id}
							type="button"
							disabled={processing}
							onClick={() => {
								$activeOperation.set(isActive ? null : op.id);
								clearResult();
							}}
							className={`cursor-pointer flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all border ${
								isActive
									? "bg-[var(--primary)]/15 border-[var(--primary)]/40 text-[var(--primary)]"
									: "bg-[var(--card-bg)] border-[var(--card-border)]/30 text-[var(--card-text)] hover:border-[var(--primary)]/30 hover:text-[var(--headline)]"
							} disabled:opacity-40 disabled:cursor-not-allowed`}
						>
							<Icon className="w-4 h-4 flex-shrink-0" />
							{op.label}
						</button>
					);
				})}
			</div>

			{/* Operation controls */}
			{activeOperation && (
				<div className="bg-[var(--card-bg)] border border-[var(--card-border)]/30 rounded-lg p-4 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
					{activeOperation === "convert" && (
						<ConvertControls format={outputFormat} quality={quality} />
					)}
					{activeOperation === "compress" && <CompressControls quality={quality} />}
					{activeOperation === "bg-removal" && <BgRemovalInfo />}

					<button
						disabled={processing}
						onClick={handleExecute}
						type="button"
						className="cursor-pointer w-full py-2.5 rounded-lg font-medium text-sm bg-[var(--primary)] text-[var(--primary-text)] hover:brightness-110 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
					>
						{processing ? (
							<span className="flex items-center justify-center gap-2">
								<Loader2 className="w-4 h-4 animate-spin" />
								Processando...
							</span>
						) : (
							"Aplicar"
						)}
					</button>
				</div>
			)}
		</div>
	);
}

/* ---- Sub-components ---- */

function UploadZone({
	onFileSelect,
	onDrop,
	fileInputRef,
}: {
	onFileSelect: (files: FileList | null) => void;
	onDrop: (e: React.DragEvent) => void;
	fileInputRef: React.RefObject<HTMLInputElement | null>;
}) {
	const [dragOver, setDragOver] = useState(false);

	return (
		<div
			onDragOver={(e) => {
				e.preventDefault();
				setDragOver(true);
			}}
			onDragLeave={() => setDragOver(false)}
			onDrop={(e) => {
				setDragOver(false);
				onDrop(e);
			}}
			onClick={() => fileInputRef.current?.click()}
			className={`cursor-pointer flex flex-col items-center justify-center gap-4 py-16 px-8 border-2 border-dashed rounded-xl transition-all duration-200 ${
				dragOver
					? "border-[var(--primary)] bg-[var(--primary)]/10"
					: "border-[var(--card-border)] hover:border-[var(--primary)]/50 hover:bg-[var(--card-bg)]/50"
			}`}
		>
			<div className="w-16 h-16 rounded-2xl bg-[var(--primary)]/10 flex items-center justify-center">
				<Upload className="w-8 h-8 text-[var(--primary)]" />
			</div>
			<div className="text-center">
				<p className="text-[var(--headline)] font-medium mb-1">Arraste uma imagem ou clique para selecionar</p>
				<p className="text-sm text-[var(--text)]/60">PNG, JPEG, WebP, GIF, BMP, TIFF, AVIF</p>
			</div>
			<input
				ref={fileInputRef}
				type="file"
				accept={ACCEPTED_EXTENSIONS}
				className="hidden"
				onChange={(e) => onFileSelect(e.target.files)}
			/>
		</div>
	);
}

function Label({ children }: { children: React.ReactNode }) {
	return <span className="block text-xs font-medium text-[var(--text)] mb-1">{children}</span>;
}

function ConvertControls({ format, quality }: { format: OutputFormat; quality: number }) {
	return (
		<div className="space-y-3">
			<div>
				<Label>Formato de saida</Label>
				<div className="flex flex-wrap gap-2">
					{(["png", "jpeg", "webp", "avif", "bmp", "gif"] as OutputFormat[]).map((f) => (
						<button
							key={f}
							type="button"
							onClick={() => $outputFormat.set(f)}
							className={`cursor-pointer px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
								format === f
									? "bg-[var(--primary)]/15 border-[var(--primary)]/40 text-[var(--primary)]"
									: "border-[var(--card-border)] text-[var(--card-text)] hover:border-[var(--primary)]/30"
							}`}
						>
							{f.toUpperCase()}
						</button>
					))}
				</div>
			</div>
			{(format === "jpeg" || format === "webp") && (
				<div>
					<Label>Qualidade: {quality}%</Label>
					<input
						type="range"
						min={1}
						max={100}
						value={quality}
						onChange={(e) => $quality.set(Number(e.target.value))}
						className="w-full accent-[var(--primary)]"
					/>
				</div>
			)}
		</div>
	);
}

function CompressControls({ quality }: { quality: number }) {
	return (
		<div>
			<Label>Qualidade: {quality}%</Label>
			<input
				type="range"
				min={1}
				max={100}
				value={quality}
				onChange={(e) => $quality.set(Number(e.target.value))}
				className="w-full accent-[var(--primary)]"
			/>
			<div className="flex justify-between text-[10px] text-[var(--text)]/50 mt-1">
				<span>Menor arquivo</span>
				<span>Maior qualidade</span>
			</div>
		</div>
	);
}

function BgRemovalInfo() {
	return (
		<div className="text-sm text-[var(--text)] space-y-2">
			<p>
				Remove o fundo da imagem usando IA diretamente no navegador.
			</p>
			<p className="text-xs text-[var(--text)]/60">
				Na primeira execucao, o modelo (~30MB) sera baixado e armazenado em cache pelo navegador.
			</p>
		</div>
	);
}

function buildSizeDiffLabel(originalBytes: number, resultBytes: number): string {
	if (originalBytes <= 0) return "";

	const diff = resultBytes - originalBytes;
	const diffAbs = Math.abs(diff);
	const pct = (diffAbs / originalBytes) * 100;
	const pctLabel = pct >= 0.1 ? `${pct.toFixed(1)}%` : "<0.1%";

	if (diff === 0) return "Mesmo tamanho que o original";

	if (diff < 0) {
		return `Economia: ${formatFileSize(diffAbs)} (${pctLabel})`;
	}

	return `Aumento: ${formatFileSize(diffAbs)} (${pctLabel})`;
}
