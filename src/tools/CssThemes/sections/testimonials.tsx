import { ACME } from "./acme/data";

export function Testimonials1() {
  const featured = ACME.testimonials[0];
  if (!featured) return null;

  return (
    <section className="bg-ct-muted px-6 py-20">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-ct-primary">
          Testimonials
        </p>
        <h2 className="mt-2 font-ct-heading text-3xl font-bold text-ct-foreground">
          Trusted by innovative teams
        </h2>
        <blockquote className="mt-10 font-ct-heading text-2xl font-medium leading-snug text-ct-foreground">
          &ldquo;{featured.quote}&rdquo;
        </blockquote>
        <footer className="mt-8">
          <p className="font-semibold text-ct-foreground">{featured.name}</p>
          <p className="text-sm text-ct-muted-foreground">{featured.role}</p>
        </footer>
      </div>
    </section>
  );
}

export function Testimonials2() {
  return (
    <section className="bg-ct-background px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <h2 className="mb-4 font-ct-heading text-3xl font-bold text-ct-foreground">
          Trusted by innovative teams
        </h2>
        <p className="mb-10 text-ct-muted-foreground">
          See what our customers have to say about Acme Platform.
        </p>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {ACME.testimonials.map((item) => (
            <figure
              key={item.name}
              className="flex min-w-0 flex-col rounded-ct-lg border border-ct-border p-6"
            >
              <blockquote className="flex-1 text-sm leading-relaxed text-ct-foreground">
                &ldquo;{item.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-6 border-t border-ct-border pt-4">
                <p className="font-semibold text-ct-foreground">{item.name}</p>
                <p className="text-xs text-ct-muted-foreground">{item.role}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Testimonials3() {
  return (
    <section className="border-y border-ct-border bg-ct-background px-6 py-16">
      <div className="mx-auto max-w-5xl">
        <h2 className="font-ct-heading text-2xl font-bold text-ct-foreground">
          Trusted by innovative teams
        </h2>
        <div className="mt-8 flex flex-col divide-y divide-border">
          {ACME.testimonials.map((item) => (
            <figure
              key={item.name}
              className="grid grid-cols-1 gap-4 py-8 first:pt-0 last:pb-0 lg:grid-cols-[1fr_12rem]"
            >
              <blockquote className="text-ct-muted-foreground">
                &ldquo;{item.quote}&rdquo;
              </blockquote>
              <figcaption className="lg:text-right">
                <p className="font-semibold text-ct-foreground">{item.name}</p>
                <p className="text-xs text-ct-muted-foreground">{item.role}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
