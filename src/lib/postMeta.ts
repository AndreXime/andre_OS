import { getLinkInfo } from "@/lib/getLinkInfo";
import { truncateMiddle } from "@/lib/utils";
import type { Post } from "@/content.config";
import type { LucideIcon } from "lucide-react";
import { Code2, ExternalLink, FileText } from "lucide-react";

export interface PostMeta {
	kind: "tool" | "note" | "link" | "intro";
	kindLabel: string;
	typeLabel: string;
	verb: string;
	windowTitle: string;
	windowTitleFull: string;
	href: string;
	Icon: LucideIcon;
	linkFavicon: string | null;
	linkDomain: string | null;
	external: boolean;
}

function truncateWindowTitle(fullTitle: string) {
	return {
		windowTitle: truncateMiddle(fullTitle, 44),
		windowTitleFull: fullTitle,
	};
}

function truncateDisplayPath(relativePath: string, fullPath: string) {
	return {
		path: truncateMiddle(relativePath, 38),
		pathFull: fullPath,
	};
}

export function getPostUrl(post: Post): string {
	switch (post.type) {
		case "note":
			return `/post/${post.slug}`;
		case "tool":
			return `/app/${post.tool_name ?? post.slug}`;
		case "link":
			return post.url ?? "#";
		default:
			return "#";
	}
}

export function getContextualPath(
	post: Post,
	activeCategory: string,
	linkDomain?: string | null,
): { path: string; pathFull: string } {
	const toolName = post.tool_name ?? post.slug;
	const linkFull = post.url ?? linkDomain ?? `~/links/${post.slug}`;

	if (activeCategory === "tool" && post.type === "tool") {
		return truncateDisplayPath(`./${toolName}`, `~/bin/${toolName}`);
	}

	if (activeCategory === "note" && post.type === "note") {
		return truncateDisplayPath(`./${post.slug}.md`, `~/notas/${post.slug}.md`);
	}

	if (activeCategory === "link" && post.type === "link") {
		return truncateDisplayPath(`./${post.slug}`, linkFull);
	}

	switch (post.type) {
		case "tool":
			return truncateDisplayPath(`./bin/${toolName}`, `~/bin/${toolName}`);
		case "note":
			return truncateDisplayPath(`./notas/${post.slug}.md`, `~/notas/${post.slug}.md`);
		case "link":
			return truncateDisplayPath(`./links/${post.slug}`, linkFull);
		default:
			return truncateDisplayPath("./README.md", "~/root/README.md");
	}
}

export async function getPostMeta(post: Post): Promise<PostMeta> {
	const href = getPostUrl(post);

	switch (post.type) {
		case "tool": {
			const toolName = post.tool_name ?? post.slug;
			return {
				kind: "tool",
				kindLabel: "bin",
				typeLabel: "Ferramenta",
				...truncateWindowTitle(`~/bin/${toolName}`),
				verb: "exec",
				href,
				Icon: Code2,
				linkFavicon: null,
				linkDomain: null,
				external: false,
			};
		}
		case "note": {
			return {
				kind: "note",
				kindLabel: "md",
				typeLabel: "Nota",
				...truncateWindowTitle(`~/notas/${post.slug}.md`),
				verb: "cat",
				href,
				Icon: FileText,
				linkFavicon: null,
				linkDomain: null,
				external: false,
			};
		}
		case "link": {
			const info = await getLinkInfo(post.url || "");
			const linkDomain = info.domain ?? post.slug;
			return {
				kind: "link",
				kindLabel: "url",
				typeLabel: "Link",
				...truncateWindowTitle(linkDomain),
				verb: "open",
				href,
				Icon: ExternalLink,
				linkFavicon: info.favicon,
				linkDomain,
				external: true,
			};
		}
		default: {
			return {
				kind: "intro",
				kindLabel: "root",
				typeLabel: "Intro",
				...truncateWindowTitle("~/root/README.md"),
				verb: "view",
				href,
				Icon: FileText,
				linkFavicon: null,
				linkDomain: null,
				external: false,
			};
		}
	}
}
