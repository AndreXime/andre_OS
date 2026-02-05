import { useStore } from "@nanostores/preact";
import { masterProfile$, updateMasterProfile } from "../lib/store";
import { useLayoutEffect, useRef } from "preact/hooks";

export function ContextTab() {
	const masterProfile = useStore(masterProfile$);
	const textareaRef = useRef<HTMLTextAreaElement>(null);

	useLayoutEffect(() => {
		if (textareaRef.current && masterProfile) {
			textareaRef.current.value = masterProfile;
		}
	}, [masterProfile]);

	return (
		<div className="flex-1 flex flex-col p-5 animate-in fade-in slide-in-from-left-4 duration-200 h-full">
			<div className="flex justify-between items-center mb-2">
				<div className="text-sm font-semibold text-blue-800 uppercase tracking-wide">
					Seus Dados (Base de Conhecimento)
				</div>
				<div className="text-[10px] text-slate-500 bg-slate-200 px-2 py-1 rounded">Salvo automaticamente</div>
			</div>
			<p className="text-xs text-slate-500 mb-3 text-justify">
				Cole aqui toda sua trajetória, projetos detalhados e "About Me". Estes dados serão injetados automaticamente no
				Prompt da IA.
			</p>
			<textarea
				ref={textareaRef}
				className="flex-1 w-full p-4 border border-slate-300 rounded-md text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none leading-relaxed bg-white"
				placeholder="Cole aqui seu arquivo 'About Me'..."
				value={masterProfile}
				onInput={(e) => updateMasterProfile(e.currentTarget.value)}
			/>
		</div>
	);
}
