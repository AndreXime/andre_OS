import { Palette } from "lucide-react";
import { ToolShell } from "../ToolShell";
import { CanvasView } from "./CanvasView";
import { canvasStorage } from "./store";

export default function Canvas() {
	return (
		<ToolShell
			title="Canvas"
			description="Editor gráfico 2D no navegador: formas, texto, imagem, camadas, guias e exportação PNG. Tudo fica no seu dispositivo."
			icon={<Palette className="size-6" strokeWidth={2} />}
			storage={canvasStorage}
		>
			<CanvasView />
		</ToolShell>
	);
}
