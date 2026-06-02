import { useMemo, useState, type ReactNode } from "react";
import { ToolShell } from "../ToolShell";
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
				<span className="text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--text)] group-focus-within/field:opacity-100 transition-colors">
					{label}
					{optional && <span className="text-[var(--text)]/75 font-normal normal-case"> (opcional)</span>}
				</span>
				{optional && hasTime(value) && (
					<button
						type="button"
						onClick={() => onChange("")}
						className="text-[10px] text-[var(--text)] hover:text-[var(--headline)]"
					>
						Limpar
					</button>
				)}
			</div>
			<div className="relative rounded-lg border border-[var(--card-border)]/90 bg-[var(--card-bg)]/80 shadow-inner shadow-[color-mix(in_srgb,var(--background)_50%,#000)]/20 transition-[border,box-shadow] group-focus-within/field:border-[var(--primary)]/40 group-focus-within/field:ring-2 group-focus-within/field:ring-[var(--primary)]/20">
				<Clock3 className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-[var(--text)]/80 group-focus-within/field:text-[var(--primary)]/70" />
				<input
					type="time"
					value={value}
					onChange={(e) => onChange(e.target.value)}
					className="w-full min-h-[2.5rem] rounded-lg bg-transparent pl-9 pr-2 py-2 text-sm font-medium text-[var(--headline)] tabular-nums tracking-tight [color-scheme:dark] focus:outline-none"
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
							<time
								dateTime={`${block.start}/${block.end}`}
								className="font-medium tabular-nums text-[var(--headline)]"
							>
								{block.start}
							</time>
							<ArrowRight className="size-3.5 text-[var(--text)]/80 shrink-0 self-center" aria-hidden />
							<time className="font-medium tabular-nums text-[var(--card-text)]">{block.end}</time>
						</>
					)}
					{hs && !he && (
						<span className="text-[var(--card-text)]">
							<span className="text-[var(--text)] text-xs font-normal mr-1.5">De</span>
							<time className="font-medium tabular-nums">{block.start}</time>
						</span>
					)}
					{!hs && he && (
						<span className="text-[var(--card-text)]">
							<span className="text-[var(--text)] text-xs font-normal mr-1.5">Até</span>
							<time className="font-medium tabular-nums">{block.end}</time>
						</span>
					)}
					{!hs && !he && <span className="text-[var(--text)]">Sem horário</span>}
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
				{block.title.trim() !== "" && <p className="text-sm text-[var(--card-text)] leading-snug">{block.title}</p>}
				{!timeRangeOk && (
					<p className="text-xs text-[var(--primary)] flex items-center gap-1">
						<span className="size-1 rounded-full bg-[var(--primary)]" />
						Intervalo inválido; apague e crie outro.
					</p>
				)}
			</div>
			<button
				type="button"
				onClick={() => removeWeekBlock(day, block.id)}
				className="shrink-0 rounded-lg p-2 text-[var(--text)] hover:text-[var(--primary)] hover:bg-[color-mix(in_srgb,var(--primary)_12%,transparent)] opacity-70 group-hover/day:opacity-100 transition-[opacity,background,color] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]/40"
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
					<span className="text-[10px] font-semibold uppercase tracking-widest text-[var(--primary)]/80">
						A definir
					</span>
					{block.groupId && (
						<span className="text-[10px] font-semibold tracking-wide uppercase rounded-md border border-[var(--primary)]/25 bg-[color-mix(in_srgb,var(--primary)_10%,transparent)] px-1.5 py-0.5 text-[var(--primary)]/95">
							Toda a semana
						</span>
					)}
				</div>
				<button
					type="button"
					onClick={() => removeWeekBlock(day, block.id)}
					className="shrink-0 text-xs text-[var(--text)] hover:text-[var(--primary)] px-1.5 py-0.5 rounded-md hover:bg-[color-mix(in_srgb,var(--primary)_10%,transparent)] transition-colors"
				>
					Descartar
				</button>
			</div>
			<p className="text-xs text-[var(--text)]/90 leading-relaxed -mt-1">
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
				<span className="text-[10px] font-medium uppercase tracking-[0.12em] text-[var(--text)]">
					O quê? <span className="text-[var(--text)]/75 font-normal">(opcional)</span>
				</span>
				<div className="relative">
					<LayoutList className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-[var(--text)]/80" />
					<input
						type="text"
						placeholder="Reunião, deep work, treino, estudo…"
						value={block.title}
						onChange={(e) => updateWeekBlock(day, block.id, { title: e.target.value })}
						className="w-full min-h-10 rounded-lg border border-[var(--card-border)]/80 bg-[color-mix(in_srgb,var(--card-bg)_60%,var(--background))] pl-9 pr-3 py-2 text-sm text-[var(--headline)] placeholder:text-[var(--text)]/70 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)]/40 transition-shadow"
					/>
				</div>
			</div>
			{timeRangeBad && (
				<p className="text-xs text-[var(--primary)] flex items-center gap-1">
					<span className="size-1 rounded-full bg-[var(--primary)]" />
					Com início e fim preenchidos, a hora de fim tem de ser depois do início.
				</p>
			)}
			{!timeRangeBad && !canSave && (
				<p className="text-xs text-[var(--primary)] flex items-center gap-1">
					<span className="size-1 rounded-full bg-[var(--primary)]" />
					Indique pelo menos início, fim ou a atividade.
				</p>
			)}
			{canSave && span > 0 && (
				<p className="text-xs text-[var(--text)]">
					Pré-visualização: <span className="text-[var(--card-text)] tabular-nums">{formatDuration(span)}</span>
				</p>
			)}
			<button
				type="button"
				disabled={!canSave}
				onClick={() => saveWeekBlock(day, block.id)}
				className={[
					"inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-[opacity,transform,background,box-shadow]",
					canSave
						? "bg-[var(--primary)] text-[var(--primary-text)] hover:brightness-110 shadow-sm shadow-[color-mix(in_srgb,var(--background)_50%,#000)]/40 active:scale-[0.99]"
						: "bg-[var(--card-bg)] text-[var(--text)]/60 cursor-not-allowed",
					"focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]",
				].join(" ")}
			>
				<Check className="size-4" strokeWidth={2.5} />
				Guardar bloco
			</button>
		</div>
	);
}

