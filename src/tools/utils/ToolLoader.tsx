import { Suspense } from "preact/compat";
import type { ActiveTool } from "./toolsData";
import { Loader2Icon } from "lucide-preact";

export default function ToolLoader({ tool }: { tool: ActiveTool }) {
	const IconComponent = tool.icon;
	const colors = tool.colors;
	const ToolComponent = tool.component;

	return (
		<div className="tool-card space-y-4">
			<h2 className={`text-2xl font-bold ${colors.text} mb-4 flex items-center border-b border-white/5 pb-2`}>
				<IconComponent className={`w-6 h-6 ${colors.icon} mr-2 flex-shrink-0`} />
				{tool.title}
			</h2>

			<Suspense
				fallback={
					<div className="flex justify-center items-center w-full h-[100px]">
						<Loader2Icon className="animate-spin" size={40} />
					</div>
				}
			>
				<ToolComponent colors={colors} />
			</Suspense>
		</div>
	);
}
