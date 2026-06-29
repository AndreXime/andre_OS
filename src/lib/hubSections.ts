export type HubCategory = "all" | "tool" | "note" | "link" | "author";
export type HubContentKind = "note" | "tool" | "link";

export const HUB_INTRO = {
	title: "Notas de um desenvolvedor",
	lede: "Escrevo sobre arquitetura web, runtime e ferramentas. Publico apps utilitários e curadoria de links que uso no dia a dia.",
} as const;

export interface HubSectionDefinition {
	category: HubCategory;
	href: string;
	navLabel: string;
	title: string;
	description: string;
	kind?: HubContentKind;
}

export const HUB_SECTIONS: HubSectionDefinition[] = [
	{
		category: "all",
		href: "/",
		navLabel: "Início",
		title: "Início",
		description: "Visão geral e publicações recentes",
	},
	{
		category: "note",
		href: "/post",
		navLabel: "Notas",
		title: "Notas",
		description: "Artigos técnicos e rascunhos longos",
		kind: "note",
	},
	{
		category: "tool",
		href: "/app",
		navLabel: "Ferramentas",
		title: "Ferramentas",
		description: "Apps web que mantenho e uso",
		kind: "tool",
	},
	{
		category: "link",
		href: "/link",
		navLabel: "Links",
		title: "Links",
		description: "Referências salvas e recomendações",
		kind: "link",
	},
	{
		category: "author",
		href: "/autor",
		navLabel: "Autor",
		title: "Sobre o autor",
		description: "Quem escreve este hub e onde me encontrar",
	},
];

export const HUB_NAV_SECTIONS = HUB_SECTIONS.filter((section) => section.category !== "all");

export const HUB_CONTENT_SECTIONS = HUB_SECTIONS.filter(
	(section): section is HubSectionDefinition & { kind: HubContentKind } =>
		section.kind !== undefined,
);

export function getListingTitle(activeCategory: string): string {
	if (activeCategory === "all") return "Publicações recentes";
	return HUB_SECTIONS.find((section) => section.category === activeCategory)?.title ?? activeCategory;
}

export function getSectionDescription(activeCategory: HubCategory): string | undefined {
	return HUB_SECTIONS.find((section) => section.category === activeCategory)?.description;
}
