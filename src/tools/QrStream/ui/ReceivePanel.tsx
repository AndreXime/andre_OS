import { useEffect, useRef, useState } from "react";
import { toolBtnGhostClass, toolBtnPrimaryClass, toolLabelClass, toolTextareaClass } from "@/lib/toolUi";
import type { StreamManifest } from "../domain/protocol";
import { createReceiver, type Receiver, type ReceiverProgress } from "../domain/receiver";
import { ProgressStrip } from "./ProgressStrip";

interface CompletedTransfer {
	readonly manifest: StreamManifest;
	readonly data: Uint8Array;
	readonly textPreview: string | null;
}

function downloadBytes(manifest: StreamManifest, data: Uint8Array): void {
	const copy = new Uint8Array(data.byteLength);
	copy.set(data);
	const blob = new Blob([copy], { type: manifest.mime });
	const url = URL.createObjectURL(blob);
	const anchor = document.createElement("a");
	anchor.href = url;
	anchor.download = manifest.name;
	anchor.click();
	URL.revokeObjectURL(url);
}

export function ReceivePanel() {
	const videoRef = useRef<HTMLVideoElement>(null);
	const receiverRef = useRef<Receiver | null>(null);

	const [scanning, setScanning] = useState(false);
	const [progress, setProgress] = useState<ReceiverProgress>({ received: 0, total: 0, missing: [] });
	const [error, setError] = useState<string | null>(null);
	const [completed, setCompleted] = useState<CompletedTransfer | null>(null);
	const [copied, setCopied] = useState(false);

	useEffect(() => {
		const video = videoRef.current;
		if (!video) return;

		receiverRef.current = createReceiver({
			video,
			onProgress: setProgress,
			onComplete: ({ manifest, data }) => {
				setScanning(false);
				const textPreview = manifest.kind === "text" ? new TextDecoder().decode(data) : null;
				setCompleted({ manifest, data, textPreview });
			},
			onError: (message) => {
				setError(message);
				setScanning(false);
			},
		});

		return () => {
			receiverRef.current?.stop();
			receiverRef.current = null;
		};
	}, []);

	const start = async () => {
		setError(null);
		setCompleted(null);
		setCopied(false);
		setProgress({ received: 0, total: 0, missing: [] });
		setScanning(true);
		await receiverRef.current?.start();
	};

	const stop = () => {
		receiverRef.current?.stop();
		setScanning(false);
	};

	const copyText = async () => {
		if (!completed?.textPreview) return;
		await navigator.clipboard.writeText(completed.textPreview);
		setCopied(true);
	};

	return (
		<div className="flex flex-col gap-md">
			<div className="flex flex-wrap gap-2xs">
				{!scanning ? (
					<button type="button" className={toolBtnPrimaryClass} onClick={() => void start()}>
						Iniciar câmera
					</button>
				) : (
					<button type="button" className={toolBtnGhostClass} onClick={stop}>
						Parar
					</button>
				)}
			</div>

			{error && <p className="m-0 text-sm text-muted">{error}</p>}

			<div className="flex flex-col gap-sm">
				<span className={toolLabelClass}>Câmera</span>
				<video
					ref={videoRef}
					className="aspect-video w-full max-w-xl border border-rule bg-ink object-cover"
					muted
					playsInline
					aria-label="Pré-visualização da câmera"
				/>
			</div>

			<ProgressStrip received={progress.received} total={progress.total} missingCount={progress.missing.length} />

			{completed && (
				<div className="flex flex-col gap-sm border-t border-rule pt-md">
					<span className={toolLabelClass}>Recebido</span>
					<p className="m-0 text-sm text-ink">
						{completed.manifest.kind === "text"
							? "Texto reconstruído"
							: `${completed.manifest.name} · ${completed.manifest.mime}`}
					</p>

					{completed.textPreview !== null ? (
						<>
							<textarea className={toolTextareaClass} readOnly value={completed.textPreview} />
							<button type="button" className={toolBtnGhostClass} onClick={() => void copyText()}>
								{copied ? "Copiado" : "Copiar texto"}
							</button>
						</>
					) : (
						<button
							type="button"
							className={toolBtnPrimaryClass}
							onClick={() => downloadBytes(completed.manifest, completed.data)}
						>
							Baixar arquivo
						</button>
					)}
				</div>
			)}
		</div>
	);
}
