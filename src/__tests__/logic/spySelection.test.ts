import { beforeEach, describe, expect, it } from 'vitest';
import { pickBalancedSpies } from '../../logic/spySelection';
import { saveSpyCounts } from '../../storage/roundHistory';

const NAMES = ['Alex', 'Blair', 'Casey', 'Drew'];

function countSelections(names: string[], games: number, spyCount = 1): Record<string, number> {
  const counts: Record<string, number> = Object.fromEntries(names.map((name) => [name, 0]));
  for (let game = 0; game < games; game++) {
    for (const index of pickBalancedSpies(names, spyCount)) {
      counts[names[index]] += 1;
    }
  }
  return counts;
}

describe('pickBalancedSpies', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('keeps spy turns close to equal over many rounds', () => {
    const counts = countSelections(NAMES, 400);
    const values = Object.values(counts);

    expect(Math.max(...values) - Math.min(...values)).toBeLessThanOrEqual(5);
  });

  it('does not strictly rotate, so the next spy is never certain', () => {
    let previous = -1;
    let immediateRepeats = 0;

    for (let game = 0; game < 300; game++) {
      const [index] = pickBalancedSpies(NAMES, 1);
      if (index === previous) immediateRepeats++;
      previous = index;
    }

    expect(immediateRepeats).toBeGreaterThan(0);
  });

  it('strongly favours players who have had fewer turns', () => {
    const picked: Record<string, number> = { Alex: 0, Blair: 0, Casey: 0, Drew: 0 };

    // A single pick from the same unfair state, repeated 1000 times.
    for (let trial = 0; trial < 1000; trial++) {
      localStorage.clear();
      saveSpyCounts({ 'p:alex': 4 });
      const [index] = pickBalancedSpies(NAMES, 1);
      picked[NAMES[index]] += 1;
    }

    expect(picked.Alex).toBeLessThanOrEqual(10);
    expect(picked.Blair).toBeGreaterThan(200);
    expect(picked.Casey).toBeGreaterThan(200);
    expect(picked.Drew).toBeGreaterThan(200);
  });

  it('balances multiple spies and never picks the same player twice in a round', () => {
    const totals: Record<string, number> = Object.fromEntries(
      NAMES.map((name) => [name, 0]),
    );

    for (let game = 0; game < 400; game++) {
      const indices = pickBalancedSpies(NAMES, 2);
      expect(new Set(indices).size).toBe(2);
      for (const index of indices) totals[NAMES[index]] += 1;
    }

    const values = Object.values(totals);
    expect(Math.max(...values) - Math.min(...values)).toBeLessThanOrEqual(5);
  });

  it('returns unique sorted indices and never more spies than players', () => {
    const indices = pickBalancedSpies(['One', 'Two', 'Three'], 10);

    expect(indices).toEqual([0, 1, 2]);
  });

  it('treats duplicate names as separate players', () => {
    const names = ['Alex', 'Alex'];
    let firstSeatPicks = 0;
    let secondSeatPicks = 0;

    for (let trial = 0; trial < 500; trial++) {
      localStorage.clear();
      saveSpyCounts({ 'p:alex': 4 });
      const [index] = pickBalancedSpies(names, 1);
      if (index === 0) firstSeatPicks++;
      else secondSeatPicks++;
    }

    expect(firstSeatPicks).toBeLessThanOrEqual(10);
    expect(secondSeatPicks).toBeGreaterThan(490);
  });

  it('returns no spies for a zero count or empty player list', () => {
    expect(pickBalancedSpies(NAMES, 0)).toEqual([]);
    expect(pickBalancedSpies([], 1)).toEqual([]);
  });
});
