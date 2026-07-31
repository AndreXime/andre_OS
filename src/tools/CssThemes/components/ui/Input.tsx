import { cn } from "../../lib/cn";

const fieldBase =
	"w-full rounded-ct-md border border-ct-border bg-ct-background px-3 py-2 text-sm text-ct-foreground transition-[color,box-shadow,border-color] duration-150 placeholder:text-ct-muted-foreground hover:border-ct-muted-foreground/40 focus:border-ct-ring focus:outline-2 focus:outline-offset-1 focus:outline-ct-ring disabled:cursor-not-allowed disabled:border-ct-border disabled:bg-ct-muted disabled:opacity-60";

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
	return <input className={cn(fieldBase, className)} {...props} />;
}
