export interface FinancialPlanInput {
	readonly salarioAtual: number;
	readonly alvoAposentadoria: number;
	readonly taxaAportePercentual: number;
	readonly taxaJurosAnualReal: number;
	/** Salário de contribuição ao INSS (ex.: salário mínimo em contrato reduzido). */
	readonly salarioContribuicaoInss: number;
	/** Benefício mensal esperado do INSS na aposentadoria. */
	readonly valorInssFixo: number;
	readonly idadeAtual: number;
	readonly idadeMinimaInss: number;
	readonly aliquotaIrRetirada: number;
}

/** Salário mínimo nacional (base INSS), 2025. */
export const SALARIO_MINIMO_2025 = 1518;

/** Teto do salário de contribuição INSS (empregado CLT), 2025. */
const TETO_SALARIO_CONTRIBUICAO_INSS_2025 = 8157.41;

const FAIXAS_CONTRIBUICAO_INSS_2025 = [
	{ limite: 1518, aliquota: 0.075 },
	{ limite: 2793.88, aliquota: 0.09 },
	{ limite: 4190.83, aliquota: 0.12 },
	{ limite: TETO_SALARIO_CONTRIBUICAO_INSS_2025, aliquota: 0.14 },
] as const;

const TETO_CONTRIBUICAO_INSS_2025 = estimarContribuicaoInssMensal(TETO_SALARIO_CONTRIBUICAO_INSS_2025);

/** Estima o desconto mensal de INSS no holerite (tabela progressiva 2025, empregado CLT). */
export function estimarContribuicaoInssMensal(salarioBruto: number): number {
	if (salarioBruto <= 0) return 0;

	const base = Math.min(salarioBruto, TETO_SALARIO_CONTRIBUICAO_INSS_2025);
	let faixaAnterior = 0;
	let total = 0;

	for (const faixa of FAIXAS_CONTRIBUICAO_INSS_2025) {
		const limiteFaixa = Math.min(base, faixa.limite);
		const valorNaFaixa = limiteFaixa - faixaAnterior;
		if (valorNaFaixa <= 0) break;
		total += valorNaFaixa * faixa.aliquota;
		faixaAnterior = faixa.limite;
		if (base <= faixa.limite) break;
	}

	return Math.round(total);
}

/**
 * Estima benefício mensal proporcional ao salário e ao tempo até a aposentadoria.
 * Usa teto 2025 e coeficiente da reforma (60% + 2% por ano acima de 20, até 100%).
 */
export function estimarBeneficioInssMensal(
	salarioBruto: number,
	idadeAtual: number,
	idadeMinimaInss: number,
): number {
	if (salarioBruto <= 0 || idadeMinimaInss <= idadeAtual) return 0;

	const contribuicaoMensal = estimarContribuicaoInssMensal(salarioBruto);
	const proporcaoContribuicao = Math.min(contribuicaoMensal / TETO_CONTRIBUICAO_INSS_2025, 1);
	const anosContribuicao = idadeMinimaInss - idadeAtual;
	const coeficiente = Math.min(1, 0.6 + 0.02 * Math.max(0, anosContribuicao - 20));
	const mediaSalarialEstimada = TETO_SALARIO_CONTRIBUICAO_INSS_2025 * proporcaoContribuicao;

	return Math.round(mediaSalarialEstimada * coeficiente);
}

const DEFAULT_SALARIO = 15000;
const DEFAULT_IDADE_ATUAL = 25;
const DEFAULT_IDADE_MINIMA_INSS = 65;
const DEFAULT_CONTRIBUICAO_INSS_TETO = estimarContribuicaoInssMensal(DEFAULT_SALARIO);
const DEFAULT_CONTRIBUICAO_INSS_MINIMO = estimarContribuicaoInssMensal(SALARIO_MINIMO_2025);
const DEFAULT_APORTE_COM_INSS_TETO = DEFAULT_SALARIO * 0.6;
const DEFAULT_VALOR_LIVRE =
	DEFAULT_SALARIO - DEFAULT_APORTE_COM_INSS_TETO - DEFAULT_CONTRIBUICAO_INSS_TETO;
const DEFAULT_APORTE_COM_INSS_MINIMO =
	DEFAULT_SALARIO - DEFAULT_CONTRIBUICAO_INSS_MINIMO - DEFAULT_VALOR_LIVRE;

export const defaultFinancialPlanInput: FinancialPlanInput = {
	salarioAtual: DEFAULT_SALARIO,
	alvoAposentadoria: 6000,
	taxaAportePercentual: Number(((DEFAULT_APORTE_COM_INSS_MINIMO / DEFAULT_SALARIO) * 100).toFixed(1)),
	taxaJurosAnualReal: 6,
	salarioContribuicaoInss: SALARIO_MINIMO_2025,
	valorInssFixo: estimarBeneficioInssMensal(SALARIO_MINIMO_2025, DEFAULT_IDADE_ATUAL, DEFAULT_IDADE_MINIMA_INSS),
	idadeAtual: DEFAULT_IDADE_ATUAL,
	idadeMinimaInss: DEFAULT_IDADE_MINIMA_INSS,
	aliquotaIrRetirada: 15,
};

