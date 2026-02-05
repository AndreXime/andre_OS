import { Loader2 } from "lucide-preact";
import { lazy, Suspense, type JSX } from "preact/compat";

export const ToolRegistry: Record<string, () => JSX.Element> = {
	WebCodeEditor: lazy(() => import("./editor/App")),
	EveryDayUtils: lazy(() => import("./utils/App")),
	CVBuilder: lazy(() => import("./cvbuilder/Page")),
};

export function ToolLoader({ name }: { name: string }) {
	const Component = ToolRegistry[name];

	return (
		<Suspense
			fallback={
				<div className="flex h-full w-full items-center justify-center">
					<Loader2 className="animate-spin" size={32} />
				</div>
			}
		>
			{Component ? <Component /> : <div>Componente não encontrado</div>}
		</Suspense>
	);
}
