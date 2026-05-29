import { removeBackground } from "@imgly/background-removal";
import { bgRemovalConfig } from "../bgRemovalConfig";

let aborted = false;
let taskChain: Promise<void> = Promise.resolve();

function enqueue(task: () => Promise<void>): void {
	taskChain = taskChain.then(task).catch((err) => {
		if (!aborted) {
			self.postMessage({ type: "ERROR", payload: (err as Error).message });
		}
	});
}

function postProgress(key: string, current: number, total: number): void {
	if (aborted) return;
	const pct = total > 0 ? Math.round((current / total) * 100) : 0;
	self.postMessage({ type: "PROGRESS", payload: { key, pct } });
}

async function runExec(imageBlob: Blob): Promise<void> {
	aborted = false;

	const blob = await removeBackground(imageBlob, {
		...bgRemovalConfig,
		progress: postProgress,
	});

	if (aborted) return;
	self.postMessage({ type: "RESULT", payload: blob });
}

self.onmessage = (e: MessageEvent) => {
	const { type, payload } = e.data;

	if (type === "ABORT") {
		aborted = true;
		return;
	}

	if (type !== "EXEC") return;

	enqueue(() => runExec((payload as { imageBlob: Blob }).imageBlob));
};
