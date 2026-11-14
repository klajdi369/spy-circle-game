import { safeGetJSON, safeSetJSON, safeRemoveItem } from './safeStorage';

/** Words left in the current shuffle-bag cycle, in draw order. */
export interface WordDeck {
  remaining: string[];
  drawn: string[];
  lastKey: string | null;
}

export interface SpyCounts {
  [identity: string]: number;
}

interface RoundHistory {
  version: number;
  wordDeck: WordDeck;
  spyCounts: SpyCounts;
}

const STORAGE_KEY = 'spy-circle-round-history';
const VERSION = 1;

function emptyWordDeck(): WordDeck {
  return { remaining: [], drawn: [], lastKey: null };
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

/**
 * Validate stored data defensively: localStorage can survive app updates and
 * may contain a broken or old shape.
 */
function isRoundHistory(value: unknown): value is RoundHistory {
  if (!value || typeof value !== 'object') return false;
  const history = value as Record<string, unknown>;
  if (history.version !== VERSION) return false;

  const deck = history.wordDeck;
  if (!deck || typeof deck !== 'object') return false;
  const wordDeck = deck as Record<string, unknown>;
  if (!isStringArray(wordDeck.remaining)) return false;
  if (!isStringArray(wordDeck.drawn)) return false;
  if (wordDeck.lastKey !== null && typeof wordDeck.lastKey !== 'string') return false;

  const counts = history.spyCounts;
  if (!counts || typeof counts !== 'object' || Array.isArray(counts)) return false;
  return Object.values(counts).every(
    (count) => typeof count === 'number' && Number.isFinite(count) && count >= 0,
  );
}

function emptyHistory(): RoundHistory {
  return { version: VERSION, wordDeck: emptyWordDeck(), spyCounts: {} };
}

function loadRoundHistory(): RoundHistory {
  const stored = safeGetJSON<unknown>(STORAGE_KEY, null);
  return isRoundHistory(stored) ? stored : emptyHistory();
}

function saveRoundHistory(history: RoundHistory): void {
  safeSetJSON(STORAGE_KEY, history);
}

/** Read the word bag. */
export function loadWordDeck(): WordDeck {
  return loadRoundHistory().wordDeck;
}

/** Persist the word bag without touching spy counts. */
export function saveWordDeck(deck: WordDeck): void {
  const history = loadRoundHistory();
  history.wordDeck = deck;
  saveRoundHistory(history);
}

/** Read how many times each player identity has been a spy. */
export function loadSpyCounts(): SpyCounts {
  return loadRoundHistory().spyCounts;
}

/** Persist spy counts without touching the word bag. */
export function saveSpyCounts(counts: SpyCounts): void {
  const history = loadRoundHistory();
  history.spyCounts = counts;
  saveRoundHistory(history);
}

/** Clear all fairness history (used by "Reset all data"). */
export function resetRoundHistory(): void {
  safeRemoveItem(STORAGE_KEY);
}
