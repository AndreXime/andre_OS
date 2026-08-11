import { QrCode } from "lucide-react";
import { ToolShell } from "../ToolShell";
import QrStreamView from "./QrStreamView";

export default function QrStream() {
	return (
		<ToolShell
			title="Transmissão óptica QR"
			description="Envie texto ou arquivos entre dois dispositivos só com a tela e a câmera, via stream de QR Codes. Tudo roda no navegador, sem servidor."
			icon={<QrCode className="size-6" strokeWidth={2} />}
		>
			<QrStreamView />
		</ToolShell>
	);
}
