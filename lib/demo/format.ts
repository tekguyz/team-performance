import { zonedParts } from "@/lib/demo/time";

const two = (n: number) => String(n).padStart(2, "0");

/** "(305) 555-0142" shows as "(305) •••-0142", the same on screen and in the CSV. */
export function maskCustomer(customer: string): string {
  return customer.replace(/(\)\s)\d{3}(-\d{4})$/, "$1•••$2");
}

/** "2026-11-17 09:00" in Coral Line Support's time zone. */
export function formatDateTime(at: string): string {
  const p = zonedParts(Date.parse(at));
  return `${p.year}-${two(p.month)}-${two(p.day)} ${two(p.hour)}:${two(p.minute)}`;
}

/** Call length, "4:12". */
export function formatDuration(sec: number): string {
  return `${Math.floor(sec / 60)}:${two(sec % 60)}`;
}

/** Credited time, "3h 10m" or "45m". */
export function formatMinutes(min: number): string {
  if (min < 60) return `${min}m`;
  return `${Math.floor(min / 60)}h ${min % 60}m`;
}

/** "2:41 PM" in Coral Line Support's time zone. */
export function formatClock(at: string): string {
  const p = zonedParts(Date.parse(at));
  const h = p.hour % 12 === 0 ? 12 : p.hour % 12;
  return `${h}:${two(p.minute)} ${p.hour < 12 ? "AM" : "PM"}`;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** The clock time, with the date in front only when the call is not on `day` (YYYY-MM-DD). */
export function formatWhen(at: string, day: string): string {
  const p = zonedParts(Date.parse(at));
  const key = `${p.year}-${two(p.month)}-${two(p.day)}`;
  return key === day ? formatClock(at) : `${MONTHS[p.month - 1]} ${p.day}, ${formatClock(at)}`;
}
