const fieldLabelClass = "text-[10px] font-bold uppercase tracking-[0.14em] text-[color:var(--text)]";

const inputClass =
	"w-full min-h-10 rounded-lg border border-[color:var(--card-border)] bg-[color:var(--card-bg)] px-3 py-2 text-sm text-[color:var(--headline)] placeholder:text-[color:var(--text)]/70 shadow-inner shadow-black/5 focus:outline-none focus:ring-2 focus:ring-[color:var(--primary)] focus:border-[color:var(--primary)] transition-shadow";

export function InputField({
	id,
	label,
	value,
	onChange,
	suffix,
	min,
	max,
	step,
}: {
	id: string;
	label: string;
	value: number;
	onChange: (value: number) => void;
	suffix?: string;
	min?: number;
	max?: number;
	step?: number;
}) {
	return (
		<div className="flex flex-col gap-1.5 min-w-0">
			<label htmlFor={id} className={fieldLabelClass}>
				{label}
			</label>
			<div className="relative">
				<input
					id={id}
					type="number"
					value={value}
					min={min}
					max={max}
					step={step}
					onChange={(e) => {
						const parsed = Number(e.currentTarget.value);
						onChange(Number.isFinite(parsed) ? parsed : 0);
					}}
					className={inputClass}
				/>
				{suffix && (
					<span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-[color:var(--text)]/70">
						{suffix}
					</span>
				)}
			</div>
		</div>
	);
}

export function ResultCard({
	label,
	value,
	hint,
	highlight,
}: {
	label: string;
	value: string;
	hint?: string;
	highlight?: boolean;
}) {
	return (
		<div
			className={[
				"rounded-xl border px-4 py-3 flex flex-col gap-0.5 min-w-0",
				highlight
					? "border-[color:var(--primary)]/35 bg-[color-mix(in_srgb,var(--primary)_10%,var(--card-bg))]"
					: "border-[color:var(--card-border)] bg-[color:var(--card-bg)]",
			].join(" ")}
		>
			<span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[color:var(--text)]/80">{label}</span>
			<span className="text-xl sm:text-2xl font-bold tabular-nums text-[color:var(--card-text)]">{value}</span>
			{hint && <span className="text-[11px] text-[color:var(--text)]/75 leading-snug">{hint}</span>}
		</div>
	);
}
