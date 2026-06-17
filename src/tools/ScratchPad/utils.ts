export const formatDate = (ts: number) =>
	new Intl.DateTimeFormat("pt-BR", {
		day: "2-digit",
		month: "short",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	}).format(new Date(ts));

export function countWords(text: string): number {
	const trimmed = text.trim();
	if (trimmed === "") return 0;
	return trimmed.split(/\s+/).length;
}
