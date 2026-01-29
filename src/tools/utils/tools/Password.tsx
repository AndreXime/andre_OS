import { useState, useEffect, useCallback } from "preact/hooks";
import type { ToolThemeSchema } from "../toolsData";

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
		password += allChars[array[i] % allChars.length];
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
function handleBase64(text: string, mode: "encode" | "decode"): string {
	if (!text) return "";
	try {
		if (mode === "encode") {
			return btoa(unescape(encodeURIComponent(text)));
		} else {
			return decodeURIComponent(escape(atob(text)));
		}
	} catch {
		return "Erro: Entrada inválida para Base64.";
	}
}

// --- Tipos de Modos ---
type GenMode = "password" | "uuid" | "hash" | "base64";

export default function SecurityToolsCard({ colors }: { colors: ToolThemeSchema }) {
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
			active ? `${colors.button} shadow-lg` : "text-slate-500 hover:text-slate-300 hover:bg-[#2a2a2a]"
		}`;
	const inputClass = `w-full p-3 rounded-lg bg-[#1a1a1a] border border-white/10 text-slate-200 focus:outline-none focus:ring-1 ${colors.ring}`;
	const checkboxClass = `w-5 h-5 rounded bg-slate-700 border-slate-600 text-current focus:ring-0 ${colors.text}`;

	return (
		<div className="space-y-6">
			{/* --- Seletor de Abas (Modo) --- */}
			<div className="bg-[#252525] p-1 rounded-lg flex space-x-1 border border-white/5">
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
							<span className="text-slate-300 font-medium">Tamanho: {pwLength}</span>
							<input
								type="range"
								min="8"
								max="64"
								value={pwLength}
								onInput={(e) => setPwLength(Number(e.currentTarget.value))}
								className={`w-1/2 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-${colors.alias}-500`}
								style={{ accentColor: colors.icon.split("-")[1] }} // Fallback
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
									className="flex items-center space-x-3 p-3 rounded-lg bg-[#252525] border border-transparent hover:border-white/10 cursor-pointer"
								>
									<input
										type="checkbox"
										name={opt.name}
										checked={pwOptions[opt.name as keyof PasswordOptions]}
										onChange={handlePwOption}
										className={checkboxClass}
									/>
									<span className="text-slate-300 text-sm">{opt.label}</span>
								</label>
							))}
						</div>
						<button
							onClick={executeAction}
							className={`w-full py-3 rounded-lg font-bold text-white shadow-lg active:scale-[0.98] transition-transform ${colors.button}`}
						>
							Gerar Nova Senha
						</button>
					</div>
				)}

				{/* MODO: UUID */}
				{mode === "uuid" && (
					<div className="space-y-4 animate-in fade-in zoom-in-95 duration-300 text-center py-4">
						<p className="text-slate-400 text-sm mb-4">
							Gera um Identificador Único Universal (UUID v4) criptograficamente seguro.
						</p>
						<button
							onClick={executeAction}
							className={`w-full py-3 rounded-lg font-bold text-white shadow-lg active:scale-[0.98] transition-transform ${colors.button}`}
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
									className={`flex-1 py-2 rounded border border-white/10 text-sm font-bold transition-colors ${
										hashAlgo === algo
											? `${colors.softBg} ${colors.text} border-transparent`
											: "text-slate-500 bg-[#252525]"
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
						<div className="flex bg-[#252525] p-1 rounded-lg border border-white/5">
							<button
								onClick={() => setBase64Mode("encode")}
								className={`flex-1 py-1.5 rounded text-sm font-bold transition-all ${
									base64Mode === "encode" ? "bg-white/10 text-white" : "text-slate-500"
								}`}
							>
								Codificar (Encode)
							</button>
							<button
								onClick={() => setBase64Mode("decode")}
								className={`flex-1 py-1.5 rounded text-sm font-bold transition-all ${
									base64Mode === "decode" ? "bg-white/10 text-white" : "text-slate-500"
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
				className={`group relative mt-6 flex flex-col justify-center p-5 rounded-lg border-l-4 bg-[#252525] cursor-pointer hover:bg-[#2a2a2a] transition-all ${colors.border}`}
				title="Clique para Copiar"
			>
				<div className="flex justify-between items-start w-full">
					<code className="font-mono text-lg font-bold break-all text-slate-200 group-hover:text-white transition-colors w-full pr-8">
						{output || (mode === "password" || mode === "uuid" ? "Clique em Gerar" : "Aguardando entrada...")}
					</code>
					<span
						className={`absolute top-5 right-5 text-xs font-bold uppercase tracking-wider transition-colors ${
							copyFeedback ? "text-emerald-400" : "text-slate-600 group-hover:text-slate-400"
						}`}
					>
						{copyFeedback || "Copiar"}
					</span>
				</div>
				{mode === "hash" && output && (
					<span className="text-xs text-slate-500 mt-2 font-mono uppercase">{hashAlgo}</span>
				)}
			</div>
		</div>
	);
}
