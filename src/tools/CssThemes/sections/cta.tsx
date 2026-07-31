import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";

export function Cta1() {
	return (
		<section className="bg-ct-primary px-6 py-16 text-ct-primary-foreground">
			<div className="mx-auto max-w-2xl text-center">
				<h2 className="font-ct-heading text-3xl font-bold">Ready to transform your workflow?</h2>
				<p className="mt-3 text-ct-primary-foreground/85">
					Join thousands of teams already using Acme Platform to work smarter and achieve more.
				</p>
				<Button size="lg" variant="inverted" className="mt-8">
					Start free trial
				</Button>
				<p className="mt-4 text-sm text-ct-primary-foreground/70">14-day trial · No credit card required</p>
			</div>
		</section>
	);
}

export function Cta2() {
	return (
		<section className="border-y border-ct-border bg-ct-muted/50 px-6 py-14">
			<div className="mx-auto flex max-w-6xl flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
				<div className="min-w-0">
					<h2 className="font-ct-heading text-2xl font-bold text-ct-foreground">Ready to transform your workflow?</h2>
					<p className="mt-2 max-w-md text-sm text-ct-muted-foreground">
						Join thousands of teams already using Acme Platform.
					</p>
				</div>
				<form className="flex w-full max-w-md flex-col gap-3 sm:flex-row" onSubmit={(e) => e.preventDefault()}>
					<Input type="email" placeholder="you@company.com" aria-label="Email" />
					<Button type="submit" className="shrink-0">
						Subscribe
					</Button>
				</form>
			</div>
			<p className="mx-auto mt-4 max-w-6xl text-xs text-ct-muted-foreground">No spam. Unsubscribe anytime.</p>
		</section>
	);
}

export function Cta3() {
	return (
		<section className="bg-ct-background px-6 py-20">
			<div className="mx-auto max-w-4xl rounded-2xl border border-ct-border bg-ct-muted/30 p-8 text-center sm:p-12">
				<h2 className="font-ct-heading text-3xl font-bold text-ct-foreground">Start building with Acme today</h2>
				<p className="mx-auto mt-3 max-w-lg text-ct-muted-foreground">
					Get your team aligned, automated, and shipping faster in one unified platform.
				</p>
				<div className="mt-8 flex flex-wrap justify-center gap-3">
					<Button size="lg">Start free trial</Button>
					<Button size="lg" variant="outline">
						Talk to sales
					</Button>
				</div>
			</div>
		</section>
	);
}
