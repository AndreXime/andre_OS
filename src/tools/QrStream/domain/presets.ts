export type PresetId = "fast" | "reliable" | "dense";

export interface StreamPreset {
	readonly id: PresetId;
	readonly label: string;
	readonly summary: string;
	readonly fps: number;
	readonly chunkSize: number;
}

export const STREAM_PRESETS: readonly StreamPreset[] = [
	{
		id: "fast",
		label: "Leitura fácil",
		summary:
			"QR mais simples e troca de frames mais rápida. A câmera lê com mais facilidade, mas a transferência demora um pouco mais.",
		fps: 15,
		chunkSize: 120,
	},
	{
		id: "reliable",
		label: "Equilibrado",
		summary: "Meio-termo entre velocidade e estabilidade. Bom ponto de partida na maioria dos casos.",
		fps: 10,
		chunkSize: 180,
	},
	{
		id: "dense",
		label: "Mais rápido",
		summary:
			"Cada QR leva mais dados, então o ciclo fecha antes. Exige boa iluminação e a câmera bem focada no código.",
		fps: 12,
		chunkSize: 250,
	},
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
