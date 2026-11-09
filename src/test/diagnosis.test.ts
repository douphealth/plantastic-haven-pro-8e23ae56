import { describe, expect, it } from "vitest";
import { buildCarePlan, normalizeCarePlan } from "@/lib/diagnosis";
import { clampWaterInterval, nextWaterIso } from "@/lib/plantCare";

const answers = {
  plantName: "Monstera Deliciosa",
  mainProblem: "Wilting or drooping leaves",
  lightLevel: "Bright indirect",
  wateringFrequency: "Once a week (regularly)",
  potDrainage: "Has drainage holes",
  soilMoisture: "Always soggy, wet, or muddy",
  experienceLevel: "Complete Beginner",
};

describe("care plan diagnosis", () => {
  it("puts today's action on the field the care plan renders", () => {
    const plan = buildCarePlan(answers);
    expect(plan.title).toContain("Overwatering");
    expect(plan.whatToDoToday.length).toBeGreaterThan(20);
    expect(plan).not.toHaveProperty("whatToday");
    expect(plan.suggestedWaterIntervalDays).toBe(14);
  });

  it("treats wet soil under a dry crust as overwatering", () => {
    const plan = buildCarePlan({
      ...answers,
      mainProblem: "Yellowing leaves",
      soilMoisture: "Crusty/dry on top but wet/damp deep below",
      lightLevel: "Bright indirect",
    });
    expect(plan.title).toContain("Overwatering");
  });

  it("keeps underwatering when the soil is dry", () => {
    const plan = buildCarePlan({
      ...answers,
      soilMoisture: "Bone dry all the way down",
    });
    expect(plan.title).toContain("Underwatering");
    expect(plan.whatToDoToday).toMatch(/bottom watering/i);
  });

  it("repairs care plans saved before the field rename", () => {
    const plan = normalizeCarePlan({
      plantName: "Pothos",
      rescueDays: ["Check the soil"],
      whatToday: "Empty the saucer.",
    });
    expect(plan?.whatToDoToday).toBe("Empty the saucer.");
  });
});

describe("watering intervals", () => {
  it("rejects intervals outside 1 to 60 days", () => {
    expect(clampWaterInterval(0)).toBe(7);
    expect(clampWaterInterval(14)).toBe(14);
    expect(clampWaterInterval(90)).toBe(7);
  });

  it("schedules the next watering from the chosen interval", () => {
    const from = new Date("2026-11-09T00:00:00.000Z");
    expect(nextWaterIso(10, from)).toBe("2026-11-19T00:00:00.000Z");
  });
});
