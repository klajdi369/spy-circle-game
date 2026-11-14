import type { Category } from '../types/words';
import { pickRandom, randomInt, shuffle } from './random';
import { loadWordDeck, saveWordDeck } from '../storage/roundHistory';

export interface WordChoice {
  category: Category;
  word: string;
}

/** Build one flat pool where every enabled word entry has equal weight. */
export function buildWordPool(categories: Category[]): WordChoice[] {
  return categories.filter((category) => category.enabled).flatMap((category) =>
    category.words
      .filter((word) => word.trim().length > 0)
      .map((word) => ({ category, word })),
  );
}

/** Independently select one word, with replacement between rounds. */
export function pickRandomWord(categories: Category[]): WordChoice | undefined {
  return pickRandom(buildWordPool(categories));
}

interface PoolEntry {
  choice: WordChoice;
  key: string;
}

/**
 * Collapse the pool to one entry per unique word (case-insensitive). A word
 * listed in more than one category still only appears once per cycle.
 */
function buildPoolEntries(categories: Category[]): PoolEntry[] {
  const entries: PoolEntry[] = [];
  const seen = new Set<string>();
  for (const choice of buildWordPool(categories)) {
    const key = choice.word.trim().toLowerCase();
    if (key.length === 0 || seen.has(key)) continue;
    seen.add(key);
    entries.push({ choice, key });
  }
  return entries;
}

export interface DrawWordOptions {
  /**
   * Chance (0-1) to pull a word from outside the bag when the cycle is nearly
   * exhausted. This keeps the last few words from being deducible.
   */
  wildcardChance?: number;
  /** Test seam: source of random numbers in [0, 1). */
  random?: () => number;
}

/** Start adding surprises once this many words (or fewer) remain in the bag. */
const WILDCARD_THRESHOLD = 3;
const DEFAULT_WILDCARD_CHANCE = 0.3;

/**
 * Draw the next word from a persistent shuffle bag.
 *
 * Every enabled word is drawn exactly once per cycle. The bag survives app
 * restarts, so "Play Again" and new sessions continue the same cycle instead
 * of starting from fresh randomness. Words added to the library join the
 * current cycle; removed words simply drop out.
 *
 * Near the end of a cycle there is a small chance of drawing a wildcard from
 * the whole pool instead. That occasional repeat is deliberate: without it,
 * players who remember the used words could predict the final few words.
 */
export function drawWord(
  categories: Category[],
  options: DrawWordOptions = {},
): WordChoice | undefined {
  const entries = buildPoolEntries(categories);
  if (entries.length === 0) return undefined;

  const byKey = new Map(entries.map(({ choice, key }) => [key, choice]));
  const poolKeys = entries.map(({ key }) => key);
  const poolKeySet = new Set(poolKeys);
  const deck = loadWordDeck();
  const wildcardChance = options.wildcardChance ?? DEFAULT_WILDCARD_CHANCE;
  const random = options.random ?? (() => randomInt(0, 1_000_000) / 1_000_000);

  // Keep only words that still exist, and de-duplicate defensively.
  const remaining = [...new Set(deck.remaining.filter((key) => poolKeySet.has(key)))];
  const drawn = [...new Set(deck.drawn.filter((key) => poolKeySet.has(key)))];
  const covered = new Set([...remaining, ...drawn]);

  // Newly added words join this cycle at a random position.
  for (const key of shuffle(poolKeys.filter((key) => !covered.has(key)))) {
    remaining.splice(randomInt(0, remaining.length + 1), 0, key);
  }

  const nearEnd = remaining.length <= WILDCARD_THRESHOLD;
  const useWildcard =
    poolKeys.length > 1 && nearEnd && random() < wildcardChance;

  let key: string;
  if (useWildcard) {
    // Pick from the whole pool, excluding the word that was just used so the
    // same word never appears twice back-to-back.
    const candidates = poolKeys.filter((poolKey) => poolKey !== deck.lastKey);
    const from = candidates.length > 0 ? candidates : poolKeys;
    const index = Math.min(from.length - 1, Math.floor(random() * from.length));
    key = from[index];
    const remainingIndex = remaining.indexOf(key);
    if (remainingIndex !== -1) remaining.splice(remainingIndex, 1);
  } else {
    if (remaining.length === 0) {
      // Start a new cycle. If the freshest word would come up first again,
      // swap it with another word so no word repeats back-to-back.
      remaining.push(...shuffle(poolKeys));
      if (remaining.length > 1 && remaining[0] === deck.lastKey) {
        const swapIndex = 1 + randomInt(0, remaining.length - 1);
        [remaining[0], remaining[swapIndex]] = [remaining[swapIndex], remaining[0]];
      }
      drawn.length = 0;
    }
    key = remaining.shift() as string;
  }

  drawn.push(key);
  saveWordDeck({ remaining, drawn, lastKey: key });
  return byKey.get(key);
}
