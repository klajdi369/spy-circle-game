import { describe, it, expect } from 'vitest';
import { validateImportData } from '../../storage/wordLibrary';
import type { WordLibrary } from '../../types/words';

describe('validateImportData', () => {
  it('accepts valid library', () => {
    const lib: WordLibrary = {
      version: 1,
      categories: [
        {
          id: 'abc',
          name: 'Test',
          enabled: true,
          isPredefined: false,
          originalWords: [],
          words: ['hello', 'world'],
        },
      ],
    };
    expect(validateImportData(lib)).toBe(true);
  });

  it('rejects null', () => {
    expect(validateImportData(null)).toBe(false);
    expect(validateImportData(undefined)).toBe(false);
  });

  it('rejects non-object', () => {
    expect(validateImportData('string')).toBe(false);
    expect(validateImportData(42)).toBe(false);
  });

  it('rejects wrong version', () => {
    expect(
      validateImportData({ version: 99, categories: [] }),
    ).toBe(false);
  });

  it('rejects missing categories array', () => {
    expect(
      validateImportData({ version: 1 }),
    ).toBe(false);
  });

  it('rejects category with invalid name', () => {
    expect(
      validateImportData({
        version: 1,
        categories: [{ id: 'x', name: '', enabled: true, words: [], originalWords: [] }],
      }),
    ).toBe(false);
  });

  it('rejects category missing fields', () => {
    expect(
      validateImportData({
        version: 1,
        categories: [{ id: 'x' }],
      }),
    ).toBe(false);
  });
});
