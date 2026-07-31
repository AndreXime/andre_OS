export async function mapPool<T>(
	items: T[],
	concurrency: number,
	worker: (item: T) => Promise<void>,
	shouldContinue: () => boolean,
): Promise<void> {
	if (items.length === 0) return;

	let next = 0;

	async function runWorker(): Promise<void> {
		while (shouldContinue()) {
			const i = next;
			next += 1;
			if (i >= items.length) return;
			const item = items[i];
			if (item === undefined) return;
			await worker(item);
		}
	}

	const poolSize = Math.max(1, Math.min(concurrency, items.length));
	await Promise.all(Array.from({ length: poolSize }, () => runWorker()));
}
