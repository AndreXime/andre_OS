import { ImagePlus } from "lucide-react";
import { ToolShell } from "../ToolShell";
import ImageToolsView from "./ImageToolsView";
import "./styles.css";

export default function ImageTools() {
	return (
		<ToolShell
			title="Ferramentas de Imagem"
			description="Converta imagens para outros formatos e reduza o tamanho do arquivo sem perder o essencial. Tudo acontece direto no seu navegador, sem enviar seus arquivos para nenhum servidor."
			icon={<ImagePlus className="size-6" strokeWidth={2} />}
		>
			<section className="rounded-2xl border border-[color:var(--card-border)] bg-[color:var(--card-bg)] shadow-sm shadow-black/10 overflow-hidden">
				<div className="p-4 sm:p-5">
					<ImageToolsView />
				</div>
			</section>
		</ToolShell>
	);
}
