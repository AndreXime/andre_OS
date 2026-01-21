export interface Post {
	id: number;
	slug: string;
	type: "intro" | "tool" | "note" | "link";
	title: string;
	description: string;
	tags: string[];
	featured?: boolean;
	date: Date;
	content?: string; // Conteúdo longo, intro não tem
	status?: string; // Versão da ferramenta, apenas para tools
	url?: string; // Link do site recomendado, apenas para links
}
