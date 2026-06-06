export const OS_VERSION = "0.0.1";

export type OsCategory = "all" | "tool" | "note" | "link";
export type OsVisualKind = "intro" | "tool" | "note" | "link";

export const OS_HOME_INTRO = {
	path: "~/root/README.md",
	title: "Olá mundo",
	text: "Bem vindo ao meu espaço na internet, ocasionalmente irei publicar ferramentas, notas e recomendações de outros sites.",
} as const;

export interface OsFolderDefinition {
	category: OsCategory;
	href: string;
	path: string;
	title: string;
	description: string;
	kind: OsVisualKind;
}

export const OS_FOLDERS: OsFolderDefinition[] = [
	{
		category: "all",
		href: "/",
		path: "~/root",
		title: "root",
		description: "Home e visao geral do sistema",
		kind: "intro",
	},
	{
		category: "tool",
		href: "/app",
		path: "~/bin",
		title: "bin",
		description: "Ferramentas web e apps utilitarios",
		kind: "tool",
	},
	{
		category: "note",
		href: "/post",
		path: "~/notas",
		title: "notas",
		description: "Notas, posts e rascunhos",
		kind: "note",
	},
	{
		category: "link",
		href: "/link",
		path: "~/links",
		title: "links",
		description: "Links salvos e recomendacoes",
		kind: "link",
	},
];

const CATEGORY_PATHS = Object.fromEntries(OS_FOLDERS.map((folder) => [folder.category, folder.path])) as Record<
	OsCategory,
	string
>;

export function getCategoryPath(category: string): string {
	return CATEGORY_PATHS[category as OsCategory] ?? "~/root";
}

export function getStatusPath(activeCategory: string, segment?: string): string {
	const base = getCategoryPath(activeCategory);
	if (!segment) return base;
	return `${base}/${segment}`;
}

export function getListingTitle(activeCategory: string): string {
	if (activeCategory === "all") return "TODOS ARQUIVOS";
	return OS_FOLDERS.find((folder) => folder.category === activeCategory)?.title ?? activeCategory;
}
