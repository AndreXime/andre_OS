import { useMemo, useState } from "react";
import {
	ArrowRight,
	CalendarDays,
	CalendarRange,
	Check,
	ChevronDown,
	ChevronUp,
	Clock3,
	LayoutList,
	Plus,
	Timer,
	Trash2,
} from "lucide-react";
import {
	addWeekBlockToAllDays,
	moveWeekBlock,
	removeWeekBlock,
	saveWeekBlock,
	updateWeekBlock,
	WEEK_DAY_LABEL,
	WEEK_DAY_ORDER,
	type WeekDayId,
	type WeekPlan,
	type WeekTimeBlock,
} from "./store";
import {
	type DayTheme,
	DAY_THEME,
	blockSpanMinutes,
	canSaveBlockFields,
	formatDuration,
	hasTime,
	isTimeRangeOk,
} from "./plannerDomain";

function TimeField({
	value,
	onChange,
	label,
	optional,
	className,
}: {
	readonly value: string;
	readonly onChange: (v: string) => void;
	readonly label: string;
	readonly optional?: boolean;
	readonly className?: string;
}) {
	return (
		<div className={["group/field flex flex-col gap-1.5 min-w-0", className].filter(Boolean).join(" ")}>
			<div className="flex items-end justify-between gap-1 min-h-[0.875rem]">
				<span className="text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-500 group-focus-within/field:text-zinc-400 transition-colors">
					{label}
					{optional && <span className="text-zinc-600 font-normal normal-case"> (opcional)</span>}
				</span>
				{optional && hasTime(value) && (
					<button type="button" onClick={() => onChange("")} className="text-[10px] text-zinc-500 hover:text-zinc-300">
						Limpar
					</button>
				)}
			</div>
			<div className="relative rounded-lg border border-zinc-800/90 bg-zinc-950/80 shadow-inner shadow-black/20 transition-[border,box-shadow] group-focus-within/field:border-emerald-500/40 group-focus-within/field:ring-2 group-focus-within/field:ring-emerald-500/20">
				<Clock3 className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-zinc-600 group-focus-within/field:text-emerald-500/60" />
				<input
					type="time"
					value={value}
					onChange={(e) => onChange(e.target.value)}
					className="w-full min-h-[2.5rem] rounded-lg bg-transparent pl-9 pr-2 py-2 text-sm font-medium text-zinc-100 tabular-nums tracking-tight [color-scheme:dark] focus:outline-none"
				/>
			</div>
		</div>
	);
}

function SavedBlockBody({
	block,
	day,
	theme,
	span,
	timeRangeOk,
}: {
	readonly block: WeekTimeBlock;
	readonly day: WeekDayId;
	readonly theme: DayTheme;
	readonly span: number;
	readonly timeRangeOk: boolean;
}) {
	const hs = hasTime(block.start);
	const he = hasTime(block.end);
	return (
		<div className="flex items-start justify-between gap-2">
			<div className="flex flex-col gap-1 min-w-0">
				<div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-sm">
					{block.groupId && (
						<span
							className={[
								"inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-semibold tracking-wide uppercase",
								theme.chip,
							].join(" ")}
						>
							Semana
						</span>
					)}
					{hs && he && (
						<>
							<time dateTime={`${block.start}/${block.end}`} className="font-medium tabular-nums text-zinc-100">
								{block.start}
							</time>
							<ArrowRight className="size-3.5 text-zinc-600 shrink-0 self-center" aria-hidden />
							<time className="font-medium tabular-nums text-zinc-200">{block.end}</time>
						</>
					)}
					{hs && !he && (
						<span className="text-zinc-200">
							<span className="text-zinc-500 text-xs font-normal mr-1.5">De</span>
							<time className="font-medium tabular-nums">{block.start}</time>
						</span>
					)}
					{!hs && he && (
						<span className="text-zinc-200">
							<span className="text-zinc-500 text-xs font-normal mr-1.5">Até</span>
							<time className="font-medium tabular-nums">{block.end}</time>
						</span>
					)}
					{!hs && !he && <span className="text-zinc-500">Sem horário</span>}
					{timeRangeOk && span > 0 && (
						<span
							className={[
								"inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-semibold tracking-wide uppercase",
								theme.chip,
							].join(" ")}
						>
							{formatDuration(span)}
						</span>
					)}
				</div>
				{block.title.trim() !== "" && <p className="text-sm text-zinc-300/95 leading-snug">{block.title}</p>}
				{!timeRangeOk && (
					<p className="text-xs text-amber-400/90 flex items-center gap-1">
						<span className="size-1 rounded-full bg-amber-400" />
						Intervalo inválido; apague e crie outro.
					</p>
				)}
			</div>
			<button
				type="button"
				onClick={() => removeWeekBlock(day, block.id)}
				className="shrink-0 rounded-lg p-2 text-zinc-500 hover:text-rose-300 hover:bg-rose-500/10 opacity-70 group-hover/day:opacity-100 transition-[opacity,background,color] focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/50"
				aria-label="Apagar bloco"
			>
				<Trash2 className="size-4" />
			</button>
		</div>
	);
}

