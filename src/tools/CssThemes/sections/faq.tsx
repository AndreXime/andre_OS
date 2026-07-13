import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { ACME } from "./acme/data";

export function Faq1() {
  return (
    <section className="bg-ct-background px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <h2 className="font-ct-heading text-3xl font-bold text-ct-foreground">
          Frequently asked questions
        </h2>
        <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2">
          {ACME.faq.map((item) => (
            <div key={item.q} className="min-w-0">
              <h3 className="font-ct-heading font-semibold text-ct-foreground">
                {item.q}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ct-muted-foreground">
                {item.a}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Faq2() {
  return (
    <section className="bg-ct-muted px-6 py-20">
      <div className="mx-auto max-w-2xl">
        <h2 className="font-ct-heading text-3xl font-bold text-ct-foreground">
          Frequently asked questions
        </h2>
        <div className="mt-8 divide-y divide-border rounded-xl border border-ct-border bg-ct-background">
          {ACME.faq.map((item) => (
            <details key={item.q} className="group px-5">
              <summary className="cursor-pointer list-none py-5 font-medium text-ct-foreground marker:content-none [&::-webkit-details-marker]:hidden">
                <span className="flex items-center justify-between gap-4">
                  {item.q}
                  <span className="text-ct-muted-foreground transition-transform group-open:rotate-45">
                    +
                  </span>
                </span>
              </summary>
              <p className="pb-5 text-sm text-ct-muted-foreground">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Faq3() {
  return (
    <section className="bg-ct-background px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          <div>
            <h2 className="font-ct-heading text-3xl font-bold text-ct-foreground">
              Frequently asked questions
            </h2>
            <dl className="mt-8 space-y-6">
              {ACME.faq.slice(0, 2).map((item) => (
                <div key={item.q}>
                  <dt className="font-semibold text-ct-foreground">{item.q}</dt>
                  <dd className="mt-2 text-sm text-ct-muted-foreground">
                    {item.a}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="rounded-xl border border-ct-border bg-ct-muted/40 p-8">
            <h3 className="font-ct-heading text-xl font-bold text-ct-foreground">
              Ready to transform your workflow?
            </h3>
            <p className="mt-2 text-sm text-ct-muted-foreground">
              Join thousands of teams already using Acme Platform to work
              smarter and achieve more.
            </p>
            <form
              className="mt-6 flex flex-col gap-3 sm:flex-row"
              onSubmit={(e) => e.preventDefault()}
            >
              <Input
                type="email"
                placeholder="you@company.com"
                aria-label="Email"
              />
              <Button type="submit" className="shrink-0">
                Subscribe
              </Button>
            </form>
            <p className="mt-3 text-xs text-ct-muted-foreground">
              No spam. Unsubscribe anytime.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
