import { toolInputClass, toolLabelClass, toolStatCardClass } from "@/lib/toolUi";

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
		<div className="flex min-w-0 flex-col gap-1.5">
			<label htmlFor={id} className={toolLabelClass}>
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
					className={toolInputClass}
				/>
				{suffix && (
					<span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted">
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
				toolStatCardClass,
				highlight ? "border-accent-muted bg-accent-bg" : "",
			].join(" ")}
		>
			<span className={toolLabelClass}>{label}</span>
			<span className="text-xl font-bold tabular-nums text-ink sm:text-2xl">{value}</span>
			{hint && <span className="text-xs leading-snug text-muted">{hint}</span>}
		</div>
	);
}
