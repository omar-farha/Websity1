export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function addDaysISO(days: number, from: string = todayISO()): string {
  const d = new Date(from + "T00:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function isPastDue(
  dateISO: string | null,
  referenceISO: string = todayISO()
): boolean {
  if (!dateISO) return false;
  return dateISO < referenceISO;
}

export function isDueSoon(
  dateISO: string | null,
  withinDays = 3,
  referenceISO: string = todayISO()
): boolean {
  if (!dateISO) return false;
  if (dateISO < referenceISO) return false;
  return dateISO <= addDaysISO(withinDays, referenceISO);
}

export function formatDate(dateISO: string | null): string | null {
  if (!dateISO) return null;
  return new Date(dateISO + "T00:00:00").toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function startOfWeekISO(referenceISO: string = todayISO()): string {
  const d = new Date(referenceISO + "T00:00:00");
  d.setDate(d.getDate() - d.getDay());
  return d.toISOString().slice(0, 10);
}

export function startOfMonthISO(
  monthsAgo = 0,
  referenceISO: string = todayISO()
): string {
  const d = new Date(referenceISO + "T00:00:00");
  d.setDate(1);
  d.setMonth(d.getMonth() - monthsAgo);
  return d.toISOString().slice(0, 10);
}

export function startOfYearISO(referenceISO: string = todayISO()): string {
  const d = new Date(referenceISO + "T00:00:00");
  d.setMonth(0, 1);
  return d.toISOString().slice(0, 10);
}

export function monthLabel(
  monthsAgo: number,
  referenceISO: string = todayISO()
): string {
  const d = new Date(referenceISO + "T00:00:00");
  d.setDate(1);
  d.setMonth(d.getMonth() - monthsAgo);
  return d.toLocaleDateString(undefined, { month: "short", year: "2-digit" });
}
