import { cn } from "../../../lib/cn";
import type { SectionCategory, SectionVariation } from "../../../sections/catalog";

interface SectionBreadcrumbProps {
  category?: SectionCategory | undefined;
  variation?: SectionVariation | undefined;
  onNavigateCatalog: () => void;
  onNavigateCategory?: (() => void) | undefined;
}

function BreadcrumbLink({
  children,
  onClick,
  current = false,
}: {
  children: React.ReactNode;
  onClick?: (() => void) | undefined;
  current?: boolean;
}) {
  if (current || !onClick) {
    return (
      <span
        className={cn(
          "text-sm",
          current ? "font-medium text-ct-foreground" : "text-ct-muted-foreground",
        )}
        aria-current={current ? "page" : undefined}
      >
        {children}
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "cursor-pointer border-0 bg-transparent p-0 text-sm text-ct-primary underline underline-offset-4",
        "transition-colors hover:text-ct-primary/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ct-ring",
      )}
    >
      {children}
    </button>
  );
}

export function SectionBreadcrumb({
  category,
  variation,
  onNavigateCatalog,
  onNavigateCategory,
}: SectionBreadcrumbProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="mb-6 border-b border-ct-border pb-4"
    >
      <ol className="flex flex-wrap items-center gap-1.5 text-sm">
        <li className="flex items-center gap-1.5">
          <BreadcrumbLink
            onClick={category ? onNavigateCatalog : undefined}
            current={!category}
          >
            Seções
          </BreadcrumbLink>
        </li>
        {category && (
          <li className="flex items-center gap-1.5">
            <span aria-hidden className="text-ct-muted-foreground">
              /
            </span>
            <BreadcrumbLink
              onClick={variation ? onNavigateCategory : undefined}
              current={!variation}
            >
              {category.name}
            </BreadcrumbLink>
          </li>
        )}
        {variation && (
          <li className="flex items-center gap-1.5">
            <span aria-hidden className="text-ct-muted-foreground">
              /
            </span>
            <BreadcrumbLink current>{variation.name}</BreadcrumbLink>
          </li>
        )}
      </ol>
    </nav>
  );
}
