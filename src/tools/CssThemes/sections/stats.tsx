import { AcmeStatsGrid } from "./acme/AcmeStatsGrid";
import { ACME } from "./acme/data";

export function Stats1() {
  return (
    <section className="bg-ct-background px-6 py-16">
      <div className="mx-auto max-w-6xl">
        <AcmeStatsGrid />
      </div>
    </section>
  );
}

export function Stats2() {
  return (
    <section className="border-y border-ct-border bg-ct-muted/50 px-6 py-12">
      <div className="mx-auto flex max-w-6xl flex-col divide-y divide-border">
        {ACME.stats.map((stat) => (
          <div
            key={stat.label}
            className="flex flex-col gap-2 py-6 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="font-ct-heading text-3xl font-bold text-ct-foreground">
                {stat.value}
              </p>
              <p className="text-sm font-medium text-ct-foreground">
                {stat.label}
              </p>
            </div>
            <p className="text-sm text-ct-muted-foreground">{stat.detail}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function Stats3() {
  return (
    <section className="bg-ct-background px-6 py-16">
      <div className="mx-auto max-w-4xl text-center">
        <p className="text-sm font-medium text-ct-primary">By the numbers</p>
        <h2 className="mt-2 font-ct-heading text-3xl font-bold text-ct-foreground">
          Trusted at scale
        </h2>
        <div className="mt-10 grid grid-cols-2 gap-8 lg:grid-cols-4">
          {ACME.stats.map((stat) => (
            <div key={stat.label}>
              <p className="font-ct-heading text-2xl font-bold text-ct-primary sm:text-3xl">
                {stat.value}
              </p>
              <p className="mt-1 text-sm font-medium">{stat.label}</p>
              <p className="text-xs text-ct-muted-foreground">{stat.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
