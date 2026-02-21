export default function Badge({ text, colorClass }: { text: string; colorClass: string }) {
	return (
		<span className={`px-2 py-0.5 text-[10px] font-mono border rounded-sm uppercase tracking-wider ${colorClass}`}>
			{text}
		</span>
	);
}
