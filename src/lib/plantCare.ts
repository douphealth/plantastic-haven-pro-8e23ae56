import { supabase } from "@/integrations/supabase/client";

export const WATER_INTERVALS = [4, 7, 10, 14, 21] as const;

export function clampWaterInterval(value: unknown): number {
  const days = typeof value === "number" ? value : Number(value);
  if (!Number.isInteger(days) || days < 1 || days > 60) return 7;
  return days;
}

export function nextWaterIso(intervalDays: number, from = new Date()): string {
  const days = clampWaterInterval(intervalDays);
  return new Date(from.getTime() + days * 86_400_000).toISOString();
}

type PlantWrite = {
  user_id: string;
  nickname: string;
  location: string;
  room: string | null;
  notes: string | null;
  health_score: number;
  last_watered: string;
  next_water_date: string;
  water_interval_days?: number;
};

export async function insertGardenPlant(input: {
  userId: string;
  nickname: string;
  location: string;
  room?: string;
  notes?: string;
  waterIntervalDays: number;
}) {
  const interval = clampWaterInterval(input.waterIntervalDays);
  const payload: PlantWrite = {
    user_id: input.userId,
    nickname: input.nickname,
    location: input.location,
    room: input.room || null,
    notes: input.notes || null,
    health_score: 100,
    last_watered: new Date().toISOString(),
    next_water_date: nextWaterIso(interval),
    water_interval_days: interval,
  };

  const first = await supabase.from("user_plants").insert(payload);
  if (!first.error) return first;

  const { water_interval_days: _ignored, ...withoutInterval } = payload;
  return supabase.from("user_plants").insert(withoutInterval);
}

export async function recordWatering(plantId: string, intervalDays: number) {
  const interval = clampWaterInterval(intervalDays);
  const rpc = await supabase.rpc("record_plant_care", {
    target_plant: plantId,
    interval_days: interval,
  });

  if (!rpc.error) return { error: null };

  const withInterval = await supabase
    .from("user_plants")
    .update({
      last_watered: new Date().toISOString(),
      next_water_date: nextWaterIso(interval),
      water_interval_days: interval,
    })
    .eq("id", plantId);

  if (!withInterval.error) return withInterval;

  return supabase
    .from("user_plants")
    .update({
      last_watered: new Date().toISOString(),
      next_water_date: nextWaterIso(7),
    })
    .eq("id", plantId);
}
