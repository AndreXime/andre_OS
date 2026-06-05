import { persistentAtom } from "@nanostores/persistent";
import type { WritableAtom } from "nanostores";

interface JsonPersistentOptions<T> {
	readonly storageKey: string;
	readonly defaultValue: T;
	readonly normalize?: (raw: unknown) => T;
}

export interface JsonPersistentAtom<T> extends WritableAtom<T> {
	setFromRaw(raw: unknown): void;
}

export function createJsonPersistentAtom<T>({
	storageKey,
	defaultValue,
	normalize,
}: JsonPersistentOptions<T>): JsonPersistentAtom<T> {
	const resolve = normalize ?? ((raw: unknown) => raw as T);

	const atom = persistentAtom<T>(storageKey, defaultValue, {
		encode: JSON.stringify,
		decode(value: string | null) {
			if (!value) return defaultValue;
			try {
				return resolve(JSON.parse(value) as unknown);
			} catch {
				return defaultValue;
			}
		},
	});

	return Object.assign(atom, {
		setFromRaw(raw: unknown) {
			atom.set(resolve(raw));
		},
	});
}
