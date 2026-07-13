import { ACME } from "./acme/data";

export function Footer1() {
  return (
    <footer className="border-t border-ct-border bg-ct-background px-6 py-16">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 lg:grid-cols-5">
          <div className="col-span-2 sm:col-span-4 lg:col-span-1">
            <div className="flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-ct-md bg-ct-primary text-sm font-bold text-ct-primary-foreground">
                A
              </span>
              <span className="font-ct-heading font-semibold">{ACME.brand}</span>
            </div>
            <p className="mt-3 text-sm text-ct-muted-foreground">
              {ACME.footer.tagline}
            </p>
          </div>
          {ACME.footer.columns.map((col) => (
            <div key={col.title}>
              <h3 className="text-sm font-semibold text-ct-foreground">
                {col.title}
              </h3>
              <ul className="mt-3 space-y-2">
                {col.links.map((link) => (
                  <li key={link}>
                    <a
                      href="/"
                      className="text-sm text-ct-muted-foreground transition-colors hover:text-ct-foreground"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col gap-4 border-t border-ct-border pt-8 text-xs text-ct-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© 2025 {ACME.brand} All rights reserved.</p>
          <div className="flex gap-4">
            <a href="/" className="hover:text-ct-foreground">
              Privacy
            </a>
            <a href="/" className="hover:text-ct-foreground">
              Terms
            </a>
            <a href="/" className="hover:text-ct-foreground">
              Cookies
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export function Footer2() {
  return (
    <footer className="bg-ct-muted px-6 py-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-ct-heading text-xl font-bold">{ACME.brand}</p>
          <p className="mt-2 max-w-xs text-sm text-ct-muted-foreground">
            {ACME.footer.tagline}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          {ACME.footer.columns.map((col) => (
            <div key={col.title}>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-ct-muted-foreground">
                {col.title}
              </h3>
              <ul className="mt-3 space-y-2">
                {col.links.slice(0, 3).map((link) => (
                  <li key={link}>
                    <a href="/" className="text-sm hover:text-ct-foreground">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <p className="mx-auto mt-10 max-w-6xl text-xs text-ct-muted-foreground">
        © 2025 {ACME.brand}
      </p>
    </footer>
  );
}

export function Footer3() {
  return (
    <footer className="border-t border-ct-border bg-ct-background px-6 py-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 text-center sm:flex-row sm:justify-between sm:text-left">
        <div className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded bg-ct-primary text-xs font-bold text-ct-primary-foreground">
            A
          </span>
          <span className="text-sm font-medium">{ACME.brand}</span>
        </div>
        <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-ct-muted-foreground">
          {ACME.footer.columns
            .flatMap((c) => c.links.slice(0, 1))
            .map((link) => (
              <a key={link} href="/" className="hover:text-ct-foreground">
                {link}
              </a>
            ))}
        </nav>
        <p className="text-xs text-ct-muted-foreground">© 2025</p>
      </div>
    </footer>
  );
}
