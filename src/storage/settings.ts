import type { AppSettings } from '../types/settings';
import { DEFAULT_SETTINGS } from '../types/settings';
import { safeGetJSON, safeSetJSON, safeRemoveItem } from './safeStorage';

const STORAGE_KEY = 'spy-circle-settings';

export function loadSettings(): AppSettings {
  const stored = safeGetJSON<Partial<AppSettings>>(STORAGE_KEY, {});
  return { ...DEFAULT_SETTINGS, ...stored };
}

export function saveSettings(settings: AppSettings): boolean {
  return safeSetJSON(STORAGE_KEY, settings);
}

export function resetSettings(): void {
  safeRemoveItem(STORAGE_KEY);
}
