import { useCallback, useEffect, useRef, useState } from "react";
import { useStore } from "@nanostores/react";
import { Upload, Download, X, Scissors, SlidersHorizontal, FileOutput, Loader2, ArrowLeft, ImagePlus } from "lucide-react";
import {
	$sourceFile,
	$sourceUrl,
	$sourceDimensions,
	$sourceHasAlpha,
	$sourceLoading,
	$resultUrl,
	$resultBlob,
	$activeOperation,
	$processing,
	$progress,
	$progressLabel,
	$error,
	$outputFormat,
	$quality,
	$compressMaxWidth,
	$supportedFormats,
	$modelPreloadStatus,
	$modelPreloadProgress,
	setSource,
	setSourceFromBlob,
	clearAll,
	clearResult,
	cancelProcessing,
} from "./store";
import { useImageProcessor } from "./hooks/useImageProcessor";
import { useBgRemoval } from "./hooks/useBgRemoval";
import { detectFormatSupport, isFormatSupported } from "./formatSupport";
import {
	ACCEPTED_EXTENSIONS,
	ACCEPTED_FORMATS_LABEL,
	MAX_DIMENSION,
	MAX_FILE_BYTES,
	COMPRESS_MAX_WIDTH_OPTIONS,
	buildDownloadFilename,
	buildSizeDiffLabel,
	formatFileSize,
	type OperationType,
	type OutputFormat,
	type ModelPreloadStatus,
} from "./domain";

const OPERATIONS: { id: OperationType; label: string; icon: typeof Upload }[] = [
	{ id: "convert", label: "Converter", icon: FileOutput },
	{ id: "compress", label: "Comprimir", icon: SlidersHorizontal },
	{ id: "bg-removal", label: "Remover Fundo", icon: Scissors },
];

const CONVERT_FORMATS: OutputFormat[] = ["png", "jpeg", "webp", "avif", "bmp"];

const PROGRESS_BAR_CLASS =
	"block w-full h-1.5 appearance-none overflow-hidden rounded-full bg-[var(--background)] [&::-webkit-progress-bar]:rounded-full [&::-webkit-progress-bar]:bg-[var(--background)] [&::-webkit-progress-value]:rounded-full [&::-webkit-progress-value]:bg-[var(--primary)] transition-all duration-300 [&::-moz-progress-bar]:rounded-full [&::-moz-progress-bar]:bg-[var(--primary)]";

const PRELOAD_PROGRESS_BAR_CLASS =
	"block w-full h-1 appearance-none overflow-hidden rounded-full bg-[var(--card-border)]/30 [&::-webkit-progress-bar]:rounded-full [&::-webkit-progress-bar]:bg-[var(--card-border)]/30 [&::-webkit-progress-value]:rounded-full [&::-webkit-progress-value]:bg-[var(--primary)]/70 [&::-moz-progress-bar]:rounded-full [&::-moz-progress-bar]:bg-[var(--primary)]/70";

