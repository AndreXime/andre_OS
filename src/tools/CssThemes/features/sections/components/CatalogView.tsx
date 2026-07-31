import { SECTION_CATEGORIES } from "../../../sections/catalog";
import { NavCard } from "./NavCard";

export function CatalogView({ onSelectCategory }: { onSelectCategory: (id: string) => void }) {
	return (
		<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
			{SECTION_CATEGORIES.map((category) => (
				<NavCard
					key={category.id}
					meta={`${category.variations.length} variações`}
					title={category.name}
					description={category.description}
					onClick={() => onSelectCategory(category.id)}
				/>
			))}
		</div>
	);
}
