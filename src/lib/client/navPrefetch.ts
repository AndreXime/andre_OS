import { SECTIONS } from "@/lib/sections";

function executeLinkPrefetch(url: string): void {
	const selector = `link[rel="prefetch"][href="${url}"]`;
	if (document.querySelector(selector)) return;

	const link = document.createElement("link");
	link.rel = "prefetch";
	link.href = url;
	link.as = "document";
	link.setAttribute("fetchpriority", "low");
	document.head.appendChild(link);
}

function prefetchIndexPages(): void {
	const currentPath = window.location.pathname;

	for (const section of SECTIONS) {
		if (section.href === currentPath) continue;
		executeLinkPrefetch(section.href);
	}
}

export function initNavPrefetch(): void {
	if (typeof window.requestIdleCallback === "function") {
		window.requestIdleCallback(prefetchIndexPages, { timeout: 4000 });
	} else {
		globalThis.setTimeout(prefetchIndexPages, 2000);
	}
}
