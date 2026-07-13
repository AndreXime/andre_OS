import { useEffect } from "react";
import { Palette } from "lucide-react";
import { ToolShell } from "../ToolShell";
import { App } from "./App";
import {
	clearThemeFromRoot,
	cssThemes$,
	cssThemesStorage,
	syncThemeToRoot,
} from "./store/themeStore";
import "./index.css";

const THEME_FONTS_HREF =
	"https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,700;1,9..40,400&family=IBM+Plex+Sans:wght@400;500;700&family=Inter:wght@400;500;700&family=JetBrains+Mono:wght@400;500&family=Lora:wght@400;500;700&family=Merriweather:wght@400;700&family=Playfair+Display:wght@500;700&family=Poppins:wght@400;500;700&display=swap";

const THEME_FONTS_ATTR = "data-css-themes-fonts";
const THEME_ROOT_CLASS = "css-themes";

function ensureThemeFonts(): void {
	if (document.querySelector(`link[${THEME_FONTS_ATTR}]`)) return;

	const preconnectGoogle = document.createElement("link");
	preconnectGoogle.rel = "preconnect";
	preconnectGoogle.href = "https://fonts.googleapis.com";
	preconnectGoogle.setAttribute(THEME_FONTS_ATTR, "");

	const preconnectGstatic = document.createElement("link");
	preconnectGstatic.rel = "preconnect";
	preconnectGstatic.href = "https://fonts.gstatic.com";
	preconnectGstatic.crossOrigin = "anonymous";
	preconnectGstatic.setAttribute(THEME_FONTS_ATTR, "");

	const stylesheet = document.createElement("link");
	stylesheet.rel = "stylesheet";
	stylesheet.href = THEME_FONTS_HREF;
	stylesheet.setAttribute(THEME_FONTS_ATTR, "");

	document.head.append(preconnectGoogle, preconnectGstatic, stylesheet);
}

export default function CssThemes() {
	useEffect(() => {
		ensureThemeFonts();

		const root = document.documentElement;
		root.classList.add(THEME_ROOT_CLASS);
		syncThemeToRoot(root);

		const unsubscribe = cssThemes$.subscribe(() => {
			syncThemeToRoot(root);
		});

		return () => {
			unsubscribe();
			clearThemeFromRoot(root);
			root.classList.remove(THEME_ROOT_CLASS);
		};
	}, []);

	return (
		<ToolShell
			title="Temas CSS"
			description="Presets, edição de tokens e preview de seções. O estado fica salvo no navegador."
			icon={<Palette className="size-6" strokeWidth={2} />}
			storage={cssThemesStorage}
		>
			<div className="w-full">
				<App />
			</div>
		</ToolShell>
	);
}
