import { Upload } from "lucide-react";
import { useState } from "react";
import { ACCEPTED_EXTENSIONS, ACCEPTED_FORMATS_LABEL, formatFileSize, MAX_DIMENSION, MAX_FILE_BYTES } from "../domain";
import { dismissGlobalError, ErrorBanner } from "./components";

export function UploadZone({
	onFileSelect,
	onDrop,
	fileInputRef,
	error,
}: {
	onFileSelect: (files: FileList | null) => void;
	onDrop: (e: React.DragEvent) => void;
	fileInputRef: React.RefObject<HTMLInputElement | null>;
	error: string | null;
}) {
	const [dragOver, setDragOver] = useState(false);

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" || e.key === " ") {
			e.preventDefault();
			fileInputRef.current?.click();
		}
	};

	return (
		<div className="space-y-3">
			<button
				tabIndex={0}
				aria-label="Selecionar imagens para upload. Arraste arquivos ou pressione Enter."
				onKeyDown={handleKeyDown}
				onDragOver={(e) => {
					e.preventDefault();
					setDragOver(true);
				}}
				onDragLeave={() => setDragOver(false)}
				onDrop={(e) => {
					setDragOver(false);
					onDrop(e);
				}}
				onClick={() => fileInputRef.current?.click()}
				className={`w-full cursor-pointer flex flex-col items-center justify-center gap-4 py-16 px-8 border-2 border-dashed rounded-card transition-all duration-200 ${
					dragOver ? "border-accent bg-accent/10" : "border-rule hover:border-accent/50 hover:bg-paper-2/50"
				}`}
			>
				<div className="w-16 h-16 rounded-card bg-accent/10 flex items-center justify-center">
					<Upload className="w-8 h-8 text-accent" aria-hidden="true" />
				</div>
				<div className="text-center">
					<p className="text-ink font-medium mb-1">Arraste imagens ou clique para selecionar</p>
					<p className="text-sm text-muted/60">
						{ACCEPTED_FORMATS_LABEL} (max {formatFileSize(MAX_FILE_BYTES)}, {MAX_DIMENSION}px)
					</p>
				</div>
				<input
					ref={fileInputRef}
					type="file"
					accept={ACCEPTED_EXTENSIONS}
					multiple
					className="hidden"
					onChange={(e) => void onFileSelect(e.target.files)}
				/>
			</button>

			{error && <ErrorBanner message={error} onDismiss={dismissGlobalError} />}
		</div>
	);
}
