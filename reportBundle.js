import { promises as fs } from "node:fs";
import path from "node:path";

const distDir = new URL("./.vercel/output/static", import.meta.url).pathname;
const astroDir = path.join(distDir, "_astro");

async function mapJsSizes() {
	const jsFiles = await fs.readdir(astroDir);

	const entries = await Promise.all(
		jsFiles.map(async (f) => {
			const full = path.join(astroDir, f);
			const stat = await fs.stat(full);
			return { file: f, size: stat.size };
		}),
	);

	return new Map(entries.map(({ file, size }) => [file, size]));
}

async function collectHtmlFiles(dir, baseDir) {
	const entries = await fs.readdir(dir, { withFileTypes: true });
	const results = [];

	for (const entry of entries) {
		const fullPath = path.join(dir, entry.name);

		if (entry.isDirectory()) {
			results.push(...(await collectHtmlFiles(fullPath, baseDir)));
		} else if (entry.isFile() && entry.name.endsWith(".html")) {
			results.push(path.relative(baseDir, fullPath));
		}
	}

	return results;
}

function extractScriptSrcs(html) {
	const scriptRegex =
		/<script[^>]+type=["']module["'][^>]+src=["']([^"']+\.js)["'][^>]*>/g;
	const islandRegex =
		/<astro-island[^>]+(?:component-url|renderer-url)=["']([^"']+\.js)["'][^>]*>/g;
	const srcs = [];

	for (const match of html.matchAll(scriptRegex)) {
		srcs.push(match[1]);
	}

	for (const match of html.matchAll(islandRegex)) {
		srcs.push(match[1]);
	}

	return srcs;
}

function humanKb(bytes) {
	return (bytes / 1024).toFixed(1);
}

const jsSizes = await mapJsSizes();
const htmlFiles = await collectHtmlFiles(distDir, distDir);

const reports = [];

for (const relHtml of htmlFiles) {
	const fullHtmlPath = path.join(distDir, relHtml);
	const html = await fs.readFile(fullHtmlPath, "utf8");
	const srcs = extractScriptSrcs(html);

	let total = 0;
	const files = [];

	for (const src of srcs) {
		const normalized = src.startsWith("/") ? src.slice(1) : src;

		// Esperamos algo como "_astro/XYZ.js"
		if (!normalized.startsWith("_astro/")) continue;

		const fileName = path.basename(normalized);
		let size = jsSizes.get(fileName);

		if (size == null) {
			// fallback direto pelo caminho completo, caso o nome-base não bata
			const candidate = path.join(distDir, normalized);
			try {
				const stat = await fs.stat(candidate);
				size = stat.size;
			} catch {
				continue;
			}
		}

		total += size;
		files.push({ src, size });
	}

	reports.push({ html: relHtml, total, files });
}

// Ordena por total de JS decrescente
reports.sort((a, b) => b.total - a.total);

for (const { html, total, files } of reports) {
	console.log(`\n${html}`);
	console.log(`  Total JS: ${humanKb(total)} KB`);

	for (const { src, size } of files) {
		console.log(`    ${src} -> ${humanKb(size)} KB`);
	}
}