export interface EvolucaoAnual {
	readonly idade: number;
	readonly totalInvestido: number;
	readonly jurosAcumulados: number;
	readonly patrimonioTotal: number;
}

export interface FinancialPlanResult {
	readonly idadeAposentadoriaProjetada: number;
	readonly patrimonioAlvoNecessario: number;
	readonly aporteMensal: number;
	readonly contribuicaoInssMensal: number;
	readonly valorLivreParaGasto: number;
	readonly rendaBrutaNecessaria: number;
	readonly considerouInssNoAlvo: boolean;
	readonly tempoAnos: number;
	readonly evolucaoPatrimonio: readonly EvolucaoAnual[];
}

const TAXA_RETIRADA_MENSAL = 0.005;
const MAX_MESES = 1200;

export function calcularPlanoAposentadoriaTributado(input: FinancialPlanInput): FinancialPlanResult {
	const {
		salarioAtual,
		alvoAposentadoria,
		taxaAportePercentual,
		taxaJurosAnualReal,
		salarioContribuicaoInss,
		valorInssFixo,
		idadeAtual,
		idadeMinimaInss,
		aliquotaIrRetirada,
	} = input;

	const aporteMensal = salarioAtual * (taxaAportePercentual / 100);
	const contribuicaoInssMensal = estimarContribuicaoInssMensal(salarioContribuicaoInss);
	const valorLivreParaGasto = salarioAtual - aporteMensal - contribuicaoInssMensal;
	const taxaMensalReal = (1 + taxaJurosAnualReal / 100) ** (1 / 12) - 1;
	const fatorImposto = 1 - aliquotaIrRetirada / 100;

	const necessidadeLiquidaSemInss = alvoAposentadoria;
	const necessidadeLiquidaComInss = Math.max(0, alvoAposentadoria - valorInssFixo);

	const saqueBrutoSemInss = necessidadeLiquidaSemInss / fatorImposto;
	const saqueBrutoComInss = necessidadeLiquidaComInss / fatorImposto;

	const patrimonioNecessarioSemInss = saqueBrutoSemInss / TAXA_RETIRADA_MENSAL;
	const patrimonioNecessarioComInss = saqueBrutoComInss / TAXA_RETIRADA_MENSAL;

	let patrimonioAtual = 0;
	let totalInvestidoAcumulado = 0;
	let meses = 0;
	let atingiuFI = false;
	let patrimonioAlvoDefinitivo = 0;
	let saqueBrutoDefinitivo = 0;
	let considerouInssNoAlvo = false;

	const evolucaoPatrimonio: EvolucaoAnual[] = [
		{
			idade: idadeAtual,
			totalInvestido: 0,
			jurosAcumulados: 0,
			patrimonioTotal: 0,
		},
	];

	while (!atingiuFI && meses < MAX_MESES) {
		meses++;

		const jurosDoMes = patrimonioAtual * taxaMensalReal;
		patrimonioAtual += jurosDoMes + aporteMensal;
		totalInvestidoAcumulado += aporteMensal;

		const idadeProjetada = idadeAtual + meses / 12;

		if (idadeProjetada >= idadeMinimaInss) {
			if (patrimonioAtual >= patrimonioNecessarioComInss) {
				atingiuFI = true;
				patrimonioAlvoDefinitivo = patrimonioNecessarioComInss;
				saqueBrutoDefinitivo = saqueBrutoComInss;
				considerouInssNoAlvo = true;
			}
		} else if (patrimonioAtual >= patrimonioNecessarioSemInss) {
			atingiuFI = true;
			patrimonioAlvoDefinitivo = patrimonioNecessarioSemInss;
			saqueBrutoDefinitivo = saqueBrutoSemInss;
			considerouInssNoAlvo = false;
		}

		if (meses % 12 === 0 || atingiuFI) {
			evolucaoPatrimonio.push({
				idade: Number(idadeProjetada.toFixed(1)),
				totalInvestido: Math.round(totalInvestidoAcumulado),
				jurosAcumulados: Math.round(patrimonioAtual - totalInvestidoAcumulado),
				patrimonioTotal: Math.round(patrimonioAtual),
			});
		}
	}

	return {
		idadeAposentadoriaProjetada: Number((idadeAtual + meses / 12).toFixed(1)),
		patrimonioAlvoNecessario: Math.round(patrimonioAlvoDefinitivo),
		aporteMensal: Math.round(aporteMensal),
		contribuicaoInssMensal,
		valorLivreParaGasto: Math.round(valorLivreParaGasto),
		rendaBrutaNecessaria: Math.round(saqueBrutoDefinitivo),
		considerouInssNoAlvo,
		tempoAnos: Number((meses / 12).toFixed(1)),
		evolucaoPatrimonio,
	};
}

export function formatarMoeda(valor: number): string {
	return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
