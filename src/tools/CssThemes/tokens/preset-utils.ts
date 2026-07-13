import type { ThemePreset } from "./types";

function parseHexColor(hex: string): [number, number, number] | undefined {
  const normalized = hex.trim().replace("#", "");
  if (!/^[0-9a-fA-F]{6}$/.test(normalized)) return undefined;

  const value = Number.parseInt(normalized, 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

function getRelativeLuminance(hex: string): number {
  const rgb = parseHexColor(hex);
  if (!rgb) return 1;

  const channels = rgb.map((channel) => {
    const normalized = channel / 255;
    return normalized <= 0.03928
      ? normalized / 12.92
      : ((normalized + 0.055) / 1.055) ** 2.4;
  });
  const r = channels[0] ?? 0;
  const g = channels[1] ?? 0;
  const b = channels[2] ?? 0;

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export type ThemeAppearance = "light" | "dark";

export type ThemeAppearanceFilter = "all" | ThemeAppearance;

export function getPresetAppearance(preset: ThemePreset): ThemeAppearance {
  return getRelativeLuminance(preset.tokens.colors.background) < 0.45
    ? "dark"
    : "light";
}

export function sortThemePresetsByAppearance(
  presets: ThemePreset[],
): ThemePreset[] {
  return presets
    .map((preset, index) => ({ preset, index }))
    .sort((a, b) => {
      const aIsDark =
        getRelativeLuminance(a.preset.tokens.colors.background) < 0.45;
      const bIsDark =
        getRelativeLuminance(b.preset.tokens.colors.background) < 0.45;

      if (aIsDark !== bIsDark) {
        return aIsDark ? 1 : -1;
      }

      return a.index - b.index;
    })
    .map(({ preset }) => preset);
}

export function filterPresetsByAppearance(
  presets: ThemePreset[],
  filter: ThemeAppearanceFilter,
): ThemePreset[] {
  if (filter === "all") return presets;

  return presets.filter(
    (preset) => getPresetAppearance(preset) === filter,
  );
}

export function getPresetPageIndexInList(
  presets: ThemePreset[],
  presetId: string,
  themesPerPage: number,
): number {
  const index = presets.findIndex((preset) => preset.id === presetId);
  if (index === -1) return 0;
  return Math.floor(index / themesPerPage);
}
