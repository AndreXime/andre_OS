let clockTimer: number | undefined;

function initClock() {
	if (clockTimer) return;

	const clock = document.querySelector<HTMLTimeElement>("#os-clock");
	const online = document.getElementById("os-online-status");

	function tick() {
		if (!clock) return;
		const now = new Date();
		clock.textContent = now.toLocaleString("pt-BR", {
			weekday: "short",
			day: "2-digit",
			month: "short",
			hour: "2-digit",
			minute: "2-digit",
		});
		clock.dateTime = now.toISOString();
	}

	function syncOnline() {
		if (!online) return;
		const connected = navigator.onLine;
		online.textContent = connected ? "online" : "offline";
		online.classList.toggle("os-status-pill--online", connected);
		online.classList.toggle("os-status-pill--offline", !connected);
	}

	tick();
	syncOnline();
	clockTimer = window.setInterval(tick, 30_000);
	window.addEventListener("online", syncOnline);
	window.addEventListener("offline", syncOnline);
}

document.addEventListener("DOMContentLoaded", initClock);
