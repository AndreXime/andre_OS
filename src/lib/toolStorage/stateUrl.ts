import type { ToolStorageEntry } from "./types";

/**
 * Limite pratico para a URL completa (origin + path + hash).
 * O fragmento (#...) nao vai na requisicao HTTP; browsers modernos aceitam
 * centenas de KB no hash. 2 KB e limite tipico de query string/servidor, nao de hash.
 * 64 KB cobre estado comprimido sem estourar apps que truncam links ao colar.
 */
export const MAX_STATE_URL_LENGTH = 65_536;

export class StateUrlTooLargeError extends Error {
	readonly urlLength: number;
	readonly maxLength: number;

	constructor(urlLength: number, maxLength = MAX_STATE_URL_LENGTH) {
		super(`O estado e grande demais para um link (${urlLength} de ${maxLength} caracteres).`);
		this.name = "StateUrlTooLargeError";
		this.urlLength = urlLength;
		this.maxLength = maxLength;
	}
}

interface LinkedToolState {
	readonly v: 1;
	readonly tool: string;
	readonly data: Readonly<Record<string, unknown>>;
}

function isLinkedToolState(raw: unknown): raw is LinkedToolState {
	if (!raw || typeof raw !== "object" || Array.isArray(raw)) return false;
	const o = raw as Record<string, unknown>;
	return (
		o.v === 1 &&
		typeof o.tool === "string" &&
		o.tool !== "" &&
		typeof o.data === "object" &&
		o.data !== null &&
		!Array.isArray(o.data)
	);
}

function bytesToBinaryString(bytes: Uint8Array): string {
	return Array.from(bytes, (byte) => String.fromCharCode(byte)).join("");
}

function binaryStringToBytes(binaryString: string): Uint8Array {
	const bytes = new Uint8Array(binaryString.length);
	for (let i = 0; i < binaryString.length; i++) {
		bytes[i] = binaryString.charCodeAt(i);
	}
	return bytes;
}

function toBase64UrlSafe(bytes: Uint8Array): string {
	return btoa(bytesToBinaryString(bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64UrlSafe(token: string): Uint8Array {
	let base64 = token.replace(/-/g, "+").replace(/_/g, "/");
	while (base64.length % 4) base64 += "=";
	return binaryStringToBytes(atob(base64));
}

function collectToolState(storage: ToolStorageEntry): LinkedToolState {
	const data: Record<string, unknown> = {};

	for (const key of storage.keys) {
		const atom = storage.atoms[key];
		if (atom) {
			data[key] = atom.get();
			continue;
		}

		if (typeof window !== "undefined") {
			const raw = localStorage.getItem(key);
			if (raw !== null) {
				try {
					data[key] = JSON.parse(raw) as unknown;
				} catch {
					data[key] = raw;
				}
			}
		}
	}

	return { v: 1, tool: storage.toolId, data };
}

function applyToolState(state: LinkedToolState, storage: ToolStorageEntry): void {
	for (const key of storage.keys) {
		const atom = storage.atoms[key];
		const raw = state.data[key];

		if (atom) {
			atom.setFromRaw(raw);
			continue;
		}

		if (typeof window !== "undefined" && raw !== undefined) {
			localStorage.setItem(key, typeof raw === "string" ? raw : JSON.stringify(raw));
		}
	}
}

export function hasStateInUrl(): boolean {
	if (typeof window === "undefined") return false;
	const hashString = window.location.hash.substring(1);
	if (!hashString) return false;
	return new URLSearchParams(hashString).has("state");
}

async function encodeStateToUrl(state: unknown, baseUrl = window.location.href): Promise<string> {
	if (state === undefined || state === null) {
		throw new Error("O estado fornecido nao pode ser nulo ou indefinido.");
	}

	const jsonString = JSON.stringify(state);
	const stream = new Blob([jsonString]).stream();
	const compressedStream = stream.pipeThrough(new CompressionStream("deflate"));
	const buffer = await new Response(compressedStream).arrayBuffer();
	const base64UrlSafe = toBase64UrlSafe(new Uint8Array(buffer));

	const urlParams = new URLSearchParams();
	urlParams.set("state", base64UrlSafe);

	const url = new URL(baseUrl);
	url.hash = urlParams.toString();

	const urlString = url.toString();
	if (urlString.length > MAX_STATE_URL_LENGTH) {
		throw new StateUrlTooLargeError(urlString.length);
	}

	return urlString;
}

export async function generateStateUrl(storage: ToolStorageEntry, baseUrl = window.location.href): Promise<string> {
	return encodeStateToUrl(collectToolState(storage), baseUrl);
}

async function decodeStateFromUrl(): Promise<unknown> {
	const hashString = window.location.hash.substring(1);
	if (!hashString) throw new Error("Nenhum dado encontrado no hash.");

	const token = new URLSearchParams(hashString).get("state");
	if (!token) throw new Error('Parametro "state" nao encontrado no hash.');

	const bytes = new Uint8Array(fromBase64UrlSafe(token));
	const stream = new Blob([bytes]).stream();
	const decompressedStream = stream.pipeThrough(new DecompressionStream("deflate"));
	const jsonString = await new Response(decompressedStream).text();

	return JSON.parse(jsonString) as unknown;
}

async function readLinkedStateFromUrl(): Promise<LinkedToolState> {
	const raw = await decodeStateFromUrl();
	if (!isLinkedToolState(raw)) {
		throw new Error("Estado do link invalido.");
	}
	return raw;
}

export async function importStateFromUrl(storage: ToolStorageEntry): Promise<void> {
	const state = await readLinkedStateFromUrl();
	if (state.tool !== storage.toolId) {
		throw new Error(`Este link pertence a outra ferramenta (${state.tool}).`);
	}
	applyToolState(state, storage);
}

export function clearUrlHash(): void {
	if (typeof window === "undefined") return;
	const url = new URL(window.location.href);
	url.hash = "";
	window.history.replaceState(null, "", url.toString());
}
