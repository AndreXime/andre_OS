import database from "./database";
import type { Post } from "./types";
import { randomInt } from "node:crypto";

const dictionary = [
	"lorem",
	"ipsum",
	"dolor",
	"sit",
	"amet",
	"consectetur",
	"adipiscing",
	"elit",
	"curabitur",
	"vel",
	"hendrerit",
	"libero",
];

function generateLore(wordsCount: number): string {
	const result: string[] = [];

	for (let i = 0; i < wordsCount; i++) {
		const index = randomInt(0, dictionary.length);
		result.push(dictionary[index]);
	}

	const text = result.join(" ");
	return `${text.charAt(0).toUpperCase() + text.slice(1)}.`;
}

function shufflePosts(posts: Post[]): Post[] {
	const shuffledPosts = [...posts];

	for (let index = shuffledPosts.length - 1; index > 0; index--) {
		const randomIndex = randomInt(0, index + 1);
		[shuffledPosts[index], shuffledPosts[randomIndex]] = [shuffledPosts[randomIndex], shuffledPosts[index]];
	}

	return shuffledPosts;
}

const introPost: Post = {
	id: 1,
	type: "intro",
	title: "Manifesto",
	slug: "manifest",
	description:
		"Minha segunda memória externa. Um jardim digital de anotações sobre Go e TS, achados da web e pequenas ferramentas de automação.",
	featured: true,
	tags: [],
	date: new Date(),
};

const toolPosts: Post[] = Array.from({ length: 5 }, (_, index) => {
	const id = index + 2;
	const sequence = index + 1;

	return {
		id,
		type: "tool",
		slug: `ferramenta-${sequence}`,
		title: `Ferramenta ${sequence}`,
		description: generateLore(10),
		featured: sequence === 1,
		date: new Date(),
		tags: ["tool", "productivity"],
		content: generateLore(40),
	};
});

const linkPosts: Post[] = Array.from({ length: 5 }, (_, index) => {
	const id = index + 7;
	const sequence = index + 1;

	return {
		id,
		type: "link",
		slug: `link-${sequence}`,
		title: `Link ${sequence}`,
		description: generateLore(8),
		featured: false,
		tags: ["link", "web"],
		date: new Date(),
		url: `https://example.com/link-${sequence}`,
	};
});

const notePosts: Post[] = Array.from({ length: 5 }, (_, index) => {
	const id = index + 12;
	const sequence = index + 1;

	return {
		id,
		type: "note",
		slug: `post-${sequence}`,
		title: `Post ${sequence}`,
		description: generateLore(12),
		featured: false,
		tags: ["note", "typescript"],
		date: new Date(),
		content: generateLore(55),
	};
});

const shuffledContentPosts = shufflePosts([...toolPosts, ...linkPosts, ...notePosts]);
const SEED_POSTS: Post[] = [introPost, ...shuffledContentPosts];

async function seedDatabase() {
	console.log("Iniciando seed...");

	for (const item of SEED_POSTS) {
		try {
			await database.execute({
				sql: `
          INSERT INTO posts (
            id, slug, type, title, description, tags, featured, date, content, url
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET
            slug = excluded.slug,
            type = excluded.type,
            title = excluded.title,
            description = excluded.description,
            tags = excluded.tags,
            featured = excluded.featured,
            date = excluded.date,
            content = excluded.content,
            url = excluded.url
        `,
				args: [
					item.id,
					item.slug,
					item.type,
					item.title,
					item.description,
					JSON.stringify(item.tags), // SQLite não tem array, vira JSON string
					item.featured ? 1 : 0, // SQLite não tem boolean, vira 1 ou 0
					item.date.toISOString(), // Data como string ISO
					item.content ?? null,
					item.url ?? null,
				],
			});
		} catch (err) {
			console.error(`Erro no item ${item.id}:`, err);
		}
	}

	console.log("Seed finalizado!");
}

await seedDatabase();
