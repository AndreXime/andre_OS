import { ImagePlus } from "lucide-react";
import { ToolShell } from "../ToolShell";
import ImageToolsView from "./ui/ImageToolsView";
import "./styles.css";

export default function ImageTools() {
	return (
		<ToolShell
			title="Ferramentas de Imagem"
			description="Converta, comprima ou remova o fundo de uma ou varias imagens. Tudo acontece direto no seu navegador, sem enviar seus arquivos para nenhum servidor."
			icon={<ImagePlus className="size-6" strokeWidth={2} />}
		>
			<ImageToolsView />
		</ToolShell>
	);
}
