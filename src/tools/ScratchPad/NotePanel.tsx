import { useEffect, useMemo, useRef } from "react";
import { Copy, Eye, EyeOff, Pin, StickyNote, Trash2 } from "lucide-react";
import { marked } from "marked";
import { toolEditorSurfaceClass, toolIconBtnActiveClass, toolIconBtnClass, toolProseClass, toolTextareaClass } from "@/lib/toolUi";
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
					className="flex-1 min-w-[12rem] bg-transparent text-base font-semibold text-ink placeholder:text-muted/50 outline-none border-b border-transparent focus:border-rule pb-1"
				/>
				<div className="flex items-center gap-1 ml-auto">
					<button
						type="button"
						onClick={() => togglePin(note.id)}
						title={note.pinned ? "Desafixar" : "Fixar"}
						className={[
							toolIconBtnClass,
							note.pinned ? toolIconBtnActiveClass : "",
						].join(" ")}
					>
						<Pin className="size-4" fill={note.pinned ? "currentColor" : "none"} />
					</button>
					<button
						type="button"
						onClick={() => onPreviewChange(!preview)}
						title={preview ? "Editar" : "Preview Markdown"}
						className={toolIconBtnClass}
					>
						{preview ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
					</button>
					<button
						type="button"
						onClick={onCopy}
						title="Copiar"
						className={toolIconBtnClass}
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
						className="p-2 rounded-lg text-muted hover:text-accent hover:bg-accent-bg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
					>
						<Trash2 className="size-4" />
					</button>
				</div>
			</div>

			<div className={toolEditorSurfaceClass}>
				{preview ? (
					<div
						className={toolProseClass}
						dangerouslySetInnerHTML={{ __html: html || "<p class='opacity-50 italic'>Nada para visualizar</p>" }}
					/>
				) : (
					<textarea
						ref={textareaRef}
						key={`body-${note.id}`}
						defaultValue={note.body}
						onChange={(e) => updateNote(note.id, { body: e.target.value })}
						placeholder="Comece a escrever… Suporta Markdown."
						className={`${toolTextareaClass} h-full min-h-[16rem] resize-none border-0 bg-transparent`}
					/>
				)}
			</div>

			<footer className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] uppercase tracking-[0.12em] text-muted/70 shrink-0">
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
		<div className="flex min-h-0 flex-1 flex-col items-center justify-center text-muted/80 opacity-60 px-4">
			<StickyNote size={56} strokeWidth={1.5} className="mb-3 text-accent" />
			<p className="text-sm text-center max-w-xs">Selecione uma nota ou crie uma nova para começar.</p>
		</div>
	);
}
