const GAME_URL = "https://www.sanriodle.net";

export function getSharePuzzleLabel(dateKey: string): string {
  return `Sanriodle ${dateKey}`;
}

function stateToEmoji(state: "exact" | "near" | "wrong"): string {
  if (state === "exact") return "🟩";
  if (state === "near") return "🟨";
  return "🟥";
}

export function buildShareText({
  dateKey,
  solvedIn,
  resultRows,
}: {
  dateKey: string;
  solvedIn: number;
  resultRows: Array<{
    gender: "exact" | "near" | "wrong";
    species: "exact" | "near" | "wrong";
    primaryColor: "exact" | "near" | "wrong";
    secondaryColor: "exact" | "near" | "wrong";
    franchiseGroup: "exact" | "near" | "wrong";
  }>;
}): string {
  const rows = resultRows.map((row) =>
    [
      stateToEmoji(row.gender),
      stateToEmoji(row.species),
      stateToEmoji(row.primaryColor),
      stateToEmoji(row.secondaryColor),
      stateToEmoji(row.franchiseGroup),
    ].join("")
  );

  return [
    getSharePuzzleLabel(dateKey),
    `Solved in ${solvedIn}/8 guesses 💚`,
    "",
    ...rows,
    "",
    GAME_URL,
  ].join("\n");
}

export async function copyResultsToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export async function tryNativeShare(text: string): Promise<boolean> {
  if (!navigator.share) return false;
  try {
    await navigator.share({
      title: "Sanriodle",
      text,
      url: GAME_URL,
    });
    return true;
  } catch {
    return false;
  }
}
