import { describe, it, expect } from 'vitest';
import { generateDefaultNames, preserveNames } from '../../logic/playerNames';

describe('generateDefaultNames', () => {
  it('generates correct number of names', () => {
    expect(generateDefaultNames(3)).toHaveLength(3);
    expect(generateDefaultNames(10)).toHaveLength(10);
  });

  it('uses "Player N" format', () => {
    const names = generateDefaultNames(3);
    expect(names).toEqual(['Player 1', 'Player 2', 'Player 3']);
  });
});

describe('preserveNames', () => {
  it('preserves existing names when count stays same', () => {
    const prev = ['Alice', 'Bob', 'Charlie'];
    expect(preserveNames(prev, 3)).toEqual(['Alice', 'Bob', 'Charlie']);
  });

  it('fills new slots with defaults when count increases', () => {
    const prev = ['Alice', 'Bob'];
    const result = preserveNames(prev, 4);
    expect(result).toEqual(['Alice', 'Bob', 'Player 3', 'Player 4']);
  });

  it('truncates when count decreases', () => {
    const prev = ['Alice', 'Bob', 'Charlie', 'Diana'];
    expect(preserveNames(prev, 2)).toEqual(['Alice', 'Bob']);
  });

  it('replaces blank names with defaults', () => {
    const prev = ['Alice', '', '  '];
    const result = preserveNames(prev, 3);
    expect(result[0]).toBe('Alice');
    expect(result[1]).toBe('Player 2');
    expect(result[2]).toBe('Player 3');
  });
});