export default function ImageToolsView() {
	const sourceFile = useStore($sourceFile);
	const sourceUrl = useStore($sourceUrl);
	const sourceDimensions = useStore($sourceDimensions);
	const sourceHasAlpha = useStore($sourceHasAlpha);
	const sourceLoading = useStore($sourceLoading);
	const resultUrl = useStore($resultUrl);
	const resultBlob = useStore($resultBlob);
	const activeOperation = useStore($activeOperation);
	const processing = useStore($processing);
	const progress = useStore($progress);
	const progressLabel = useStore($progressLabel);
	const error = useStore($error);
	const outputFormat = useStore($outputFormat);
	const quality = useStore($quality);
	const compressMaxWidth = useStore($compressMaxWidth);
	const supportedFormats = useStore($supportedFormats);
	const modelPreloadStatus = useStore($modelPreloadStatus);
	const modelPreloadProgress = useStore($modelPreloadProgress);

	const { convert, compress } = useImageProcessor();
	const { removeBackground, cancelBgRemoval, retryPreload } = useBgRemoval();
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [resultAnnouncement, setResultAnnouncement] = useState("");

	const isBgRemovalLoading = modelPreloadStatus === "loading";
	const canRunBgRemoval = modelPreloadStatus === "ready" || modelPreloadStatus === "error";
	const isApplyDisabled =
		processing || (activeOperation === "bg-removal" && !canRunBgRemoval);

	useEffect(() => {
		detectFormatSupport().then((support) => {
			$supportedFormats.set(support);
			if (!isFormatSupported(support, $outputFormat.get())) {
				const fallback = CONVERT_FORMATS.find((f) => isFormatSupported(support, f)) ?? "png";
				$outputFormat.set(fallback);
			}
		});
	}, []);

	useEffect(() => {
		if (resultBlob && !processing) {
			setResultAnnouncement(`Processamento concluido. Arquivo resultante: ${formatFileSize(resultBlob.size)}.`);
		}
	}, [resultBlob, processing]);

	const handleFileSelect = useCallback(async (files: FileList | null) => {
		const file = files?.[0];
		if (!file) return;
		await setSource(file);
		if (fileInputRef.current) fileInputRef.current.value = "";
	}, []);

	const handleDrop = useCallback(
		(e: React.DragEvent) => {
			e.preventDefault();
			void handleFileSelect(e.dataTransfer.files);
		},
		[handleFileSelect],
	);

	const handleDownload = useCallback(() => {
		if (!resultBlob || !resultUrl || !sourceFile) return;

		const a = document.createElement("a");
		a.href = resultUrl;
		a.download = buildDownloadFilename(
			sourceFile.name,
			resultBlob,
			activeOperation ?? "convert",
			activeOperation === "convert" ? outputFormat : undefined,
		);
		a.click();
	}, [resultBlob, resultUrl, sourceFile, activeOperation, outputFormat]);

	const handleUseResultAsSource = useCallback(async () => {
		if (!resultBlob || !sourceFile || !activeOperation) return;

		const filename = buildDownloadFilename(
			sourceFile.name,
			resultBlob,
			activeOperation,
			activeOperation === "convert" ? outputFormat : undefined,
		);
		await setSourceFromBlob(resultBlob, filename);
	}, [resultBlob, sourceFile, activeOperation, outputFormat]);

	const handleCancel = useCallback(() => {
		if (activeOperation === "bg-removal") {
			cancelBgRemoval();
		} else {
			cancelProcessing();
		}
	}, [activeOperation, cancelBgRemoval]);

	const handleExecute = useCallback(async () => {
		if (!sourceFile) return;

		switch (activeOperation) {
			case "convert":
				await convert(sourceFile, outputFormat, quality);
				break;
			case "compress":
				await compress(sourceFile, quality, compressMaxWidth);
				break;
			case "bg-removal":
				removeBackground(sourceFile);
				break;
		}
	}, [sourceFile, activeOperation, outputFormat, quality, compressMaxWidth, convert, compress, removeBackground]);

	if (!sourceFile || !sourceUrl) {
		return (
			<div className="flex flex-col gap-4 w-full">
				<ModelPreloadBanner
					status={modelPreloadStatus}
					progress={modelPreloadProgress}
					onRetry={retryPreload}
				/>
				<UploadZone
					onFileSelect={handleFileSelect}
					onDrop={handleDrop}
					fileInputRef={fileInputRef}
					loading={sourceLoading}
					error={error}
				/>
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-4 w-full">
			<ModelPreloadBanner
				status={modelPreloadStatus}
				progress={modelPreloadProgress}
				onRetry={retryPreload}
			/>
			<div aria-live="polite" aria-atomic="true" className="sr-only">
				{resultAnnouncement}
			</div>

			<div className="flex items-center justify-between gap-3 flex-wrap">
				<button
					type="button"
					onClick={clearAll}
					className="flex items-center gap-1.5 text-sm text-[var(--text)] hover:text-[var(--headline)] transition-colors cursor-pointer"
				>
					<ArrowLeft className="w-4 h-4" aria-hidden="true" />
					Nova imagem
				</button>
				<div className="flex items-center gap-2 text-xs text-[var(--text)]">
					<span>{sourceFile.name}</span>
					<span className="opacity-50" aria-hidden="true">
						|
					</span>
					<span>{formatFileSize(sourceFile.size)}</span>
					{sourceDimensions && (
						<>
							<span className="opacity-50" aria-hidden="true">
								|
							</span>
							<span>
								{sourceDimensions.width}x{sourceDimensions.height}
							</span>
						</>
					)}
				</div>
			</div>

			<div className="relative bg-[var(--background)] border border-[var(--card-border)]/30 rounded-lg overflow-hidden min-h-48">
				<div className="checkered-bg absolute inset-0" aria-hidden="true" />
				{resultUrl ? (
					<div className="relative flex flex-col lg:flex-row gap-2 p-2">
						<div className="relative flex-1 flex items-center justify-center bg-black/10 rounded-md overflow-hidden min-h-48 max-h-[50vh]">
							<img src={sourceUrl} alt="Imagem original" className="max-w-full max-h-[50vh] object-contain" />
							<span className="absolute top-2 left-2 text-[10px] bg-black/50 text-white px-1.5 py-0.5 rounded">
								Original
							</span>
						</div>
						<div className="relative flex-1 flex items-center justify-center bg-black/10 rounded-md overflow-hidden min-h-48 max-h-[50vh]">
							<img src={resultUrl} alt="Imagem processada" className="max-w-full max-h-[50vh] object-contain" />
							<span className="absolute top-2 left-2 text-[10px] bg-black/50 text-white px-1.5 py-0.5 rounded">
								Resultado
							</span>
						</div>
					</div>
				) : (
					<img
						src={sourceUrl}
						alt="Imagem original"
						className="relative max-w-full max-h-[50vh] object-contain mx-auto"
					/>
				)}
			</div>

			{processing && (
				<div className="space-y-1.5">
					<div className="flex items-center justify-between text-xs text-[var(--text)]">
						<span className="flex items-center gap-1.5">
							<Loader2 className="w-3.5 h-3.5 animate-spin text-[var(--primary)]" aria-hidden="true" />
							{progressLabel}
						</span>
						<span>{progress}%</span>
					</div>
					<progress
						value={progress}
						max={100}
						aria-label={progressLabel || "Progresso do processamento"}
						className={PROGRESS_BAR_CLASS}
					/>
					<button
						type="button"
						onClick={handleCancel}
						className="text-xs text-[var(--text)] hover:text-[var(--headline)] transition-colors cursor-pointer"
					>
						Cancelar
					</button>
				</div>
			)}

			{error && (
				<div
					role="alert"
					className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2 flex items-center justify-between"
				>
					<span>{error}</span>
					<button
						type="button"
						onClick={() => $error.set(null)}
						className="cursor-pointer"
						aria-label="Fechar mensagem de erro"
					>
						<X className="w-4 h-4" aria-hidden="true" />
					</button>
				</div>
			)}

			{resultBlob && (
				<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between bg-emerald-400/10 border border-emerald-400/20 rounded-lg px-3 py-2">
					<div className="text-sm text-emerald-400">
						<div>Resultado: {formatFileSize(resultBlob.size)}</div>
						{sourceFile && (
							<div className="text-xs text-emerald-400/80">{buildSizeDiffLabel(sourceFile.size, resultBlob.size)}</div>
						)}
					</div>
					<div className="flex items-center gap-3">
						<button
							type="button"
							onClick={() => void handleUseResultAsSource()}
							className="flex items-center gap-1.5 text-sm font-medium text-[var(--text)] hover:text-[var(--headline)] transition-colors cursor-pointer"
						>
							<ImagePlus className="w-4 h-4" aria-hidden="true" />
							Usar como nova imagem
						</button>
						<button
							type="button"
							onClick={handleDownload}
							className="flex items-center gap-1.5 text-sm font-medium text-[var(--primary)] hover:text-[var(--headline)] transition-colors cursor-pointer"
						>
							<Download className="w-4 h-4" aria-hidden="true" />
							Baixar
						</button>
					</div>
				</div>
			)}

			<div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
				{OPERATIONS.map((op) => {
					const Icon = op.icon;
					const isActive = activeOperation === op.id;
					const isDisabled = processing || (op.id === "bg-removal" && isBgRemovalLoading);
					return (
						<button
							key={op.id}
							type="button"
							disabled={isDisabled}
							title={op.id === "bg-removal" && isBgRemovalLoading ? "Aguarde o modelo de IA terminar de carregar" : undefined}
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
							<Icon className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
							{op.label}
						</button>
					);
				})}
			</div>

			{activeOperation && (
				<div className="bg-[var(--card-bg)] border border-[var(--card-border)]/30 rounded-lg p-4 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
					{activeOperation === "convert" && (
						<ConvertControls format={outputFormat} quality={quality} supportedFormats={supportedFormats} />
					)}
					{activeOperation === "compress" && (
						<CompressControls quality={quality} maxWidth={compressMaxWidth} hasAlpha={sourceHasAlpha} />
					)}
					{activeOperation === "bg-removal" && (
						<BgRemovalInfo modelPreloadStatus={modelPreloadStatus} />
					)}

					<button
						disabled={isApplyDisabled}
						onClick={() => void handleExecute()}
						type="button"
						className="cursor-pointer w-full py-2.5 rounded-lg font-medium text-sm bg-[var(--primary)] text-[var(--primary-text)] hover:brightness-110 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
					>
						{processing ? (
							<span className="flex items-center justify-center gap-2">
								<Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
								Processando...
							</span>
						) : activeOperation === "bg-removal" && isBgRemovalLoading ? (
							"Aguardando modelo de IA..."
						) : (
							"Aplicar"
						)}
					</button>
				</div>
			)}
		</div>
	);
}

function UploadZone({
	onFileSelect,
	onDrop,
	fileInputRef,
	loading,
	error,
}: {
	onFileSelect: (files: FileList | null) => void;
	onDrop: (e: React.DragEvent) => void;
	fileInputRef: React.RefObject<HTMLInputElement | null>;
	loading: boolean;
	error: string | null;
}) {
	const [dragOver, setDragOver] = useState(false);

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" || e.key === " ") {
			e.preventDefault();
			fileInputRef.current?.click();
		}
	};

	return (
		<div className="space-y-3">
			<button
				tabIndex={0}
				aria-label="Selecionar imagem para upload. Arraste um arquivo ou pressione Enter."
				aria-busy={loading}
				onKeyDown={handleKeyDown}
				onDragOver={(e) => {
					e.preventDefault();
					setDragOver(true);
				}}
				onDragLeave={() => setDragOver(false)}
				onDrop={(e) => {
					setDragOver(false);
					onDrop(e);
				}}
				onClick={() => !loading && fileInputRef.current?.click()}
				className={`w-full cursor-pointer flex flex-col items-center justify-center gap-4 py-16 px-8 border-2 border-dashed rounded-xl transition-all duration-200 ${
					dragOver
						? "border-[var(--primary)] bg-[var(--primary)]/10"
						: "border-[var(--card-border)] hover:border-[var(--primary)]/50 hover:bg-[var(--card-bg)]/50"
				} ${loading ? "opacity-60 pointer-events-none" : ""}`}
			>
				<div className="w-16 h-16 rounded-2xl bg-[var(--primary)]/10 flex items-center justify-center">
					{loading ? (
						<Loader2 className="w-8 h-8 text-[var(--primary)] animate-spin" aria-hidden="true" />
					) : (
						<Upload className="w-8 h-8 text-[var(--primary)]" aria-hidden="true" />
					)}
				</div>
				<div className="text-center">
					<p className="text-[var(--headline)] font-medium mb-1">
						{loading ? "Validando imagem..." : "Arraste uma imagem ou clique para selecionar"}
					</p>
					<p className="text-sm text-[var(--text)]/60">
						{ACCEPTED_FORMATS_LABEL} (max {formatFileSize(MAX_FILE_BYTES)}, {MAX_DIMENSION}px)
					</p>
				</div>
				<input
					ref={fileInputRef}
					type="file"
					accept={ACCEPTED_EXTENSIONS}
					className="hidden"
					onChange={(e) => void onFileSelect(e.target.files)}
				/>
			</button>

			{error && (
				<div
					role="alert"
					className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2 flex items-center justify-between"
				>
					<span>{error}</span>
					<button
						type="button"
						onClick={() => $error.set(null)}
						className="cursor-pointer"
						aria-label="Fechar mensagem de erro"
					>
						<X className="w-4 h-4" aria-hidden="true" />
					</button>
				</div>
			)}
		</div>
	);
}

