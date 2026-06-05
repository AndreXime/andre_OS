import type { JsonPersistentAtom } from "./persistentAtom";

export interface ToolStorageEntry {
	readonly toolId: string;
	readonly keys: readonly string[];
	readonly atoms: Readonly<Record<string, JsonPersistentAtom<unknown>>>;
}
