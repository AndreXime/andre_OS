import { useStore } from "@nanostores/react";
import { Plus, Trash2, Wallet } from "lucide-react";
import { useMemo, useState } from "react";
import { toolBtnPrimaryClass, toolInputClass, toolLabelClass, toolPanelClass, toolStatCardClass } from "@/lib/toolUi";
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
		<div className={toolStatCardClass}>
			<div className={toolLabelClass}>{label}</div>
			<div className="text-2xl font-bold tabular-nums text-ink">{value}</div>
			{hint && <div className="mt-0.5 text-xs leading-snug text-muted">{hint}</div>}
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

			<div className="h-px w-full bg-rule" />

			<section className="w-full">
				<div className={`${toolPanelClass} overflow-hidden`}>
					<div className="p-md">
						<div className="flex flex-col gap-sm">
							<div className="grid grid-cols-1 gap-sm lg:grid-cols-[1fr_12rem]">
								<div className="flex min-w-0 flex-col gap-1.5">
									<span className={toolLabelClass}>Assinatura</span>
									<input
										value={name}
										onChange={(e) => setName(e.target.value)}
										placeholder="Coursera, Spotify, iCloud…"
										className={toolInputClass}
									/>
								</div>

								<div className="flex flex-col gap-1.5">
									<span className={toolLabelClass}>Valor mensal (R$)</span>
									<input
										value={monthly}
										onChange={(e) => setMonthly(e.target.value)}
										inputMode="decimal"
										placeholder="100,00"
										className={toolInputClass}
									/>
								</div>
							</div>

							<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
								<div className="text-xs text-muted">
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
									className={`inline-flex w-full items-center justify-center gap-2 sm:w-auto ${toolBtnPrimaryClass}`}
								>
									<Plus className="size-4" strokeWidth={2.5} />
									Adicionar
								</button>
							</div>
						</div>
					</div>

					<div className="border-t border-rule">
						{items.length === 0 ? (
							<div className="p-6 text-sm text-muted">Nenhuma assinatura ainda. Adicione a primeira acima.</div>
						) : (
							<ul className="p-2 sm:p-3 flex flex-col gap-2 list-none m-0">
								{items.map((it) => (
									<li key={it.id} className="rounded-card border border-rule bg-paper/40">
										<div className="flex items-center justify-between gap-3 p-3">
											<div className="min-w-0 flex flex-col">
												<div className="text-sm font-medium text-ink truncate">{it.name}</div>
												<div className="text-xs text-muted/80 tabular-nums">
													{formatBrlFromCents(it.monthlyCents)} / mês
												</div>
											</div>
											<button
												type="button"
												onClick={() => removeSubscriptionItem(it.id)}
												className="shrink-0 rounded-lg p-2 text-muted/70 hover:text-ink hover:bg-accent/15 transition-[background,color] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
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
							className="text-xs text-muted/80 hover:text-ink px-2 py-1 rounded-md hover:bg-accent/15 transition-colors"
						>
							Limpar tudo
						</button>
					</div>
				)}
			</section>
		</ToolShell>
	);
}
