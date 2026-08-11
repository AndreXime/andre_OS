import QRCode from "qrcode";
import type { StreamPreset } from "./presets";
import { buildFrames, type StreamManifest } from "./protocol";

export interface TransmitterLoadInput {
	readonly data: Uint8Array;
	readonly manifest: StreamManifest;
	readonly preset: StreamPreset;
}

export interface Transmitter {
	load: (input: TransmitterLoadInput) => void;
	start: () => void;
	stop: () => void;
	readonly isRunning: () => boolean;
	readonly frameCount: () => number;
}

export interface CreateTransmitterOptions {
	readonly canvas: HTMLCanvasElement;
	readonly onFrame?: (current: number, total: number) => void;
}

export function createTransmitter(options: CreateTransmitterOptions): Transmitter {
	let frames: string[] = [];
	let currentFrame = 0;
	let intervalId: number | null = null;
	let fps = 10;
	let renderToken = 0;

	const stop = (): void => {
		if (intervalId !== null) {
			window.clearInterval(intervalId);
			intervalId = null;
		}
		renderToken += 1;
	};

	const paint = async (frameData: string, token: number): Promise<void> => {
		await QRCode.toCanvas(options.canvas, frameData, {
			errorCorrectionLevel: "L",
			margin: 2,
			width: 400,
			color: {
				dark: "#14181f",
				light: "#ffffff",
			},
		});
		if (token !== renderToken) return;
	};

	return {
		load({ data, manifest, preset }) {
			stop();
			fps = preset.fps;
			frames = buildFrames(data, preset.chunkSize, manifest);
			currentFrame = 0;
		},
		start() {
			if (frames.length === 0) return;
			stop();
			const interval = 1000 / fps;
			const token = renderToken;

			const tick = () => {
				const frameData = frames[currentFrame];
				if (frameData === undefined) return;
				options.onFrame?.(currentFrame, frames.length);
				void paint(frameData, token);
				currentFrame = (currentFrame + 1) % frames.length;
			};

			tick();
			intervalId = window.setInterval(tick, interval);
		},
		stop,
		isRunning: () => intervalId !== null,
		frameCount: () => frames.length,
	};
}
