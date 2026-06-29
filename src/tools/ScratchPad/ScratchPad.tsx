import { useCallback, useEffect, useMemo, useState } from "react";
import { useStore } from "@nanostores/react";
import { StickyNote } from "lucide-react";
import { ToolShell } from "../ToolShell";
import { ListPanel } from "./ListPanel";
import { EmptyNotePanel, NotePanel } from "./NotePanel";
import { createNote, displayTitle, scratchPad$, scratchPadStorage } from "./store";

export default function ScratchPad() {
	const { notes } = useStore(scratchPad$);
	const [selectedId, setSelectedId] = useState<string | null>(null);
	const [query, setQuery] = useState("");
	const [preview, setPreview] = useState(false);
	const [toast, setToast] = useState<string | null>(null);

	useEffect(() => {
		if (!toast) return;
		const t = setTimeout(() => setToast(null), 2800);
		return () => clearTimeout(t);
	}, [toast]);

	useEffect(() => {
		if (selectedId && !notes.some((n) => n.id === selectedId)) {
			setSelectedId(notes[0]?.id ?? null);
		}
	}, [notes, selectedId]);

	const selected = useMemo(
		() => (selectedId ? notes.find((n) => n.id === selectedId) : undefined),
		[notes, selectedId],
	);

	const filtered = useMemo(() => {
		const q = query.trim().toLowerCase();
		if (q === "") return [...notes];
		return notes.filter((n) => {
			const label = displayTitle(n).toLowerCase();
			return label.includes(q) || n.body.toLowerCase().includes(q) || n.title.toLowerCase().includes(q);
		});
	}, [notes, query]);

	const notify = useCallback((msg: string) => setToast(msg), []);

	function handleCreate() {
		const id = createNote();
		setSelectedId(id);
		setPreview(false);
	}

	function handleSelect(id: string) {
		setSelectedId(id);
		setPreview(false);
	}

	async function handleCopy() {
		if (!selected) return;
		const text = [displayTitle(selected), "", selected.body.trim()].filter(Boolean).join("\n");
		try {
			await navigator.clipboard.writeText(text);
			notify("Copiado para a área de transferência");
		} catch {
			notify("Não foi possível copiar");
		}
	}

	return (
		<>
			{toast && (
				<output
					aria-live="polite"
					className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 block px-4 py-2 rounded-full text-sm font-medium bg-paper-2 border border-accent/40 text-ink shadow-sm"
				>
					{toast}
				</output>
			)}

			<ToolShell
				title="Bloco de Notas"
				description="Notas locais no navegador, com busca, pin e preview em Markdown."
				icon={<StickyNote className="size-6" strokeWidth={2} />}
				storage={scratchPadStorage}
			>
				<div className="flex flex-1 min-h-0 min-w-0 w-full flex-col lg:flex-row">
					<aside className="flex w-full shrink-0 flex-col min-h-0 border-b border-rule p-4 lg:w-72 lg:border-b-0 lg:border-r lg:p-3">
						<ListPanel
							notes={notes}
							filtered={filtered}
							query={query}
							selectedId={selectedId}
							onQueryChange={setQuery}
							onCreate={handleCreate}
							onSelect={handleSelect}
						/>
					</aside>

					<main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden p-4">
						{selected ? (
							<NotePanel
								key={selected.id}
								note={selected}
								preview={preview}
								onPreviewChange={setPreview}
								onDelete={() => setSelectedId(notes.find((n) => n.id !== selected.id)?.id ?? null)}
								onCopy={handleCopy}
							/>
						) : (
							<EmptyNotePanel />
						)}
					</main>
				</div>
			</ToolShell>
		</>
	);
}
