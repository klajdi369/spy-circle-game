import { describe, it, expect } from 'vitest';
import {
  validateSpyCount,
  clampSpyCount,
  validateWord,
  validateCategoryName,
  removeDuplicateWords,
  hasUsableWords,
} from '../../logic/validation';

describe('validateSpyCount', () => {
  it('returns valid for normal values', () => {
    expect(validateSpyCount(5, 1).valid).toBe(true);
    expect(validateSpyCount(10, 3).valid).toBe(true);
    expect(validateSpyCount(20, 5).valid).toBe(true);
  });

  it('rejects spy count of 0', () => {
    const result = validateSpyCount(5, 0);
    expect(result.valid).toBe(false);
    expect(result.corrected).toBe(1);
  });

  it('clamps spy count when too high', () => {
    const result = validateSpyCount(5, 4);
    expect(result.valid).toBe(false);
    expect(result.corrected).toBe(3); // 5 - 2 = 3 max spies
  });

  it('requires at least 3 players', () => {
    const result = validateSpyCount(2, 1);
    expect(result.valid).toBe(false);
  });

  it('allows max spies = players - 2', () => {
    const result = validateSpyCount(5, 3);
    expect(result.valid).toBe(true);
    expect(result.corrected).toBe(3);
  });

  it('handles edge case: 3 players, 1 spy', () => {
    const result = validateSpyCount(3, 1);
    expect(result.valid).toBe(true);
  });
});

describe('clampSpyCount', () => {
  it('returns same value when valid', () => {
    expect(clampSpyCount(5, 2)).toBe(2);
  });

  it('returns max when too high', () => {
    expect(clampSpyCount(5, 10)).toBe(3);
  });

  it('returns 1 when too low', () => {
    expect(clampSpyCount(5, 0)).toBe(1);
  });
});

describe('validateWord', () => {
  it('accepts valid words', () => {
    expect(validateWord('Dog').valid).toBe(true);
  });

  it('trims whitespace', () => {
    const result = validateWord('  Cat  ');
    expect(result.valid).toBe(true);
    expect(result.cleaned).toBe('Cat');
  });

  it('rejects blank strings', () => {
    expect(validateWord('').valid).toBe(false);
    expect(validateWord('   ').valid).toBe(false);
    expect(validateWord('').error).toBeDefined();
  });
});

describe('validateCategoryName', () => {
  it('accepts valid names', () => {
    expect(validateCategoryName('Animals').valid).toBe(true);
  });

  it('rejects empty names', () => {
    expect(validateCategoryName('').valid).toBe(false);
  });
});

describe('removeDuplicateWords', () => {
  it('removes case-insensitive duplicates', () => {
    const { unique, removed } = removeDuplicateWords(['Dog', 'dog', 'DOG', 'Cat']);
    expect(unique).toHaveLength(2);
    expect(removed).toBe(2);
  });

  it('removes blank words', () => {
    const { unique, removed } = removeDuplicateWords(['', 'Dog', '', 'Cat']);
    expect(unique).toHaveLength(2);
    expect(removed).toBe(2);
  });

  it('returns empty for empty input', () => {
    const { unique, removed } = removeDuplicateWords([]);
    expect(unique).toHaveLength(0);
    expect(removed).toBe(0);
  });
});

describe('hasUsableWords', () => {
  it('returns true when words exist', () => {
    expect(hasUsableWords([{ words: ['Dog'] }])).toBe(true);
  });

  it('returns false when all empty', () => {
    expect(hasUsableWords([{ words: [] }])).toBe(false);
  });

  it('returns true if any category has words', () => {
    expect(hasUsableWords([{ words: [] }, { words: ['Cat'] }])).toBe(true);
  });
});