function DraftBlockBody({
	block,
	day,
	canSave,
	timeRangeBad,
	span,
}: {
	readonly block: WeekTimeBlock;
	readonly day: WeekDayId;
	readonly canSave: boolean;
	readonly timeRangeBad: boolean;
	readonly span: number;
}) {
	return (
		<div className="flex flex-col gap-3 w-full">
			<div className="flex items-center justify-between gap-2">
				<div className="flex items-center gap-2 flex-wrap">
					<span className="text-[10px] font-semibold uppercase tracking-widest text-amber-500/70">A definir</span>
					{block.groupId && (
						<span className="text-[10px] font-semibold tracking-wide uppercase rounded-md border border-emerald-500/25 bg-emerald-500/10 px-1.5 py-0.5 text-emerald-400/90">
							Toda a semana
						</span>
					)}
				</div>
				<button
					type="button"
					onClick={() => removeWeekBlock(day, block.id)}
					className="shrink-0 text-xs text-zinc-500 hover:text-rose-300 px-1.5 py-0.5 rounded-md hover:bg-rose-500/10 transition-colors"
				>
					Descartar
				</button>
			</div>
			<p className="text-xs text-zinc-600 leading-relaxed -mt-1">
				Início, fim e título: escolhe o que precisar (basta preencher uma coisa, ou só horas, etc.).
			</p>
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
				<TimeField
					label="Início"
					optional
					value={block.start}
					onChange={(v) => updateWeekBlock(day, block.id, { start: v })}
				/>
				<TimeField
					label="Fim"
					optional
					value={block.end}
					onChange={(v) => updateWeekBlock(day, block.id, { end: v })}
				/>
			</div>
			<div className="flex flex-col gap-1.5">
				<span className="text-[10px] font-medium uppercase tracking-[0.12em] text-zinc-500">
					O quê? <span className="text-zinc-600 font-normal">(opcional)</span>
				</span>
				<div className="relative">
					<LayoutList className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-zinc-600" />
					<input
						type="text"
						placeholder="Reunião, deep work, treino, estudo…"
						value={block.title}
						onChange={(e) => updateWeekBlock(day, block.id, { title: e.target.value })}
						className="w-full min-h-10 rounded-lg border border-zinc-800/80 bg-zinc-900/40 pl-9 pr-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/35 transition-shadow"
					/>
				</div>
			</div>
			{timeRangeBad && (
				<p className="text-xs text-amber-400/90 flex items-center gap-1">
					<span className="size-1 rounded-full bg-amber-400" />
					Com início e fim preenchidos, a hora de fim tem de ser depois do início.
				</p>
			)}
			{!timeRangeBad && !canSave && (
				<p className="text-xs text-amber-400/90 flex items-center gap-1">
					<span className="size-1 rounded-full bg-amber-400" />
					Indique pelo menos início, fim ou a atividade.
				</p>
			)}
			{canSave && span > 0 && (
				<p className="text-xs text-zinc-500">
					Pré-visualização: <span className="text-zinc-300 tabular-nums">{formatDuration(span)}</span>
				</p>
			)}
			<button
				type="button"
				disabled={!canSave}
				onClick={() => saveWeekBlock(day, block.id)}
				className={[
					"inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-[opacity,transform,background,box-shadow]",
					canSave
						? "bg-emerald-600 text-white hover:bg-emerald-500 shadow-sm shadow-emerald-950/40 active:scale-[0.99]"
						: "bg-zinc-800 text-zinc-500 cursor-not-allowed",
					"focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950",
				].join(" ")}
			>
				<Check className="size-4" strokeWidth={2.5} />
				Guardar bloco
			</button>
		</div>
	);
}

