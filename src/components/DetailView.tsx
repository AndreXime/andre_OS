import { ExternalLink, Terminal } from "lucide-preact";
import Badge from "./Bagde";
import type { Post } from "@/database/types";
import { formatDate, getDomain, getThemeClasses } from "@/lib/utils";

export default function DetailPostView({ post }: { post: Post }) {
	const { bgClass, borderClass, badgeClass } = getThemeClasses(post.type);

	return (
		<div
			class={`min-h-[200px] rounded-lg border ${borderClass} bg-zinc-900/50 backdrop-blur-sm overflow-hidden flex flex-col`}
		>
			<div class={`p-6 md:p-8 border-b ${borderClass} ${bgClass} flex-shrink-0`}>
				<div class="flex gap-2 mb-4">
					{post.tags?.map((tag: string) => (
						<Badge text={`#${tag}`} colorClass={badgeClass} />
					))}
				</div>
				<div class="flex items-end justify-between gap-4 mb-4">
					<h1 class="text-3xl md:text-4xl font-bold text-zinc-100 ">{post.title}</h1>
					{post.type === "tool" && (
						<a
							href={`/app/${post.slug}`}
							class="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-md font-medium transition-colors flex items-center justi gap-2"
						>
							<Terminal size={16} /> Ver ferramenta
						</a>
					)}
				</div>
				<div class="flex items-center justify-between gap-4 text-sm text-zinc-400 font-mono">
					{post.url && (
						<a
							href={post.url}
							target="_blank"
							rel="noopener noreferrer"
							class="flex items-center gap-1.5 text-violet-400 hover:text-violet-300 transition-colors"
						>
							<ExternalLink size={14} /> {getDomain(post.url)}
						</a>
					)}
					{post.date && <span>{formatDate(post.date)}</span>}
				</div>
			</div>

			<div class="p-6 md:p-8 overflow-y-auto flex-1 prose prose-invert prose-zinc prose-pre:text-base max-w-none">
				<p class="text-zinc-200 leading-relaxed">{post.description}</p>
				{post.content && (
					<div
						class="text-zinc-200 leading-relaxed content-container"
						dangerouslySetInnerHTML={{ __html: post.content }}
					/>
				)}
			</div>
		</div>
	);
}
