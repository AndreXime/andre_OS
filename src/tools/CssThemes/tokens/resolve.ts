import { getPresetById } from "./presets";
import type { DesignTokens } from "./types";
import { DEFAULT_TOKENS } from "./types";

function getBaseTokens(presetId: string): DesignTokens {
  return getPresetById(presetId)?.tokens ?? DEFAULT_TOKENS;
}

export function resolvePresetTokens(
  presetId: string,
  presetOverrides: Readonly<Record<string, DesignTokens>>,
): DesignTokens {
  return presetOverrides[presetId] ?? getBaseTokens(presetId);
}
