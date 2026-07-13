import { useEffect, useMemo, useState } from "react";
import { useStore } from "@nanostores/react";
import { Button } from "../../components/ui/Button";
import { Panel } from "../../components/ui/Panel";
import { SegmentedControl } from "../../components/ui/SegmentedControl";
import { cssThemes$, setPreset } from "../../store/themeStore";
import {
  filterPresetsByAppearance,
  getPresetPageIndexInList,
  type ThemeAppearanceFilter,
} from "../../tokens/preset-utils";
import { THEME_PRESETS, THEMES_PER_PAGE } from "../../tokens/presets";
import { PresetCard } from "./PresetCard";

const APPEARANCE_FILTERS: Array<{ id: ThemeAppearanceFilter; label: string }> =
  [
    { id: "all", label: "Todos" },
    { id: "light", label: "Claros" },
    { id: "dark", label: "Escuros" },
  ];

export function ThemePicker() {
  const { activePresetId, presetOverrides } = useStore(cssThemes$);

  const [appearanceFilter, setAppearanceFilter] =
    useState<ThemeAppearanceFilter>("all");
  const [page, setPage] = useState(0);

  const filteredPresets = useMemo(
    () => filterPresetsByAppearance(THEME_PRESETS, appearanceFilter),
    [appearanceFilter],
  );

  const totalPages = Math.max(
    1,
    Math.ceil(filteredPresets.length / THEMES_PER_PAGE),
  );

  useEffect(() => {
    setPage(
      getPresetPageIndexInList(
        filteredPresets,
        activePresetId,
        THEMES_PER_PAGE,
      ),
    );
  }, [activePresetId, filteredPresets]);

  useEffect(() => {
    if (page > totalPages - 1) {
      setPage(Math.max(0, totalPages - 1));
    }
  }, [page, totalPages]);

  const pageStart = page * THEMES_PER_PAGE;
  const visiblePresets = filteredPresets.slice(
    pageStart,
    pageStart + THEMES_PER_PAGE,
  );

  return (
    <Panel
      title="Temas"
      description="Escolha um preset e edite os tokens do tema selecionado."
    >
      <SegmentedControl
        ariaLabel="Filtrar por aparência"
        className="mb-4"
        options={APPEARANCE_FILTERS}
        value={appearanceFilter}
        onChange={setAppearanceFilter}
      />

      {visiblePresets.length > 0 ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {visiblePresets.map((preset) => {
            const tokens = presetOverrides[preset.id] ?? preset.tokens;

            return (
              <PresetCard
                key={preset.id}
                name={preset.name}
                description={preset.description}
                primary={tokens.colors.primary}
                secondary={tokens.colors.secondary}
                background={tokens.colors.background}
                isActive={activePresetId === preset.id}
                onSelect={() => setPreset(preset.id)}
              />
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-ct-muted-foreground">
          Nenhum tema encontrado para este filtro.
        </p>
      )}

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between gap-3">
          <Button
            variant="ghost"
            size="sm"
            disabled={page === 0}
            onClick={() => setPage((current) => current - 1)}
          >
            Anterior
          </Button>
          <span className="text-sm text-ct-muted-foreground">
            Página {page + 1} de {totalPages}
          </span>
          <Button
            variant="ghost"
            size="sm"
            disabled={page >= totalPages - 1}
            onClick={() => setPage((current) => current + 1)}
          >
            Próxima
          </Button>
        </div>
      )}
    </Panel>
  );
}
