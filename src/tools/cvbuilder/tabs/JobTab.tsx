import { useStore } from "@nanostores/react";
import { jobDescription$, updateJobDescription } from "../lib/store";

export function JobTab() {
	const jobDescription = useStore(jobDescription$);

	return (
		<div className="flex-1 flex flex-col p-5 animate-in fade-in slide-in-from-left-4 duration-200 h-full">
			<div className="flex justify-between items-center mb-2">
				<div className="text-sm font-semibold text-blue-800 uppercase tracking-wide">Vaga</div>
				<div className="text-[10px] text-slate-500 bg-slate-200 px-2 py-1 rounded">Salvo automaticamente</div>
			</div>
			<p className="text-xs text-slate-500 mb-3 text-justify">
				Cole aqui a descrição completa da vaga. Esses dados serão injetados automaticamente no Prompt da IA em conjunto com
				seu contexto.
			</p>
			<textarea
				className="flex-1 w-full p-4 border border-slate-300 rounded-md text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none leading-relaxed bg-white"
				placeholder="Cole aqui o texto da vaga..."
				value={jobDescription}
				onInput={(e) => updateJobDescription(e.currentTarget.value)}
			/>
		</div>
	);
}

