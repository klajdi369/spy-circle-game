import { describe, it, expect } from 'vitest';
import { pickRandomIndices, pickRandom, randomInt } from '../../logic/random';

describe('randomInt', () => {
  it('returns values in range', () => {
    for (let i = 0; i < 50; i++) {
      const val = randomInt(0, 10);
      expect(val).toBeGreaterThanOrEqual(0);
      expect(val).toBeLessThan(10);
    }
  });
});

describe('pickRandomIndices', () => {
  it('returns correct count', () => {
    const indices = pickRandomIndices(10, 3);
    expect(indices).toHaveLength(3);
  });

  it('returns unique values', () => {
    const indices = pickRandomIndices(20, 10);
    const unique = new Set(indices);
    expect(unique.size).toBe(10);
  });

  it('returns sorted values', () => {
    const indices = pickRandomIndices(10, 5);
    for (let i = 1; i < indices.length; i++) {
      expect(indices[i]).toBeGreaterThan(indices[i - 1]);
    }
  });

  it('returns all indices when count equals total', () => {
    const indices = pickRandomIndices(5, 5);
    expect(indices).toEqual([0, 1, 2, 3, 4]);
  });

  it('returns empty for zero count', () => {
    expect(pickRandomIndices(5, 0)).toEqual([]);
  });

  it('clamps count to total', () => {
    const indices = pickRandomIndices(3, 10);
    expect(indices).toHaveLength(3);
  });
});

describe('pickRandom', () => {
  it('returns an item from the array', () => {
    const items = ['a', 'b', 'c'];
    const picked = pickRandom(items);
    expect(items).toContain(picked);
  });

  it('returns undefined for empty array', () => {
    expect(pickRandom([])).toBeUndefined();
  });
});
