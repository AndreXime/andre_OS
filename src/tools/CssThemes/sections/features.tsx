import { Badge } from "../components/ui/Badge";
import { ACME } from "./acme/data";

export function Features1() {
	return (
		<section className="bg-ct-background px-6 py-20">
			<div className="mx-auto max-w-6xl">
				<div className="mb-12 text-center">
					<p className="text-sm font-semibold uppercase tracking-widest text-ct-primary">Features</p>
					<h2 className="mt-2 font-ct-heading text-3xl font-bold text-ct-foreground">Everything you need to succeed</h2>
				</div>
				<div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
					{ACME.features.map((feature) => (
						<article key={feature.num} className="min-w-0">
							<span className="font-ct-heading text-sm font-bold text-ct-primary">{feature.num}</span>
							<h3 className="mt-2 font-ct-heading text-lg font-semibold text-ct-foreground">{feature.title}</h3>
							<p className="mt-2 text-sm leading-relaxed text-ct-muted-foreground">{feature.body}</p>
						</article>
					))}
				</div>
			</div>
		</section>
	);
}

export function Features2() {
	return (
		<section className="bg-ct-muted px-6 py-20">
			<div className="mx-auto max-w-4xl">
				<Badge className="mb-4">Features</Badge>
				<h2 className="font-ct-heading text-3xl font-bold text-ct-foreground">Everything you need to succeed</h2>
				<ul className="mt-10 divide-y divide-border border-y border-ct-border">
					{ACME.features.map((feature) => (
						<li key={feature.num} className="grid grid-cols-1 gap-3 py-6 sm:grid-cols-[4rem_minmax(0,1fr)] sm:gap-6">
							<span className="font-ct-heading text-2xl font-bold text-ct-primary/40">{feature.num}</span>
							<div>
								<h3 className="font-ct-heading font-semibold text-ct-foreground">{feature.title}</h3>
								<p className="mt-1 text-sm text-ct-muted-foreground">{feature.body}</p>
							</div>
						</li>
					))}
				</ul>
			</div>
		</section>
	);
}

export function Features3() {
	const [featured, ...rest] = ACME.features;
	return (
		<section className="bg-ct-background px-6 py-20">
			<div className="mx-auto max-w-6xl">
				<h2 className="mb-10 font-ct-heading text-3xl font-bold text-ct-foreground">Everything you need to succeed</h2>
				<div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
					{featured && (
						<article className="rounded-xl border border-ct-primary/30 bg-ct-primary/5 p-8 lg:row-span-2">
							<span className="text-sm font-bold text-ct-primary">{featured.num}</span>
							<h3 className="mt-3 font-ct-heading text-2xl font-bold">{featured.title}</h3>
							<p className="mt-4 text-ct-muted-foreground">{featured.body}</p>
						</article>
					)}
					<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
						{rest.slice(0, 4).map((feature) => (
							<article
								key={feature.num}
								className="rounded-ct-lg border border-ct-border p-5 transition-colors hover:bg-ct-muted/50"
							>
								<h3 className="font-ct-heading font-semibold">{feature.title}</h3>
								<p className="mt-1 text-sm text-ct-muted-foreground">{feature.body}</p>
							</article>
						))}
					</div>
				</div>
			</div>
		</section>
	);
}
