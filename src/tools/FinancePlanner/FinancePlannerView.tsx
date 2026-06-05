import { useMemo, useState } from "react";
import { useStore } from "@nanostores/react";
import { Plus, Trash2, Wallet } from "lucide-react";
import { ToolShell } from "../ToolShell";
import { computeTotals, formatBrlFromCents, parseBrlToCents } from "./domain";
import {
	addSubscriptionItem,
	clearAllSubscriptionItems,
	financePlanner$,
	financePlannerStorage,
	removeSubscriptionItem,
} from "./store";

function TotalsCard({
	label,
	value,
	hint,
}: {
	readonly label: string;
	readonly value: string;
	readonly hint?: string;
}) {
	return (
		<div className="flex-1 min-w-0 flex flex-col justify-center rounded-2xl border border-[color:var(--card-border)] bg-[color:var(--card-bg)] px-4 py-3 shadow-inner shadow-black/10">
			<div className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[color:var(--text)]/80">{label}</div>
			<div className="text-2xl font-bold tabular-nums text-[color:var(--card-text)]">{value}</div>
			{hint && <div className="text-[11px] text-[color:var(--text)]/80 mt-0.5 leading-snug">{hint}</div>}
		</div>
	);
}

export function FinancePlannerView() {
	const { items } = useStore(financePlanner$);
	const totals = useMemo(() => computeTotals(items), [items]);

	const [name, setName] = useState<string>("");
	const [monthly, setMonthly] = useState<string>("");

	const parsedMonthlyCents = useMemo(() => parseBrlToCents(monthly), [monthly]);
	const canAdd = name.trim() !== "" && parsedMonthlyCents !== null;

	return (
		<ToolShell
			title="Planejador de assinaturas"
			description="Cadastre assinaturas mensais (ex.: Coursera, streaming, SaaS). O total diário é uma média no ano (365 dias). Dados ficam só no seu dispositivo."
			icon={<Wallet className="size-6" strokeWidth={2} />}
			storage={financePlannerStorage}
		>
			<div className="flex flex-col lg:flex-row gap-2 sm:gap-3 w-full">
				<TotalsCard label="Diário" value={formatBrlFromCents(totals.dailyCents)} hint="média (365 dias)" />
				<TotalsCard label="Mensal" value={formatBrlFromCents(totals.monthlyCents)} hint="soma das assinaturas" />
				<TotalsCard label="Anual" value={formatBrlFromCents(totals.annualCents)} hint="mensal × 12" />
			</div>

			<div className="h-px w-full bg-gradient-to-r from-transparent via-[color:var(--card-border)]/70 to-transparent" />

			<section className="w-full">
				<div className="rounded-2xl border border-[color:var(--card-border)] bg-[color:var(--card-bg)] shadow-sm shadow-black/10 overflow-hidden">
					<div className="p-4 sm:p-5">
						<div className="flex flex-col gap-3">
							<div className="grid grid-cols-1 lg:grid-cols-[1fr_12rem] gap-3">
								<div className="flex flex-col gap-1.5 min-w-0">
									<span className="text-[10px] font-medium uppercase tracking-[0.14em] text-[color:var(--text)]/80">
										Assinatura
									</span>
									<input
										value={name}
										onChange={(e) => setName(e.target.value)}
										placeholder="Coursera, Spotify, iCloud…"
										className="w-full min-h-10 rounded-lg border border-[color:var(--card-border)] bg-[color:var(--background)] px-3 py-2 text-sm text-[color:var(--headline)] placeholder:text-[color:var(--text)]/70 focus:outline-none focus:ring-2 focus:ring-[color:var(--primary)] focus:border-[color:var(--primary)] transition-shadow"
									/>
								</div>

								<div className="flex flex-col gap-1.5">
									<span className="text-[10px] font-medium uppercase tracking-[0.14em] text-[color:var(--text)]/80">
										Valor mensal (R$)
									</span>
									<input
										value={monthly}
										onChange={(e) => setMonthly(e.target.value)}
										inputMode="decimal"
										placeholder="100,00"
										className="w-full min-h-10 rounded-lg border border-[color:var(--card-border)] bg-[color:var(--background)] px-3 py-2 text-sm text-[color:var(--headline)] placeholder:text-[color:var(--text)]/70 focus:outline-none focus:ring-2 focus:ring-[color:var(--primary)] focus:border-[color:var(--primary)] transition-shadow"
									/>
								</div>
							</div>

							<div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
								<div className="text-xs text-[color:var(--text)]/80">
									{monthly.trim() === ""
										? "Dica: aceita “100”, “100,50” ou “R$ 1.234,56”."
										: parsedMonthlyCents === null
											? "Valor inválido."
											: `Você está adicionando ${formatBrlFromCents(parsedMonthlyCents)} / mês.`}
								</div>
								<button
									type="button"
									disabled={!canAdd}
									onClick={() => {
										if (parsedMonthlyCents === null) return;
										addSubscriptionItem(name, parsedMonthlyCents);
										setName("");
										setMonthly("");
									}}
									className={[
										"inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-[opacity,transform,background,box-shadow]",
										canAdd
											? "bg-[color:var(--primary)] text-[color:var(--primary-text)] hover:opacity-90 shadow-sm shadow-black/20 active:scale-[0.99]"
											: "bg-[color:var(--card-border)]/40 text-[color:var(--text)]/60 cursor-not-allowed",
										"focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--background)]",
									].join(" ")}
								>
									<Plus className="size-4" strokeWidth={2.5} />
									Adicionar
								</button>
							</div>
						</div>
					</div>

					<div className="border-t border-[color:var(--card-border)]">
						{items.length === 0 ? (
							<div className="p-6 text-sm text-[color:var(--text)]">
								Nenhuma assinatura ainda. Adicione a primeira acima.
							</div>
						) : (
							<ul className="p-2 sm:p-3 flex flex-col gap-2 list-none m-0">
								{items.map((it) => (
									<li
										key={it.id}
										className="rounded-xl border border-[color:var(--card-border)] bg-[color:var(--background)]/40"
									>
										<div className="flex items-center justify-between gap-3 p-3">
											<div className="min-w-0 flex flex-col">
												<div className="text-sm font-medium text-[color:var(--headline)] truncate">{it.name}</div>
												<div className="text-xs text-[color:var(--text)]/80 tabular-nums">
													{formatBrlFromCents(it.monthlyCents)} / mês
												</div>
											</div>
											<button
												type="button"
												onClick={() => removeSubscriptionItem(it.id)}
												className="shrink-0 rounded-lg p-2 text-[color:var(--text)]/70 hover:text-[color:var(--headline)] hover:bg-[color:var(--primary)]/15 transition-[background,color] focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--primary)]"
												aria-label={`Remover ${it.name}`}
											>
												<Trash2 className="size-4" />
											</button>
										</div>
									</li>
								))}
							</ul>
						)}
					</div>
				</div>

				{items.length > 0 && (
					<div className="mt-3 flex justify-end">
						<button
							type="button"
							onClick={() => clearAllSubscriptionItems()}
							className="text-xs text-[color:var(--text)]/80 hover:text-[color:var(--headline)] px-2 py-1 rounded-md hover:bg-[color:var(--primary)]/15 transition-colors"
						>
							Limpar tudo
						</button>
					</div>
				)}
			</section>
		</ToolShell>
	);
}
