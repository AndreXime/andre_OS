import { tools, type ToolListItem } from "./toolsData";
import { useState } from "react";
import { ChevronRight, ArrowLeft, Wrench } from "lucide-react";
import { ToolShell } from "../ToolShell";

export default function UtilsApp() {
	const [selectedTool, setSelectedTool] = useState<ToolListItem>();
	const isListView = !selectedTool;

	return (
		<ToolShell
			title="Ferramentas Úteis"
			description="Calculadoras, geradores e conversores práticos para o dia a dia. Tudo roda localmente no navegador."
			icon={<Wrench className="size-6" strokeWidth={2} />}
		>
			<section
				id="tool-list-view"
				className={isListView ? "animate-in fade-in slide-in-from-bottom-4 duration-500" : "hidden"}
			>
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

			<section className={isListView ? "hidden" : "animate-in fade-in slide-in-from-right-8 duration-300"}>
				<button
					type="button"
					onClick={() => setSelectedTool(undefined)}
					className="flex items-center text-[color:var(--text)] hover:text-[color:var(--headline)] mb-4 transition-colors group px-2 py-1 -ml-2 rounded-lg hover:bg-[color-mix(in_srgb,var(--primary)_8%,transparent)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--primary)]"
				>
					<ArrowLeft className="h-5 w-5 mr-1 group-hover:-translate-x-1 transition-transform" />
					Voltar
				</button>

				{selectedTool && (
					<div className="rounded-2xl border border-[color:var(--card-border)] bg-[color:var(--card-bg)] shadow-sm shadow-black/10 overflow-hidden">
						<div className="p-4 sm:p-5 flex flex-col gap-4">
							<h2 className="text-xl font-bold flex items-center gap-2 border-b border-[color:var(--card-border)] pb-3 text-[color:var(--headline)]">
								<selectedTool.icon className="w-5 h-5 shrink-0 text-[color:var(--primary)]" />
								{selectedTool.title}
							</h2>
							<selectedTool.component />
						</div>
					</div>
				)}
			</section>
		</ToolShell>
	);
}
