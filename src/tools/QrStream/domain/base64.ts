export function bytesToBase64(bytes: Uint8Array): string {
	const chunkSize = 0x8000;
	let binary = "";
	for (let offset = 0; offset < bytes.byteLength; offset += chunkSize) {
		const slice = bytes.subarray(offset, offset + chunkSize);
		binary += String.fromCharCode(...slice);
	}
	return btoa(binary);
}

export function base64ToBytes(base64: string): Uint8Array {
	const binary = atob(base64);
	const bytes = new Uint8Array(binary.length);
	for (let i = 0; i < binary.length; i++) {
		bytes[i] = binary.charCodeAt(i);
	}
	return bytes;
}
