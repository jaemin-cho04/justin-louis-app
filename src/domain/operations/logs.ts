import type { AppData } from "../model/types";

export function clearLogData(current: AppData, itemId: string, date: string): AppData {
  return {
    ...current,
    logs: current.logs.filter((entry) => !(entry.itemId === itemId && entry.date === date))
  };
}
