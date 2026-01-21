export interface Item {
	id: number;
	slug: string;
	type: "intro" | "tool" | "note" | "link";
	title: string;
	description: string;
	tags: string[];
	featured?: boolean;
	date: Date;
	content?: string; // Conteúdo longo, type Intro não tem
	status?: string; // Versão da ferramenta, apenas para tools
	url?: string; // Link do site recomendado, Apenas para links
}

export const INITIAL_ITEMS: Item[] = [
	{
		id: 1,
		type: "intro",
		title: "Manifesto",
		slug: "manifest",
		description:
			"Minha segunda memória externa. Um jardim digital de anotações sobre Go e TS, achados da web e pequenas ferramentas de automação.",
		featured: true,
		tags: [],
		date: new Date(),
	},
	{
		id: 2,
		type: "tool",
		slug: "json-para-go-struct",
		title: "JSON para Go Struct",
		description: "Conversor instantâneo com tags omitempty. Cole seu JSON e receba a struct tipada.",
		status: "v1.4.2",
		featured: false,
		date: new Date(),

		tags: ["golang", "tool", "productivity"],
		content:
			'Esta ferramenta converte objetos JSON em structs Go. Ela detecta automaticamente tipos aninhados, gera tags `json:"..."` e adiciona `omitempty` onde apropriado. Feito com WASM para rodar localmente.',
	},
	{
		id: 3,
		type: "note",
		title: "Pattern Matching em TS",
		slug: "pattern-matching-em-ts",
		date: new Date("2025-10-12"),
		description:
			"Explorando bibliotecas como ts-pattern vs switch statements nativos para controle de fluxo mais seguro.",
		featured: false,
		tags: ["typescript", "patterns"],
		content:
			'O TypeScript é ótimo, mas seu controle de fluxo nativo (switch/if) pode ser verboso. Bibliotecas como ts-pattern trazem a elegância do pattern matching de linguagens funcionais.\n\n```typescript\nmatch(val).with({ status: "error" }, () => ...)\n```',
	},
	{
		id: 4,
		type: "link",
		slug: "raycast-store",
		title: "Raycast Store",
		description: "Scripts e extensões essenciais para produtividade no Mac.",
		featured: false,
		tags: ["macos", "productivity"],
		date: new Date(),

		url: "https://raycast.com",
	},
	{
		id: 5,
		type: "note",
		title: "Goroutines vs Threads",
		slug: "goroutines-vs-threads",
		date: new Date("2025-12-08"),
		description: "Notas mentais sobre o scheduler do Go e quando realmente se preocupar com context switching.",
		featured: false,
		tags: ["golang", "performance"],
		content:
			"Goroutines não são threads do SO. Elas são multiplexadas em um número menor de threads do SO. Entender o modelo M:N scheduler do Go é crucial para evitar gargalos em aplicações de alta concorrência.",
	},
	{
		id: 6,
		type: "tool",
		slug: "regex-tester-local",
		title: "Regex Tester (Local)",
		description: "Testador de Regex rodando 100% no cliente via WASM.",
		status: "Beta",
		featured: true,
		date: new Date(),

		tags: ["tool", "webassembly"],
		content:
			"Um playground para testar expressões regulares em tempo real sem enviar dados para o servidor. Suporta sintaxe PCRE e JS.",
	},
	{
		id: 7,
		type: "link",
		date: new Date(),

		slug: "design-systems-repo",
		title: "Design Systems Repo",
		description: "Coleção curada de sistemas de design reais para referência de UI.",
		featured: false,
		tags: ["design", "ui"],
		url: "https://component.gallery",
	},
	{
		id: 8,
		type: "note",
		slug: "zod-schema-validation",
		title: "Zod Schema Validation",
		date: new Date("2025-12-28"),
		description: "Snippet rápido para validação de env vars no Next.js.",
		featured: false,
		tags: ["typescript", "validation"],
		content:
			"Nunca inicie seu app sem validar as variáveis de ambiente. Usar Zod no arquivo de configuração garante que o app falhe rápido (fail-fast) se algo estiver faltando.\n\n```typescript\nz.object({ DATABASE_URL: z.string() })\n```",
	},
];
