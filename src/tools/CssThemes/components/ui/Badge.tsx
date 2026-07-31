import { cn } from "../../lib/cn";

const variants = {
	primary: "bg-ct-primary/15 text-ct-primary ring-1 ring-inset ring-ct-primary/25",
	secondary: "bg-ct-secondary text-ct-secondary-foreground ring-1 ring-inset ring-ct-border",
	destructive: "bg-ct-destructive/15 text-ct-destructive ring-1 ring-inset ring-ct-destructive/25",
	outline: "bg-transparent text-ct-foreground ring-1 ring-inset ring-ct-border",
} as const;

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
	variant?: keyof typeof variants;
}

export function Badge({ variant = "primary", className, ...props }: BadgeProps) {
	return (
		<span
			className={cn(
				"inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors duration-150",
				variants[variant],
				className,
			)}
			{...props}
		/>
	);
}
