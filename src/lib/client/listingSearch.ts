const SEARCH_PARAM = "q";
const RECENT_RAIL_SECTION = 'section[aria-labelledby="rail-Recente"]';

function getSearchInput(): HTMLInputElement | null {
	return document.getElementById("search") as HTMLInputElement | null;
}

function getFilterableRows(): NodeListOf<HTMLTableRowElement> {
	return document.querySelectorAll<HTMLTableRowElement>("tr[data-search-text]");
}

function hasFilterableRows(): boolean {
	return getFilterableRows().length > 0;
}

function syncRailSections(query: string): void {
	const recentRail = document.querySelector<HTMLElement>(RECENT_RAIL_SECTION);
	if (recentRail) recentRail.hidden = query.length > 0;

	const sections = document.querySelectorAll<HTMLElement>('section[aria-labelledby^="rail-"]');

	for (const section of sections) {
		if (section === recentRail) continue;

		const rows = section.querySelectorAll<HTMLTableRowElement>("tr[data-search-text]");
		if (rows.length === 0) continue;

		let visibleInSection = 0;
		for (const row of rows) {
			if (!row.hidden) visibleInSection++;
		}

		section.hidden = visibleInSection === 0;
	}
}

function readQueryFromUrl(): string {
	return new URLSearchParams(window.location.search).get(SEARCH_PARAM)?.trim() ?? "";
}

function clearQueryFromUrl(): void {
	const url = new URL(window.location.href);
	if (!url.searchParams.has(SEARCH_PARAM)) return;
	url.searchParams.delete(SEARCH_PARAM);
	const next = url.search ? `${url.pathname}${url.search}` : url.pathname;
	window.history.replaceState({}, "", next);
}

function goToHomeWithQuery(query: string): void {
	const url = new URL("/", window.location.origin);
	if (query) url.searchParams.set(SEARCH_PARAM, query);
	window.location.assign(url.toString());
}

export function initListingSearch(): void {
	const searchInput = getSearchInput();
	if (!searchInput) return;

	const emptyState = document.getElementById("search-empty");
	const emptyTerm = document.getElementById("search-empty-term");
	const clearBtn = document.getElementById("search-clear");

	const filterRows = (): void => {
		if (!hasFilterableRows()) return;

		const query = searchInput.value.trim().toLowerCase();
		const rows = getFilterableRows();
		let visible = 0;

		for (const row of rows) {
			const text = row.dataset.searchText ?? "";
			const match = !query || text.includes(query);
			row.hidden = !match;
			if (match) visible++;
		}

		syncRailSections(query);

		if (emptyState && emptyTerm) {
			if (query && visible === 0) {
				emptyState.classList.remove("hidden");
				emptyTerm.textContent = `"${query}"`;
			} else {
				emptyState.classList.add("hidden");
			}
		}
	};

	const syncFromUrl = (): void => {
		const query = readQueryFromUrl();
		if (query) searchInput.value = query;
		filterRows();
	};

	searchInput.addEventListener("input", filterRows);

	searchInput.addEventListener("keydown", (event) => {
		if (event.key !== "Enter") return;
		if (hasFilterableRows()) return;

		event.preventDefault();
		goToHomeWithQuery(searchInput.value.trim());
	});

	if (clearBtn) {
		clearBtn.addEventListener("click", () => {
			searchInput.value = "";
			filterRows();
			clearQueryFromUrl();
			searchInput.focus();
		});
	}

	syncFromUrl();
}
