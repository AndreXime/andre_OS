import { useId, useState } from "react";
import { cn } from "../../lib/cn";

interface Tab {
  id: string;
  label: string;
  content: React.ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  className?: string;
}

export function Tabs({ tabs, defaultTab, className }: TabsProps) {
  const baseId = useId();
  const [activeId, setActiveId] = useState(defaultTab ?? tabs[0]?.id ?? "");

  return (
    <div className={className}>
      <div
        role="tablist"
        aria-label="Navegação"
        className="mb-6 flex gap-1 rounded-ct-md border border-ct-border bg-ct-muted p-1"
      >
        {tabs.map((tab) => {
          const isActive = tab.id === activeId;

          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              id={`${baseId}-tab-${tab.id}`}
              aria-selected={isActive}
              aria-controls={`${baseId}-panel-${tab.id}`}
              className={cn(
                "flex-1 cursor-pointer rounded-ct-sm px-4 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-ct-background text-ct-foreground shadow-sm"
                  : "text-ct-muted-foreground hover:text-ct-foreground",
              )}
              onClick={() => setActiveId(tab.id)}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {tabs.map((tab) => {
        const isActive = tab.id === activeId;

        return (
          <div
            key={tab.id}
            role="tabpanel"
            id={`${baseId}-panel-${tab.id}`}
            aria-labelledby={`${baseId}-tab-${tab.id}`}
            hidden={!isActive}
            className={cn(!isActive && "hidden")}
          >
            {tab.content}
          </div>
        );
      })}
    </div>
  );
}
