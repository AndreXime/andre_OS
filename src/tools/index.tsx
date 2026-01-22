import { Loader2 } from "lucide-preact";
import { lazy, Suspense } from "preact/compat";

export const toolRegistry = ["WebCodeEditor"];

const WebCodeEditor = lazy(() => import("./editor/App"));

export function ToolLoader({ name }: { name: string }) {
	return (
		<Suspense
			fallback={
				<div className="flex h-full w-full items-center justify-center">
					<Loader2 className="animate-spin" size={32} />
				</div>
			}
		>
			{name === "WebCodeEditor" && <WebCodeEditor />}
		</Suspense>
	);
}
