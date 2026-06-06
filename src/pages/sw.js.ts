export const prerender = true;

function getBuildId(): string {
	const fromEnv = process.env.VERCEL_GIT_COMMIT_SHA ?? process.env.GITHUB_SHA ?? process.env.CF_PAGES_COMMIT_SHA;
	if (fromEnv) return fromEnv.slice(0, 7);
	return Date.now().toString(36);
}

function buildServiceWorker(cacheName: string): string {
	return `
const CACHE = ${JSON.stringify(cacheName)};

self.addEventListener("install", (event) => {
	self.skipWaiting();
	event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(["/", "/favicon.svg", "/manifest.webmanifest"])));
});

self.addEventListener("activate", (event) => {
	event.waitUntil(
		caches
			.keys()
			.then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
			.then(() => self.clients.claim()),
	);
});

self.addEventListener("fetch", (event) => {
	const { request } = event;
	if (request.method !== "GET") return;

	const url = new URL(request.url);
	if (url.origin !== self.location.origin) return;

	event.respondWith(
		caches.open(CACHE).then(async (cache) => {
			const cached = await cache.match(request);
			const network = fetch(request)
				.then((response) => {
					if (response.ok) {
						cache.put(request, response.clone());
					}
					return response;
				})
				.catch(() => cached);

			return cached || network;
		}),
	);
});
`;
}

export function GET() {
	const cacheName = `andre-os-${getBuildId()}`;

	return new Response(buildServiceWorker(cacheName), {
		headers: {
			"Content-Type": "application/javascript; charset=utf-8",
			"Cache-Control": "public, max-age=0, must-revalidate",
		},
	});
}
