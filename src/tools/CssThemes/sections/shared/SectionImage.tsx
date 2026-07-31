import { getPlaceholderImage, type PlaceholderId } from "../../assets/images";
import { cn } from "../../lib/cn";

interface SectionImageProps {
	alt: string;
	className?: string;
	placeholder?: PlaceholderId;
}

export function SectionImage({ alt, className, placeholder = 1 }: SectionImageProps) {
	const image = getPlaceholderImage(placeholder);
	const src = typeof image === "string" ? image : image.src;

	return <img src={src} alt={alt} loading="lazy" className={cn("w-full object-cover", className)} />;
}
