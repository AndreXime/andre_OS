import { useStore } from "@nanostores/react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Panel } from "../../components/ui/Panel";
import {
  cssThemes$,
  resetTokens,
  updateColor,
} from "../../store/themeStore";
import { tokensToCssVariables } from "../../tokens/css-variables";
import { getPresetById } from "../../tokens/presets";
import { resolvePresetTokens } from "../../tokens/resolve";
import type { ColorTokens } from "../../tokens/types";

const COLOR_LABELS: Record<keyof ColorTokens, string> = {
  primary: "Primária",
  primaryForeground: "Texto primário",
  secondary: "Secundária",
  secondaryForeground: "Texto secundário",
  background: "Fundo",
  foreground: "Texto",
  muted: "Muted",
  mutedForeground: "Texto muted",
  accent: "Accent",
  accentForeground: "Texto accent",
  destructive: "Destrutivo",
  destructiveForeground: "Texto destrutivo",
  border: "Borda",
  ring: "Focus ring",
};

export function TokenPreview() {
  const { activePresetId, presetOverrides } = useStore(cssThemes$);

  const tokens = resolvePresetTokens(activePresetId, presetOverrides);
  const cssVars = tokensToCssVariables(tokens);
  const presetName = getPresetById(activePresetId)?.name ?? "Tema";

  return (
    <Panel
      title="Tokens ativos"
      description={`Editando ${presetName}. Alterações salvas no localStorage.`}
      action={
        <Button variant="ghost" size="sm" onClick={resetTokens}>
          Resetar para padrão
        </Button>
      }
    >
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {(Object.keys(COLOR_LABELS) as Array<keyof ColorTokens>).map((key) => (
          <label
            key={key}
            className="flex flex-row gap-2 rounded-ct-md border border-ct-border p-3"
          >
            <div className="flex items-center gap-2">
              <input
                type="color"
                className="size-10 shrink-0 cursor-pointer rounded-ct-md bg-transparent p-0"
                value={tokens.colors[key]}
                onChange={(e) => updateColor(key, e.target.value)}
              />
              <div className="min-w-0">
                <span className="block text-xs font-medium">
                  {COLOR_LABELS[key]}
                </span>
                <code className="text-[0.65rem] text-ct-muted-foreground">
                  {key}
                </code>
              </div>
            </div>
            <Input
              value={tokens.colors[key]}
              onChange={(e) => updateColor(key, e.target.value)}
            />
          </label>
        ))}
      </div>
      <details className="mt-4">
        <summary className="cursor-pointer text-sm font-medium">
          Exportar CSS variables
        </summary>
        <pre className="mt-2 overflow-x-auto rounded-ct-md bg-ct-muted p-3 text-[0.7rem]">
          {`.css-themes {\n${Object.entries(cssVars)
            .map(([k, v]) => `  ${k}: ${v};`)
            .join("\n")}\n}`}
        </pre>
      </details>
    </Panel>
  );
}
