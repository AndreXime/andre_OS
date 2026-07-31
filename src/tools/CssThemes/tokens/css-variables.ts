import type { DesignTokens } from "./types";

const TOKEN_TO_CSS_VAR: Record<string, string> = {
	"colors.primary": "--ct-color-primary",
	"colors.primaryForeground": "--ct-color-primary-foreground",
	"colors.secondary": "--ct-color-secondary",
	"colors.secondaryForeground": "--ct-color-secondary-foreground",
	"colors.background": "--ct-color-background",
	"colors.foreground": "--ct-color-foreground",
	"colors.muted": "--ct-color-muted",
	"colors.mutedForeground": "--ct-color-muted-foreground",
	"colors.accent": "--ct-color-accent",
	"colors.accentForeground": "--ct-color-accent-foreground",
	"colors.destructive": "--ct-color-destructive",
	"colors.destructiveForeground": "--ct-color-destructive-foreground",
	"colors.border": "--ct-color-border",
	"colors.ring": "--ct-color-ring",
	"typography.fontFamily": "--ct-font-family",
	"typography.fontFamilyHeading": "--ct-font-family-heading",
	"typography.fontSizeBase": "--ct-font-size-base",
	"typography.fontSizeSm": "--ct-font-size-sm",
	"typography.fontSizeLg": "--ct-font-size-lg",
	"typography.fontSizeXl": "--ct-font-size-xl",
	"typography.lineHeightBase": "--ct-line-height-base",
	"typography.fontWeightNormal": "--ct-font-weight-normal",
	"typography.fontWeightMedium": "--ct-font-weight-medium",
	"typography.fontWeightBold": "--ct-font-weight-bold",
	"spacing.radius": "--ct-radius",
	"spacing.radiusSm": "--ct-radius-sm",
	"spacing.radiusLg": "--ct-radius-lg",
	"spacing.spacingUnit": "--ct-spacing-unit",
};

function flattenTokens(obj: Record<string, unknown>, prefix = ""): Record<string, string> {
	const result: Record<string, string> = {};

	for (const [key, value] of Object.entries(obj)) {
		const path = prefix ? `${prefix}.${key}` : key;
		if (typeof value === "object" && value !== null) {
			Object.assign(result, flattenTokens(value as Record<string, unknown>, path));
		} else if (typeof value === "string") {
			result[path] = value;
		}
	}

	return result;
}

export function tokensToCssVariables(tokens: DesignTokens): Record<string, string> {
	const flat = flattenTokens(tokens as unknown as Record<string, unknown>);
	const cssVars: Record<string, string> = {};

	for (const [path, value] of Object.entries(flat)) {
		const cssVar = TOKEN_TO_CSS_VAR[path];
		if (cssVar) {
			cssVars[cssVar] = value;
		}
	}

	return cssVars;
}

export function applyCssVariables(variables: Record<string, string>, root: HTMLElement): void {
	for (const [key, value] of Object.entries(variables)) {
		root.style.setProperty(key, value);
	}
}

export function clearCssVariables(variables: Record<string, string>, root: HTMLElement): void {
	for (const key of Object.keys(variables)) {
		root.style.removeProperty(key);
	}
}
