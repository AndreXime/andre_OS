import type { ActiveTool } from "./toolsData";

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

			<ToolComponent colors={colors} />
		</div>
	);
}
