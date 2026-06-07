const TOOL_ROUTES: Record<string, string> = {
	webcodeeditor: "WebCodeEditor",
	editor: "WebCodeEditor",
	codigo: "WebCodeEditor",
	everydayutils: "EveryDayUtils",
	utils: "EveryDayUtils",
	cvbuilder: "CVBuilder",
	cv: "CVBuilder",
	curriculo: "CVBuilder",
	weekplanner: "WeekPlanner",
	semana: "WeekPlanner",
	financeplanner: "FinancePlanner",
	financas: "FinancePlanner",
	imagetools: "ImageTools",
	imagem: "ImageTools",
	cookingbook: "CookingBook",
	receitas: "CookingBook",
	rssreader: "RssReader",
	rss: "RssReader",
	feeds: "RssReader",
};

const CD_ROUTES: Record<string, string> = {
	root: "/",
	"~": "/",
	"~/": "/",
	"~/root": "/",
	notas: "/post",
	"~/notas": "/post",
	post: "/post",
	bin: "/app",
	"~/bin": "/app",
	app: "/app",
	links: "/link",
	"~/links": "/link",
	link: "/link",
};

interface ParsedCommand {
	mode: "grep" | "navigate" | "feedback";
	term: string;
	message?: string;
	implicitGrep?: boolean;
}

interface SearchItem {
	row: HTMLElement;
	searchText: string;
}

function parseCommand(raw: string): ParsedCommand {
	const input = raw.trim();
	if (!input) return { mode: "grep", term: "" };

	const [command, ...rest] = input.split(/\s+/);
	if (!command) return { mode: "grep", term: "" };

	const args = rest.join(" ").trim();
	const cmd = command.toLowerCase();

	if (cmd === "help") {
		return {
			mode: "feedback",
			term: "",
			message: "Comandos: open <app>, cd root|notas|bin|links, grep <termo>, clear, help",
		};
	}

	if (cmd === "clear") {
		return { mode: "grep", term: "" };
	}

	if (cmd === "grep") {
		return { mode: "grep", term: args };
	}

	if (cmd === "cd") {
		const target = args.toLowerCase();
		const href = CD_ROUTES[target];
		if (!href) {
			return { mode: "feedback", term: "", message: `cd: diretorio desconhecido "${args}"` };
		}
		return { mode: "navigate", term: "", message: href };
	}

	if (cmd === "open" || cmd === "exec") {
		if (!args) {
			return { mode: "feedback", term: "", message: `${cmd}: informe o nome do app` };
		}
		const tool = TOOL_ROUTES[args.toLowerCase()];
		if (!tool) {
			return { mode: "feedback", term: "", message: `${cmd}: app "${args}" nao encontrado` };
		}
		return { mode: "navigate", term: "", message: `/app/${tool}` };
	}

	return { mode: "grep", term: input, implicitGrep: true };
}

function buildSearchText(element: Element): string {
	const fromData = element.getAttribute("data-search-text");
	if (fromData) return fromData.toLowerCase();

	const title = element.querySelector("h3")?.textContent ?? "";
	const description = element.querySelector("p")?.textContent ?? "";
	const tags = [...element.querySelectorAll(".ui-pill")].map((pill) => pill.textContent ?? "").join(" ");
	return `${title} ${description} ${tags}`.toLowerCase();
}

function collectSearchItems(): SearchItem[] {
	return [...document.querySelectorAll<HTMLElement>(".os-desktop-icon")].map((node) => ({
		row: node,
		searchText: buildSearchText(node),
	}));
}

let searchable: SearchItem[] = [];
let lastTerm = "";
let rafId: number | undefined;
let terminalBound = false;

function setFeedback(message: string) {
	const feedbackEl = document.getElementById("terminal-feedback");
	if (!feedbackEl) return;

	if (!message) {
		feedbackEl.textContent = "";
		feedbackEl.classList.add("hidden");
		return;
	}

	feedbackEl.textContent = message;
	feedbackEl.classList.remove("hidden");
}

function applyFilter(term: string) {
	const normalizedTerm = term.trim().toLowerCase();
	if (normalizedTerm === lastTerm) return;
	lastTerm = normalizedTerm;

	const trimmedTerm = term.trim();
	const emptyEl = document.getElementById("search-empty");
	const emptyTermEl = document.getElementById("search-empty-term");

	if (rafId !== undefined) cancelAnimationFrame(rafId);

	rafId = requestAnimationFrame(() => {
		rafId = undefined;
		let visibleCount = 0;

		for (const item of searchable) {
			const matches = !normalizedTerm || item.searchText.includes(normalizedTerm);
			item.row.hidden = !matches;
			if (matches) visibleCount++;
		}

		if (emptyEl && emptyTermEl) {
			emptyTermEl.textContent = `"${trimmedTerm}"`;
			emptyEl.classList.toggle("hidden", !trimmedTerm || visibleCount > 0);
		}
	});
}

function runCommand(raw: string) {
	const searchInput = document.getElementById("search") as HTMLInputElement | null;
	const parsed = parseCommand(raw);

	if (parsed.mode === "navigate" && parsed.message) {
		window.location.href = parsed.message;
		return;
	}

	if (parsed.mode === "feedback") {
		setFeedback(parsed.message ?? "");
		return;
	}

	setFeedback("");
	applyFilter(parsed.term);

	if (searchInput && raw.trim().toLowerCase() === "clear") {
		searchInput.value = "";
	}

	if (parsed.implicitGrep && searchInput) {
		searchInput.value = `grep ${parsed.term}`;
	}
}

function refreshTerminalSearch() {
	searchable = collectSearchItems();
	applyFilter(lastTerm);
}

function bindTerminalOnce() {
	if (terminalBound) return;
	terminalBound = true;

	const searchInput = document.getElementById("search") as HTMLInputElement | null;

	document.getElementById("search-clear")?.addEventListener("click", () => {
		if (searchInput) searchInput.value = "";
		setFeedback("");
		applyFilter("");
	});

	searchInput?.addEventListener("input", () => {
		setFeedback("");
	});

	searchInput?.addEventListener("keydown", (event) => {
		if (event.key !== "Enter") return;
		event.preventDefault();
		runCommand(searchInput.value);
	});
}

function initTerminal() {
	bindTerminalOnce();
	refreshTerminalSearch();
}

document.addEventListener("DOMContentLoaded", initTerminal);
