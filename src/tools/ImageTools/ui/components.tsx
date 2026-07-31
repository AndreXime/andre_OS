import { Loader2, Trash2, X } from "lucide-react";
import {
	COMPRESS_MAX_WIDTH_OPTIONS,
	type ImageItem,
	type ModelPreloadStatus,
	type OutputFormat,
} from "../domain";
import { isFormatSupported } from "../lib/formatSupport";
import { $compressMaxWidth, $error, $outputFormat, $quality } from "../store";
import { CONVERT_FORMATS, PRELOAD_PROGRESS_BAR_CLASS, PROGRESS_BAR_CLASS, STATUS_LABEL } from "./constants";

export function Label({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) {
	return (
		<label htmlFor={htmlFor} className="block text-sm font-medium text-muted mb-1">
			{children}
		</label>
	);
}

export function ErrorBanner({ message, onDismiss }: { message: string; onDismiss?: () => void }) {
	return (
		<div
			role="alert"
			className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2 flex items-center justify-between gap-2"
		>
			<span>{message}</span>
			{onDismiss && (
				<button
					type="button"
					onClick={onDismiss}
					className="cursor-pointer shrink-0"
					aria-label="Fechar mensagem de erro"
				>
					<X className="w-4 h-4" aria-hidden="true" />
				</button>
			)}
		</div>
	);
}

export function ImageListItem({
	item,
	active,
	selected,
	onSelect,
	onToggleSelected,
	onRemove,
}: {
	item: ImageItem;
	active: boolean;
	selected: boolean;
	onSelect: () => void;
	onToggleSelected: () => void;
	onRemove: () => void;
}) {
	return (
		<li>
			<div
				className={`flex items-center gap-2 rounded-lg border px-2 py-1.5 transition-colors ${
					active ? "border-accent/50 bg-accent/10" : "border-rule/30 bg-paper-2 hover:border-rule/50"
				}`}
			>
				<input
					type="checkbox"
					checked={selected}
					onChange={onToggleSelected}
					onClick={(e) => e.stopPropagation()}
					aria-label={`Incluir ${item.file.name} na selecao multipla`}
					className="size-5 accent-accent cursor-pointer shrink-0"
				/>
				<button
					type="button"
					onClick={onSelect}
					aria-label={`Usar so ${item.file.name}`}
					className="flex flex-1 items-center gap-2 min-w-0 text-left cursor-pointer"
				>
					{item.sourceUrl ? (
						<img src={item.sourceUrl} alt="" className="w-10 h-10 rounded object-cover shrink-0 bg-black/20" />
					) : (
						<div className="w-10 h-10 rounded bg-black/20 shrink-0" />
					)}
					<div className="min-w-0 flex-1">
						<p className="text-sm text-ink truncate">{item.file.name}</p>
						<p
							className={`text-[10px] ${
								item.status === "error"
									? "text-red-400"
									: item.status === "done"
										? "text-emerald-400"
										: "text-muted"
							}`}
						>
							{STATUS_LABEL[item.status]}
						</p>
					</div>
				</button>
				<button
					type="button"
					onClick={onRemove}
					className="p-1 text-muted hover:text-ink cursor-pointer shrink-0"
					aria-label={`Remover ${item.file.name}`}
				>
					<Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
				</button>
			</div>
		</li>
	);
}

export function ConvertControls({
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
								className={`cursor-pointer px-3 py-1.5 rounded-md text-sm font-medium border transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
									format === f
										? "bg-accent/15 border-accent/40 text-accent"
										: "border-rule text-ink-2 hover:border-accent/30"
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
						className="w-full accent-accent"
					/>
				</div>
			)}
		</div>
	);
}

export function CompressControls({
	quality,
	maxWidth,
	hasAlpha,
}: {
	quality: number;
	maxWidth: number;
	hasAlpha: boolean;
}) {
	return (
		<div className="space-y-3">
			{hasAlpha && (
				<p className="text-sm text-amber-400/90 bg-amber-400/10 border border-amber-400/20 rounded-md px-3 py-2">
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
					className="w-full accent-accent"
				/>
				<div className="flex justify-between text-[10px] text-muted/50 mt-1">
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
							className={`cursor-pointer px-3 py-1.5 rounded-md text-sm font-medium border transition-colors ${
								maxWidth === opt.value
									? "bg-accent/15 border-accent/40 text-accent"
									: "border-rule text-ink-2 hover:border-accent/30"
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

export function ModelPreloadBanner({
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
			<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-sm text-muted/60 bg-paper border border-rule/30 rounded-lg px-3 py-2">
				<p>
					Nao foi possivel preparar o modelo de IA em segundo plano. A remocao de fundo ainda funciona, mas pode demorar
					mais na primeira execucao.
				</p>
				<button
					type="button"
					onClick={onRetry}
					className="shrink-0 text-accent hover:text-ink transition-colors cursor-pointer font-medium"
				>
					Tentar novamente
				</button>
			</div>
		);
	}

	return (
		<output
			className="block text-sm text-muted bg-paper border border-rule/30 rounded-lg px-3 py-2 space-y-1.5"
			aria-live="polite"
		>
			<span className="flex items-center justify-between gap-2">
				<span className="flex items-center gap-1.5">
					<Loader2 className="w-3.5 h-3.5 animate-spin text-accent" aria-hidden="true" />
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

export function BgRemovalInfo({ modelPreloadStatus }: { modelPreloadStatus: ModelPreloadStatus }) {
	return (
		<div className="text-sm text-muted space-y-2">
			<p>Remove o fundo da imagem usando IA diretamente no navegador.</p>
			<p className="text-sm text-muted/60">
				{modelPreloadStatus === "ready"
					? "Modelo de IA pronto. O resultado sera salvo em PNG."
					: modelPreloadStatus === "loading"
						? "Aguarde o download do modelo (~30MB) terminar para usar esta ferramenta."
						: "O modelo sera baixado na primeira execucao. O resultado sera salvo em PNG."}
			</p>
		</div>
	);
}

export function ProcessingStatus({
	label,
	current,
	total,
	batchRunning,
	onCancel,
}: {
	label: string;
	current: number;
	total: number;
	batchRunning: boolean;
	onCancel: () => void;
}) {
	return (
		<div className="space-y-1.5">
			<div className="flex items-center justify-between text-sm text-muted">
				<span className="flex items-center gap-1.5">
					<Loader2 className="w-3.5 h-3.5 animate-spin text-accent" aria-hidden="true" />
					{label || "Processando..."}
				</span>
				{batchRunning && total > 0 && (
					<span>
						{current}/{total}
					</span>
				)}
			</div>
			{batchRunning && total > 0 && (
				<progress
					value={(current / total) * 100}
					max={100}
					aria-label={label || "Progresso do processamento"}
					className={PROGRESS_BAR_CLASS}
				/>
			)}
			<button
				type="button"
				onClick={onCancel}
				className="text-sm text-muted hover:text-ink transition-colors cursor-pointer"
			>
				Cancelar
			</button>
		</div>
	);
}

export function dismissGlobalError(): void {
	$error.set(null);
}
