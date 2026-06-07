export const formatDate = (ts: number) =>
	new Intl.DateTimeFormat("pt-BR", {
		day: "2-digit",
		month: "short",
		year: "numeric",
	}).format(new Date(ts));
