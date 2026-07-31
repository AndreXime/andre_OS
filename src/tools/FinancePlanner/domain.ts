export interface SubscriptionItem {
	readonly id: string;
	readonly name: string;
	/** Valor mensal em centavos (BRL). */
	readonly monthlyCents: number;
}

export interface SubscriptionTotals {
	readonly dailyCents: number;
	readonly monthlyCents: number;
	readonly annualCents: number;
}

export function formatBrlFromCents(cents: number): string {
	const safe = Number.isFinite(cents) ? cents : 0;
	return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(safe / 100);
}

export function normalizeName(name: string): string {
	return name.trim().replace(/\s+/g, " ");
}

/**
 * Aceita entradas como: "100", "100,50", "R$ 1.234,56", "1234.56".
 * Retorna centavos inteiros (>= 0) ou null se inválido.
 */
export function parseBrlToCents(input: string): number | null {
	const raw = input.trim();
	if (raw === "") return null;

	const cleaned = raw.replace(/\s/g, "").replace(/^R\$\s*/i, "");
	const hasComma = cleaned.includes(",");
	const hasDot = cleaned.includes(".");

	let normalized = cleaned;
	if (hasComma && hasDot) {
		// pt-BR típico: 1.234,56 -> remove milhares e troca decimal
		normalized = cleaned.replace(/\./g, "").replace(",", ".");
	} else if (hasComma && !hasDot) {
		// 100,50 -> 100.50
		normalized = cleaned.replace(",", ".");
	} else {
		// 1234.56 ou 1234
		normalized = cleaned;
	}

	if (!/^\d+(\.\d{0,2})?$/.test(normalized)) return null;
	const n = Number(normalized);
	if (!Number.isFinite(n) || n < 0) return null;
	return Math.round(n * 100);
}

export function computeTotals(items: readonly SubscriptionItem[]): SubscriptionTotals {
	const monthlyCents = items.reduce((acc, s) => acc + (Number.isFinite(s.monthlyCents) ? s.monthlyCents : 0), 0);
	const annualCents = monthlyCents * 12;
	// diária média no ano (365). Mantém em centavos (arredondado).
	const dailyCents = Math.round(annualCents / 365);
	return { dailyCents, monthlyCents, annualCents };
}
