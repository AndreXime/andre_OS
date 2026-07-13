import type { SectionCategory } from "../../../sections/catalog";
import { DetailView } from "./DetailView";
import { NavCard } from "./NavCard";

interface VariationsViewProps {
  category: SectionCategory;
  selectedVariationId?: string | undefined;
  onSelectVariation: (variationId: string) => void;
}

export function VariationsView({
  category,
  selectedVariationId,
  onSelectVariation,
}: VariationsViewProps) {
  const selectedVariation = selectedVariationId
    ? category.variations.find((item) => item.id === selectedVariationId)
    : undefined;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {category.variations.map((variation, index) => (
          <NavCard
            key={variation.id}
            meta={`Variação ${index + 1}`}
            title={variation.name}
            selected={variation.id === selectedVariationId}
            onClick={() => onSelectVariation(variation.id)}
          />
        ))}
      </div>

      {selectedVariation && (
        <DetailView key={selectedVariation.id} variation={selectedVariation} />
      )}
    </div>
  );
}
