import { formatDate, getDomain, getThemeClasses } from "@/lib/utils";
import { Code2, Cpu, ExternalLink, FileText, Terminal } from "lucide-react";
import type { Post } from "@/database/types";
import Badge from "./Bagde";

export default function PreviewCard({ post }: { post: Post }) {
	switch (post.type) {
		case "intro":
			return <CardIntro post={post} />;
		case "tool":
			return <CardTool post={post} />;
		case "link":
			return <CardLink post={post} />;
		default:
			return <CardNote post={post} />;
	}
}

function CardIntro({ post }: { post: Post }) {
	return (
		<div className="h-full p-6 bg-zinc-900 border border-zinc-700 flex flex-col justify-center rounded-md relative overflow-hidden">
			<div className="absolute top-0 right-0 p-4 opacity-5 text-zinc-100">
				<Cpu size={120} />
			</div>
			<h2 className="text-sm font-mono text-emerald-500 mb-2 flex items-center gap-2">
				<Terminal size={14} /> README.md
			</h2>
			<p className="text-lg font-bold text-zinc-200 leading-relaxed relative z-10">{post.title}</p>

			<p className="text-base font-medium text-zinc-200 leading-relaxed relative z-10">{post.description}</p>
		</div>
	);
}

function CardLink({ post }: { post: Post }) {
	const { badgeClass } = getThemeClasses(post.type);

	return (
		<div className="cursor-pointer h-full bg-zinc-900 border border-zinc-800 hover:border-violet-500/50 hover:bg-violet-900/5 transition-all duration-300 flex flex-col rounded-md overflow-hidden card-trigger">
			<div className="h-20 w-full bg-gradient-to-br from-violet-900/20 to-fuchsia-900/20 relative flex items-center justify-center border-b border-zinc-800 group-hover:border-violet-900/30 transition-colors">
				<span className="font-bold gap-1 text-xl text-white/10 tracking-widest uppercase group-hover:text-violet-500/20 transition-colors px-2">
					{getDomain(post.url || "")}
				</span>
			</div>
			<div className="p-4 flex flex-col flex-1 justify-between">
				<div>
					<h3 className="font-medium text-zinc-100 mb-1 group-hover:text-violet-100 transition-colors">{post.title}</h3>
					<p className="text-xs text-zinc-400 leading-relaxed">{post.description}</p>
				</div>
				<div className="mt-auto pt-4 flex flex-col gap-3 transition-colors">
					<div className="flex gap-2 flex-wrap">
						{post.tags.map((tag: string) => (
							<Badge key={tag} text={`#${tag}`} colorClass={badgeClass} />
						))}
					</div>
					<div className="w-full flex justify-center items-center gap-2 text-xs font-bold text-violet-400 bg-violet-950/30 hover:bg-violet-900 border border-violet-900/50 hover:border-violet-500/50 px-3 py-1.5 rounded transition-all uppercase tracking-wide">
						<ExternalLink size={12} /> Ver link
					</div>
				</div>
			</div>
		</div>
	);
}

function CardNote({ post }: { post: Post }) {
	const { badgeClass } = getThemeClasses(post.type);

	return (
		<div className="cursor-pointer h-full p-4 bg-zinc-900 border border-zinc-800 hover:border-blue-500/50 hover:bg-blue-900/5 transition-all duration-300 flex flex-col rounded-md relative overflow-hidden card-trigger">
			<div>
				<div className="flex items-center gap-2 mb-3">
					<span className="text-xs font-mono text-zinc-500">{post.date ? formatDate(post.date) : ""}</span>
				</div>
				<h3 className="text-lg font-medium text-zinc-100 mb-2 leading-tight group-hover:text-blue-100 transition-colors">
					{post.title}
				</h3>
				<p className="text-sm text-zinc-400 mb-4 line-clamp-3 leading-relaxed">{post.description}</p>
			</div>
			<div className="mt-auto pt-4 flex flex-col gap-3 transition-colors">
				<div className="flex gap-2 flex-wrap">
					{post.tags.map((tag: string) => (
						<Badge key={tag} text={`#${tag}`} colorClass={badgeClass} />
					))}
				</div>
				<div className="w-full flex justify-center items-center gap-2 text-xs font-bold text-blue-400 bg-blue-950/30 hover:bg-blue-900 border border-blue-900/50 hover:border-blue-500/50 px-3 py-1.5 rounded transition-all uppercase tracking-wide">
					<FileText size={12} /> Ver nota
				</div>
			</div>
		</div>
	);
}

function CardTool({ post }: { post: Post }) {
	return (
		<div className="cursor-pointer h-full p-5 bg-zinc-900/40 border border-zinc-800 hover:border-emerald-500/50 hover:bg-emerald-900/5 transition-all duration-300 flex flex-col justify-between rounded-md relative shadow-none hover:shadow-[0_0_15px_-5px_rgba(16,185,129,0.1)] card-trigger">
			<div>
				<div className="flex items-center gap-2 mb-4">
					<div className="bg-emerald-500/10 p-2 rounded-md border border-emerald-500/20 text-emerald-400 group-hover:bg-emerald-500/20 transition-colors">
						<Code2 size={20} />
					</div>
					<h3 className="text-lg font-semibold text-emerald-400 group-hover:text-emerald-300 transition-colors">
						{post.title}
					</h3>
				</div>
				<p className="text-sm text-zinc-400 mb-4">{post.description}</p>
			</div>
			<div className="mt-auto pt-4 border-t border-dashed border-zinc-800 group-hover:border-emerald-900/50 flex justify-between items-center transition-colors">
				<span className="text-xs font-mono text-zinc-300 group-hover:text-emerald-600/70 transition-colors">
					./bin/{post.tool_name}
				</span>
				<div className="flex items-center gap-2 text-xs font-bold text-emerald-400 bg-emerald-950/30 hover:bg-emerald-900 border border-emerald-900/50 hover:border-emerald-500/50 px-3 py-1.5 rounded transition-all uppercase tracking-wide">
					<Terminal size={12} /> Executar
				</div>
			</div>
		</div>
	);
}
