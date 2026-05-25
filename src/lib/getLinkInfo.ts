export interface LinkMetadata {
	title: string | null;
	ogImage: string | null;
	favicon: string | null;
}

const FETCH_TIMEOUT_MS = 5000;
const HTML_SCAN_LIMIT = 50_000;

function getDocumentBase(documentUrl: string): string {
	const url = new URL(documentUrl);
	if (url.pathname.endsWith("/")) return url.href;

	const lastSegment = url.pathname.split("/").pop() ?? "";
	const looksLikeFile = lastSegment.includes(".");
	if (!looksLikeFile) {
		url.pathname = `${url.pathname}/`;
	}

	return url.href;
}

function normalizeUrl(path: string | undefined, baseUrl: string): string | null {
	if (!path) return null;
	const trimmed = path.trim();
	if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
	if (trimmed.startsWith("//")) return `https:${trimmed}`;
	try {
		return new URL(trimmed, baseUrl).href;
	} catch {
		return null;
	}
}

function parseTitle(html: string): string | null {
	const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
	if (!match?.[1]) return null;
	return match[1].replace(/\s+/g, " ").trim() || null;
}

function parseOgImage(html: string, baseUrl: string): string | null {
	const patterns = [
		/<meta[^>]+(?:property|name)=["'](?:og:image|twitter:image)["'][^>]+content=["']([^"']+)["']/i,
		/<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["'](?:og:image|twitter:image)["']/i,
	];
	for (const pattern of patterns) {
		const match = html.match(pattern);
		const url = normalizeUrl(match?.[1], baseUrl);
		if (url) return url;
	}
	return null;
}

function parseBaseHref(html: string, documentUrl: string): string {
	const match = html.match(/<base[^>]+href=["']([^"']+)["']/i);
	if (!match?.[1]) return documentUrl;
	return normalizeUrl(match[1], documentUrl) ?? documentUrl;
}

function parseFavicon(html: string, baseUrl: string): string | null {
	const patterns = [
		/<link[^>]+rel=["'](?:[^"']*icon[^"']*)["'][^>]+href=["']([^"']+)["']/i,
		/<link[^>]+href=["']([^"']+)["'][^>]+rel=["'](?:[^"']*icon[^"']*)["']/i,
	];
	for (const pattern of patterns) {
		const match = html.match(pattern);
		const url = normalizeUrl(match?.[1], baseUrl);
		if (url) return url;
	}
	return null;
}

const getDomain = (url: string) => url.replace(/^(https?:\/\/)?(www\.)?/, "").split("/")[0];

export async function getLinkInfo(targetUrl: string): Promise<LinkMetadata> {
	const domain = getDomain(targetUrl);

	try {
		const response = await fetch(targetUrl, {
			headers: { "User-Agent": "Mozilla/5.0 (compatible; andre_OS/1.0)" },
			signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
			redirect: "follow",
		});

		if (!response.ok) throw new Error(`Status: ${response.status}`);

		const html = (await response.text()).slice(0, HTML_SCAN_LIMIT);
		const documentUrl = response.url || targetUrl;
		const resolveBase = parseBaseHref(html, getDocumentBase(documentUrl));

		return {
			title: parseTitle(html) ?? domain,
			ogImage: parseOgImage(html, resolveBase),
			favicon: parseFavicon(html, resolveBase),
		};
	} catch {
		return {
			title: domain,
			ogImage: null,
			favicon: null,
		};
	}
}
