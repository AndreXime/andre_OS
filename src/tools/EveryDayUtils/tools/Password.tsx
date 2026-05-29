import { useState, useEffect, useCallback } from "react";

// --- Utilitários de Lógica ---

const CHARS = {
	LOWER: "abcdefghijklmnopqrstuvwxyz",
	UPPER: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
	NUMBERS: "01234456789",
	SYMBOLS: "!@#$%^&*()_+~`|}{[]:;?><,./-=",
};

interface PasswordOptions {
	includeLower: boolean;
	includeUpper: boolean;
	includeNumbers: boolean;
	includeSymbols: boolean;
}

// 1. Gerador de Senha Aleatória
function generateRandomPassword(length: number, options: PasswordOptions): string {
	let allChars = "";
	if (options.includeLower) allChars += CHARS.LOWER;
	if (options.includeUpper) allChars += CHARS.UPPER;
	if (options.includeNumbers) allChars += CHARS.NUMBERS;
	if (options.includeSymbols) allChars += CHARS.SYMBOLS;

	if (allChars.length === 0 || length < 1) return "";

	let password = "";
	const array = new Uint32Array(length);
	crypto.getRandomValues(array); // Mais seguro que Math.random()

	for (let i = 0; i < length; i++) {
		const random = array[i] ?? 0;
		password += allChars[random % allChars.length];
	}
	return password;
}

