export const formatDate = (date: Date) =>
	new Intl.DateTimeFormat("pt-BR", {
		day: "2-digit",
		month: "short",
		year: "numeric",
	}).format(date);

export const getDomain = (url: string) => url.replace(/^(https?:\/\/)?(www\.)?/, "").split("/")[0];

export const getThemeClasses = (toolType: string) => {
	switch (toolType) {
		case "tool":
			return {
				borderClass: "border-emerald-500/30",
				bgClass: "bg-emerald-950/20",
				badgeClass: "bg-emerald-950/30 text-emerald-400 border-emerald-900/50",
			};
		case "note":
			return {
				borderClass: "border-blue-500/30",
				bgClass: "bg-blue-950/20",
				badgeClass: "bg-blue-950/30 text-blue-400 border-blue-900/50",
			};
		case "link":
			return {
				borderClass: "border-violet-500/30",
				bgClass: "bg-violet-950/20",
				badgeClass: "bg-violet-950/30 text-violet-400 border-violet-900/50",
			};

		default:
			return {
				borderClass: "border-zinc-700",
				bgClass: "bg-zinc-900",
				badgeClass: "bg-zinc-800 text-zinc-400 border-zinc-700",
			};
	}
};
