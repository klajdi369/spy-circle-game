import { beforeEach, describe, expect, it } from 'vitest';
import { createRoundSetup } from '../../logic/roundSetup';
import type { Category } from '../../types/words';

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

const CATEGORIES = [category('Animals', ['Dog', 'Cat'])];

function input(overrides: Partial<Parameters<typeof createRoundSetup>[0]> = {}) {
  return {
    categories: CATEGORIES,
    playerCount: 4,
    spyCount: 1,
    usePlayerNames: false,
    playerNames: [],
    balance: true,
    ...overrides,
  };
}

describe('createRoundSetup', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('creates one player per seat with the requested number of spies', () => {
    const round = createRoundSetup(input({ spyCount: 2 }));

    expect(round).toBeDefined();
    expect(round?.players).toHaveLength(4);
    expect(round?.players.filter((player) => player.isSpy)).toHaveLength(2);
    expect(round?.category).toBe(CATEGORIES[0]);
    expect(['Dog', 'Cat']).toContain(round?.word);
  });

  it('uses custom names, filling blank seats with defaults', () => {
    const round = createRoundSetup(
      input({
        playerCount: 3,
        usePlayerNames: true,
        playerNames: ['Alex', '  ', 'Casey'],
      }),
    );

    expect(round?.names).toEqual(['Alex', 'Player 2', 'Casey']);
    expect(round?.players.map((player) => player.name)).toEqual(round?.names);
  });

  it('pads a short custom name list so every seat is filled', () => {
    const round = createRoundSetup(
      input({ playerCount: 4, usePlayerNames: true, playerNames: ['Alex'] }),
    );

    expect(round?.names).toEqual(['Alex', 'Player 2', 'Player 3', 'Player 4']);
  });

  it('returns undefined when no enabled words exist', () => {
    expect(createRoundSetup(input({ categories: [] }))).toBeUndefined();
  });

  it('still produces a valid round when balancing is disabled', () => {
    const round = createRoundSetup(input({ balance: false, spyCount: 2 }));

    expect(round?.players).toHaveLength(4);
    expect(round?.players.filter((player) => player.isSpy)).toHaveLength(2);
  });
});
