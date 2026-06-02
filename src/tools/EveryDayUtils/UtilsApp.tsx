import { tools, type ToolListItem } from "./toolsData";
import { useState } from "react";
import { ArrowLeft, ChevronRight, Wrench } from "lucide-react";
import { ToolShell } from "../ToolShell";

export default function UtilsApp() {
	const [selectedTool, setSelectedTool] = useState<ToolListItem>();
	const isListView = !selectedTool;

	return (
		<ToolShell
			title={selectedTool?.title ?? "Ferramentas Úteis"}
			{...(isListView
				? {
						description:
							"Calculadoras, geradores e conversores práticos para o dia a dia. Tudo roda localmente no navegador.",
					}
				: {})}
			icon={
				selectedTool ? (
					<selectedTool.icon className="size-6" strokeWidth={2} />
				) : (
					<Wrench className="size-6" strokeWidth={2} />
				)
			}
			{...(!isListView
				? {
						actions: (
							<button
								type="button"
								onClick={() => setSelectedTool(undefined)}
								className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium border border-[color:var(--card-border)] text-[color:var(--text)] hover:text-[color:var(--headline)] hover:border-[color:var(--primary)]/40 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--primary)]"
							>
								<ArrowLeft className="size-4" />
								Voltar
							</button>
						),
					}
				: {})}
		>
			{isListView ? (
				<section id="tool-list-view" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
					<div className="flex flex-col gap-2">
						{tools.map((tool) => {
							const Icon = tool.icon;

							return (
								<button
									key={tool.title}
									type="button"
									className="cursor-pointer group w-full text-left p-4 rounded-2xl flex items-center justify-between border border-[color:var(--card-border)] bg-[color:var(--card-bg)] hover:border-[color:var(--primary)]/45 hover:bg-[color-mix(in_srgb,var(--primary)_8%,var(--card-bg))] transition-[border,background,box-shadow] shadow-sm hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--primary)]"
									onClick={() => setSelectedTool(tool)}
								>
									<span className="text-base sm:text-lg font-medium text-[color:var(--card-text)] flex items-center flex-1 pr-2 group-hover:text-[color:var(--headline)] transition-colors">
										<Icon className="w-5 h-5 mr-3 opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all text-[color:var(--primary)]" />
										{tool.title}
									</span>
									<ChevronRight className="h-5 w-5 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-[color:var(--primary)]" />
								</button>
							);
						})}
					</div>
				</section>
			) : (
				selectedTool && (
					<div className="animate-in fade-in slide-in-from-right-8 duration-300">
						<selectedTool.component />
					</div>
				)
			)}
		</ToolShell>
	);
}
