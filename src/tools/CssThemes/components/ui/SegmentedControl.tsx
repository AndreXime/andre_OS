import { cn } from "../../lib/cn";

interface SegmentedControlOption<T extends string> {
  id: T;
  label: string;
}

interface SegmentedControlProps<T extends string> {
  options: SegmentedControlOption<T>[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel: string;
  className?: string;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
  className,
}: SegmentedControlProps<T>) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn(
        "flex gap-1 rounded-ct-md border border-ct-border bg-ct-muted p-1",
        className,
      )}
    >
      {options.map((option) => {
        const isActive = option.id === value;

        return (
          <button
            key={option.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={cn(
              "flex-1 cursor-pointer rounded-ct-sm px-3 py-1.5 text-sm font-medium transition-colors",
              isActive
                ? "bg-ct-background text-ct-foreground shadow-sm"
                : "text-ct-muted-foreground hover:text-ct-foreground",
            )}
            onClick={() => onChange(option.id)}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
