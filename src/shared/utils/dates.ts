import type { Weekday } from "../../domain/model/types";

export function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function todayKey(): string {
  return toDateKey(new Date());
}

export function parseDateKey(key: string): Date {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function displayDate(key: string): string {
  return parseDateKey(key).toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric"
  });
}

export function weekdayFor(key: string): Weekday {
  return parseDateKey(key).getDay() as Weekday;
}

export function startOfWeek(date = new Date()): Date {
  const copy = new Date(date);
  const diff = (copy.getDay() + 6) % 7;
  copy.setDate(copy.getDate() - diff);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

export function weekKeys(date = new Date()): string[] {
  const start = startOfWeek(date);
  return Array.from({ length: 7 }, (_, index) => {
    const copy = new Date(start);
    copy.setDate(start.getDate() + index);
    return toDateKey(copy);
  });
}

export function offsetDateKey(key: string, days: number): string {
  const date = parseDateKey(key);
  date.setDate(date.getDate() + days);
  return toDateKey(date);
}

export function formatBreakdownLabel(selectedDate: string, today: string): string {
  const offset = Math.round(
    (parseDateKey(selectedDate).getTime() - parseDateKey(today).getTime()) / 86400000
  );

  if (offset === 0) return "TODAY'S BREAKDOWN";
  if (offset === -1) return "YESTERDAY'S BREAKDOWN";
  if (offset === 1) return "TOMORROW'S BREAKDOWN";

  return `${parseDateKey(selectedDate).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric"
  }).toUpperCase()} BREAKDOWN`;
}
