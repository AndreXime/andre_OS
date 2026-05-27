import ImageToolsView from "./ImageToolsView";
import "./styles.css";

export default function ImageTools() {
	return (
		<div className="flex justify-center bg-[var(--background)] flex-1">
			<div className="p-4 flex flex-col items-center container">
				<main className="w-full bg-[var(--card-bg)] border border-[var(--card-border)]/50 rounded-xl shadow-2xl p-4 sm:p-8">
					<h2 className="text-2xl font-bold text-[var(--headline)] mb-6 border-b border-[var(--card-border)] pb-4">
						Ferramentas de Imagem
					</h2>
					<p className="text-sm text-[var(--text)]/80 -mt-3 mb-6">
						Converta imagens para outros formatos e reduza o tamanho do arquivo sem perder o essencial.
						Tudo acontece direto no seu navegador, sem enviar seus arquivos para nenhum servidor.
					</p>
					<ImageToolsView />
				</main>
			</div>
		</div>
	);
}
