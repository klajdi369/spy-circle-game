import { beforeEach, describe, expect, it } from 'vitest';
import {
  loadSpyCounts,
  loadWordDeck,
  resetRoundHistory,
  saveSpyCounts,
  saveWordDeck,
} from '../../storage/roundHistory';

const STORAGE_KEY = 'spy-circle-round-history';

describe('round history storage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns empty fairness state when nothing is stored', () => {
    expect(loadWordDeck()).toEqual({ remaining: [], drawn: [], lastKey: null });
    expect(loadSpyCounts()).toEqual({});
  });

  it('persists the word deck without touching spy counts', () => {
    saveSpyCounts({ 'p:alex': 2 });
    saveWordDeck({ remaining: ['dog'], drawn: ['cat'], lastKey: 'cat' });

    expect(loadWordDeck()).toEqual({ remaining: ['dog'], drawn: ['cat'], lastKey: 'cat' });
    expect(loadSpyCounts()).toEqual({ 'p:alex': 2 });
  });

  it('persists spy counts without touching the word deck', () => {
    saveWordDeck({ remaining: ['dog'], drawn: [], lastKey: 'cat' });
    saveSpyCounts({ 'p:alex': 1, 'p:blair': 3 });

    expect(loadWordDeck()).toEqual({ remaining: ['dog'], drawn: [], lastKey: 'cat' });
    expect(loadSpyCounts()).toEqual({ 'p:alex': 1, 'p:blair': 3 });
  });

  it('falls back to empty state when stored data is malformed', () => {
    localStorage.setItem(STORAGE_KEY, '{not json');
    expect(loadWordDeck()).toEqual({ remaining: [], drawn: [], lastKey: null });
    expect(loadSpyCounts()).toEqual({});
  });

  it('rejects stored data with an unexpected version', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: 99,
        wordDeck: { remaining: ['dog'], drawn: [], lastKey: null },
        spyCounts: { 'p:alex': 5 },
      }),
    );

    expect(loadWordDeck()).toEqual({ remaining: [], drawn: [], lastKey: null });
    expect(loadSpyCounts()).toEqual({});
  });

  it('reset clears both pieces of state', () => {
    saveWordDeck({ remaining: ['dog'], drawn: [], lastKey: 'dog' });
    saveSpyCounts({ 'p:alex': 1 });

    resetRoundHistory();

    expect(loadWordDeck()).toEqual({ remaining: [], drawn: [], lastKey: null });
    expect(loadSpyCounts()).toEqual({});
  });
});
