import jsQR from "jsqr";
import { assemblePayload, missingIndexes } from "./assemble";
import { parseFrame, type StreamManifest } from "./protocol";

interface DetectedBarcode {
	readonly rawValue: string;
}

interface BarcodeDetectorLike {
	detect: (source: ImageBitmapSource) => Promise<DetectedBarcode[]>;
}

interface BarcodeDetectorConstructor {
	new (options?: { formats?: string[] }): BarcodeDetectorLike;
}

export interface ReceiverProgress {
	readonly received: number;
	readonly total: number;
	readonly missing: readonly number[];
}

export interface ReceiverComplete {
	readonly manifest: StreamManifest;
	readonly data: Uint8Array;
}

export interface CreateReceiverOptions {
	readonly video: HTMLVideoElement;
	readonly onProgress: (progress: ReceiverProgress) => void;
	readonly onComplete: (result: ReceiverComplete) => void;
	readonly onError: (message: string) => void;
}

export interface Receiver {
	start: () => Promise<void>;
	stop: () => void;
	reset: () => void;
	readonly isScanning: () => boolean;
}

function getBarcodeDetector(): BarcodeDetectorConstructor | null {
	const candidate = (window as Window & { BarcodeDetector?: BarcodeDetectorConstructor }).BarcodeDetector;
	return candidate ?? null;
}

export function createReceiver(options: CreateReceiverOptions): Receiver {
	const chunks = new Map<number, Uint8Array>();
	let totalChunks = -1;
	let manifest: StreamManifest | null = null;
	let scanning = false;
	let rafId: number | null = null;
	let stream: MediaStream | null = null;
	let completed = false;

	const DetectorCtor = getBarcodeDetector();
	const detector = DetectorCtor ? new DetectorCtor({ formats: ["qr_code"] }) : null;
	const fallbackCanvas = document.createElement("canvas");
	const fallbackCtx = fallbackCanvas.getContext("2d", { willReadFrequently: true });

	const resetBuffer = (): void => {
		chunks.clear();
		totalChunks = -1;
		manifest = null;
		completed = false;
	};

	const stop = (): void => {
		scanning = false;
		if (rafId !== null) {
			cancelAnimationFrame(rafId);
			rafId = null;
		}
		if (stream) {
			for (const track of stream.getTracks()) {
				track.stop();
			}
			stream = null;
		}
		options.video.srcObject = null;
	};

	const emitProgress = (): void => {
		if (totalChunks < 1) {
			options.onProgress({ received: chunks.size, total: 0, missing: [] });
			return;
		}
		options.onProgress({
			received: chunks.size,
			total: totalChunks,
			missing: missingIndexes(chunks, totalChunks),
		});
	};

	const tryComplete = (): void => {
		if (completed || totalChunks < 1 || !manifest) return;
		if (chunks.size !== totalChunks) return;
		for (let index = 0; index < totalChunks; index++) {
			if (!chunks.has(index)) return;
		}

		completed = true;
		scanning = false;
		const data = assemblePayload(chunks, totalChunks);
		options.onComplete({ manifest, data });
		stop();
	};

	const ingest = (rawValue: string): void => {
		if (completed) return;
		const parsed = parseFrame(rawValue);
		if (!parsed) return;

		if (totalChunks === -1) {
			totalChunks = parsed.total;
		} else if (parsed.total !== totalChunks) {
			resetBuffer();
			totalChunks = parsed.total;
		}

		if (parsed.kind === "manifest") {
			manifest = parsed.manifest;
			if (!chunks.has(0)) {
				chunks.set(0, new Uint8Array(0));
				emitProgress();
			}
			tryComplete();
			return;
		}

		if (!chunks.has(parsed.index)) {
			chunks.set(parsed.index, parsed.bytes);
			emitProgress();
			tryComplete();
		}
	};

	const detectWithFallback = (): void => {
		if (!fallbackCtx) return;
		const width = options.video.videoWidth;
		const height = options.video.videoHeight;
		if (width < 2 || height < 2) return;

		fallbackCanvas.width = width;
		fallbackCanvas.height = height;
		fallbackCtx.drawImage(options.video, 0, 0, width, height);
		const imageData = fallbackCtx.getImageData(0, 0, width, height);
		const code = jsQR(imageData.data, imageData.width, imageData.height);
		if (code?.data) ingest(code.data);
	};

	const scanLoop = async (): Promise<void> => {
		if (!scanning) return;

		try {
			if (detector) {
				const barcodes = await detector.detect(options.video);
				for (const barcode of barcodes) {
					ingest(barcode.rawValue);
				}
			} else {
				detectWithFallback();
			}
		} catch {
			// frames sem QR ou detector ocupado
		}

		if (scanning) {
			rafId = requestAnimationFrame(() => {
				void scanLoop();
			});
		}
	};

	return {
		async start() {
			resetBuffer();
			emitProgress();

			if (!window.isSecureContext) {
				options.onError(
					"A câmera exige HTTPS ou localhost. Em HTTP pela rede local (ex.: 192.168.x.x) o navegador bloqueia o acesso.",
				);
				return;
			}

			if (!navigator.mediaDevices?.getUserMedia) {
				options.onError("Este navegador não expõe a API de câmera.");
				return;
			}

			try {
				stream = await navigator.mediaDevices.getUserMedia({
					video: { facingMode: "environment", frameRate: { ideal: 30 } },
					audio: false,
				});
			} catch (err) {
				const name = err instanceof DOMException ? err.name : "";
				if (name === "NotAllowedError" || name === "PermissionDeniedError") {
					options.onError("Permissão da câmera negada. Libere o acesso nas configurações do site/navegador.");
				} else if (name === "NotFoundError" || name === "DevicesNotFoundError") {
					options.onError("Nenhuma câmera foi encontrada neste dispositivo.");
				} else if (name === "NotReadableError" || name === "TrackStartError") {
					options.onError("A câmera está em uso por outro aplicativo.");
				} else {
					options.onError("Não foi possível acessar a câmera. Verifique a permissão do navegador.");
				}
				return;
			}

			options.video.srcObject = stream;
			options.video.setAttribute("playsinline", "true");
			await options.video.play();
			scanning = true;
			void scanLoop();
		},
		stop,
		reset: () => {
			resetBuffer();
			emitProgress();
		},
		isScanning: () => scanning,
	};
}
