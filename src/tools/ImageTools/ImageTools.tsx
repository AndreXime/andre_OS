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
			<ImageToolsView />
		</ToolShell>
	);
}
