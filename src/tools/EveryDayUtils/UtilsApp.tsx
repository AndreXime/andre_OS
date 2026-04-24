import { tools, type ToolListItem } from "./toolsData";
import { useState } from "react";
import { ChevronRight, ArrowLeft } from "lucide-react";

export default function UtilsApp() {
	const [selectedTool, setSelectedTool] = useState<ToolListItem>();
	const isListView = !selectedTool;

	return (
		<div className="flex justify-center bg-[#121212] flex-1">
			<div className="p-4 flex flex-col items-center container">
				<main className="w-full bg-[#1E1E1E] border border-white/5 rounded-xl shadow-2xl p-4 sm:p-8">
					<section
						id="tool-list-view"
						className={isListView ? "animate-in fade-in slide-in-from-bottom-4 duration-500" : "hidden"}
					>
						<h2 className="text-2xl font-bold text-[#E2E8F0] mb-8 border-b border-white/10 pb-4">Ferramentas Úteis</h2>

						<div className="grid gap-3">
							{tools.map((tool) => {
								const Icon = tool.icon;

								return (
									<button
										key={tool.title}
										className={`cursor-pointer group w-full text-left p-4 rounded-lg flex items-center justify-between 
                                            bg-[#252525] border border-[var(--primary)]/20 hover:border-opacity-0
                                            hover:bg-[var(--primary)]/10 
                                            transition-all duration-200 shadow-sm hover:shadow-md`}
										onClick={() => setSelectedTool(tool)}
									>
										<span className="text-base sm:text-lg font-medium text-slate-200 flex items-center flex-1 pr-2 group-hover:text-white transition-colors">
											<Icon
												className="w-5 h-5 mr-3 opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all text-[var(--primary)]"
											/>
											{tool.title}
										</span>
										<ChevronRight
											className="h-5 w-5 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-[var(--primary)]"
										/>
									</button>
								);
							})}
						</div>
					</section>

					<section className={isListView ? "hidden" : "animate-in fade-in slide-in-from-right-8 duration-300"}>
						<button
							onClick={() => setSelectedTool(undefined)}
							className="flex items-center text-slate-400 hover:text-white mb-6 transition-colors group px-2 py-1 -ml-2 rounded-md hover:bg-white/5"
						>
							<ArrowLeft className="h-5 w-5 mr-1 group-hover:-translate-x-1 transition-transform" />
							Voltar
						</button>

						{selectedTool && (
							<div className="tool-card space-y-4">
								<h2
									className="text-2xl font-bold mb-4 flex items-center border-b border-white/5 pb-2 text-[var(--primary)]"
								>
									<selectedTool.icon
										className="w-6 h-6 mr-2 flex-shrink-0 text-[var(--primary)]"
									/>
									{selectedTool.title}
								</h2>

								<selectedTool.component />
							</div>
						)}
					</section>
				</main>
			</div>
		</div>
	);
}
