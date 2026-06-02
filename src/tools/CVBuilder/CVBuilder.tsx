import "./styles.css";
import { Printer, FileText, Briefcase, User, Database, Eye, BookOpen, FileSearch } from "lucide-react";
import { useState } from "react";
import type React from "react";

import { ToolShell } from "../ToolShell";
import { printResume } from "./lib/store";
import { EditorTab } from "./tabs/EditorTab";
import { ContextTab } from "./tabs/ContextTab";
import { PromptTab } from "./tabs/PromptTab";
import { SavedResumesTab } from "./tabs/SavedResumesTab";
import { JobTab } from "./tabs/JobTab";
import ResumeContent from "./Page";

type TabId = 1 | 2 | 3 | 4 | 5 | 6;

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
	{ id: 1, label: "Dados pessoais", icon: <BookOpen size={16} /> },
	{ id: 2, label: "Vaga", icon: <FileSearch size={16} /> },
	{ id: 3, label: "Prompt IA", icon: <Briefcase size={16} /> },
	{ id: 4, label: "Editor", icon: <User size={16} /> },
	{ id: 6, label: "Preview", icon: <Eye size={16} /> },
	{ id: 5, label: "Salvos", icon: <Database size={16} /> },
];

export default function CVBuilderApp() {
	const [activeTab, setActiveTab] = useState<TabId>(1);

	return (
		<>
			<div className="print:hidden overflow-x-hidden">
				<ToolShell
					title="Gerador de CV"
					description="Monte currículos em Markdown, gere prompts para IA e exporte em PDF."
					icon={<FileText className="size-6" strokeWidth={2} />}
					actions={
						<button
							type="button"
							onClick={printResume}
							className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold bg-[color:var(--primary)] text-[color:var(--primary-text)] hover:opacity-90 shadow-sm shadow-black/20 active:scale-[0.99] transition-[opacity,transform] focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--background)] shrink-0"
							title="Imprimir / Salvar PDF"
						>
							<Printer size={16} />
							<span>Imprimir</span>
						</button>
					}
				>
					<div className="flex flex-col flex-1 min-h-0 -mt-1">
						<nav className="flex gap-1 overflow-x-auto pb-px" aria-label="Abas do gerador">
							{TABS.map((tab) => {
								const isActive = activeTab === tab.id;
								return (
									<button
										key={tab.id}
										type="button"
										onClick={() => setActiveTab(tab.id)}
										className={[
											"flex shrink-0 items-center justify-center gap-2 px-3 py-2.5 text-xs font-semibold uppercase tracking-wider transition-all rounded-t-xl border border-b-0",
											isActive
												? "bg-white border-slate-200 text-slate-800"
												: "bg-[color:var(--card-bg)] border-[color:var(--card-border)] text-[color:var(--text)] hover:text-[color:var(--headline)] hover:border-[color:var(--primary)]/35",
										].join(" ")}
									>
										{tab.icon}
										<span className="truncate hidden sm:inline">{tab.label}</span>
									</button>
								);
							})}
						</nav>
						{activeTab === 6 ? (
							<div className="flex-1 w-full overflow-x-auto pt-4">
								<div className="flex justify-center">
									<div className="origin-top scale-[0.45] sm:scale-75 lg:scale-100 transition-transform duration-300 shadow-2xl bg-white inline-block print:contents">
										<ResumeContent />
									</div>
								</div>
							</div>
						) : (
							<div className="flex-1 flex flex-col bg-slate-50 relative overflow-hidden pointer-events-auto rounded-b-2xl rounded-tr-2xl border border-slate-200 min-h-[400px] -mt-px">
								{activeTab === 1 && <ContextTab />}
								{activeTab === 2 && <JobTab />}
								{activeTab === 3 && <PromptTab />}
								{activeTab === 4 && <EditorTab />}
								{activeTab === 5 && <SavedResumesTab />}
							</div>
						)}
					</div>
				</ToolShell>
			</div>
			<div className="not-print:hidden w-full">
				<ResumeContent />
			</div>
		</>
	);
}
