import type { Post } from "@/content.config";
import { getLinkInfo } from "@/lib/getLinkInfo";

export interface PostMeta {
	kind: "tool" | "note" | "link";
	typeLabel: string;
	href: string;
	linkFavicon: string | null;
	external: boolean;
}

function getPostUrl(post: Post): string {
	switch (post.type) {
		case "note":
			return `/post/${post.slug}`;
		case "tool":
			return `/app/${post.slug}`;
		case "link":
			return post.target ?? "#";
	}
}

export async function getPostMeta(post: Post): Promise<PostMeta> {
	const href = getPostUrl(post);

	switch (post.type) {
		case "tool":
			return {
				kind: "tool",
				typeLabel: "Ferramenta",
				href,
				linkFavicon: null,
				external: false,
			};
		case "note":
			return {
				kind: "note",
				typeLabel: "Nota",
				href,
				linkFavicon: null,
				external: false,
			};
		case "link": {
			const info = await getLinkInfo(post.target || "");
			return {
				kind: "link",
				typeLabel: "Link",
				href,
				linkFavicon: info.favicon,
				external: true,
			};
		}
	}
}
