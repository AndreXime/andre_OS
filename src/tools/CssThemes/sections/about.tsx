import { Button } from "../components/ui/Button";
import { ACME } from "./acme/data";

export function About1() {
  return (
    <section className="bg-ct-background px-6 py-20">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-ct-primary">
            About
          </p>
          <h2 className="mt-3 font-ct-heading text-3xl font-bold text-ct-foreground">
            {ACME.about.title}
          </h2>
        </div>
        <div className="space-y-4 text-ct-muted-foreground">
          <p className="text-lg leading-relaxed text-ct-foreground">
            {ACME.about.lead}
          </p>
          <p className="leading-relaxed">{ACME.about.body}</p>
          <Button variant="outline">Learn more about Acme</Button>
        </div>
      </div>
    </section>
  );
}

export function About2() {
  return (
    <section className="bg-ct-muted px-6 py-20">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="font-ct-heading text-3xl font-bold text-ct-foreground sm:text-4xl">
          {ACME.about.title}
        </h2>
        <p className="mt-6 text-lg leading-relaxed text-ct-muted-foreground">
          {ACME.about.lead} {ACME.about.body}
        </p>
      </div>
    </section>
  );
}

export function About3() {
  return (
    <section className="border-t border-ct-border bg-ct-background px-6 py-16">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-xl border-l-4 border-ct-primary pl-6">
          <p className="text-sm font-medium text-ct-primary">About Acme</p>
          <h2 className="mt-2 font-ct-heading text-2xl font-bold text-ct-foreground">
            {ACME.about.title}
          </h2>
          <p className="mt-4 text-ct-muted-foreground">{ACME.about.lead}</p>
          <p className="mt-3 text-sm text-ct-muted-foreground">
            {ACME.about.body}
          </p>
        </div>
      </div>
    </section>
  );
}
