import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { AcmeNav } from "./acme/AcmeNav";
import { AcmeStatsGrid } from "./acme/AcmeStatsGrid";
import { ACME } from "./acme/data";

export function Hero1() {
	return (
		<section className="bg-ct-background">
			<AcmeNav />
			<div className="mx-auto max-w-4xl px-6 pb-16 pt-8 text-center">
				<Badge className="mb-6">{ACME.hero.eyebrow}</Badge>
				<h1 className="font-ct-heading text-[clamp(2.25rem,5vw,3.5rem)] font-bold leading-tight tracking-tight text-ct-foreground">
					{ACME.hero.title}
				</h1>
				<p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-ct-muted-foreground">{ACME.hero.subtitle}</p>
				<div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
					<Button size="lg">Start free trial</Button>
					<Button size="lg" variant="outline">
						Watch demo
					</Button>
				</div>
				<p className="mt-6 text-sm text-ct-muted-foreground">{ACME.hero.socialProof}</p>
			</div>
			<div className="mx-auto max-w-6xl px-6 pb-16">
				<AcmeStatsGrid />
			</div>
		</section>
	);
}

export function Hero2() {
	return (
		<section className="bg-ct-muted">
			<AcmeNav />
			<div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-6 py-16 lg:grid-cols-2 lg:py-20">
				<div className="min-w-0">
					<p className="text-sm font-semibold uppercase tracking-widest text-ct-primary">{ACME.hero.eyebrow}</p>
					<h1 className="mt-4 font-ct-heading text-4xl font-bold leading-tight text-ct-foreground lg:text-5xl">
						{ACME.hero.title}
					</h1>
					<p className="mt-5 text-ct-muted-foreground">{ACME.hero.subtitle}</p>
					<Button className="mt-8" size="lg">
						Get started free
					</Button>
					<p className="mt-4 text-sm text-ct-muted-foreground">{ACME.hero.socialProof}</p>
				</div>
				<div className="grid grid-cols-2 gap-3">
					{ACME.stats.map((stat) => (
						<div
							key={stat.label}
							className="rounded-ct-lg border border-ct-border bg-ct-background p-5 transition-shadow duration-150 hover:shadow-md"
						>
							<p className="font-ct-heading text-2xl font-bold text-ct-primary">{stat.value}</p>
							<p className="mt-1 text-sm font-medium">{stat.label}</p>
							<p className="text-xs text-ct-muted-foreground">{stat.detail}</p>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}

export function Hero3() {
	return (
		<section className="relative overflow-hidden bg-ct-primary text-ct-primary-foreground">
			<AcmeNav inverted />
			<div className="relative mx-auto max-w-3xl px-6 py-20 text-center">
				<h1 className="font-ct-heading text-4xl font-bold leading-tight sm:text-5xl">{ACME.hero.title}</h1>
				<p className="mx-auto mt-5 max-w-xl text-ct-primary-foreground/85">{ACME.hero.subtitle}</p>
				<Button size="lg" variant="inverted" className="mt-8">
					Start free trial
				</Button>
				<p className="mt-4 text-sm text-ct-primary-foreground/70">{ACME.hero.socialProof}</p>
			</div>
		</section>
	);
}
