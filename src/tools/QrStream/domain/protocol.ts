import { base64ToBytes, bytesToBase64 } from "./base64";

export interface StreamManifest {
	readonly v: 1;
	readonly kind: "text" | "file";
	readonly mime: string;
	readonly name: string;
	readonly bytes: number;
}

export type ParsedFrame =
	| { readonly kind: "manifest"; readonly index: 0; readonly total: number; readonly manifest: StreamManifest }
	| { readonly kind: "data"; readonly index: number; readonly total: number; readonly bytes: Uint8Array };

const MANIFEST_PREFIX = "M|";

export function computeTotalFrames(byteLength: number, chunkSize: number): number {
	if (chunkSize <= 0) throw new Error("chunkSize inválido");
	if (byteLength <= 0) return 1;
	return 1 + Math.ceil(byteLength / chunkSize);
}

export function encodeManifestPayload(manifest: StreamManifest): string {
	const json = JSON.stringify(manifest);
	const encoded = bytesToBase64(new TextEncoder().encode(json));
	return `${MANIFEST_PREFIX}${encoded}`;
}

export function buildFrames(data: Uint8Array, chunkSize: number, manifest: StreamManifest): string[] {
	const total = computeTotalFrames(data.byteLength, chunkSize);
	const frames: string[] = [];
	frames.push(`0|${total}|${encodeManifestPayload(manifest)}`);

	for (let dataIndex = 0; dataIndex < total - 1; dataIndex++) {
		const start = dataIndex * chunkSize;
		const slice = data.subarray(start, start + chunkSize);
		const frameIndex = dataIndex + 1;
		frames.push(`${frameIndex}|${total}|${bytesToBase64(slice)}`);
	}

	return frames;
}

function parseManifest(payload: string): StreamManifest | null {
	if (!payload.startsWith(MANIFEST_PREFIX)) return null;
	const encoded = payload.slice(MANIFEST_PREFIX.length);
	if (!encoded) return null;

	try {
		const json = new TextDecoder().decode(base64ToBytes(encoded));
		const raw: unknown = JSON.parse(json);
		if (!raw || typeof raw !== "object") return null;
		const record = raw as Record<string, unknown>;
		if (record.v !== 1) return null;
		if (record.kind !== "text" && record.kind !== "file") return null;
		if (typeof record.mime !== "string") return null;
		if (typeof record.name !== "string") return null;
		if (typeof record.bytes !== "number" || !Number.isFinite(record.bytes) || record.bytes < 0) {
			return null;
		}
		return {
			v: 1,
			kind: record.kind,
			mime: record.mime,
			name: record.name,
			bytes: record.bytes,
		};
	} catch {
		return null;
	}
}

export function parseFrame(rawValue: string): ParsedFrame | null {
	const firstSep = rawValue.indexOf("|");
	if (firstSep < 0) return null;
	const secondSep = rawValue.indexOf("|", firstSep + 1);
	if (secondSep < 0) return null;

	const index = Number.parseInt(rawValue.slice(0, firstSep), 10);
	const total = Number.parseInt(rawValue.slice(firstSep + 1, secondSep), 10);
	const payload = rawValue.slice(secondSep + 1);

	if (!Number.isInteger(index) || !Number.isInteger(total)) return null;
	if (index < 0 || total < 1 || index >= total) return null;
	if (!payload) return null;

	if (index === 0) {
		const manifest = parseManifest(payload);
		if (!manifest) return null;
		return { kind: "manifest", index: 0, total, manifest };
	}

	try {
		const bytes = base64ToBytes(payload);
		return { kind: "data", index, total, bytes };
	} catch {
		return null;
	}
}

export function createTextManifest(text: string): StreamManifest {
	const bytes = new TextEncoder().encode(text).byteLength;
	return {
		v: 1,
		kind: "text",
		mime: "text/plain;charset=utf-8",
		name: "texto.txt",
		bytes,
	};
}

export function createFileManifest(file: File, byteLength: number): StreamManifest {
	return {
		v: 1,
		kind: "file",
		mime: file.type || "application/octet-stream",
		name: file.name || "arquivo.bin",
		bytes: byteLength,
	};
}
