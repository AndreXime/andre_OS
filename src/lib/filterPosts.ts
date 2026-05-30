document.addEventListener("DOMContentLoaded", () => {
	const searchInput = document.getElementById("search") as HTMLInputElement;
	const grepEl = document.getElementById("search-grep");
	const grepTermEl = document.getElementById("search-grep-term");
	const emptyEl = document.getElementById("search-empty");
	const emptyTermEl = document.getElementById("search-empty-term");
	const DEBOUNCE_MS = 300;

	let debounceId: ReturnType<typeof setTimeout> | undefined;
	let lastTerm = "";
	let rafId: number | undefined;

	function buildPostSearchText(article: Element): string {
		const title = article.querySelector("h3")?.textContent ?? "";
		const description = article.querySelector("p")?.textContent ?? "";
		const tags = [...article.querySelectorAll(".ui-pill")].map((pill) => pill.textContent ?? "").join(" ");

		return `${title} ${description} ${tags}`.toLowerCase();
	}

	const posts = [...document.querySelectorAll("article")].map((article) => ({
		row: (article.closest("a") ?? article) as HTMLElement,
		searchText: buildPostSearchText(article),
	}));

	function filterPosts(term: string) {
		const normalizedTerm = term.trim().toLowerCase();
		if (normalizedTerm === lastTerm) return;
		lastTerm = normalizedTerm;

		const trimmedTerm = term.trim();
		const updates = posts.map((post) => ({
			row: post.row,
			matches:
				!normalizedTerm || post.searchText.includes(normalizedTerm),
		}));

		if (rafId !== undefined) {
			cancelAnimationFrame(rafId);
		}

		rafId = requestAnimationFrame(() => {
			rafId = undefined;
			let visibleCount = 0;

			for (const { row, matches } of updates) {
				row.hidden = !matches;
				if (matches) visibleCount++;
			}

			if (grepEl && grepTermEl) {
				grepTermEl.textContent = trimmedTerm;
				grepEl.classList.toggle("hidden", !trimmedTerm);
			}

			if (emptyEl && emptyTermEl) {
				emptyTermEl.textContent = `"${trimmedTerm}"`;
				emptyEl.classList.toggle(
					"hidden",
					!trimmedTerm || visibleCount > 0,
				);
			}
		});
	}

	document.getElementById("search-clear")?.addEventListener("click", () => {
		searchInput.value = "";
		filterPosts("");
	});

	searchInput?.addEventListener("input", () => {
		clearTimeout(debounceId);

		debounceId = setTimeout(() => {
			filterPosts(searchInput.value);
		}, DEBOUNCE_MS);
	});
});
