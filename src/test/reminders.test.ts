import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import {
  daysOverdue,
  isOverdue,
  markNotified,
  overduePlants,
  plantsToNotify,
} from "@/lib/reminders";
import { matchCatalogPlant } from "@/lib/plantCatalog";

const now = new Date("2026-11-09T12:00:00.000Z");

describe("watering reminders", () => {
  it("lists only plants whose next water date has passed", () => {
    const plants = [
      { id: "a", nickname: "Monty", next_water_date: "2026-11-08T12:00:00.000Z" },
      { id: "b", nickname: "Due now", next_water_date: "2026-11-09T12:00:00.000Z" },
      { id: "c", nickname: "Later", next_water_date: "2026-11-12T12:00:00.000Z" },
      { id: "d", nickname: "Unscheduled", next_water_date: null },
    ];
    expect(overduePlants(plants, now).map((plant) => plant.id)).toEqual(["a", "b"]);
    expect(isOverdue(null, now)).toBe(false);
    expect(daysOverdue("2026-11-07T12:00:00.000Z", now)).toBe(2);
  });

  it("notifies each overdue plant once per local day", () => {
    const plants = [
      { id: "a", nickname: "Monty", next_water_date: "2026-11-01T12:00:00.000Z" },
    ];
    const first = plantsToNotify(plants, {}, now);
    expect(first).toHaveLength(1);
    const sent = markNotified({}, first, now);
    expect(plantsToNotify(plants, sent, now)).toHaveLength(0);
  });
});

describe("catalog matching", () => {
  const catalog = [
    {
      id: "1",
      name: "Swiss cheese plant",
      scientific_name: "Monstera deliciosa",
      common_names: ["Ceriman"],
      light_needs: "Bright indirect",
      water_frequency_days: null,
      water_guidance: null,
      care_source: null,
      toxicity_pets: true,
      toxicity_children: true,
      humidity: null,
      description: null,
      care_difficulty: "moderate",
    },
  ];

  it("matches a scientific name before a loose common name", () => {
    expect(
      matchCatalogPlant(catalog, {
        name: "Something else",
        scientific_name: "Monstera deliciosa",
      })?.id
    ).toBe("1");
    expect(matchCatalogPlant(catalog, { name: "Ceriman" })?.id).toBe("1");
    expect(matchCatalogPlant(catalog, { name: "Monstera" })).toBeNull();
  });
});

describe("plant catalog seed", () => {
  const sql = readFileSync(
    "supabase/migrations/20261109213000_plant_catalog_seed.sql",
    "utf8"
  );

  it("cites the extension source for every seeded species and does not invent a day count", () => {
    for (const name of [
      "Monstera deliciosa",
      "Dracaena trifasciata",
      "Ficus lyrata",
      "Epipremnum aureum",
      "Zamioculcas zamiifolia",
      "Aloe vera",
      "Spathiphyllum",
      "Goeppertia makoyana",
      "Chlorophytum comosum",
      "Nephrolepis exaltata",
      "Ficus elastica",
      "Crassula ovata",
    ]) {
      expect(sql).toContain(name);
    }
    expect(sql.match(/plants\.ces\.ncsu\.edu/g)?.length).toBe(12);
    expect(sql).toContain("14");
    expect(sql).toContain("twice monthly");
    expect(sql).toContain("No day count is published");
  });
});
