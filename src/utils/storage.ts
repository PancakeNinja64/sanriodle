export type DailyGameStatus = "playing" | "won" | "lost";

export type DailyGameStorage = {
  dateKey: string;
  guessedCharacterIds: string[];
  status: DailyGameStatus;
};

const STORAGE_KEY = "sanriodle.daily.classic.v1";

export function loadDailyGameStorage(): DailyGameStorage | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (
      typeof parsed?.dateKey === "string" &&
      Array.isArray(parsed?.guessedCharacterIds) &&
      typeof parsed?.status === "string"
    ) {
      return {
        dateKey: parsed.dateKey,
        guessedCharacterIds: parsed.guessedCharacterIds.filter((id: unknown) => typeof id === "string"),
        status: parsed.status,
      };
    }
    return null;
  } catch {
    return null;
  }
}

export function saveDailyGameStorage(state: DailyGameStorage): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
