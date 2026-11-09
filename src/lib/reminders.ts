export type ReminderPlant = {
  id: string;
  nickname: string;
  next_water_date: string | null;
};

export const REMINDER_PREFERENCE_KEY = "plantastichaven_browser_reminders";
export const REMINDER_SENT_KEY = "plantastichaven_reminder_sent";

export function isOverdue(nextWaterDate: string | null | undefined, now = new Date()): boolean {
  if (!nextWaterDate) return false;
  const due = new Date(nextWaterDate);
  if (Number.isNaN(due.getTime())) return false;
  return due.getTime() <= now.getTime();
}

export function overduePlants<T extends ReminderPlant>(plants: T[], now = new Date()): T[] {
  return plants
    .filter((plant) => isOverdue(plant.next_water_date, now))
    .sort((a, b) => {
      const left = new Date(a.next_water_date || 0).getTime();
      const right = new Date(b.next_water_date || 0).getTime();
      return left - right;
    });
}

export function daysOverdue(nextWaterDate: string, now = new Date()): number {
  const due = new Date(nextWaterDate).getTime();
  return Math.max(0, Math.floor((now.getTime() - due) / 86_400_000));
}

export function localDayKey(now = new Date()): string {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function reminderBody(plants: ReminderPlant[]): string {
  const names = plants.map((plant) => plant.nickname).filter(Boolean);
  if (names.length === 0) return "A plant is due for water.";
  if (names.length === 1) return `${names[0]} is due for water.`;
  return `${names.slice(0, 3).join(", ")}${names.length > 3 ? ` and ${names.length - 3} more` : ""} are due for water.`;
}

export function plantsToNotify(
  plants: ReminderPlant[],
  alreadySent: Record<string, string>,
  now = new Date()
): ReminderPlant[] {
  const day = localDayKey(now);
  return overduePlants(plants, now).filter((plant) => alreadySent[plant.id] !== day);
}

export function markNotified(
  alreadySent: Record<string, string>,
  plants: ReminderPlant[],
  now = new Date()
): Record<string, string> {
  const day = localDayKey(now);
  const next = { ...alreadySent };
  for (const plant of plants) next[plant.id] = day;
  return next;
}
