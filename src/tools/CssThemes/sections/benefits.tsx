import { ACME } from "./acme/data";

export function Benefits1() {
  return (
    <section className="bg-ct-muted px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12">
          <p className="text-sm font-semibold uppercase tracking-widest text-ct-primary">
            Benefits
          </p>
          <h2 className="mt-2 font-ct-heading text-3xl font-bold text-ct-foreground">
            Why teams choose Acme
          </h2>
          <p className="mt-2 text-ct-muted-foreground">
            Everything you need to succeed in one platform
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {ACME.benefits.map((benefit) => (
            <article
              key={benefit.title}
              className="rounded-ct-lg border border-ct-border bg-ct-background p-6 transition-shadow duration-150 hover:shadow-md"
            >
              <h3 className="font-ct-heading text-lg font-semibold text-ct-foreground">
                {benefit.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ct-muted-foreground">
                {benefit.body}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Benefits2() {
  return (
    <section className="bg-ct-background px-6 py-20">
      <div className="mx-auto max-w-4xl">
        <h2 className="font-ct-heading text-3xl font-bold text-ct-foreground">
          Why teams choose Acme
        </h2>
        <ul className="mt-10 space-y-6">
          {ACME.benefits.map((benefit) => (
            <li key={benefit.title} className="flex gap-4">
              <span
                aria-hidden
                className="mt-2 size-2 shrink-0 rounded-full bg-ct-primary"
              />
              <div>
                <h3 className="font-ct-heading font-semibold text-ct-foreground">
                  {benefit.title}
                </h3>
                <p className="mt-1 text-sm text-ct-muted-foreground">
                  {benefit.body}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function Benefits3() {
  return (
    <section className="bg-ct-primary px-6 py-20 text-ct-primary-foreground">
      <div className="mx-auto max-w-6xl">
        <h2 className="font-ct-heading text-3xl font-bold">
          Why teams choose Acme
        </h2>
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {ACME.benefits.map((benefit) => (
            <div key={benefit.title} className="min-w-0">
              <h3 className="font-ct-heading font-semibold">{benefit.title}</h3>
              <p className="mt-2 text-sm text-ct-primary-foreground/80">
                {benefit.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
