export function normalizeName(value: string): string {
  return value
    .toUpperCase()
    .replace(/\([^)]*\)/g, " ")
    .replace(/[^A-Z0-9]+/g, " ")
    .replace(/\bGARDENS\b/g, " ")
    .replace(/\bRACECOURSE\b/g, " ")
    .replace(/\bPARK\b/g, " ")
    .replace(/\bTHE\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function parseRaceNumber(value?: string): number | undefined {
  if (!value) return undefined;

  const match = value.match(/\bR(?:ACE)?\s*0*(\d+)\b/i);
  if (match) {
    return Number(match[1]);
  }

  const parsed = Number(value);
  if (Number.isFinite(parsed) && parsed > 0) {
    return parsed;
  }

  return undefined;
}

export function combineDateAndTime(
  date: string,
  timeValue?: string,
  fallbackMinutes = 0
): string {
  if (timeValue) {
    const raw = timeValue.trim();
    const parsed = new Date(raw);

    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString();
    }

    const timeMatch = raw.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
    if (timeMatch) {
      const [, hour, minute, second = "00"] = timeMatch;
      return new Date(`${date}T${hour.padStart(2, "0")}:${minute}:${second}+10:00`).toISOString();
    }
  }

  const fallback = new Date(`${date}T12:00:00+10:00`);
  fallback.setUTCMinutes(fallback.getUTCMinutes() + fallbackMinutes);
  return fallback.toISOString();
}
