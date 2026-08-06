import { describe, it, expect, beforeEach } from 'vitest';
import { loadSettings, saveSettings, resetSettings } from '../../storage/settings';
import { DEFAULT_SETTINGS } from '../../types/settings';

describe('settings storage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns defaults on first load', () => {
    const settings = loadSettings();
    expect(settings).toEqual(DEFAULT_SETTINGS);
  });

  it('persists and loads custom settings', () => {
    const custom = { ...DEFAULT_SETTINGS, sound: false };
    saveSettings(custom);
    const loaded = loadSettings();
    expect(loaded.sound).toBe(false);
  });

  it('reset clears stored settings', () => {
    saveSettings({ ...DEFAULT_SETTINGS, sound: false });
    resetSettings();
    const loaded = loadSettings();
    expect(loaded.sound).toBe(DEFAULT_SETTINGS.sound);
  });
});
