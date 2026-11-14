import { beforeEach, describe, expect, it } from 'vitest';
import type { Category } from '../../types/words';
import { buildWordPool, drawWord, pickRandomWord } from '../../logic/wordSelection';

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

describe('drawWord', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('draws every enabled word once before repeating any word', () => {
    const categories = [
      category('animals', ['Dog', 'Cat', 'Wolf']),
      category('food', ['Pizza', 'Taco']),
    ];

    const drawn = Array.from(
      { length: 5 },
      () => drawWord(categories, { wildcardChance: 0 })?.word,
    );

    expect(new Set(drawn).size).toBe(5);
    expect(new Set(drawn)).toEqual(new Set(['Dog', 'Cat', 'Wolf', 'Pizza', 'Taco']));
  });

  it('never repeats the same word back-to-back, even across cycles', () => {
    const categories = [category('animals', ['Dog', 'Cat'])];

    let previous = drawWord(categories)?.word;
    for (let i = 0; i < 40; i++) {
      const next = drawWord(categories)?.word;
      expect(next).not.toBe(previous);
      previous = next;
    }
  });

  it('persists the bag between separate calls, like separate sessions', () => {
    const categories = [category('animals', ['Dog', 'Cat', 'Wolf'])];
    const first = drawWord(categories, { wildcardChance: 0 })?.word;
    const second = drawWord(categories, { wildcardChance: 0 })?.word;
    const third = drawWord(categories, { wildcardChance: 0 })?.word;

    expect(new Set([first, second, third]).size).toBe(3);
  });

  it('can repeat a word before the bag is empty so the last words stay unpredictable', () => {
    const categories = [category('animals', ['Dog', 'Cat', 'Wolf', 'Bear'])];
    const drawn: string[] = [];

    // Draw three unique words without using the wildcard.
    for (let i = 0; i < 3; i++) {
      drawn.push(drawWord(categories, { wildcardChance: 0 })?.word as string);
    }

    // One word is still in the bag. Force a wildcard and choose a word that
    // was already drawn, proving the next word is not simply "the last one".
    const lastWord = drawn[drawn.length - 1];
    const candidates = ['Dog', 'Cat', 'Wolf', 'Bear'].filter((word) => word !== lastWord);
    const repeatWord = candidates.find((word) => drawn.includes(word)) as string;
    const repeatIndex = candidates.indexOf(repeatWord);

    let calls = 0;
    const random = () => {
      calls++;
      if (calls === 1) return 0; // trigger the wildcard
      return (repeatIndex + 0.5) / candidates.length;
    };

    const result = drawWord(categories, { wildcardChance: 1, random });

    expect(drawn).toContain(result?.word);
    expect(result?.word).not.toBe(lastWord);
  });

  it('ignores disabled categories and removed words', () => {
    const enabled = category('animals', ['Dog']);
    const disabled = { ...category('food', ['Pizza']), enabled: false };

    expect(drawWord([enabled, disabled])?.word).toBe('Dog');
    expect(drawWord([{ ...enabled, words: [] }, disabled])).toBeUndefined();
  });

  it('adds newly added words to the current cycle', () => {
    const animals = category('animals', ['Dog']);
    expect(drawWord([animals], { wildcardChance: 0 })?.word).toBe('Dog');

    animals.words.push('Cat');
    const next = drawWord([animals], { wildcardChance: 0 })?.word;
    expect(next).toBe('Cat');
  });
});
