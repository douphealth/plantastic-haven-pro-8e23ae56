import { beforeEach, describe, expect, it } from "vitest";
import { db, exportLocalData, importLocalData, localUserId } from "@/lib/localDb";
import { saveLicense, clearLicense } from "@/lib/proAccess";

describe("on-device Pro workspace store", () => {
  beforeEach(() => localStorage.clear());

  it("inserts, filters, orders, updates and deletes garden rows", async () => {
    const owner = localUserId();
    const first = await db.from("user_plants").insert({ user_id: owner, nickname: "Fern", next_water_date: "2026-12-05" }).select("id");
    await db.from("user_plants").insert({ user_id: owner, nickname: "Aloe", next_water_date: "2026-12-01" });
    await db.from("user_plants").insert({ user_id: "someone-else", nickname: "Other" });

    const mine = await db.from("user_plants").select("*").eq("user_id", owner).order("next_water_date", { ascending: true });
    expect(mine.data.map((row: { nickname: string }) => row.nickname)).toEqual(["Aloe", "Fern"]);

    const id = first.data[0].id;
    await db.from("user_plants").update({ health_score: 80 }).eq("id", id);
    const one = await db.from("user_plants").select("*").eq("id", id).single();
    expect(one.data.health_score).toBe(80);

    await db.from("user_plants").delete().eq("id", id);
    const gone = await db.from("user_plants").select("*").eq("id", id).maybeSingle();
    expect(gone.data).toBeNull();
  });

  it("joins the bundled catalog and refuses to edit it", async () => {
    const owner = localUserId();
    const catalog = await db.from("plants").select("*");
    expect(catalog.data).toHaveLength(12);
    const zz = catalog.data.find((plant: { name: string }) => plant.name === "ZZ plant");
    const added = await db.from("user_plants").insert({ user_id: owner, nickname: "Zed", plant_id: zz.id }).select("id");
    const joined = await db.from("user_plants").select("*, plants(*)").eq("id", added.data[0].id).single();
    expect(joined.data.plants.water_frequency_days).toBe(14);
    const write = await db.from("plants").insert({ name: "Fake" });
    expect(write.error).not.toBeNull();
  });

  it("derives the Pro tier only from a stored license", async () => {
    const owner = localUserId();
    let profile = await db.from("profiles").select("subscription_tier").eq("user_id", owner).maybeSingle();
    expect(profile.data.subscription_tier).toBe("free");
    // A client cannot promote itself by writing the profile.
    await db.from("profiles").update({ subscription_tier: "pro", display_name: "Sam" }).eq("user_id", owner);
    profile = await db.from("profiles").select("*").eq("user_id", owner).maybeSingle();
    expect(profile.data.subscription_tier).toBe("free");
    expect(profile.data.display_name).toBe("Sam");
    saveLicense("signed.token", "sam@example.com");
    profile = await db.from("profiles").select("*").eq("user_id", owner).maybeSingle();
    expect(profile.data.subscription_tier).toBe("pro");
    clearLicense();
  });

  it("upserts lesson progress on the conflict key", async () => {
    const owner = localUserId();
    const row = { user_id: owner, course_id: "c1", lesson_index: 0 };
    await db.from("lesson_progress").upsert(row, { onConflict: "user_id,course_id,lesson_index" });
    await db.from("lesson_progress").upsert(row, { onConflict: "user_id,course_id,lesson_index" });
    const rows = await db.from("lesson_progress").select("*").eq("user_id", owner);
    expect(rows.data).toHaveLength(1);
  });

  it("exports and re-imports a backup under this device's id", async () => {
    await db.from("user_plants").insert({ user_id: "old-device", nickname: "Moved" });
    const backup = exportLocalData();
    localStorage.clear();
    expect(importLocalData(backup)).toBeGreaterThan(0);
    const rows = await db.from("user_plants").select("*").eq("user_id", localUserId());
    expect(rows.data.map((row: { nickname: string }) => row.nickname)).toEqual(["Moved"]);
    expect(() => importLocalData({ app: "other" })).toThrow();
  });
});
