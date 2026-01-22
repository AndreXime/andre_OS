import type { ComponentType } from "preact";

type ToolLoader = () => Promise<{
	default: ComponentType<unknown>;
}>;

export const toolRegistry = {
	WebCodeEditor: () => import("./editor/App"),
} as Record<string, ToolLoader>;

export async function loadTool(toolName: string) {
	const loader = toolRegistry[toolName];

	if (loader) {
		const module = await loader();

		const Component = module.default;
		return Component;
	}
}