function Label({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) {
	return (
		<label htmlFor={htmlFor} className="block text-xs font-medium text-[var(--text)] mb-1">
			{children}
		</label>
	);
}

function ConvertControls({
	format,
	quality,
	supportedFormats,
}: {
	format: OutputFormat;
	quality: number;
	supportedFormats: Record<OutputFormat, boolean> | null;
}) {
	return (
		<div className="space-y-3">
			<div>
				<Label>Formato de saida</Label>
				<div className="flex flex-wrap gap-2">
					{CONVERT_FORMATS.map((f) => {
						const supported = isFormatSupported(supportedFormats, f);
						return (
							<button
								key={f}
								type="button"
								disabled={!supported}
								title={supported ? undefined : "Nao suportado neste navegador"}
								onClick={() => $outputFormat.set(f)}
								className={`cursor-pointer px-3 py-1.5 rounded-md text-xs font-medium border transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
									format === f
										? "bg-[var(--primary)]/15 border-[var(--primary)]/40 text-[var(--primary)]"
										: "border-[var(--card-border)] text-[var(--card-text)] hover:border-[var(--primary)]/30"
								}`}
							>
								{f.toUpperCase()}
							</button>
						);
					})}
				</div>
			</div>
			{(format === "jpeg" || format === "webp") && (
				<div>
					<Label htmlFor="convert-quality">Qualidade: {quality}%</Label>
					<input
						id="convert-quality"
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

function CompressControls({ quality, maxWidth, hasAlpha }: { quality: number; maxWidth: number; hasAlpha: boolean }) {
	return (
		<div className="space-y-3">
			{hasAlpha && (
				<p className="text-xs text-amber-400/90 bg-amber-400/10 border border-amber-400/20 rounded-md px-3 py-2">
					Esta imagem tem transparencia. A compressao usara WebP ou PNG para preservar o fundo transparente.
				</p>
			)}
			<div>
				<Label htmlFor="compress-quality">Qualidade: {quality}%</Label>
				<input
					id="compress-quality"
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
			<div>
				<Label>Largura maxima</Label>
				<div className="flex flex-wrap gap-2">
					{COMPRESS_MAX_WIDTH_OPTIONS.map((opt) => (
						<button
							key={opt.value}
							type="button"
							onClick={() => $compressMaxWidth.set(opt.value)}
							className={`cursor-pointer px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
								maxWidth === opt.value
									? "bg-[var(--primary)]/15 border-[var(--primary)]/40 text-[var(--primary)]"
									: "border-[var(--card-border)] text-[var(--card-text)] hover:border-[var(--primary)]/30"
							}`}
						>
							{opt.label}
						</button>
					))}
				</div>
			</div>
		</div>
	);
}

function ModelPreloadBanner({
	status,
	progress,
	onRetry,
}: {
	status: ModelPreloadStatus;
	progress: number;
	onRetry: () => void;
}) {
	if (status === "idle" || status === "ready") return null;

	if (status === "error") {
		return (
			<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-xs text-[var(--text)]/60 bg-[var(--background)] border border-[var(--card-border)]/30 rounded-lg px-3 py-2">
				<p>
					Nao foi possivel preparar o modelo de IA em segundo plano. A remocao de fundo ainda funciona, mas pode
					demorar mais na primeira execucao.
				</p>
				<button
					type="button"
					onClick={onRetry}
					className="shrink-0 text-[var(--primary)] hover:text-[var(--headline)] transition-colors cursor-pointer font-medium"
				>
					Tentar novamente
				</button>
			</div>
		);
	}

	return (
		<output
			className="block text-xs text-[var(--text)] bg-[var(--background)] border border-[var(--card-border)]/30 rounded-lg px-3 py-2 space-y-1.5"
			aria-live="polite"
		>
			<span className="flex items-center justify-between gap-2">
				<span className="flex items-center gap-1.5">
					<Loader2 className="w-3.5 h-3.5 animate-spin text-[var(--primary)]" aria-hidden="true" />
					Preparando modelo de IA em segundo plano...
				</span>
				<span>{progress}%</span>
			</span>
			<progress
				value={progress}
				max={100}
				aria-label="Download do modelo de IA"
				className={PRELOAD_PROGRESS_BAR_CLASS}
			/>
		</output>
	);
}

function BgRemovalInfo({ modelPreloadStatus }: { modelPreloadStatus: ModelPreloadStatus }) {
	return (
		<div className="text-sm text-[var(--text)] space-y-2">
			<p>Remove o fundo da imagem usando IA diretamente no navegador.</p>
			<p className="text-xs text-[var(--text)]/60">
				{modelPreloadStatus === "ready"
					? "Modelo de IA pronto. O resultado sera salvo em PNG."
					: modelPreloadStatus === "loading"
						? "Aguarde o download do modelo (~30MB) terminar para usar esta ferramenta."
						: "O modelo sera baixado na primeira execucao. O resultado sera salvo em PNG."}
			</p>
		</div>
	);
}
