import { describe, expect, it } from 'vitest';
import type { Category } from '../../types/words';
import { buildWordPool, pickRandomWord } from '../../logic/wordSelection';

function category(id: string, words: string[]): Category {
  return {
    id,
    name: id,
    enabled: true,
    isPredefined: false,
    originalWords: [],
    words,
  };
}

describe('word selection', () => {
  it('gives every word one entry regardless of category size', () => {
    const small = category('small', ['VR Headset']);
    const large = category('large', ['Dog', 'Cat', 'Rabbit', 'Horse']);

    const pool = buildWordPool([small, large]);

    expect(pool).toHaveLength(5);
    expect(pool.filter(({ word }) => word === 'VR Headset')).toHaveLength(1);
    expect(pool.filter(({ category: owner }) => owner.id === 'large')).toHaveLength(4);
  });

  it('preserves the category belonging to the selected word', () => {
    const onlyCategory = category('technology', ['VR Headset']);

    expect(pickRandomWord([onlyCategory])).toEqual({
      category: onlyCategory,
      word: 'VR Headset',
    });
  });

  it('excludes disabled categories from the pool', () => {
    const disabled = { ...category('disabled', ['VR Headset']), enabled: false };
    const enabled = category('enabled', ['Robot']);

    expect(buildWordPool([disabled, enabled]).map(({ word }) => word)).toEqual(['Robot']);
  });

  it('returns undefined for an empty pool', () => {
    expect(pickRandomWord([])).toBeUndefined();
  });
});
