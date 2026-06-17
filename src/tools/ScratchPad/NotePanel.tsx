import { useEffect, useMemo, useRef } from "react";
import { Copy, Eye, EyeOff, Pin, StickyNote, Trash2 } from "lucide-react";
import { marked } from "marked";
import { displayTitle, removeNote, togglePin, updateNote, type Note } from "./store";
import { countWords, formatDate } from "./utils";

interface NotePanelProps {
	note: Note;
	preview: boolean;
	onPreviewChange: (preview: boolean) => void;
	onDelete: () => void;
	onCopy: () => void;
}

export function NotePanel({ note, preview, onPreviewChange, onDelete, onCopy }: NotePanelProps) {
	const textareaRef = useRef<HTMLTextAreaElement>(null);

	useEffect(() => {
		if (!preview) textareaRef.current?.focus();
	}, [preview]);

	const html = useMemo(() => {
		if (!preview || note.body.trim() === "") return "";
		return marked.parse(note.body, { async: false }) as string;
	}, [note.body, preview]);

	const wordCount = countWords(note.body);
	const charCount = note.body.length;

	return (
		<div className="flex flex-col min-h-0 flex-1 gap-3">
			<div className="flex flex-wrap items-center gap-2 shrink-0">
				<input
					key={`title-${note.id}`}
					defaultValue={note.title}
					placeholder={displayTitle(note)}
					onChange={(e) => updateNote(note.id, { title: e.target.value })}
					className="flex-1 min-w-[12rem] bg-transparent text-base font-semibold text-[color:var(--headline)] placeholder:text-[color:var(--text)]/50 outline-none border-b border-transparent focus:border-[color:var(--card-border)] pb-1"
				/>
				<div className="flex items-center gap-1 ml-auto">
					<button
						type="button"
						onClick={() => togglePin(note.id)}
						title={note.pinned ? "Desafixar" : "Fixar"}
						className={[
							"p-2 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--primary)]",
							note.pinned
								? "text-[color:var(--primary)] bg-[color-mix(in_srgb,var(--primary)_15%,var(--card-bg))]"
								: "text-[color:var(--text)] hover:text-[color:var(--headline)] hover:bg-[color:var(--card-bg)]",
						].join(" ")}
					>
						<Pin className="size-4" fill={note.pinned ? "currentColor" : "none"} />
					</button>
					<button
						type="button"
						onClick={() => onPreviewChange(!preview)}
						title={preview ? "Editar" : "Preview Markdown"}
						className="p-2 rounded-lg text-[color:var(--text)] hover:text-[color:var(--headline)] hover:bg-[color:var(--card-bg)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--primary)]"
					>
						{preview ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
					</button>
					<button
						type="button"
						onClick={onCopy}
						title="Copiar"
						className="p-2 rounded-lg text-[color:var(--text)] hover:text-[color:var(--headline)] hover:bg-[color:var(--card-bg)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--primary)]"
					>
						<Copy className="size-4" />
					</button>
					<button
						type="button"
						onClick={() => {
							const ok = globalThis.confirm(`Remover "${displayTitle(note)}"?`);
							if (!ok) return;
							removeNote(note.id);
							onDelete();
						}}
						title="Excluir"
						className="p-2 rounded-lg text-[color:var(--text)] hover:text-[color:var(--primary)] hover:bg-[color-mix(in_srgb,var(--primary)_10%,var(--card-bg))] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--primary)]"
					>
						<Trash2 className="size-4" />
					</button>
				</div>
			</div>

			<div className="flex-1 min-h-0 rounded-xl border border-[color:var(--card-border)] bg-[color:var(--card-bg)] overflow-hidden">
				{preview ? (
					<div
						className="prose prose-invert prose-sm max-w-none h-full overflow-y-auto p-4 text-[color:var(--card-text)]"
						dangerouslySetInnerHTML={{ __html: html || "<p class='opacity-50 italic'>Nada para visualizar</p>" }}
					/>
				) : (
					<textarea
						ref={textareaRef}
						key={`body-${note.id}`}
						defaultValue={note.body}
						onChange={(e) => updateNote(note.id, { body: e.target.value })}
						placeholder="Comece a escrever… Suporta Markdown."
						className="w-full h-full min-h-[16rem] resize-none bg-transparent p-4 text-sm leading-relaxed text-[color:var(--card-text)] placeholder:text-[color:var(--text)]/50 outline-none"
					/>
				)}
			</div>

			<footer className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] uppercase tracking-[0.12em] text-[color:var(--text)]/70 shrink-0">
				<span>{wordCount} palavras</span>
				<span>{charCount} caracteres</span>
				<span className="ml-auto normal-case tracking-normal text-[11px]">
					Atualizado {formatDate(note.updatedAt)}
				</span>
			</footer>
		</div>
	);
}

export function EmptyNotePanel() {
	return (
		<div className="flex min-h-0 flex-1 flex-col items-center justify-center text-[color:var(--text)]/80 opacity-60 px-4">
			<StickyNote size={56} strokeWidth={1.5} className="mb-3 text-[color:var(--primary)]" />
			<p className="text-sm text-center max-w-xs">Selecione uma nota ou crie uma nova para começar.</p>
		</div>
	);
}
