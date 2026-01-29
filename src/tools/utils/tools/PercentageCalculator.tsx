import { useState, useMemo } from "preact/hooks";
import type { ToolThemeSchema } from "../toolsData";

// --- Funções de Cálculo (Mantidas iguais) ---
function calculatePercentageOfValue(x: number, y: number): number {
	return (x / 100) * y;
}

function calculatePercentOfTotal(part: number, total: number): number {
	if (total === 0) return 0;
	return (part / total) * 100;
}

function calculateDiscountOrIncrease(val: number, rate: number, isDiscount: boolean) {
	const amount = (rate / 100) * val;
	return {
		finalValue: isDiscount ? val - amount : val + amount,
		changeAmount: amount,
	};
}

function calculatePercentageChange(oldVal: number, newVal: number): number {
	if (oldVal === 0) return 0;
	return ((newVal - oldVal) / oldVal) * 100;
}

function calculateOriginalTotal(part: number, percent: number): number {
	if (percent === 0) return 0;
	return part / (percent / 100);
}

function formatResult(value: number | null | undefined, unit: string = "", fallback: string = "..."): string {
	if (value === null || value === undefined || Number.isNaN(value) || !Number.isFinite(value)) return fallback;
	return `${parseFloat(value.toFixed(4))}${unit}`;
}

// --- COMPONENTE AUXILIAR (MOVIDO PARA FORA) ---
// Agora ele é estável e não causa re-renderização desnecessária dos filhos
const Row = ({
	children,
	result,
	unit = "",
	colors,
}: {
	children: React.ReactNode;
	result: number | null;
	unit?: string;
	colors: ToolThemeSchema;
}) => {
	// Definimos o estilo aqui dentro, baseado na prop colors
	const resultBox = `flex flex-col justify-center items-end px-4 py-2 rounded-lg bg-[#2a2a2a] border-l-4 ${colors.border}`;

	return (
		<div className="bg-[#252525] p-5 rounded-xl border border-white/5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
			<div className="text-xl font-light text-slate-300 leading-relaxed w-full text-center sm:text-left">
				{children}
			</div>
			<div className={`flex-shrink-0 w-full sm:w-auto ${resultBox}`}>
				<span className="text-xs uppercase tracking-wider text-slate-500 font-semibold text-right w-full block">
					Resultado
				</span>
				<span className={`text-2xl font-bold ${colors.text} leading-none`}>{formatResult(result, unit)}</span>
			</div>
		</div>
	);
};

