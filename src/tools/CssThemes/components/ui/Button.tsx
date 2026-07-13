import { cn } from "../../lib/cn";

const base =
  "inline-flex cursor-pointer items-center justify-center gap-2 font-medium transition-all duration-150 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ct-ring disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.98]";

const variants = {
  primary:
    "bg-ct-primary text-ct-primary-foreground shadow-sm hover:brightness-110 hover:shadow-md active:brightness-95",
  secondary:
    "bg-ct-secondary text-ct-secondary-foreground hover:bg-ct-accent hover:text-ct-accent-foreground active:brightness-95",
  destructive:
    "bg-ct-destructive text-ct-destructive-foreground shadow-sm hover:brightness-110 hover:shadow-md active:brightness-95",
  ghost:
    "border border-ct-border bg-transparent text-ct-foreground hover:border-ct-primary/30 hover:bg-ct-accent hover:text-ct-accent-foreground active:bg-ct-muted",
  outline:
    "border border-ct-primary/40 bg-transparent text-ct-primary hover:border-ct-primary hover:bg-ct-primary/10 active:bg-ct-primary/15",
  inverted:
    "bg-ct-primary-foreground text-ct-primary shadow-sm hover:brightness-95 hover:shadow-md active:brightness-95",
} as const;

const sizes = {
  default: "rounded-ct-md px-4 py-2 text-sm",
  sm: "rounded-ct-md px-3 py-1.5 text-sm",
  lg: "rounded-ct-md px-6 py-2.5 text-base",
} as const;

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
}

export function Button({
  variant = "primary",
  size = "default",
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    />
  );
}
