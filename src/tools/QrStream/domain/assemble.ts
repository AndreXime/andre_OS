export function assemblePayload(chunks: ReadonlyMap<number, Uint8Array>, total: number): Uint8Array {
	if (total < 1) throw new Error("total inválido");

	let totalLength = 0;
	for (let index = 1; index < total; index++) {
		const chunk = chunks.get(index);
		if (!chunk) throw new Error(`Chunk ausente: ${index}`);
		totalLength += chunk.byteLength;
	}

	const result = new Uint8Array(totalLength);
	let offset = 0;
	for (let index = 1; index < total; index++) {
		const chunk = chunks.get(index);
		if (!chunk) throw new Error(`Chunk ausente: ${index}`);
		result.set(chunk, offset);
		offset += chunk.byteLength;
	}
	return result;
}

export function missingIndexes(chunks: ReadonlyMap<number, Uint8Array>, total: number): number[] {
	const missing: number[] = [];
	for (let index = 0; index < total; index++) {
		if (!chunks.has(index)) missing.push(index);
	}
	return missing;
}
