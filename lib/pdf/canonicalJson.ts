/**
 * Canonical JSON helpers (client-side)
 *
 * Must match pdf-service-puppeteer/src/security/canonical-json.ts.
 */

export type JsonValue =
  | null
  | boolean
  | number
  | string
  | JsonValue[]
  | { [key: string]: JsonValue };

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function canonicalizeJson(value: JsonValue): JsonValue {
  if (Array.isArray(value)) {
    return value.map((v) => canonicalizeJson(v as JsonValue));
  }
  if (isPlainObject(value)) {
    const keys = Object.keys(value).sort();
    const out: Record<string, JsonValue> = {};
    for (const key of keys) {
      out[key] = canonicalizeJson((value as Record<string, JsonValue>)[key] as JsonValue);
    }
    return out;
  }
  return value;
}

export function stringifyCanonicalJson(value: JsonValue): string {
  return JSON.stringify(canonicalizeJson(value));
}
