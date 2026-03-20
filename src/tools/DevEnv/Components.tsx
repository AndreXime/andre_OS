import { Terminal } from "lucide-react";
import { useState, useEffect, type ReactNode } from "react";

export function Typewriter({ text, delay = 30 }: { text: string; delay?: number }) {
	const [currentText, setCurrentText] = useState("");
	const [currentIndex, setCurrentIndex] = useState(0);

	useEffect(() => {
		if (currentIndex < text.length) {
			const timeout = setTimeout(() => {
				setCurrentText((prev) => prev + text[currentIndex]);
				setCurrentIndex((prev) => prev + 1);
			}, delay);
			return () => clearTimeout(timeout);
		}
	}, [currentIndex, delay, text]);

	return <span>{currentText}</span>;
}

export function Pane({ title, children, className = "" }: { title: string; children: ReactNode; className?: string }) {
	return (
		<div className={`border border-[#1f521f] bg-[#0a0a0a] flex flex-col h-full ${className}`}>
			<div className="bg-[#1f521f] text-[#0a0a0a] px-2 py-0.5 text-xs font-bold flex justify-between items-center">
				<span>{`+--- ${title} ---+`}</span>
				<div className="flex gap-1">
					<div className="w-2 h-2 bg-[#0a0a0a]"></div>
					<div className="w-2 h-2 bg-[#0a0a0a]"></div>
				</div>
			</div>
			<div className="p-4 flex-1 overflow-hidden">{children}</div>
		</div>
	);
}

export function Footer() {
	return (
		<footer className="fixed bottom-0 left-0 w-full z-50 border-t border-[#1f521f] bg-[#0a0a0a] flex items-stretch text-[10px] font-bold h-6 select-none">
			<div className="bg-[#33ff00] text-[#0a0a0a] px-3 flex items-center gap-2">
				<Terminal size={12} />
				<span>NORMAL</span>
			</div>
			<div className="bg-[#1f521f] text-[#33ff00] px-4 flex items-center skew-x-[-20deg] -ml-2">
				<span className="skew-x-[20deg]">main*</span>
			</div>
			<div className="flex-1 flex items-center px-4 overflow-hidden italic opacity-50">~/workspace/setup.sh</div>
			<div className="hidden md:flex items-center gap-4 px-4 bg-[#0a0a0a] border-l border-[#1f521f]">
				<span className="text-[#ffb000]">UTF-8</span>
				<span className="text-[#33ff00]">LN: 120, COL: 42</span>
				<div className="flex items-center gap-1">
					<div className="w-2 h-2 rounded-full bg-[#33ff00] animate-pulse"></div>
					<span>CONNECTED</span>
				</div>
			</div>
			<div className="bg-[#1f521f] text-[#0a0a0a] px-4 flex items-center">
				{new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
			</div>
		</footer>
	);
}
