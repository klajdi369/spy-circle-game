import { describe, it, expect, beforeEach } from 'vitest';
import {
  safeGetItem,
  safeSetItem,
  safeRemoveItem,
  safeParseJSON,
  safeGetJSON,
  safeSetJSON,
} from '../../storage/safeStorage';

describe('safeStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('safeGetItem / safeSetItem / safeRemoveItem', () => {
    it('stores and retrieves strings', () => {
      safeSetItem('test', 'hello');
      expect(safeGetItem('test')).toBe('hello');
    });

    it('returns null for missing keys', () => {
      expect(safeGetItem('nonexistent')).toBeNull();
    });

    it('removes items', () => {
      safeSetItem('test', 'hello');
      safeRemoveItem('test');
      expect(safeGetItem('test')).toBeNull();
    });
  });

  describe('safeParseJSON', () => {
    it('parses valid JSON', () => {
      expect(safeParseJSON('{"a":1}', { a: 0 })).toEqual({ a: 1 });
    });

    it('returns fallback on null', () => {
      expect(safeParseJSON(null, 'default')).toBe('default');
    });

    it('returns fallback on invalid JSON', () => {
      expect(safeParseJSON('not json', { valid: false })).toEqual({ valid: false });
    });
  });

  describe('safeGetJSON / safeSetJSON', () => {
    it('round-trips objects', () => {
      const obj = { name: 'Test', value: 42 };
      safeSetJSON('obj', obj);
      expect(safeGetJSON('obj', null)).toEqual(obj);
    });

    it('returns fallback for missing keys', () => {
      expect(safeGetJSON('nonexistent', { default: true })).toEqual({ default: true });
    });

    it('returns fallback for corrupted data', () => {
      localStorage.setItem('bad', 'not-json');
      expect(safeGetJSON('bad', { fallback: true })).toEqual({ fallback: true });
    });
  });
});
