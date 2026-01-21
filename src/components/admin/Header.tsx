import { LogOut } from "lucide-preact";

export default function HeaderAdmin() {
	return (
		<header className="bg-zinc-900/80 border-b border-zinc-800 h-14 flex items-center px-6 justify-between sticky top-0 z-50 backdrop-blur-md">
			<div className="flex items-center gap-3">
				<div className="w-3 h-3 bg-red-500 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div>
				<span className="font-mono font-bold text-zinc-100 tracking-tight">andre_OS</span>
				<span className="text-xs bg-red-950 text-red-400 border border-red-900 px-2 py-0.5 rounded font-mono">
					ADMIN
				</span>
			</div>
			<a
				href={"/admin?action=logout"}
				className="flex items-center gap-2 text-sm font-mono text-zinc-500 hover:text-white transition-colors"
			>
				<LogOut size={15} /> Logout
			</a>
		</header>
	);
}
