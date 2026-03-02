import "./styles.css";
import { Printer, FileText, Briefcase, User, Database, Eye, BookOpen, FileSearch } from "lucide-react";
import { useState } from "react";
import type React from "react";

import { printResume } from "./lib/store";
import { EditorTab } from "./tabs/EditorTab";
import { ContextTab } from "./tabs/ContextTab";
import { PromptTab } from "./tabs/PromptTab";
import { SavedResumesTab } from "./tabs/SavedResumesTab";
import { JobTab } from "./tabs/JobTab";
import ResumeContent from "./Page";

type TabId = 1 | 2 | 3 | 4 | 5 | 6;

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
	{ id: 1, label: "Editor", icon: <User size={16} /> },
	{ id: 2, label: "Dados pessoais", icon: <BookOpen size={16} /> },
	{ id: 3, label: "Vaga", icon: <FileSearch size={16} /> },
	{ id: 4, label: "Prompt IA", icon: <Briefcase size={16} /> },
	{ id: 5, label: "Salvos", icon: <Database size={16} /> },
	{ id: 6, label: "Preview", icon: <Eye size={16} /> },
];

export default function CVBuilderApp() {
	const [activeTab, setActiveTab] = useState<TabId>(1);

	return (
		<div className="flex justify-center bg-slate-200/50 flex-1 min-h-screen w-full overflow-x-hidden print:contents">
			<div className="flex flex-col items-center w-full lg:container">
				<main className="w-full bg-white overflow-hidden flex flex-col min-h-screen print:contents">
					<div className="bg-blue-600 text-white px-4 pt-4 pb-0 lg:px-8 lg:pt-5">
						<header className="flex items-center gap-4">
							<h2 className="font-bold text-lg flex items-center gap-2">
								<FileText size={20} />
								<span>Gerador de CV</span>
							</h2>
							<button
								onClick={printResume}
								className="ml-auto inline-flex items-center gap-2 px-3 py-2 rounded-full bg-white text-blue-700 text-xs font-semibold uppercase tracking-wide shadow-sm hover:bg-slate-100 hover:shadow-md transition-colors"
								title="Imprimir / Salvar PDF"
							>
								<Printer size={16} />
								<span>Imprimir</span>
							</button>
						</header>

						<nav className="mt-3 flex space-x-1 overflow-x-auto">
							{TABS.map((tab) => (
								<button
									key={tab.id}
									onClick={() => setActiveTab(tab.id)}
									className={`flex-1 flex items-center justify-center gap-2 px-3 py-3 text-xs font-bold uppercase tracking-wider transition-all rounded-t-md ${
										activeTab === tab.id
											? "bg-white text-blue-700"
											: "bg-blue-500/30 text-blue-100 hover:bg-blue-500/50 hover:text-white"
									}`}
								>
									{tab.icon} <span className="truncate hidden sm:inline">{tab.label}</span>
								</button>
							))}
						</nav>
					</div>

					<section className="flex-1 flex flex-col mt-4 px-4 pb-4 lg:px-8 lg:pb-8">
						{activeTab === 6 ? (
							<div className="flex-1 w-full overflow-x-auto">
								<div className="flex justify-center">
									<div className="origin-top scale-[0.45] sm:scale-75 lg:scale-100 transition-transform duration-300 shadow-2xl bg-white inline-block print:contents">
										<ResumeContent />
									</div>
								</div>
							</div>
						) : (
							<div className="flex-1 flex flex-col bg-slate-50 relative overflow-hidden pointer-events-auto rounded-lg border border-slate-200 min-h-[400px]">
								{activeTab === 1 && <EditorTab />}
								{activeTab === 2 && <ContextTab />}
								{activeTab === 3 && <JobTab />}
								{activeTab === 4 && <PromptTab />}
								{activeTab === 5 && <SavedResumesTab />}
							</div>
						)}
					</section>
				</main>
			</div>
		</div>
	);
}
