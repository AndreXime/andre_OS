import type { DesignTokens, ThemePreset } from "./types";
import { DEFAULT_TOKENS } from "./types";

function preset(
	id: string,
	name: string,
	description: string,
	overrides: Partial<{
		colors: Partial<DesignTokens["colors"]>;
		typography: Partial<DesignTokens["typography"]>;
		spacing: Partial<DesignTokens["spacing"]>;
	}>,
): ThemePreset {
	return {
		id,
		name,
		description,
		tokens: {
			colors: { ...DEFAULT_TOKENS.colors, ...overrides.colors },
			typography: { ...DEFAULT_TOKENS.typography, ...overrides.typography },
			spacing: { ...DEFAULT_TOKENS.spacing, ...overrides.spacing },
		},
	};
}

const THEME_PRESETS_SOURCE: ThemePreset[] = [
	{
		id: "default",
		name: "Corporativo",
		description: "Azul neutro para produtos corporativos",
		tokens: DEFAULT_TOKENS,
	},
	preset("lavender", "Lavanda", "Roxo suave com tipografia Poppins", {
		colors: {
			primary: "#7c3aed",
			primaryForeground: "#ffffff",
			secondary: "#ede9fe",
			secondaryForeground: "#4c1d95",
			ring: "#7c3aed",
		},
		typography: {
			fontFamily: "Poppins, system-ui, sans-serif",
			fontFamilyHeading: "Poppins, system-ui, sans-serif",
		},
	}),
	preset("forest", "Floresta", "Verde natural com fundo claro", {
		colors: {
			primary: "#047857",
			primaryForeground: "#ffffff",
			secondary: "#d1fae5",
			secondaryForeground: "#065f46",
			background: "#f0fdf4",
			ring: "#047857",
		},
		typography: {
			fontFamily: "DM Sans, system-ui, sans-serif",
			fontFamilyHeading: "DM Sans, system-ui, sans-serif",
		},
	}),
	preset("sunset", "Pôr do Sol", "Laranja quente e acolhedor", {
		colors: {
			primary: "#ea580c",
			primaryForeground: "#ffffff",
			secondary: "#ffedd5",
			secondaryForeground: "#9a3412",
			accent: "#fff7ed",
			accentForeground: "#7c2d12",
			ring: "#ea580c",
		},
		typography: {
			fontFamilyHeading: "Playfair Display, Georgia, serif",
		},
	}),
	preset("ocean", "Oceano", "Azul profundo inspirado no mar", {
		colors: {
			primary: "#0369a1",
			primaryForeground: "#ffffff",
			secondary: "#e0f2fe",
			secondaryForeground: "#0c4a6e",
			background: "#f0f9ff",
			muted: "#e0f2fe",
			ring: "#0369a1",
		},
	}),
	preset("midnight", "Meia-noite", "Tema escuro para dashboards", {
		colors: {
			primary: "#818cf8",
			primaryForeground: "#0f172a",
			secondary: "#1e293b",
			secondaryForeground: "#e2e8f0",
			background: "#0f172a",
			foreground: "#f8fafc",
			muted: "#1e293b",
			mutedForeground: "#94a3b8",
			accent: "#1e293b",
			accentForeground: "#f8fafc",
			border: "#334155",
			ring: "#818cf8",
		},
		typography: {
			fontFamily: "JetBrains Mono, ui-monospace, monospace",
			fontFamilyHeading: "Inter, system-ui, sans-serif",
		},
	}),
	preset("obsidian", "Obsidiana", "Grafite profundo com destaque em ciano", {
		colors: {
			primary: "#22d3ee",
			primaryForeground: "#083344",
			secondary: "#27272a",
			secondaryForeground: "#e4e4e7",
			background: "#18181b",
			foreground: "#fafafa",
			muted: "#27272a",
			mutedForeground: "#a1a1aa",
			accent: "#27272a",
			accentForeground: "#fafafa",
			border: "#3f3f46",
			ring: "#22d3ee",
		},
	}),
	preset("noir", "Noir", "Monocromo escuro de alto contraste", {
		colors: {
			primary: "#fafafa",
			primaryForeground: "#0a0a0a",
			secondary: "#262626",
			secondaryForeground: "#f5f5f5",
			background: "#0a0a0a",
			foreground: "#fafafa",
			muted: "#171717",
			mutedForeground: "#a3a3a3",
			accent: "#262626",
			accentForeground: "#fafafa",
			border: "#404040",
			ring: "#fafafa",
		},
		spacing: {
			radius: "0.25rem",
			radiusLg: "0.375rem",
		},
	}),
	preset("ember", "Brasa", "Fundo escuro com acentos quentes de âmbar", {
		colors: {
			primary: "#fb923c",
			primaryForeground: "#431407",
			secondary: "#292018",
			secondaryForeground: "#ffedd5",
			background: "#1c1410",
			foreground: "#fff7ed",
			muted: "#292018",
			mutedForeground: "#fdba74",
			accent: "#292018",
			accentForeground: "#fff7ed",
			border: "#44403c",
			ring: "#fb923c",
		},
		typography: {
			fontFamilyHeading: "Merriweather, Georgia, serif",
		},
	}),
	preset("rose", "Rosa", "Tom rosado para marcas de lifestyle", {
		colors: {
			primary: "#e11d48",
			primaryForeground: "#ffffff",
			secondary: "#ffe4e6",
			secondaryForeground: "#9f1239",
			accent: "#fff1f2",
			accentForeground: "#881337",
			ring: "#e11d48",
		},
	}),
	preset("mono", "Monocromo", "Preto e branco minimalista", {
		colors: {
			primary: "#171717",
			primaryForeground: "#fafafa",
			secondary: "#f5f5f5",
			secondaryForeground: "#171717",
			accent: "#f5f5f5",
			ring: "#171717",
		},
		spacing: {
			radius: "0.25rem",
			radiusLg: "0.375rem",
		},
	}),
	preset("amber", "Âmbar", "Dourado quente para marcas premium", {
		colors: {
			primary: "#d97706",
			primaryForeground: "#ffffff",
			secondary: "#fef3c7",
			secondaryForeground: "#92400e",
			background: "#fffbeb",
			accent: "#fff7ed",
			accentForeground: "#78350f",
			ring: "#d97706",
		},
		typography: {
			fontFamilyHeading: "Merriweather, Georgia, serif",
		},
	}),
	preset("mint", "Menta", "Verde água fresco e leve", {
		colors: {
			primary: "#0d9488",
			primaryForeground: "#ffffff",
			secondary: "#ccfbf1",
			secondaryForeground: "#115e59",
			background: "#f0fdfa",
			muted: "#ccfbf1",
			ring: "#0d9488",
		},
	}),
	preset("cherry", "Cereja", "Vermelho intenso com alto contraste", {
		colors: {
			primary: "#be123c",
			primaryForeground: "#ffffff",
			secondary: "#ffe4e6",
			secondaryForeground: "#881337",
			background: "#fff1f2",
			ring: "#be123c",
		},
	}),
	preset("sky", "Céu", "Azul celeste arejado e limpo", {
		colors: {
			primary: "#0284c7",
			primaryForeground: "#ffffff",
			secondary: "#e0f2fe",
			secondaryForeground: "#075985",
			background: "#f0f9ff",
			muted: "#e0f2fe",
			ring: "#0284c7",
		},
	}),
	preset("sand", "Areia", "Tons terrosos e acolhedores", {
		colors: {
			primary: "#a16207",
			primaryForeground: "#ffffff",
			secondary: "#fef9c3",
			secondaryForeground: "#713f12",
			background: "#fefce8",
			muted: "#fef9c3",
			mutedForeground: "#854d0e",
			accent: "#fffbeb",
			accentForeground: "#78350f",
			ring: "#a16207",
		},
	}),
	preset("graphite", "Grafite", "Cinza escuro elegante e sobrio", {
		colors: {
			primary: "#52525b",
			primaryForeground: "#fafafa",
			secondary: "#e4e4e7",
			secondaryForeground: "#27272a",
			background: "#fafafa",
			muted: "#f4f4f5",
			mutedForeground: "#71717a",
			ring: "#52525b",
		},
	}),
	preset("coral", "Coral", "Laranja rosado vibrante e jovem", {
		colors: {
			primary: "#f43f5e",
			primaryForeground: "#ffffff",
			secondary: "#ffe4e6",
			secondaryForeground: "#be123c",
			background: "#fff1f2",
			accent: "#fff7ed",
			accentForeground: "#9a3412",
			ring: "#f43f5e",
		},
	}),
	preset("indigo", "Indigo", "Azul-violeta profundo e moderno", {
		colors: {
			primary: "#4f46e5",
			primaryForeground: "#ffffff",
			secondary: "#e0e7ff",
			secondaryForeground: "#312e81",
			background: "#eef2ff",
			muted: "#e0e7ff",
			ring: "#4f46e5",
		},
		typography: {
			fontFamily: "IBM Plex Sans, system-ui, sans-serif",
			fontFamilyHeading: "IBM Plex Sans, system-ui, sans-serif",
		},
	}),
	preset("plum", "Ameixa", "Roxo escuro sofisticado", {
		colors: {
			primary: "#9333ea",
			primaryForeground: "#ffffff",
			secondary: "#f3e8ff",
			secondaryForeground: "#581c87",
			background: "#faf5ff",
			muted: "#f3e8ff",
			ring: "#9333ea",
		},
	}),
	preset("terracotta", "Terracota", "Tons de barro e cerâmica artesanal", {
		colors: {
			primary: "#c2410c",
			primaryForeground: "#ffffff",
			secondary: "#ffedd5",
			secondaryForeground: "#7c2d12",
			background: "#fff7ed",
			muted: "#ffedd5",
			mutedForeground: "#9a3412",
			ring: "#c2410c",
		},
		typography: {
			fontFamilyHeading: "Lora, Georgia, serif",
		},
	}),
	preset("glacier", "Geleira", "Azul gelo minimalista e frio", {
		colors: {
			primary: "#0891b2",
			primaryForeground: "#ffffff",
			secondary: "#cffafe",
			secondaryForeground: "#155e75",
			background: "#ecfeff",
			muted: "#cffafe",
			mutedForeground: "#0e7490",
			border: "#a5f3fc",
			ring: "#0891b2",
		},
		spacing: {
			radius: "0.375rem",
			radiusLg: "0.625rem",
		},
	}),
	preset("olive", "Oliva", "Verde oliva orgânico e natural", {
		colors: {
			primary: "#65a30d",
			primaryForeground: "#ffffff",
			secondary: "#ecfccb",
			secondaryForeground: "#3f6212",
			background: "#f7fee7",
			muted: "#ecfccb",
			mutedForeground: "#4d7c0f",
			ring: "#65a30d",
		},
	}),
	preset("velvet", "Veludo", "Roxo profundo com acentos violeta suaves", {
		colors: {
			primary: "#c084fc",
			primaryForeground: "#3b0764",
			secondary: "#1e1029",
			secondaryForeground: "#f3e8ff",
			background: "#130a1f",
			foreground: "#faf5ff",
			muted: "#1e1029",
			mutedForeground: "#d8b4fe",
			accent: "#1e1029",
			accentForeground: "#faf5ff",
			border: "#2e1a40",
			ring: "#c084fc",
		},
	}),
	preset("slate", "Ardósia", "Cinza azulado sóbrio para interfaces técnicas", {
		colors: {
			primary: "#94a3b8",
			primaryForeground: "#0f172a",
			secondary: "#1f2937",
			secondaryForeground: "#e2e8f0",
			background: "#111827",
			foreground: "#f8fafc",
			muted: "#1f2937",
			mutedForeground: "#9ca3af",
			accent: "#1f2937",
			accentForeground: "#f8fafc",
			border: "#374151",
			ring: "#94a3b8",
		},
		typography: {
			fontFamily: "IBM Plex Sans, system-ui, sans-serif",
			fontFamilyHeading: "IBM Plex Sans, system-ui, sans-serif",
		},
	}),
	preset("wine", "Vinho", "Bordô escuro com destaques rosados", {
		colors: {
			primary: "#f472b6",
			primaryForeground: "#500724",
			secondary: "#2a1018",
			secondaryForeground: "#fce7f3",
			background: "#18080f",
			foreground: "#fdf2f8",
			muted: "#2a1018",
			mutedForeground: "#f9a8d4",
			accent: "#2a1018",
			accentForeground: "#fdf2f8",
			border: "#3f1724",
			ring: "#f472b6",
		},
		typography: {
			fontFamilyHeading: "Playfair Display, Georgia, serif",
		},
	}),

	preset("vscode-dark", "VS Code Dark", "Paleta do tema escuro padrão do Visual Studio Code", {
		colors: {
			primary: "#007acc",
			primaryForeground: "#ffffff",
			secondary: "#252526",
			secondaryForeground: "#cccccc",
			background: "#1e1e1e",
			foreground: "#d4d4d4",
			muted: "#2d2d2d",
			mutedForeground: "#858585",
			accent: "#2a2d2e",
			accentForeground: "#d4d4d4",
			destructive: "#f14c4c",
			destructiveForeground: "#ffffff",
			border: "#3c3c3c",
			ring: "#007fd4",
		},
		typography: {
			fontFamily: "JetBrains Mono, Consolas, monospace",
			fontFamilyHeading: "Segoe UI, system-ui, sans-serif",
		},
		spacing: {
			radius: "0.25rem",
			radiusLg: "0.375rem",
		},
	}),
	preset("monokai", "Monokai", "Clássico do editor com verde, rosa e roxo", {
		colors: {
			primary: "#a6e22e",
			primaryForeground: "#272822",
			secondary: "#3e3d32",
			secondaryForeground: "#f8f8f2",
			background: "#272822",
			foreground: "#f8f8f2",
			muted: "#3e3d32",
			mutedForeground: "#75715e",
			accent: "#49483e",
			accentForeground: "#f8f8f2",
			destructive: "#f92672",
			destructiveForeground: "#ffffff",
			border: "#49483e",
			ring: "#ae81ff",
		},
		typography: {
			fontFamily: "JetBrains Mono, Consolas, monospace",
			fontFamilyHeading: "JetBrains Mono, Consolas, monospace",
		},
		spacing: {
			radius: "0.25rem",
			radiusLg: "0.375rem",
		},
	}),
	preset("dashboard", "Painel", "Escuro neutro e direto para dashboards e dados", {
		colors: {
			primary: "#3b82f6",
			primaryForeground: "#ffffff",
			secondary: "#18181b",
			secondaryForeground: "#e4e4e7",
			background: "#09090b",
			foreground: "#fafafa",
			muted: "#18181b",
			mutedForeground: "#a1a1aa",
			accent: "#18181b",
			accentForeground: "#fafafa",
			destructive: "#dc2626",
			destructiveForeground: "#ffffff",
			border: "#27272a",
			ring: "#3b82f6",
		},
		typography: {
			fontFamily: "Inter, system-ui, sans-serif",
			fontFamilyHeading: "Inter, system-ui, sans-serif",
		},
		spacing: {
			radius: "0.375rem",
			radiusSm: "0.25rem",
			radiusLg: "0.5rem",
		},
	}),
	preset("linen", "Linho", "Creme quente com verde sálvia delicado", {
		colors: {
			primary: "#6b8f71",
			primaryForeground: "#ffffff",
			secondary: "#eef2ea",
			secondaryForeground: "#2f4533",
			background: "#faf8f4",
			foreground: "#1c1917",
			muted: "#f0ebe3",
			mutedForeground: "#78716c",
			accent: "#eef2ea",
			accentForeground: "#2f4533",
			border: "#e7e0d5",
			ring: "#6b8f71",
		},
		typography: {
			fontFamily: "Lora, Georgia, serif",
			fontFamilyHeading: "Lora, Georgia, serif",
		},
		spacing: {
			radius: "0.625rem",
			radiusLg: "0.875rem",
		},
	}),
];

import { sortThemePresetsByAppearance } from "./preset-utils";

export const THEMES_PER_PAGE = 10;

export const THEME_PRESETS = sortThemePresetsByAppearance(THEME_PRESETS_SOURCE);

export function getPresetById(id: string): ThemePreset | undefined {
	return THEME_PRESETS.find((p) => p.id === id);
}
