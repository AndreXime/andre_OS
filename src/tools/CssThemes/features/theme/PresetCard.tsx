import { cn } from "../../lib/cn";

interface PresetCardProps {
  name: string;
  description: string;
  primary: string;
  secondary: string;
  background: string;
  isActive: boolean;
  onSelect: () => void;
}

export function PresetCard({
  name,
  description,
  primary,
  secondary,
  background,
  isActive,
  onSelect,
}: PresetCardProps) {
  return (
    <button
      type="button"
      className={cn(
        "flex cursor-pointer flex-col items-start gap-1.5 rounded-ct-md border-2 bg-ct-background p-3 text-left transition-colors",
        isActive
          ? "border-ct-primary shadow-[0_0_0_1px_var(--ct-color-primary)]"
          : "border-ct-border hover:border-ct-primary",
      )}
      onClick={onSelect}
    >
      <div className="mb-1 flex gap-1.5">
        <span className="size-5 rounded-full" style={{ background: primary }} />
        <span
          className="size-5 rounded-full"
          style={{ background: secondary }}
        />
        <span
          className="size-5 rounded-full border border-ct-border"
          style={{ background }}
        />
      </div>
      <strong className="text-sm">{name}</strong>
      <small className="text-xs leading-snug text-ct-muted-foreground">
        {description}
      </small>
    </button>
  );
}