function WeekStatCard({
	label,
	value,
	title,
}: {
	readonly label: string;
	readonly value: ReactNode;
	readonly title?: string;
}) {
	return (
		<div className="flex-1 min-w-0 sm:flex-initial sm:min-w-[8.5rem] flex flex-col justify-center rounded-2xl border border-[var(--card-border)]/80 bg-[color-mix(in_srgb,var(--card-bg)_40%,var(--background))] px-4 py-3 shadow-inner shadow-[color-mix(in_srgb,var(--background)_50%,#000)]/20">
			<div className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--text)]">{label}</div>
			<div className="text-2xl font-bold tabular-nums text-[var(--headline)]" title={title}>
				{value}
			</div>
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
		<section
			id={`week-day-${day}`}
			aria-labelledby={`week-day-heading-${day}`}
			className="scroll-mt-28 min-w-100 flex-[1_1_18rem] max-w-full"
		>
			<article
				className={[
					"group/day relative overflow-hidden rounded-2xl border backdrop-blur-sm transition-[box-shadow,transform] duration-300",
					"motion-reduce:transition-none",
					"bg-gradient-to-b from-[var(--card-bg)]/90 to-[color-mix(in_srgb,var(--background)_80%,#0000)]/95",
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
								<h2
									id={`week-day-heading-${day}`}
									className="text-base font-semibold text-[var(--headline)] tracking-tight"
								>
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
							<p className="text-xs text-[var(--text)]">
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
								className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-[var(--card-border)]/90 bg-[color-mix(in_srgb,var(--card-bg)_30%,var(--background))] py-7 px-4 text-center transition-all hover:border-[var(--primary)]/35 hover:bg-[color-mix(in_srgb,var(--primary)_4%,var(--background))] group/empty"
							>
								<div className="flex size-11 items-center justify-center rounded-2xl bg-[color-mix(in_srgb,var(--card-bg)_80%,#0000)] text-[var(--text)] ring-1 ring-[var(--card-border)] group-hover/empty:ring-[var(--primary)]/30 group-hover/empty:text-[var(--primary)]/95 transition-all">
									<CalendarRange className="size-5" />
								</div>
								<div>
									<p className="text-sm font-medium text-[var(--card-text)]">Nada neste dia ainda</p>
									<p className="text-xs text-[var(--text)]/90 mt-0.5 max-w-[16rem] mx-auto leading-relaxed">
										Blocos são adicionados à semana inteira. Toque abaixo ou use o botão no topo.
									</p>
								</div>
								<span className="mt-0.5 inline-flex items-center gap-1.5 text-xs font-medium text-[var(--primary)]/85 group-hover/empty:text-[var(--primary)]">
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
													"relative flex gap-0 overflow-hidden rounded-xl border border-[var(--card-border)]/80 bg-[color-mix(in_srgb,var(--card-bg)_50%,var(--background))]/90",
													"shadow-sm shadow-[color-mix(in_srgb,var(--background)_50%,#000)]/30 transition-[box-shadow,transform] duration-200",
													"motion-reduce:transition-none",
													isHovered ? "ring-1 ring-inset ring-[var(--headline)]/5" : "",
													!block.saved ? "border-[var(--primary)]/20" : "",
												].join(" ")}
											>
												<div aria-hidden className={`w-1 shrink-0 bg-gradient-to-b ${theme.bar}`} />
												{canReorder && (
													<div className="flex flex-col border-r border-[var(--card-border)]/60 bg-[color-mix(in_srgb,var(--card-bg)_20%,#0000)] shrink-0">
														<button
															type="button"
															disabled={index === 0}
															onClick={() => moveWeekBlock(day, block.id, -1)}
															className="flex-1 p-1.5 text-[var(--text)] enabled:hover:text-[var(--headline)] enabled:hover:bg-[color-mix(in_srgb,var(--card-bg)_70%,var(--background))] disabled:opacity-25 disabled:cursor-not-allowed transition-colors"
															aria-label="Mover para cima"
														>
															<ChevronUp className="size-4" />
														</button>
														<div className="h-px bg-[var(--card-border)]/80 shrink-0" aria-hidden />
														<button
															type="button"
															disabled={index === blocks.length - 1}
															onClick={() => moveWeekBlock(day, block.id, 1)}
															className="flex-1 p-1.5 text-[var(--text)] enabled:hover:text-[var(--headline)] enabled:hover:bg-[color-mix(in_srgb,var(--card-bg)_70%,var(--background))] disabled:opacity-25 disabled:cursor-not-allowed transition-colors"
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
		<ToolShell
			title="Planejador de semana"
			description="Adicione um bloco uma vez: o mesmo rascunho aparece em todos os dias. Editar ou guardar noutro dia mantém tudo alinhado. Dados só no seu dispositivo."
			icon={<CalendarRange className="size-6" strokeWidth={2} />}
		>
			<div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
				<button
					type="button"
					onClick={() => addWeekBlockToAllDays()}
					className="w-full lg:w-auto flex items-center justify-center gap-2 rounded-xl border border-[var(--card-border)]/90 bg-[color-mix(in_srgb,var(--card-bg)_50%,var(--background))] px-3.5 py-2 text-sm font-medium text-[var(--card-text)] hover:border-[var(--primary)]/45 hover:bg-[color-mix(in_srgb,var(--primary)_10%,var(--background))] hover:text-[var(--headline)] transition-[border,background,color] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] shrink-0"
				>
					<CalendarDays className="size-4 text-[var(--primary)]/85" strokeWidth={2.25} />
					Adicionar bloco à semana
				</button>
				<div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full lg:w-auto">
					<WeekStatCard
						label="Blocos"
						value={
							<span className="flex items-baseline gap-1">
								{totalBlocks}
								<span className="text-sm font-medium text-[var(--text)]/80">/ semana</span>
							</span>
						}
					/>
					<WeekStatCard
						label="Carga"
						value={totalBlocks === 0 ? "—" : hoursLabel}
						title="Soma da duração de blocos em que a hora de fim é depois do início"
					/>
				</div>
			</div>
			<div className="flex flex-wrap gap-4">
				{WEEK_DAY_ORDER.map((day) => (
					<DaySection key={day} day={day} blocks={plan[day]} theme={DAY_THEME[day]} />
				))}
			</div>
		</ToolShell>
	);
}