// --- COMPONENTE PRINCIPAL ---
export default function PercentageCalculatorCard({ colors }: { colors: ToolThemeSchema }) {
	const [inputs, setInputs] = useState({
		percentOfX: "",
		totalOfY: "",
		partOfY: "",
		totalOfZ: "",
		rateX: "",
		priceY: "",
		oldVal: "",
		newVal: "",
		knownPart: "",
		knownPercent: "",
	});

	const [isDiscount, setIsDiscount] = useState(true);

	const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.currentTarget;
		if (/^[\d.-]*$/.test(value)) {
			setInputs((prev) => ({ ...prev, [name]: value }));
		}
	};

	// Memos
	const res1 = useMemo(
		() => calculatePercentageOfValue(parseFloat(inputs.percentOfX), parseFloat(inputs.totalOfY)),
		[inputs.percentOfX, inputs.totalOfY],
	);
	const res2 = useMemo(
		() => calculatePercentOfTotal(parseFloat(inputs.partOfY), parseFloat(inputs.totalOfZ)),
		[inputs.partOfY, inputs.totalOfZ],
	);
	const res3 = useMemo(
		() => calculateDiscountOrIncrease(parseFloat(inputs.priceY), parseFloat(inputs.rateX), isDiscount),
		[inputs.priceY, inputs.rateX, isDiscount],
	);
	const resChange = useMemo(
		() => calculatePercentageChange(parseFloat(inputs.oldVal), parseFloat(inputs.newVal)),
		[inputs.oldVal, inputs.newVal],
	);
	const resTotal = useMemo(
		() => calculateOriginalTotal(parseFloat(inputs.knownPart), parseFloat(inputs.knownPercent)),
		[inputs.knownPart, inputs.knownPercent],
	);

	// Estilo do Input
	const inlineInput = `inline-block w-24 sm:w-32 mx-2 p-1 text-center font-bold bg-transparent border-b-2 border-white/20 text-white placeholder-white/20 transition-colors focus:outline-none focus:border-current ${colors.text}`;

	return (
		<div className="space-y-6">
			{/* Agora passamos 'colors' para o Row */}
			<Row result={res1} colors={colors}>
				Quanto é
				<input
					name="percentOfX"
					value={inputs.percentOfX}
					onInput={handleInput}
					placeholder="20"
					className={inlineInput}
					inputMode="decimal"
				/>
				% de
				<input
					name="totalOfY"
					value={inputs.totalOfY}
					onInput={handleInput}
					placeholder="1000"
					className={inlineInput}
					inputMode="decimal"
				/>
				?
			</Row>

			<Row result={res2} unit="%" colors={colors}>
				O valor
				<input
					name="partOfY"
					value={inputs.partOfY}
					onInput={handleInput}
					placeholder="50"
					className={inlineInput}
					inputMode="decimal"
				/>
				é qual % de
				<input
					name="totalOfZ"
					value={inputs.totalOfZ}
					onInput={handleInput}
					placeholder="200"
					className={inlineInput}
					inputMode="decimal"
				/>
				?
			</Row>

			<Row result={resChange} unit="%" colors={colors}>
				Se o valor for de
				<input
					name="oldVal"
					value={inputs.oldVal}
					onInput={handleInput}
					placeholder="100"
					className={inlineInput}
					inputMode="decimal"
				/>
				para
				<input
					name="newVal"
					value={inputs.newVal}
					onInput={handleInput}
					placeholder="150"
					className={inlineInput}
					inputMode="decimal"
				/>
				a variação é:
			</Row>

			<Row result={resTotal} colors={colors}>
				Se
				<input
					name="knownPart"
					value={inputs.knownPart}
					onInput={handleInput}
					placeholder="25"
					className={inlineInput}
					inputMode="decimal"
				/>
				representa
				<input
					name="knownPercent"
					value={inputs.knownPercent}
					onInput={handleInput}
					placeholder="10"
					className={inlineInput}
					inputMode="decimal"
				/>
				% do total, o total é:
			</Row>

			{/* O bloco de Desconto/Aumento continua igual pois é HTML direto */}
			<div className="bg-[#252525] p-5 rounded-xl border border-white/5 shadow-sm space-y-5">
				<div className="flex items-center justify-between border-b border-white/5 pb-2">
					<h4 className="text-lg font-semibold text-slate-200">Cálculo de Desconto/Aumento</h4>
					<div className="flex bg-[#1a1a1a] p-1 rounded-lg">
						<button
							onClick={() => setIsDiscount(true)}
							className={`px-3 py-1 text-sm font-bold rounded-md transition-all ${isDiscount ? colors.button : "text-slate-500 hover:text-slate-300"}`}
						>
							Desconto
						</button>
						<button
							onClick={() => setIsDiscount(false)}
							className={`px-3 py-1 text-sm font-bold rounded-md transition-all ${!isDiscount ? colors.button : "text-slate-500 hover:text-slate-300"}`}
						>
							Aumento
						</button>
					</div>
				</div>

				<div className="text-xl font-light text-slate-300 leading-relaxed text-center sm:text-left">
					Qual o valor final após{" "}
					{isDiscount ? (
						<span className="text-red-400 font-medium">desconto</span>
					) : (
						<span className="text-green-400 font-medium">aumento</span>
					)}{" "}
					de
					<input
						name="rateX"
						value={inputs.rateX}
						onInput={handleInput}
						placeholder="15"
						className={inlineInput}
						inputMode="decimal"
					/>
					% em
					<input
						name="priceY"
						value={inputs.priceY}
						onInput={handleInput}
						placeholder="100"
						className={inlineInput}
						inputMode="decimal"
					/>
					?
				</div>

				<div className="grid grid-cols-2 gap-4 pt-2">
					<div className={`p-3 rounded-lg bg-[#2a2a2a] border border-white/5`}>
						<p className="text-slate-500 text-sm mb-1">Valor Final</p>
						<span className={`text-2xl font-bold ${colors.text}`}>{formatResult(res3?.finalValue)}</span>
					</div>
					<div className={`p-3 rounded-lg bg-[#2a2a2a] border border-white/5 text-right`}>
						<p className="text-slate-500 text-sm mb-1">Diferença</p>
						<span className="text-xl font-semibold text-slate-300">{formatResult(res3?.changeAmount)}</span>
					</div>
				</div>
			</div>
		</div>
	);
}