function Background() {
	return (
		<div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden>
			<div className="absolute -top-40 left-1/2 h-[480px] w-[min(1200px,100%)] -translate-x-1/2 rounded-full bg-emerald-500/6 blur-3xl" />
			<div className="absolute top-[20%] -right-32 h-72 w-72 rounded-full bg-violet-500/4 blur-3xl" />
			<div className="absolute top-[40%] -left-24 h-64 w-64 rounded-full bg-sky-500/3 blur-3xl" />
			<div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent,transparent),linear-gradient(90deg,rgba(24,24,27,0.2)_0.5px,transparent_0.5px),linear-gradient(180deg,rgba(24,24,27,0.2)_0.5px,transparent_0.5px)] bg-[size:12px_12px] [mask-image:radial-gradient(ellipse_at_center_20%,#000,transparent_75%)]" />
		</div>
	);
}

function Header({ totalBlocks, hoursLabel }: { readonly totalBlocks: number; readonly hoursLabel: string }) {
	return (
		<div className="w-full max-w-[1680px] mx-auto px-4 pt-6 pb-3 md:px-8 md:pt-8 md:pb-4">
			<header className="flex flex-col gap-5 lg:gap-6">
				<div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
					<div className="flex flex-col gap-2 max-w-xl">
						<h1 className="text-3xl sm:text-4xl font-bold text-zinc-50 tracking-tight [text-shadow:0_0_40px_rgba(16,185,129,0.08)]">
							Planejador de semana
						</h1>
						<p className="text-sm sm:text-[15px] text-zinc-500 leading-relaxed">
							Adicione um bloco uma vez: o mesmo rascunho aparece em todos os dias. Editar ou guardar noutro dia mantém
							tudo alinhado. Dados só no seu dispositivo.
						</p>
						<button
							type="button"
							onClick={() => addWeekBlockToAllDays()}
							className="w-full sm:w-auto mt-1 flex items-center justify-center gap-2 rounded-xl border border-zinc-700/80 bg-zinc-800/50 px-3.5 py-2 text-sm font-medium text-zinc-200 hover:border-emerald-500/45 hover:bg-emerald-500/10 hover:text-emerald-200 transition-[border,background,color] focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
						>
							<CalendarDays className="size-4 text-emerald-500/80" strokeWidth={2.25} />
							Adicionar bloco à semana
						</button>
					</div>
					<div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
						<div className="flex-1 min-w-0 sm:flex-initial sm:min-w-[8.5rem] flex flex-col justify-center rounded-2xl border border-zinc-800/80 bg-zinc-900/40 px-4 py-3 shadow-inner shadow-black/20">
							<div className="text-[10px] font-semibold uppercase tracking-[0.15em] text-zinc-500">Blocos</div>
							<div className="text-2xl font-bold tabular-nums text-zinc-100 flex items-baseline gap-1">
								{totalBlocks}
								<span className="text-sm font-medium text-zinc-600">/ semana</span>
							</div>
						</div>
						<div className="flex-1 min-w-0 sm:flex-initial sm:min-w-[8.5rem] flex flex-col justify-center rounded-2xl border border-zinc-800/80 bg-zinc-900/40 px-4 py-3 shadow-inner shadow-black/20">
							<div className="text-[10px] font-semibold uppercase tracking-[0.15em] text-zinc-500">Carga</div>
							<div
								className="text-2xl font-bold tabular-nums text-zinc-100"
								title="Soma da duração de blocos em que a hora de fim é depois do início"
							>
								{totalBlocks === 0 ? "—" : hoursLabel}
							</div>
						</div>
					</div>
				</div>
			</header>
		</div>
	);
}

