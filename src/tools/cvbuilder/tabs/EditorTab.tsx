import { RotateCcw } from "lucide-react";
import { useLayoutEffect, useRef } from "react";
import { useStore } from "@nanostores/react";
import { activeResume$, updateResumeContent, resetActiveResume } from "../lib/store";

export function EditorTab() {
	const activeResume = useStore(activeResume$);
	const textareaRef = useRef<HTMLTextAreaElement>(null);

	// Mantém o hack do useLayoutEffect para garantir atualização do textarea ao trocar de CV
	useLayoutEffect(() => {
		if (textareaRef.current && activeResume) {
			textareaRef.current.value = activeResume.data;
		}
	}, [activeResume]);

	return (
		<div className="flex-1 flex flex-col p-5 animate-in fade-in slide-in-from-left-4 duration-200 h-full">
			<div className="flex justify-between items-center mb-2">
				<label htmlFor="cv-content" className="text-sm font-semibold text-blue-800 uppercase tracking-wide truncate">
					Editando: {activeResume?.name}
				</label>
				<button
					onClick={resetActiveResume}
					className="flex items-center gap-2 px-3 py-1.5 rounded text-xs font-bold transition-all bg-white border border-slate-300 text-slate-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 shadow-sm"
				>
					<RotateCcw size={14} />
					Resetar
				</button>
			</div>
			<textarea
				ref={textareaRef}
				id="cv-content"
				name="cv-content"
				autoComplete="off"
				key={activeResume?.id}
				className="flex-1 w-full p-4 border border-slate-300 rounded-md text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none leading-relaxed"
				placeholder="Siga o exemplo padrão"
				defaultValue={activeResume?.data}
				onInput={(e) => updateResumeContent(e.currentTarget.value)}
			/>
		</div>
	);
}
