import { useState } from "react";
import { Panel } from "../../components/ui/Panel";
import { getCategoryById, getVariationById } from "../../sections/catalog";
import { CatalogView } from "./components/CatalogView";
import { SectionBreadcrumb } from "./components/SectionBreadcrumb";
import { VariationsView } from "./components/VariationsView";

type SectionView = { level: "catalog" } | { level: "variations"; categoryId: string };

export function SectionShowcase() {
	const [view, setView] = useState<SectionView>({ level: "catalog" });
	const [selectedVariationId, setSelectedVariationId] = useState<string>();

	const category = view.level === "variations" ? getCategoryById(view.categoryId) : undefined;

	const variation =
		view.level === "variations" && selectedVariationId && category
			? getVariationById(category.id, selectedVariationId)
			: undefined;

	function navigateToCatalog() {
		setView({ level: "catalog" });
		setSelectedVariationId(undefined);
	}

	function navigateToCategory() {
		setSelectedVariationId(undefined);
	}

	const panelDescription =
		view.level === "catalog"
			? "Quatorze entradas no catálogo. Cada seção com três variações."
			: variation
				? "Preview da variação selecionada. Troque o tema para ver as cores reagirem."
				: `Escolha uma variação de ${category?.name ?? "seção"}.`;

	return (
		<Panel title="Seções" description={panelDescription}>
			{view.level !== "catalog" && (
				<SectionBreadcrumb
					category={category}
					variation={variation}
					onNavigateCatalog={navigateToCatalog}
					onNavigateCategory={variation ? navigateToCategory : undefined}
				/>
			)}

			{view.level === "catalog" && (
				<CatalogView
					onSelectCategory={(categoryId) => {
						setView({ level: "variations", categoryId });
						setSelectedVariationId(undefined);
					}}
				/>
			)}

			{view.level === "variations" && category && (
				<VariationsView
					category={category}
					selectedVariationId={selectedVariationId}
					onSelectVariation={setSelectedVariationId}
				/>
			)}
		</Panel>
	);
}
