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
