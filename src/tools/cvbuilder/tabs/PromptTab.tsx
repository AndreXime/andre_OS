import { Check, Copy } from "lucide-react";
import { useState, useMemo } from "react";
import { useStore } from "@nanostores/react";
import { masterProfile$ } from "../lib/store";
import IAPromptTemplate from "../markdown/promptExample.md?raw";

export function PromptTab() {
	const [copied, setCopied] = useState(false);
	const masterProfile = useStore(masterProfile$);

	const promptFinal = useMemo(() => {
		const userContent = masterProfile || "";
		return IAPromptTemplate.replace("[USERDATA]", userContent);
	}, [masterProfile]);

	const handleCopyPrompt = () => {
		navigator.clipboard.writeText(promptFinal);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	return (
		<div className="flex-1 flex flex-col p-5 animate-in fade-in slide-in-from-left-4 duration-200 h-full">
			<div className="flex justify-between items-center mb-2">
				<div className="text-sm font-semibold text-blue-800 uppercase tracking-wide">Prompt Pronto</div>
				<button
					onClick={handleCopyPrompt}
					className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-bold transition-all ${
						copied ? "bg-green-500 text-white" : "bg-blue-600 text-white hover:bg-blue-700"
					}`}
				>
					{copied ? (
						<>
							<Check size={14} /> Copiado!
						</>
					) : (
						<>
							<Copy size={14} /> Copiar
						</>
					)}
				</button>
			</div>
			<p className="text-xs text-slate-500 mb-2">
				Este prompt já contém os dados da aba "Contexto". Copie e cole no ChatGPT/Claude junto com a descrição da vaga.
			</p>
			<textarea
				readOnly
				className="flex-1 w-full p-4 border border-slate-300 rounded-md text-sm text-slate-700 resize-none bg-slate-100 focus:outline-none font-mono"
				value={promptFinal}
			/>
		</div>
	);
}
