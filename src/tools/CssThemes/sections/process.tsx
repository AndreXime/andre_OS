import { Button } from "../components/ui/Button";
import { ACME } from "./acme/data";

export function Process1() {
	return (
		<section className="bg-ct-background px-6 py-20">
			<div className="mx-auto max-w-6xl text-center">
				<p className="text-sm font-semibold uppercase tracking-widest text-ct-primary">Process</p>
				<h2 className="mt-2 font-ct-heading text-3xl font-bold text-ct-foreground">How Acme works</h2>
				<p className="mx-auto mt-3 max-w-lg text-ct-muted-foreground">Get up and running in minutes, not days.</p>
				<div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
					{ACME.process.map((item) => (
						<article key={item.step} className="min-w-0">
							<span className="inline-flex size-10 items-center justify-center rounded-full bg-ct-primary font-ct-heading text-sm font-bold text-ct-primary-foreground">
								{item.step}
							</span>
							<h3 className="mt-4 font-ct-heading text-lg font-semibold text-ct-foreground">{item.title}</h3>
							<p className="mt-2 text-sm text-ct-muted-foreground">{item.body}</p>
						</article>
					))}
				</div>
			</div>
		</section>
	);
}

export function Process2() {
	return (
		<section className="bg-ct-muted px-6 py-20">
			<div className="mx-auto max-w-4xl">
				<h2 className="font-ct-heading text-3xl font-bold text-ct-foreground">How Acme works</h2>
				<p className="mt-2 text-ct-muted-foreground">Get up and running in minutes, not days.</p>
				<ol className="mt-10 space-y-0">
					{ACME.process.map((item) => (
						<li key={item.step} className="relative flex gap-6 border-l-2 border-ct-primary/30 pb-10 pl-8 last:pb-0">
							<span className="absolute -left-3 top-0 flex size-6 items-center justify-center rounded-full bg-ct-primary text-xs font-bold text-ct-primary-foreground">
								{item.step}
							</span>
							<div>
								<h3 className="font-ct-heading font-semibold text-ct-foreground">{item.title}</h3>
								<p className="mt-1 text-sm text-ct-muted-foreground">{item.body}</p>
							</div>
						</li>
					))}
				</ol>
			</div>
		</section>
	);
}

export function Process3() {
	return (
		<section className="border-y border-ct-border bg-ct-background px-6 py-16">
			<div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 lg:grid-cols-[1fr_1.2fr] lg:items-start">
				<div>
					<h2 className="font-ct-heading text-3xl font-bold text-ct-foreground">How Acme works</h2>
					<p className="mt-3 text-ct-muted-foreground">Get up and running in minutes, not days.</p>
					<Button className="mt-6" variant="outline">
						View documentation
					</Button>
				</div>
				<div className="grid gap-4">
					{ACME.process.map((item) => (
						<div key={item.step} className="flex gap-4 rounded-ct-lg border border-ct-border p-5">
							<span className="font-ct-heading text-2xl font-bold text-ct-primary/30">{item.step}</span>
							<div>
								<h3 className="font-ct-heading font-semibold">{item.title}</h3>
								<p className="mt-1 text-sm text-ct-muted-foreground">{item.body}</p>
							</div>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
