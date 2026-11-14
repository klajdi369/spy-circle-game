import { loadSpyCounts, saveSpyCounts } from '../storage/roundHistory';
import { randomInt } from './random';

/**
 * Build a stable identity for every seat.
 *
 * Names are normalized so the same person is recognized across sessions and
 * changes to the player count. Duplicate names get a seat suffix so two
 * players called "Alex" still rotate independently. The "p:" prefix keeps
 * names such as "__proto__" from colliding with object prototype keys.
 */
function playerIdentities(names: string[]): string[] {
  const seen = new Map<string, number>();
  return names.map((name, index) => {
    const base = `p:${name.trim().toLowerCase() || `player ${index + 1}`}`;
    const occurrences = seen.get(base) ?? 0;
    seen.set(base, occurrences + 1);
    return occurrences === 0 ? base : `${base}#${occurrences + 1}`;
  });
}

/** Cap how far behind a player can fall before their advantage stops growing. */
const MAX_DEFICIT = 4;

/**
 * Players who have had fewer spy turns get a higher weight, but nobody is
 * ever guaranteed or excluded. The strong curve keeps counts close over time
 * while leaving a small chance that a recent spy repeats, so the role cannot
 * be predicted from the previous round.
 */
function spyWeight(count: number, maxCount: number): number {
  const deficit = Math.min(Math.max(maxCount - count, 0), MAX_DEFICIT);
  return (deficit + 1) ** 4;
}

/** Weighted pick without replacement. */
function pickWeightedIndex(available: number[], weights: number[]): number {
  const total = weights.reduce((sum, weight) => sum + weight, 0);
  let roll = randomInt(0, total);

  for (let i = 0; i < available.length; i++) {
    roll -= weights[i];
    if (roll < 0) return i;
  }
  return available.length - 1;
}

/**
 * Pick spies with a weighted preference for players who have had fewer turns,
 * randomising the rest. Counts are persisted, so roles are spread across
 * everyone who has played, not just within the current sitting — but the next
 * spy is still genuinely uncertain.
 */
export function pickBalancedSpies(names: string[], spyCount: number): number[] {
  if (names.length === 0 || spyCount <= 0) return [];

  const counts = loadSpyCounts();
  const identities = playerIdentities(names);
  const maxCount = Math.max(...identities.map((identity) => counts[identity] ?? 0));

  const available = identities.map((_, index) => index);
  const chosen: number[] = [];
  const count = Math.min(spyCount, identities.length);

  for (let i = 0; i < count; i++) {
    const weights = available.map((index) =>
      spyWeight(counts[identities[index]] ?? 0, maxCount),
    );
    const pickedIndex = pickWeightedIndex(available, weights);
    chosen.push(available[pickedIndex]);
    available.splice(pickedIndex, 1);
  }

  for (const index of chosen) {
    const identity = identities[index];
    counts[identity] = (counts[identity] ?? 0) + 1;
  }
  saveSpyCounts(counts);

  return chosen.sort((a, b) => a - b);
}
