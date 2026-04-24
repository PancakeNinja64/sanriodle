export function getDateKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getNextMidnight(date = new Date()): Date {
  const next = new Date(date);
  next.setHours(24, 0, 0, 0);
  return next;
}

export function getSecondsUntilMidnight(date = new Date()): number {
  const msRemaining = getNextMidnight(date).getTime() - date.getTime();
  return Math.max(0, Math.floor(msRemaining / 1000));
}

function hashString(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash;
}

export function selectDailyCharacter<T extends { id: string }>(
  dateKey: string,
  dataset: T[]
): T {
  if (!dataset.length) {
    throw new Error("Character dataset is empty.");
  }
  const seed = hashString(dateKey);
  return dataset[seed % dataset.length];
}

export function formatCountdown(secondsRemaining: number): string {
  const hours = Math.floor(secondsRemaining / 3600);
  const minutes = Math.floor((secondsRemaining % 3600) / 60);
  const seconds = secondsRemaining % 60;
  return [hours, minutes, seconds].map((part) => String(part).padStart(2, "0")).join(":");
}
