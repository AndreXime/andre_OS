export type PresetId = "fast" | "reliable" | "dense";

export interface StreamPreset {
	readonly id: PresetId;
	readonly label: string;
	readonly fps: number;
	readonly chunkSize: number;
}

export const STREAM_PRESETS: readonly StreamPreset[] = [
	{ id: "fast", label: "Rápido", fps: 15, chunkSize: 120 },
	{ id: "reliable", label: "Confiável", fps: 10, chunkSize: 180 },
	{ id: "dense", label: "Densidade alta", fps: 12, chunkSize: 250 },
] as const;

export const DEFAULT_PRESET_ID: PresetId = "reliable";

export function getPreset(id: PresetId): StreamPreset {
	const preset = STREAM_PRESETS.find((item) => item.id === id);
	if (!preset) {
		const fallback = STREAM_PRESETS.find((item) => item.id === DEFAULT_PRESET_ID);
		if (!fallback) {
			throw new Error("Preset padrão ausente");
		}
		return fallback;
	}
	return preset;
}
