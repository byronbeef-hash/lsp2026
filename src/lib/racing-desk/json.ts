export type JsonRecord = Record<string, unknown>;

export function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function asRecordArray(value: unknown): JsonRecord[] {
  if (!Array.isArray(value)) return [];
  return value.filter(isRecord);
}

export function toRecord(value: unknown): JsonRecord | null {
  return isRecord(value) ? value : null;
}

export function pickString(
  record: JsonRecord,
  keys: string[]
): string | undefined {
  for (const key of keys) {
    const value = record[key];

    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }

    if (typeof value === "number") {
      return String(value);
    }
  }

  return undefined;
}

export function pickNumber(
  record: JsonRecord,
  keys: string[]
): number | undefined {
  for (const key of keys) {
    const value = record[key];

    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === "string") {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }

  return undefined;
}

export function pickBoolean(
  record: JsonRecord,
  keys: string[]
): boolean | undefined {
  for (const key of keys) {
    const value = record[key];

    if (typeof value === "boolean") {
      return value;
    }

    if (typeof value === "string") {
      const normalized = value.trim().toLowerCase();
      if (normalized === "true") return true;
      if (normalized === "false") return false;
    }
  }

  return undefined;
}

export function extractRecordArrays(
  payload: unknown,
  preferredKeys: string[] = []
): JsonRecord[][] {
  if (Array.isArray(payload)) {
    const records = asRecordArray(payload);
    return records.length > 0 ? [records] : [];
  }

  const root = toRecord(payload);
  if (!root) return [];

  const arrays: JsonRecord[][] = [];
  const seen = new Set<string>();

  for (const key of preferredKeys) {
    const records = asRecordArray(root[key]);
    if (records.length > 0) {
      arrays.push(records);
      seen.add(key);
    }
  }

  for (const [key, value] of Object.entries(root)) {
    if (seen.has(key)) continue;

    const records = asRecordArray(value);
    if (records.length > 0) {
      arrays.push(records);
      continue;
    }

    const nested = toRecord(value);
    if (!nested) continue;

    for (const nestedValue of Object.values(nested)) {
      const nestedRecords = asRecordArray(nestedValue);
      if (nestedRecords.length > 0) {
        arrays.push(nestedRecords);
      }
    }
  }

  return arrays;
}

export function parseDateLike(value: unknown): string | undefined {
  if (typeof value === "number" && Number.isFinite(value)) {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) {
      return date.toISOString();
    }
  }

  if (typeof value === "string" && value.trim()) {
    const trimmed = value.trim();
    const parsed = new Date(trimmed);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString();
    }
  }

  return undefined;
}
