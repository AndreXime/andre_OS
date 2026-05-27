import { removeBackground } from "@imgly/background-removal";

self.onmessage = async (e: MessageEvent) => {
	const { type, payload } = e.data;

	if (type !== "EXEC") return;

	try {
		const { imageBlob } = payload as { imageBlob: Blob };

		const blob = await removeBackground(imageBlob, {
			progress: (key: string, current: number, total: number) => {
				const pct = total > 0 ? Math.round((current / total) * 100) : 0;
				self.postMessage({ type: "PROGRESS", payload: { key, pct } });
			},
			model: "isnet_quint8",
		});

		self.postMessage({ type: "RESULT", payload: blob });
	} catch (err) {
		self.postMessage({ type: "ERROR", payload: (err as Error).message });
	}
};
