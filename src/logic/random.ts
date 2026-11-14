/**
 * Generate a UUID. Falls back to a Crypto-API-based random string when
 * crypto.randomUUID is unavailable (non-secure contexts like http://LAN-IP).
 */
export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  bytes[6] = (bytes[6] & 0x0f) | 0x40; // version 4
  bytes[8] = (bytes[8] & 0x3f) | 0x80; // variant 10
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

/**
 * Cryptographically secure random integer in [min, max).
 */
export function randomInt(min: number, max: number): number {
  const range = max - min;
  const maxSafe = Math.floor(2 ** 32 / range) * range;
  const array = new Uint32Array(1);
  let value: number;
  do {
    crypto.getRandomValues(array);
    value = array[0];
  } while (value >= maxSafe);
  return min + (value % range);
}

/**
 * Fisher-Yates shuffle using Crypto API.
 */
export function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = randomInt(0, i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Pick N unique random indices from 0 to total-1.
 * Returns sorted indices.
 */
export function pickRandomIndices(total: number, count: number): number[] {
  if (count > total) count = total;
  if (count <= 0) return [];
  const indices = Array.from({ length: total }, (_, i) => i);
  const shuffled = shuffle(indices);
  return shuffled.slice(0, count).sort((a, b) => a - b);
}

/**
 * Pick one random item from an array.
 */
export function pickRandom<T>(items: T[]): T | undefined {
  if (items.length === 0) return undefined;
  return items[randomInt(0, items.length)];
}
