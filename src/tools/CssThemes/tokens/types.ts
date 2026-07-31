export interface ColorTokens {
	primary: string;
	primaryForeground: string;
	secondary: string;
	secondaryForeground: string;
	background: string;
	foreground: string;
	muted: string;
	mutedForeground: string;
	accent: string;
	accentForeground: string;
	destructive: string;
	destructiveForeground: string;
	border: string;
	ring: string;
}

export interface TypographyTokens {
	fontFamily: string;
	fontFamilyHeading: string;
	fontSizeBase: string;
	fontSizeSm: string;
	fontSizeLg: string;
	fontSizeXl: string;
	lineHeightBase: string;
	fontWeightNormal: string;
	fontWeightMedium: string;
	fontWeightBold: string;
}

export interface SpacingTokens {
	radius: string;
	radiusSm: string;
	radiusLg: string;
	spacingUnit: string;
}

export interface DesignTokens {
	colors: ColorTokens;
	typography: TypographyTokens;
	spacing: SpacingTokens;
}

export type DeepPartial<T> = {
	[P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export interface ThemePreset {
	id: string;
	name: string;
	description: string;
	tokens: DesignTokens;
}

export const DEFAULT_TOKENS: DesignTokens = {
	colors: {
		primary: "#2563eb",
		primaryForeground: "#ffffff",
		secondary: "#f1f5f9",
		secondaryForeground: "#0f172a",
		background: "#ffffff",
		foreground: "#0f172a",
		muted: "#f8fafc",
		mutedForeground: "#64748b",
		accent: "#f1f5f9",
		accentForeground: "#0f172a",
		destructive: "#dc2626",
		destructiveForeground: "#ffffff",
		border: "#e2e8f0",
		ring: "#2563eb",
	},
	typography: {
		fontFamily: "Inter, system-ui, sans-serif",
		fontFamilyHeading: "Inter, system-ui, sans-serif",
		fontSizeBase: "1rem",
		fontSizeSm: "0.875rem",
		fontSizeLg: "1.125rem",
		fontSizeXl: "1.25rem",
		lineHeightBase: "1.5",
		fontWeightNormal: "400",
		fontWeightMedium: "500",
		fontWeightBold: "700",
	},
	spacing: {
		radius: "0.5rem",
		radiusSm: "0.25rem",
		radiusLg: "0.75rem",
		spacingUnit: "0.25rem",
	},
};
