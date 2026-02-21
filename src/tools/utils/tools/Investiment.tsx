import { useEffect, useState, useMemo } from "react";
import type { ToolThemeSchema } from "../toolsData";

interface TaxaApiItem {
	nome: string;
	valor: number;
}

async function getServerApiData() {
	let inflacao = 4.5 / 100; // Fallback IPCA
	let cdi = 11.25 / 100; // Fallback CDI
	let isFallback = true;

	try {
		const responseTaxas = await fetch("https://brasilapi.com.br/api/taxas/v1");
		if (!responseTaxas.ok) throw new Error("Erro API");
		const data: TaxaApiItem[] = await responseTaxas.json();

		const ipcaObj = data.find((t) => t.nome === "IPCA");
		if (ipcaObj) inflacao = ipcaObj.valor / 100;

		const cdiObj = data.find((t) => t.nome === "CDI");
		if (cdiObj) cdi = cdiObj.valor / 100;

		if (ipcaObj && cdiObj) isFallback = false;
	} catch (e) {
		console.warn("Usando taxas de fallback:", e);
	}

	return { inflacao, cdi, isFallback };
}

function formatarMoeda(valor: number) {
	return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function InvestmentCard({ colors }: { colors: ToolThemeSchema }) {
	const [metaRenda, setMetaRenda] = useState(1518);
	const [percCDI, setPercCDI] = useState(100);
	const [dadosMercado, setDadosMercado] = useState({ inflacao: 0, cdi: 0, isFallback: false });

	useEffect(() => {
		getServerApiData().then(setDadosMercado);
	}, []);

	const resultado = useMemo(() => {
		if (!dadosMercado.cdi || metaRenda <= 0 || percCDI <= 0) return null;

		const cdiMensal = Math.pow(1 + dadosMercado.cdi, 1 / 12) - 1;
		const inflacaoMensal = Math.pow(1 + dadosMercado.inflacao, 1 / 12) - 1;

		const rendimentoBrutoMensal = cdiMensal * (percCDI / 100);
		const aliquotaIR = 0.15;
		const rendimentoLiquidoMensal = rendimentoBrutoMensal * (1 - aliquotaIR);

		const capitalNecessario = metaRenda / rendimentoLiquidoMensal;

		const proporcaoReinvestir = inflacaoMensal / rendimentoLiquidoMensal;
		const valorReinvestir = metaRenda * proporcaoReinvestir;
		const rendaRealDisponivel = metaRenda - valorReinvestir;

		return {
			capital: capitalNecessario,
			taxaMensalLiq: rendimentoLiquidoMensal,
			porcentagemReinvestir: proporcaoReinvestir * 100,
			valorReinvestir: valorReinvestir,
			rendaReal: rendaRealDisponivel,
		};
	}, [metaRenda, percCDI, dadosMercado]);

	const inputClass = `w-full p-3 rounded-lg bg-[#2a2a2a] border border-white/10 text-slate-200 focus:outline-none focus:ring-2 ${colors.ring}`;
	const cardClass = `p-5 rounded-lg border-l-4 bg-[#252525] border-white/5 shadow-sm`;

	// Componente interno para os cards de indicadores
	const MarketIndicator = ({ label, value, colorClass }: { label: string; value: string; colorClass: string }) => (
		<div
			className={`bg-[#1a1a1a] p-3 rounded-lg border flex flex-col justify-center relative overflow-hidden ${dadosMercado.isFallback ? "border-yellow-500/30" : "border-white/5"}`}
		>
			{dadosMercado.isFallback && (
				<div
					className="absolute top-0 right-0 w-2 h-2 bg-yellow-500 rounded-full m-1"
					title="Valor Estimado (API Offline)"
				/>
			)}
			<span className="text-slate-400 text-xs uppercase font-bold tracking-wider">{label}</span>
			<strong className={`text-xl ${colorClass}`}>{value}</strong>
		</div>
	);

	return (
		<div className="space-y-6">
			<div className="space-y-4">
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<div>
						<label htmlFor="rendamensal" className="block mb-2 font-bold text-slate-200 text-sm">
							Meta de Renda Mensal
						</label>
						<input
							id="rendamensal"
							type="number"
							value={metaRenda}
							onInput={(e) => setMetaRenda(Number(e.currentTarget.value))}
							className={inputClass}
							placeholder="Ex: 5000"
						/>
					</div>
					<div>
						<label htmlFor="rentabilidade" className="block mb-2 font-bold text-slate-200 text-sm">
							Rentabilidade (% do CDI)
						</label>
						<div className="relative">
							<input
								id="rentabilidade"
								type="number"
								value={percCDI}
								onInput={(e) => setPercCDI(Number(e.currentTarget.value))}
								className={inputClass}
								placeholder="100"
							/>
							<span className="absolute right-4 top-3 text-slate-500 font-bold text-sm">%</span>
						</div>
					</div>
				</div>

				{/* Cards de Indicadores de Mercado */}
				<div className="grid grid-cols-2 gap-4">
					<MarketIndicator
						label="CDI Atual (Ano)"
						value={`${(dadosMercado.cdi * 100).toFixed(2)}%`}
						colorClass={colors.text}
					/>
					<MarketIndicator
						label="Inflação (IPCA)"
						value={`${(dadosMercado.inflacao * 100).toFixed(2)}%`}
						colorClass="text-red-400"
					/>
				</div>
				{dadosMercado.isFallback && (
					<p className="text-xs text-yellow-500/70 text-right mt-1">* Valores estimados. API indisponível.</p>
				)}
			</div>

			{/* --- Resultado --- */}
			{resultado && (
				<div className={`${cardClass} ${colors.border} animate-in fade-in slide-in-from-bottom-2 duration-500`}>
					<h3 className={`text-lg font-bold mb-4 ${colors.text} uppercase tracking-wide`}>Planejamento Financeiro</h3>

					<div className="flex flex-col gap-6">
						{/* Capital Principal */}
						<div>
							<p className="text-slate-300 mb-1 text-sm">Patrimônio Necessário:</p>
							<p className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
								{formatarMoeda(resultado.capital)}
							</p>
						</div>

						{/* Bloco de Reinvestimento */}
						<div className="bg-[#1a1a1a] p-4 rounded-lg border border-white/5 relative overflow-hidden">
							<div className="absolute top-0 left-0 h-1 bg-gradient-to-r from-red-500 to-green-500 w-full opacity-30"></div>

							<h4 className="text-slate-200 font-bold mb-3 flex items-center text-sm">Distribuição da Renda Gerada</h4>

							<div className="grid grid-cols-2 gap-3 text-sm">
								<div className="p-3 bg-red-500/5 rounded border border-red-500/10">
									<span className="block text-red-400 uppercase font-bold mb-1">Reinvestir (Inflação)</span>
									<strong className="text-slate-200 text-lg block">{formatarMoeda(resultado.valorReinvestir)}</strong>
									<span className=" text-slate-500">{resultado.porcentagemReinvestir.toFixed(1)}% do total</span>
								</div>
								<div className="p-3 bg-green-500/5 rounded border border-green-500/10">
									<span className="block text-green-400  uppercase font-bold mb-1">Pode Gastar (Livre)</span>
									<strong className="text-slate-200 text-lg block">{formatarMoeda(resultado.rendaReal)}</strong>
									<span className=" text-slate-500">
										{(100 - resultado.porcentagemReinvestir).toFixed(1)}% do total
									</span>
								</div>
							</div>
						</div>

						<div className="flex justify-between items-center  text-slate-600 border-t border-white/5 pt-2">
							<span>
								Rend. Líquido Real: <strong>~{(resultado.taxaMensalLiq * 100).toFixed(2)}% a.m.</strong>
							</span>
							<span>
								IR: <strong>15%</strong>
							</span>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