function DaySection({
	day,
	blocks,
	theme,
}: {
	readonly day: WeekDayId;
	readonly blocks: readonly WeekTimeBlock[];
	readonly theme: DayTheme;
}) {
	const [hovered, setHovered] = useState<string | null>(null);
	const hasBlocks = blocks.length > 0;
	const dayTotalMins = useMemo(
		() => blocks.filter((b) => b.saved).reduce((acc, b) => acc + blockSpanMinutes(b.start, b.end), 0),
		[blocks],
	);

	return (
		<section id={`week-day-${day}`} aria-labelledby={`week-day-heading-${day}`} className="scroll-mt-28">
			<article
				className={[
					"group/day relative overflow-hidden rounded-2xl border backdrop-blur-sm transition-[box-shadow,transform] duration-300",
					"motion-reduce:transition-none",
					"bg-gradient-to-b from-zinc-900/90 to-zinc-950/80",
					"shadow-[0_1px_0_rgba(255,255,255,0.04)] hover:shadow-[0_8px_40px_-12px_rgba(0,0,0,0.55)]",
					theme.border,
					hasBlocks ? "min-h-0" : "min-h-[8.5rem]",
				]
					.filter(Boolean)
					.join(" ")}
			>
				<div aria-hidden className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r ${theme.topGradient}`} />
				<div className="relative p-1">
					<div className="px-3 pt-3 pb-2">
						<div className="flex flex-col gap-0.5 min-w-0">
							<div className="flex items-center gap-2 flex-wrap">
								<h2 id={`week-day-heading-${day}`} className="text-base font-semibold text-zinc-100 tracking-tight">
									{WEEK_DAY_LABEL[day]}
								</h2>
								{hasBlocks && (
									<span
										className={[
											"inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium tabular-nums",
											theme.chip,
										].join(" ")}
									>
										<Timer className="size-3 opacity-80" />
										{dayTotalMins > 0 ? formatDuration(dayTotalMins) : "—"}
									</span>
								)}
							</div>
							<p className="text-xs text-zinc-500">
								{hasBlocks
									? `${blocks.length} ${blocks.length === 1 ? "bloco" : "blocos"} planejado${blocks.length === 1 ? "" : "s"}`
									: "Use o botão no topo da página para adicionar blocos a todos os dias de uma vez."}
							</p>
						</div>
					</div>

					<div className="px-3 pb-3 flex flex-col gap-2.5">
						{!hasBlocks ? (
							<button
								type="button"
								onClick={() => addWeekBlockToAllDays()}
								className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-zinc-800/90 bg-zinc-950/40 py-7 px-4 text-center transition-all hover:border-emerald-500/30 hover:bg-emerald-500/[0.04] group/empty"
							>
								<div className="flex size-11 items-center justify-center rounded-2xl bg-zinc-900/80 text-zinc-500 ring-1 ring-zinc-800 group-hover/empty:ring-emerald-500/25 group-hover/empty:text-emerald-400/90 transition-all">
									<CalendarRange className="size-5" />
								</div>
								<div>
									<p className="text-sm font-medium text-zinc-300">Nada neste dia ainda</p>
									<p className="text-xs text-zinc-600 mt-0.5 max-w-[16rem] mx-auto leading-relaxed">
										Blocos são adicionados à semana inteira. Toque abaixo ou use o botão no topo.
									</p>
								</div>
								<span className="mt-0.5 inline-flex items-center gap-1.5 text-xs font-medium text-emerald-500/80 group-hover/empty:text-emerald-400">
									<Plus className="size-3.5" />
									Adicionar bloco à semana
								</span>
							</button>
						) : (
							<ul className="flex flex-col gap-2.5 list-none p-0 m-0">
								{blocks.map((block, index) => {
									const timeRangeOk = isTimeRangeOk(block.start, block.end);
									const span = blockSpanMinutes(block.start, block.end);
									const canSave = canSaveBlockFields(block.start, block.end, block.title);
									const timeRangeBad =
										hasTime(block.start) && hasTime(block.end) && !isTimeRangeOk(block.start, block.end);
									const isHovered = hovered === block.id;
									const canReorder = blocks.length > 1;
									return (
										<li
											key={block.id}
											onMouseEnter={() => setHovered(block.id)}
											onMouseLeave={() => setHovered(null)}
											className="relative"
										>
											<div
												className={[
													"relative flex gap-0 overflow-hidden rounded-xl border border-zinc-800/80 bg-zinc-950/60",
													"shadow-sm shadow-black/30 transition-[box-shadow,transform] duration-200",
													"motion-reduce:transition-none",
													isHovered ? "ring-1 ring-inset ring-white/5" : "",
													!block.saved ? "border-amber-500/20" : "",
												].join(" ")}
											>
												<div aria-hidden className={`w-1 shrink-0 bg-gradient-to-b ${theme.bar}`} />
												{canReorder && (
													<div className="flex flex-col border-r border-zinc-800/60 bg-zinc-900/20 shrink-0">
														<button
															type="button"
															disabled={index === 0}
															onClick={() => moveWeekBlock(day, block.id, -1)}
															className="flex-1 p-1.5 text-zinc-500 enabled:hover:text-zinc-200 enabled:hover:bg-zinc-800/80 disabled:opacity-25 disabled:cursor-not-allowed transition-colors"
															aria-label="Mover para cima"
														>
															<ChevronUp className="size-4" />
														</button>
														<div className="h-px bg-zinc-800/80 shrink-0" aria-hidden />
														<button
															type="button"
															disabled={index === blocks.length - 1}
															onClick={() => moveWeekBlock(day, block.id, 1)}
															className="flex-1 p-1.5 text-zinc-500 enabled:hover:text-zinc-200 enabled:hover:bg-zinc-800/80 disabled:opacity-25 disabled:cursor-not-allowed transition-colors"
															aria-label="Mover para baixo"
														>
															<ChevronDown className="size-4" />
														</button>
													</div>
												)}
												<div className="min-w-0 flex-1 p-3.5 pl-3 flex flex-col gap-3">
													{block.saved ? (
														<SavedBlockBody
															block={block}
															day={day}
															theme={theme}
															span={span}
															timeRangeOk={timeRangeOk}
														/>
													) : (
														<DraftBlockBody
															block={block}
															day={day}
															canSave={canSave}
															timeRangeBad={timeRangeBad}
															span={span}
														/>
													)}
												</div>
											</div>
										</li>
									);
								})}
							</ul>
						)}
					</div>
				</div>
			</article>
		</section>
	);
}

export function WeekPlannerView({
	plan,
	totalBlocks,
	hoursLabel,
}: {
	plan: WeekPlan;
	totalBlocks: number;
	hoursLabel: string;
}) {
	return (
		<div className="w-full min-h-dvh max-w-[1680px] mx-auto flex flex-col">
			<Background />
			<Header totalBlocks={totalBlocks} hoursLabel={hoursLabel} />
			<main className="w-full max-w-[1680px] mx-auto px-4 pb-12 md:px-8 flex flex-col gap-4">
				<div className="h-px w-full max-w-2xl bg-gradient-to-r from-transparent via-zinc-700/40 to-transparent mb-1" />
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-4 xl:grid-cols-3 2xl:grid-cols-3 min-[1920px]:grid-cols-4">
					{WEEK_DAY_ORDER.map((day) => (
						<DaySection key={day} day={day} blocks={plan[day]} theme={DAY_THEME[day]} />
					))}
				</div>
			</main>
		</div>
	);
}
