"use client";
import { toolCategories, type ActiveTool } from "./toolsData";
import { useCallback, useState } from "preact/hooks";
import { ChevronRight, ArrowLeft } from "lucide-preact";
import ToolLoader from "./ToolLoader";

export default function EveryDayUtils() {
	const [selectedTool, setSelectedTool] = useState<ActiveTool>();
	const isListView = !selectedTool;

	const handleSelectTool = useCallback((tool: ActiveTool) => {
		setSelectedTool(tool);
	}, []);

	const handleBackToList = useCallback(() => {
		setSelectedTool(undefined);
	}, []);

	return (
		<div className="flex justify-center bg-[#121212]">
			<div className="p-4 flex flex-col items-center container">
				<main className="w-full bg-[#1E1E1E] border border-white/5 rounded-xl shadow-2xl p-4 sm:p-8">
					<section
						id="tool-list-view"
						className={isListView ? "animate-in fade-in slide-in-from-bottom-4 duration-500" : "hidden"}
					>
						<h2 className="text-2xl font-bold text-[#E2E8F0] mb-8 border-b border-white/10 pb-4">Ferramentas Úteis</h2>

						<div className="space-y-8">
							{toolCategories.map((category) => {
								const theme = category.theme;

								return (
									<div key={category.name} className="space-y-3">
										<div className="flex items-center gap-2 mb-3">
											<div className={`h-6 w-1 rounded-full ${theme.button.split(" ")[0]}`} />{" "}
											<h3 className={`font-bold ${theme.text} text-lg tracking-wide`}>{category.name}</h3>
										</div>

										<div className="grid gap-3">
											{category.tools.map((tool) => {
												const Icon = tool.icon;
												return (
													<button
														key={tool.title}
														// Botão da ferramenta: Fundo escuro (#252525) com hover colorido sutil
														className={`group w-full text-left p-4 rounded-lg flex items-center justify-between 
                                                            bg-[#252525] border border-white/5 hover:border-opacity-0
                                                            ${theme.border} hover:${theme.softBg} 
                                                            transition-all duration-200 shadow-sm hover:shadow-md`}
														onClick={() => handleSelectTool({ ...tool, colors: category.theme })}
													>
														<span className="text-base sm:text-lg font-medium text-slate-200 flex items-center flex-1 pr-2 group-hover:text-white transition-colors">
															<Icon
																className={`w-5 h-5 ${theme.icon} mr-3 opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all`}
															/>
															{tool.title}
														</span>
														<ChevronRight
															className={`${theme.icon} h-5 w-5 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all`}
														/>
													</button>
												);
											})}
										</div>
									</div>
								);
							})}
						</div>
					</section>

					<section className={isListView ? "hidden" : "animate-in fade-in slide-in-from-right-8 duration-300"}>
						<button
							onClick={handleBackToList}
							className="flex items-center text-slate-400 hover:text-white mb-6 transition-colors group px-2 py-1 -ml-2 rounded-md hover:bg-white/5"
						>
							<ArrowLeft className="h-5 w-5 mr-1 group-hover:-translate-x-1 transition-transform" />
							Voltar
						</button>

						{selectedTool && <ToolLoader tool={selectedTool} />}
					</section>
				</main>
			</div>
		</div>
	);
}
