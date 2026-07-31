import { Button } from "../components/ui/Button";
import { ACME } from "./acme/data";

export function Sponsors1() {
	return (
		<section className="border-y border-ct-border bg-ct-muted/40 px-6 py-16">
			<div className="mx-auto max-w-6xl text-center">
				<p className="text-sm font-semibold uppercase tracking-widest text-ct-primary">Sponsors</p>
				<h2 className="mt-2 font-ct-heading text-2xl font-bold text-ct-foreground">Our Sponsors</h2>
				<p className="mx-auto mt-2 max-w-lg text-sm text-ct-muted-foreground">
					Acme is made possible by these amazing partners
				</p>
				<div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
					{ACME.sponsors.map((sponsor) => (
						<article
							key={sponsor.name}
							className="rounded-ct-lg border border-ct-border bg-ct-background p-6 text-left"
						>
							<div className="mb-4 flex h-12 items-center font-ct-heading text-lg font-bold text-ct-foreground">
								{sponsor.name}
							</div>
							<p className="text-sm text-ct-muted-foreground">{sponsor.body}</p>
						</article>
					))}
				</div>
			</div>
		</section>
	);
}

export function Sponsors2() {
	return (
		<section className="bg-ct-background px-6 py-12">
			<div className="mx-auto max-w-6xl">
				<p className="text-center text-sm text-ct-muted-foreground">Trusted by industry leaders</p>
				<div className="mt-8 flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
					{ACME.sponsors.map((sponsor) => (
						<span key={sponsor.name} className="font-ct-heading text-lg font-semibold text-ct-muted-foreground/60">
							{sponsor.name}
						</span>
					))}
					<span className="font-ct-heading text-lg font-semibold text-ct-muted-foreground/40">CloudBase</span>
					<span className="font-ct-heading text-lg font-semibold text-ct-muted-foreground/40">DataFlow</span>
				</div>
			</div>
		</section>
	);
}

export function Sponsors3() {
	return (
		<section className="bg-ct-muted px-6 py-16">
			<div className="mx-auto max-w-4xl">
				<h2 className="font-ct-heading text-2xl font-bold text-ct-foreground">Become a sponsor</h2>
				<p className="mt-2 text-ct-muted-foreground">
					Put your product in front of a highly engaged, creative audience.
				</p>
				<div className="mt-8 space-y-4">
					{ACME.sponsors.map((sponsor) => (
						<div
							key={sponsor.name}
							className="flex flex-col gap-4 rounded-ct-lg border border-dashed border-ct-border bg-ct-background p-6 sm:flex-row sm:items-center sm:justify-between"
						>
							<div>
								<h3 className="font-ct-heading font-semibold">{sponsor.name}</h3>
								<p className="mt-1 text-sm text-ct-muted-foreground">{sponsor.body}</p>
							</div>
							<Button variant="outline" size="sm" className="shrink-0">
								Learn more
							</Button>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
