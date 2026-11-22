export type CatalogPlant = {
  id: string;
  name: string;
  scientific_name: string | null;
  common_names: string[] | null;
  light_needs: string;
  water_frequency_days: number | null;
  water_guidance: string | null;
  care_source: string | null;
  toxicity_pets: boolean | null;
  toxicity_children: boolean | null;
  humidity: string | null;
  description: string | null;
  care_difficulty: string;
};

export function matchCatalogPlant(
  catalog: CatalogPlant[],
  candidate: { name?: string | null; scientific_name?: string | null }
): CatalogPlant | null {
  const scientific = candidate.scientific_name?.trim().toLowerCase();
  const name = candidate.name?.trim().toLowerCase();

  if (scientific) {
    const byScientific = catalog.find(
      (plant) => plant.scientific_name?.trim().toLowerCase() === scientific
    );
    if (byScientific) return byScientific;
  }

  if (!name) return null;

  return (
    catalog.find((plant) => plant.name.trim().toLowerCase() === name) ||
    catalog.find((plant) =>
      (plant.common_names || []).some((common) => common.trim().toLowerCase() === name)
    ) ||
    null
  );
}

export function toxicityLabel(plant: Pick<CatalogPlant, "toxicity_pets" | "toxicity_children">): string {
  const parts: string[] = [];
  if (plant.toxicity_pets) parts.push("listed as a problem for pets");
  if (plant.toxicity_children) parts.push("listed as poisonous to people");
  if (parts.length === 0) {
    return "The cited source does not list this plant as toxic to pets or people.";
  }
  return `The cited source marks this plant as ${parts.join(" and ")}.`;
}
