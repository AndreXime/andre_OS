import { Printer, FileText, Briefcase, User, Expand, Minimize2, Database, Eye, BookOpen } from "lucide-react";
import { useState } from "react";
import type React from "react";

import { EditorTab } from "./tabs/EditorTab";
import { ContextTab } from "./tabs/ContextTab";
import { PromptTab } from "./tabs/PromptTab";
import { SavedResumesTab } from "./tabs/SavedResumesTab";

export default function Sidebar() {
	const [activeTab, setActiveTab] = useState<1 | 2 | 3 | 4 | 5>(1);
	const [expand, setExpand] = useState(false);

	const isMobilePreview = activeTab === 4;

	return (
		<aside
			className={`
				fixed top-0 left-0 z-50 flex flex-col font-sans transition-all duration-300 border-r border-slate-200 shadow-xl print:hidden
				${!expand ? "min-[1282px]:w-[550px]" : "w-full"} 
				w-full
				${isMobilePreview ? "h-auto bg-transparent shadow-none border-none pointer-events-none" : "h-full bg-white pointer-events-auto"}
			`}
		>
			<div className="bg-blue-600 text-white shadow-md shrink-0 pointer-events-auto">
				{/* Cabeçalho */}
				<div className="p-4 flex items-center justify-start gap-10">
					<h2 className="font-bold text-lg flex items-center gap-2">
						<FileText size={20} />
						Gerador CV
					</h2>
					<div className="flex gap-3">
						<button
							onClick={() => setExpand(!expand)}
							className="hidden min-[1282px]:block p-2 bg-white/10 hover:bg-white/20 rounded-md transition-colors"
							title={expand ? "Recolher" : "Expandir"}
						>
							{expand ? <Minimize2 size={18} /> : <Expand size={18} />}
						</button>
						<button
							onClick={() => window.print()}
							className="p-2 bg-white/10 hover:bg-white/20 rounded-md transition-colors"
							title="Imprimir / Salvar PDF"
						>
							<Printer size={18} />
						</button>
					</div>
				</div>

				{/* Navegação de Abas */}
				<div className="flex px-2 space-x-1 overflow-x-auto no-scrollbar">
					<TabButton
						isActive={activeTab === 1}
						onClick={() => setActiveTab(1)}
						icon={<User size={16} />}
						label="Editor"
					/>
					<TabButton
						isActive={activeTab === 5}
						onClick={() => setActiveTab(5)}
						icon={<BookOpen size={16} />}
						label="Contexto"
					/>
					<TabButton
						isActive={activeTab === 2}
						onClick={() => setActiveTab(2)}
						icon={<Briefcase size={16} />}
						label="Prompt IA"
					/>
					<TabButton
						isActive={activeTab === 3}
						onClick={() => setActiveTab(3)}
						icon={<Database size={16} />}
						label="Salvos"
					/>
					<div className="min-[1280px]:hidden contents">
						<TabButton
							isActive={activeTab === 4}
							onClick={() => setActiveTab(activeTab === 4 ? 1 : 4)}
							icon={<Eye size={16} />}
							label="Ver"
						/>
					</div>
				</div>
			</div>

			{/* Renderização Condicional das Abas */}
			{!isMobilePreview && (
				<div className="flex-1 flex flex-col bg-slate-50 relative overflow-hidden pointer-events-auto">
					{activeTab === 1 && <EditorTab />}
					{activeTab === 5 && <ContextTab />}
					{activeTab === 2 && <PromptTab />}
					{activeTab === 3 && <SavedResumesTab />}
				</div>
			)}
		</aside>
	);
}

const TabButton = ({
	isActive,
	onClick,
	icon,
	label,
}: {
	isActive: boolean;
	onClick: () => void;
	icon: React.ReactNode;
	label: string;
}) => (
	<button
		onClick={onClick}
		className={`flex-1 min-w-[50px] md:min-w-[80px] flex items-center justify-center gap-2 px-2 py-3 text-xs font-bold uppercase tracking-wider transition-all border-b-4 ${
			isActive
				? "border-white bg-blue-700/30 text-white"
				: "border-transparent text-blue-200 hover:bg-blue-700/20 hover:text-white"
		}`}
	>
		{icon} <span className="truncate hidden sm:inline">{label}</span>
	</button>
);