// 2. Gerador de Hash (Async)
async function generateHash(text: string, algorithm: "SHA-1" | "SHA-256" | "SHA-512"): Promise<string> {
	if (!text) return "";
	const msgBuffer = new TextEncoder().encode(text);
	const hashBuffer = await crypto.subtle.digest(algorithm, msgBuffer);
	const hashArray = Array.from(new Uint8Array(hashBuffer));
	return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// 3. Base64 (UTF-8 Safe)
function utf8ToBase64(text: string): string {
	const bytes = new TextEncoder().encode(text);
	let binary = "";
	for (const byte of bytes) {
		binary += String.fromCharCode(byte);
	}
	return btoa(binary);
}

function base64ToUtf8(base64: string): string {
	const binary = atob(base64);
	const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
	return new TextDecoder().decode(bytes);
}

function handleBase64(text: string, mode: "encode" | "decode"): string {
	if (!text) return "";
	try {
		return mode === "encode" ? utf8ToBase64(text) : base64ToUtf8(text);
	} catch {
		return "Erro: Entrada inválida para Base64.";
	}
}

// --- Tipos de Modos ---
type GenMode = "password" | "uuid" | "hash" | "base64";

export default function SecurityToolsCard() {
	// Estado Global
	const [mode, setMode] = useState<GenMode>("password");
	const [output, setOutput] = useState("");
	const [inputText, setInputText] = useState("");
	const [copyFeedback, setCopyFeedback] = useState("");

	// Estado Senha
	const [pwLength, setPwLength] = useState(16);
	const [pwOptions, setPwOptions] = useState({
		includeLower: true,
		includeUpper: true,
		includeNumbers: true,
		includeSymbols: true,
	});

	// Estado Hash / Base64
	const [hashAlgo, setHashAlgo] = useState<"SHA-256" | "SHA-512" | "SHA-1">("SHA-256");
	const [base64Mode, setBase64Mode] = useState<"encode" | "decode">("encode");

	// --- Lógica Principal de Execução ---
	const executeAction = useCallback(async () => {
		let result = "";

		switch (mode) {
			case "password":
				result = generateRandomPassword(pwLength, pwOptions);
				break;
			case "uuid":
				result = crypto.randomUUID();
				break;
			case "hash":
				result = await generateHash(inputText, hashAlgo);
				break;
			case "base64":
				result = handleBase64(inputText, base64Mode);
				break;
		}

		setOutput(result);
		setCopyFeedback("");
	}, [mode, pwLength, pwOptions, inputText, hashAlgo, base64Mode]);

	// Executa automaticamente quando muda inputs (exceto hash pesado que poderia ter debounce, mas aqui é ok)
	useEffect(() => {
		executeAction();
	}, [executeAction]);

	// --- Helpers de UI ---

	const handlePwOption = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, checked } = e.currentTarget;
		setPwOptions((prev) => {
			const next = { ...prev, [name]: checked };
			if (!Object.values(next).some(Boolean)) return prev;
			return next;
		});
	};

	const copyToClipboard = () => {
		if (!output) return;
		navigator.clipboard.writeText(output).then(() => {
			setCopyFeedback("Copiada!");
			setTimeout(() => setCopyFeedback(""), 1500);
		});
	};

	// Estilos comuns
	const tabClass = (active: boolean) =>
		`flex-1 py-2 text-sm font-bold rounded-md transition-all ${
			active
				? "bg-[var(--primary)] text-[var(--primary-text)] hover:brightness-105 shadow-lg"
				: "text-[var(--text)]/90 hover:text-[var(--headline)] hover:bg-[color-mix(in_srgb,var(--card-bg)_90%,#0000)]"
		}`;
	const inputClass =
		"w-full p-3 rounded-lg bg-[color-mix(in_srgb,var(--background)_50%,#0000)] border border-[var(--card-border)]/80 text-[var(--card-text)] focus:outline-none focus:outline-2 focus:outline-solid focus:outline-[var(--primary)] focus:outline-offset-2";
	const checkboxClass =
		"w-5 h-5 rounded bg-[var(--card-border)]/60 border border-[var(--card-border)] text-[var(--primary)] focus:ring-0";

	return (
		<div className="space-y-6">
			{/* --- Seletor de Abas (Modo) --- */}
			<div className="bg-[color-mix(in_srgb,var(--card-bg)_88%,#0000)] p-1 rounded-lg flex space-x-1 border border-[var(--card-border)]/50">
				<button onClick={() => setMode("password")} className={tabClass(mode === "password")}>
					Senha
				</button>
				<button onClick={() => setMode("uuid")} className={tabClass(mode === "uuid")}>
					UUID
				</button>
				<button onClick={() => setMode("hash")} className={tabClass(mode === "hash")}>
					Hash
				</button>
				<button onClick={() => setMode("base64")} className={tabClass(mode === "base64")}>
					Base64
				</button>
			</div>

			{/* --- Área de Configuração (Muda conforme modo) --- */}
			<div className="min-h-[120px]">
				{/* MODO: SENHA */}
				{mode === "password" && (
					<div className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
						<div className="flex justify-between items-center px-1">
							<span className="text-[var(--card-text)] font-medium">Tamanho: {pwLength}</span>
							<input
								type="range"
								min="8"
								max="64"
								value={pwLength}
								onInput={(e) => setPwLength(Number(e.currentTarget.value))}
								className="w-1/2 h-2 bg-[var(--card-border)]/50 rounded-lg appearance-none cursor-pointer accent-[var(--primary)]"
							/>
						</div>
						<div className="grid grid-cols-2 gap-3">
							{[
								{ label: "Maiúsculas", name: "includeUpper" },
								{ label: "Números", name: "includeNumbers" },
								{ label: "Símbolos", name: "includeSymbols" },
								{ label: "Minúsculas", name: "includeLower" },
							].map((opt) => (
								<label
									key={opt.name}
									className="flex items-center space-x-3 p-3 rounded-lg bg-[color-mix(in_srgb,var(--card-bg)_90%,#0000)] border border-transparent hover:border-[var(--card-border)]/80 cursor-pointer"
								>
									<input
										type="checkbox"
										name={opt.name}
										checked={pwOptions[opt.name as keyof PasswordOptions]}
										onChange={handlePwOption}
										className={checkboxClass}
									/>
									<span className="text-[var(--card-text)] text-sm">{opt.label}</span>
								</label>
							))}
						</div>
						<button
							onClick={executeAction}
							className="w-full py-3 rounded-lg font-bold shadow-lg active:scale-[0.98] transition-transform bg-[var(--primary)] text-[var(--primary-text)] hover:brightness-105"
						>
							Gerar Nova Senha
						</button>
					</div>
				)}

				{/* MODO: UUID */}
				{mode === "uuid" && (
					<div className="space-y-4 animate-in fade-in zoom-in-95 duration-300 text-center py-4">
						<p className="text-[var(--text)] text-sm mb-4">
							Gera um Identificador Único Universal (UUID v4) criptograficamente seguro.
						</p>
						<button
							onClick={executeAction}
							className="w-full py-3 rounded-lg font-bold shadow-lg active:scale-[0.98] transition-transform bg-[var(--primary)] text-[var(--primary-text)] hover:brightness-105"
						>
							Gerar Novo UUID
						</button>
					</div>
				)}

				{/* MODO: HASH */}
				{mode === "hash" && (
					<div className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
						<textarea
							value={inputText}
							onInput={(e) => setInputText(e.currentTarget.value)}
							placeholder="Digite o texto para gerar o hash..."
							className={`${inputClass} h-24 resize-none`}
						/>
						<div className="flex space-x-2">
							{(["SHA-256", "SHA-512", "SHA-1"] as const).map((algo) => (
								<button
									key={algo}
									onClick={() => setHashAlgo(algo)}
									className={`flex-1 py-2 rounded border border-[var(--card-border)]/80 text-sm font-bold transition-colors ${
										hashAlgo === algo
											? "bg-[var(--primary)]/10 border-transparent text-[var(--primary)]"
											: "text-[var(--text)]/90 bg-[color-mix(in_srgb,var(--card-bg)_90%,#0000)]"
									}`}
								>
									{algo}
								</button>
							))}
						</div>
					</div>
				)}

				{/* MODO: BASE64 */}
				{mode === "base64" && (
					<div className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
						<textarea
							value={inputText}
							onInput={(e) => setInputText(e.currentTarget.value)}
							placeholder={base64Mode === "encode" ? "Texto para codificar..." : "Cole o Base64 aqui..."}
							className={`${inputClass} h-24 resize-none`}
						/>
						<div className="flex bg-[color-mix(in_srgb,var(--card-bg)_90%,#0000)] p-1 rounded-lg border border-[var(--card-border)]/50">
							<button
								onClick={() => setBase64Mode("encode")}
								className={`flex-1 py-1.5 rounded text-sm font-bold transition-all ${
									base64Mode === "encode" ? "bg-[var(--primary)]/15 text-[var(--headline)]" : "text-[var(--text)]/90"
								}`}
							>
								Codificar (Encode)
							</button>
							<button
								onClick={() => setBase64Mode("decode")}
								className={`flex-1 py-1.5 rounded text-sm font-bold transition-all ${
									base64Mode === "decode" ? "bg-[var(--primary)]/15 text-[var(--headline)]" : "text-[var(--text)]/90"
								}`}
							>
								Decodificar (Decode)
							</button>
						</div>
					</div>
				)}
			</div>

			{/* --- Área de Resultado (Comum a todos) --- */}
			<div
				onClick={copyToClipboard}
				className="group relative mt-6 flex flex-col justify-center p-5 rounded-lg border-l-4 bg-[color-mix(in_srgb,var(--card-bg)_88%,#0000)] cursor-pointer hover:bg-[color-mix(in_srgb,var(--card-bg)_95%,#0000)] transition-all border-[var(--primary)]/20"
				title="Clique para Copiar"
			>
				<div className="flex justify-between items-start w-full">
					<code className="font-mono text-lg font-bold break-all text-[var(--card-text)] group-hover:text-[var(--headline)] transition-colors w-full pr-8">
						{output || (mode === "password" || mode === "uuid" ? "Clique em Gerar" : "Aguardando entrada...")}
					</code>
					<span
						className={`absolute top-5 right-5 text-xs font-bold uppercase tracking-wider transition-colors ${
							copyFeedback ? "text-[var(--primary)]" : "text-[var(--text)]/70 group-hover:text-[var(--text)]"
						}`}
					>
						{copyFeedback || "Copiar"}
					</span>
				</div>
				{mode === "hash" && output && (
					<span className="text-xs text-[var(--text)]/80 mt-2 font-mono uppercase">{hashAlgo}</span>
				)}
			</div>
		</div>
	);
}
