import { useStore } from "@nanostores/react";
import { Check, Copy } from "lucide-react";
import { useMemo, useState } from "react";
import { jobDescription$, masterProfile$ } from "../lib/store";
import defaultCV from "../markdown/cvExample.md?raw";
import IAPrompt from "../markdown/promptExample.md?raw";

export function PromptTab() {
	const [copied, setCopied] = useState(false);
	const masterProfile = useStore(masterProfile$);
	const jobDescription = useStore(jobDescription$);

	const promptFinal = useMemo(() => {
		const userContent = masterProfile || "";
		const jobContent = jobDescription || "";
		return IAPrompt.replace("[USERDATA]", userContent)
			.replace("[JOBDATA]", jobContent)
			.replace("[CVEXAMPLE]", defaultCV);
	}, [masterProfile, jobDescription]);

	const handleCopyPrompt = () => {
		navigator.clipboard.writeText(promptFinal);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	return (
		<div className="flex-1 flex flex-col p-5 animate-in fade-in slide-in-from-left-4 duration-200 h-full">
			<div className="flex justify-between items-center mb-2">
				<div className="text-sm font-semibold text-slate-800 uppercase tracking-[0.12em]">Prompt Pronto</div>
				<button
					type="button"
					onClick={handleCopyPrompt}
					className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
						copied ? "bg-emerald-600 text-white" : "bg-slate-800 text-white hover:bg-slate-900"
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
			<p className="text-sm text-slate-500 mb-2">
				Este prompt já contém os dados das abas "Dados pessoais" e "Vaga". Basta colar diretamente na IA de sua escolha.
			</p>
			<textarea
				readOnly
				className="flex-1 w-full p-4 border border-slate-300 rounded-md text-sm text-slate-700 resize-none bg-slate-100 focus:outline-none font-mono"
				value={promptFinal}
			/>
		</div>
	);
}
