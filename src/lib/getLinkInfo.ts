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

function parseBaseHref(html: string, documentUrl: string): string {
	const match = html.match(/<base[^>]+href=["']([^"']+)["']/i);
	if (!match?.[1]) return documentUrl;
	return normalizeUrl(match[1], documentUrl) ?? documentUrl;
}

function isIcoUrl(url: string): boolean {
	try {
		return new URL(url).pathname.toLowerCase().endsWith(".ico");
	} catch {
		return url.toLowerCase().includes(".ico");
	}
}

function parseFavicon(html: string, baseUrl: string): string | null {
	const iconUrls: string[] = [];

	for (const linkTag of html.matchAll(/<link[^>]*>/gi)) {
		const tag = linkTag[0];
		const rel = tag.match(/rel=["']([^"']+)["']/i)?.[1]?.toLowerCase();
		if (!rel?.includes("icon")) continue;

		const href = tag.match(/href=["']([^"']+)["']/i)?.[1];
		const url = normalizeUrl(href, baseUrl);
		if (url && !iconUrls.includes(url)) iconUrls.push(url);
	}

	const preferred = iconUrls.find((url) => !isIcoUrl(url));
	if (preferred) return preferred;

	const ico = iconUrls.find(isIcoUrl);
	return ico ?? null;
}

const getDomain = (url: string) => url.replace(/^(https?:\/\/)?(www\.)?/, "").split("/")[0];

export async function getLinkInfo(targetUrl: string) {
	const domain = getDomain(targetUrl);

	try {
		const response = await fetch(targetUrl, {
			headers: { "User-Agent": "Mozilla/5.0 (compatible; dev.andreximenes/1.0)" },
			signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
			redirect: "follow",
		});

		if (!response.ok) throw new Error(`Status: ${response.status}`);

		const html = (await response.text()).slice(0, HTML_SCAN_LIMIT);
		const documentUrl = response.url || targetUrl;
		const resolveBase = parseBaseHref(html, getDocumentBase(documentUrl));

		return {
			title: parseTitle(html),
			domain,
			favicon: parseFavicon(html, resolveBase),
		};
	} catch {
		return {
			title: null,
			domain,
			favicon: null,
		};
	}
}
