import type { AppSettings } from '../types/settings';
import { DEFAULT_SETTINGS } from '../types/settings';
import { safeGetJSON, safeSetJSON, safeRemoveItem } from './safeStorage';

const STORAGE_KEY = 'spy-circle-settings';

export function loadSettings(): AppSettings {
  return safeGetJSON<AppSettings>(STORAGE_KEY, DEFAULT_SETTINGS);
}

export function saveSettings(settings: AppSettings): boolean {
  return safeSetJSON(STORAGE_KEY, settings);
}

export function resetSettings(): void {
  safeRemoveItem(STORAGE_KEY);
}
