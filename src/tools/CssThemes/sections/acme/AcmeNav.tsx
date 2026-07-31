import { Button } from "../../components/ui/Button";
import { cn } from "../../lib/cn";
import { ACME } from "./data";

interface AcmeNavProps {
	className?: string;
	inverted?: boolean;
}

export function AcmeNav({ className, inverted = false }: AcmeNavProps) {
	return (
		<header className={cn("flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between", className)}>
			<div className="flex items-center gap-2">
				<span
					className={cn(
						"flex size-8 items-center justify-center rounded-ct-md text-sm font-bold",
						inverted ? "bg-ct-primary-foreground text-ct-primary" : "bg-ct-primary text-ct-primary-foreground",
					)}
				>
					A
				</span>
				<span
					className={cn(
						"font-ct-heading font-semibold",
						inverted ? "text-ct-primary-foreground" : "text-ct-foreground",
					)}
				>
					{ACME.brand}
				</span>
			</div>
			<nav className="flex flex-wrap items-center gap-x-6 gap-y-2">
				{ACME.nav.map((link) => (
					<a
						key={link.label}
						href="/"
						className={cn(
							"text-sm transition-colors duration-150",
							inverted
								? "text-ct-primary-foreground/80 hover:text-ct-primary-foreground"
								: "text-ct-muted-foreground hover:text-ct-foreground",
						)}
					>
						{link.label}
					</a>
				))}
				<Button size="sm" variant={inverted ? "inverted" : "primary"}>
					Get started
				</Button>
			</nav>
		</header>
	);
}
