import { atom, type WritableAtom } from "nanostores";

interface JsonPersistentOptions<T> {
	readonly storageKey: string;
	readonly defaultValue: T;
	readonly normalize?: (raw: unknown) => T;
}

export interface JsonPersistentAtom<T> extends WritableAtom<T> {
	setFromRaw(raw: unknown): void;
}

type BootTask = () => void;

const bootTasks: BootTask[] = [];
let booted = false;

/**
 * Lê localStorage e liga a persistência. Deve rodar só no client,
 * depois da hidratação (ex.: useEffect), para o HTML do SSR bater
 * com o primeiro render do React.
 */
export function bootJsonPersistentAtoms(): void {
	if (booted || typeof window === "undefined") return;
	booted = true;
	for (const task of bootTasks) task();
	bootTasks.length = 0;
}

export function createJsonPersistentAtom<T>({
	storageKey,
	defaultValue,
	normalize,
}: JsonPersistentOptions<T>): JsonPersistentAtom<T> {
	const resolve = normalize ?? ((raw: unknown) => raw as T);
	const store = atom<T>(defaultValue);

	const setFromRaw = (raw: unknown): void => {
		store.set(resolve(raw));
	};

	const boot = (): void => {
		try {
			const raw = window.localStorage.getItem(storageKey);
			if (raw !== null) {
				store.set(resolve(JSON.parse(raw) as unknown));
			}
		} catch {
			store.set(defaultValue);
		}

		store.listen((value) => {
			try {
				window.localStorage.setItem(storageKey, JSON.stringify(value));
			} catch {
				// quota / private mode: estado fica só em memória
			}
		});
	};

	if (typeof window === "undefined") {
		// SSR: mantém defaultValue (sem localStorage)
	} else if (booted) {
		boot();
	} else {
		bootTasks.push(boot);
	}

	return Object.assign(store, { setFromRaw });
}
