import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Bell, Droplets } from "lucide-react";
import {
  REMINDER_PREFERENCE_KEY,
  REMINDER_SENT_KEY,
  daysOverdue,
  markNotified,
  overduePlants,
  plantsToNotify,
  reminderBody,
  type ReminderPlant,
} from "@/lib/reminders";

const readSent = () => {
  try {
    const raw = localStorage.getItem(REMINDER_SENT_KEY);
    return raw ? (JSON.parse(raw) as Record<string, string>) : {};
  } catch {
    return {};
  }
};

const WateringReminders = ({ plants }: { plants: ReminderPlant[] }) => {
  const due = overduePlants(plants);

  useEffect(() => {
    if (localStorage.getItem(REMINDER_PREFERENCE_KEY) !== "on") return;
    if (typeof Notification === "undefined" || Notification.permission !== "granted") return;
    const pending = plantsToNotify(plants, readSent());
    if (pending.length === 0) return;
    try {
      new Notification("Plants to water", { body: reminderBody(pending) });
      localStorage.setItem(REMINDER_SENT_KEY, JSON.stringify(markNotified(readSent(), pending)));
    } catch {
      // The in-app list remains the reliable reminder.
    }
  }, [plants]);

  if (due.length === 0) return null;

  return (
    <section className="rounded-2xl border border-bloom/30 bg-bloom/5 p-4 md:p-5">
      <div className="flex items-start gap-3">
        <Bell className="w-5 h-5 text-bloom mt-0.5 shrink-0" />
        <div className="min-w-0 flex-1">
          <h2 className="font-heading text-lg font-semibold text-foreground">Watering reminders</h2>
          <p className="text-sm text-muted-foreground mt-1">
            These are the plants whose saved next-water date has passed. They show up when you open the app.
            Browser notifications, if you turn them on in Settings, can also appear while this site is open.
            This app does not send email or phone push messages.
          </p>
          <ul className="mt-3 space-y-2">
            {due.map((plant) => (
              <li key={plant.id} className="flex items-center justify-between gap-3 text-sm">
                <Link to={`/plant/${plant.id}`} className="font-medium text-foreground hover:text-primary">
                  {plant.nickname}
                </Link>
                <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
                  <Droplets className="w-3.5 h-3.5" />
                  {plant.next_water_date ? `${daysOverdue(plant.next_water_date)}d overdue` : "Due"}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default WateringReminders;
