import { useEffect, useRef } from "react";
import { Palette } from "lucide-react";
import { ToolShell } from "../ToolShell";
import { App } from "./App";
import { cssThemes$, cssThemesStorage, syncThemeToRoot } from "./store/themeStore";
import "./index.css";

export default function CssThemes() {
	const rootRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const root = rootRef.current;
		if (!root) return;

		syncThemeToRoot(root);
		const unsubscribe = cssThemes$.subscribe(() => {
			syncThemeToRoot(root);
		});
		return unsubscribe;
	}, []);

	return (
		<ToolShell
			title="Temas CSS"
			description="Presets, edição de tokens e preview de seções. O estado fica salvo no navegador."
			icon={<Palette className="size-6" strokeWidth={2} />}
			storage={cssThemesStorage}
		>
			<div ref={rootRef} className="css-themes w-full">
				<App />
			</div>
		</ToolShell>
	);
}
