import { useEffect, useRef, useState } from "react";
import {
	toolBtnGhostClass,
	toolBtnPrimaryClass,
	toolInputClass,
	toolLabelClass,
	toolSegmentTabClass,
	toolTabBarClass,
	toolTextareaClass,
} from "@/lib/toolUi";
import { DEFAULT_PRESET_ID, getPreset, type PresetId, STREAM_PRESETS } from "../domain/presets";
import { createFileManifest, createTextManifest } from "../domain/protocol";
import { createTransmitter, type Transmitter } from "../domain/transmitter";

const SOFT_LIMIT_BYTES = 1.5 * 1024 * 1024;

type InputMode = "text" | "file";

function formatBytes(size: number): string {
	if (size < 1024) return `${size} B`;
	if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
	return `${(size / (1024 * 1024)).toFixed(2)} MB`;
}

export function TransmitPanel() {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const transmitterRef = useRef<Transmitter | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const [inputMode, setInputMode] = useState<InputMode>("text");
	const [text, setText] = useState("");
	const [file, setFile] = useState<File | null>(null);
	const [fileBytes, setFileBytes] = useState<Uint8Array | null>(null);
	const [presetId, setPresetId] = useState<PresetId>(DEFAULT_PRESET_ID);
	const [running, setRunning] = useState(false);
	const [currentFrame, setCurrentFrame] = useState(0);
	const [totalFrames, setTotalFrames] = useState(0);
	const [payloadSize, setPayloadSize] = useState(0);
	const [hint, setHint] = useState<string | null>(null);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		transmitterRef.current = createTransmitter({
			canvas,
			onFrame: (current, total) => {
				setCurrentFrame(current);
				setTotalFrames(total);
			},
		});

		return () => {
			transmitterRef.current?.stop();
			transmitterRef.current = null;
		};
	}, []);

	const clearFile = () => {
		setFile(null);
		setFileBytes(null);
		if (fileInputRef.current) fileInputRef.current.value = "";
	};

	const onPickText = () => {
		setInputMode("text");
		clearFile();
		setHint(null);
	};

	const onPickFileMode = () => {
		setInputMode("file");
		setText("");
		setHint(null);
	};

	const onFileChange = async (next: File | null) => {
		if (!next) {
			clearFile();
			return;
		}
		const buffer = new Uint8Array(await next.arrayBuffer());
		setFile(next);
		setFileBytes(buffer);
		setText("");
		setInputMode("file");
		setHint(null);
	};

	const resolvePayload = (): { data: Uint8Array; size: number } | null => {
		if (inputMode === "text") {
			const trimmed = text;
			if (!trimmed.trim()) return null;
			const data = new TextEncoder().encode(trimmed);
			return { data, size: data.byteLength };
		}
		if (!file || !fileBytes || fileBytes.byteLength === 0) return null;
		return { data: fileBytes, size: fileBytes.byteLength };
	};

	const start = () => {
		const transmitter = transmitterRef.current;
		if (!transmitter) return;

		const payload = resolvePayload();
		if (!payload) {
			setHint("Informe um texto ou selecione um arquivo antes de transmitir.");
			return;
		}

		const manifest =
			inputMode === "text" && text.trim()
				? createTextManifest(text)
				: file
					? createFileManifest(file, payload.size)
					: null;

		if (!manifest) {
			setHint("Não foi possível montar o manifesto.");
			return;
		}

		const preset = getPreset(presetId);
		transmitter.load({ data: payload.data, manifest, preset });
		setPayloadSize(payload.size);
		setTotalFrames(transmitter.frameCount());
		setCurrentFrame(0);
		setHint(payload.size >= SOFT_LIMIT_BYTES ? "Payload grande: a transferência pode demorar." : null);
		transmitter.start();
		setRunning(true);
	};

	const stop = () => {
		transmitterRef.current?.stop();
		setRunning(false);
	};

	return (
		<div className="flex flex-col gap-md">
			<div className="flex flex-col gap-sm">
				<span className={toolLabelClass}>Origem</span>
				<div className={toolTabBarClass} role="tablist" aria-label="Tipo de payload">
					<button
						type="button"
						role="tab"
						aria-selected={inputMode === "text"}
						className={toolSegmentTabClass(inputMode === "text")}
						onClick={onPickText}
					>
						Texto
					</button>
					<button
						type="button"
						role="tab"
						aria-selected={inputMode === "file"}
						className={toolSegmentTabClass(inputMode === "file")}
						onClick={onPickFileMode}
					>
						Arquivo
					</button>
				</div>

				{inputMode === "text" ? (
					<textarea
						className={toolTextareaClass}
						value={text}
						onChange={(event) => setText(event.target.value)}
						placeholder="Cole ou digite o texto a transmitir"
						disabled={running}
					/>
				) : (
					<div className="flex flex-col gap-2xs">
						<input
							ref={fileInputRef}
							type="file"
							className={toolInputClass}
							onChange={(event) => {
								const next = event.target.files?.[0] ?? null;
								void onFileChange(next);
							}}
							disabled={running}
						/>
						{file && (
							<p className="m-0 font-mono text-xs text-muted">
								{file.name} · {formatBytes(file.size)}
							</p>
						)}
					</div>
				)}
			</div>

			<div className="flex flex-col gap-sm">
				<span className={toolLabelClass}>Preset</span>
				<div className={toolTabBarClass} role="tablist" aria-label="Preset de desempenho">
					{STREAM_PRESETS.map((preset) => (
						<button
							key={preset.id}
							type="button"
							role="tab"
							aria-selected={presetId === preset.id}
							className={toolSegmentTabClass(presetId === preset.id)}
							onClick={() => setPresetId(preset.id)}
							disabled={running}
						>
							{preset.label}
						</button>
					))}
				</div>
			</div>

			<div className="flex flex-wrap gap-2xs">
				{!running ? (
					<button type="button" className={toolBtnPrimaryClass} onClick={start}>
						Iniciar transmissão
					</button>
				) : (
					<button type="button" className={toolBtnGhostClass} onClick={stop}>
						Parar
					</button>
				)}
			</div>

			{hint && <p className="m-0 text-sm text-muted">{hint}</p>}

			<div className="flex flex-col items-center gap-sm">
				<canvas
					ref={canvasRef}
					width={400}
					height={400}
					className="max-w-full border border-rule bg-paper"
					aria-label="QR Code em transmissão"
				/>
				<p className="m-0 font-mono text-xs text-muted">
					{totalFrames > 0 ? `frame ${currentFrame + 1}/${totalFrames} · ${formatBytes(payloadSize)}` : "QR ocioso"}
				</p>
			</div>
		</div>
	);
}
