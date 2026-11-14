export type ThemeMode = 'dark' | 'light' | 'system';

export interface AppSettings {
  showCategoryToSpies: boolean;
  showCategoryInResults: boolean;
  sound: boolean;
  vibration: boolean;
  theme: ThemeMode;
  preventScreenSleep: boolean;
  confirmBeforeLeaving: boolean;
  lastTimerDuration: number | null;
  balanceRounds: boolean;
}

export const DEFAULT_SETTINGS: AppSettings = {
  showCategoryToSpies: false,
  showCategoryInResults: true,
  sound: true,
  vibration: true,
  theme: 'dark',
  preventScreenSleep: true,
  confirmBeforeLeaving: true,
  lastTimerDuration: 300,
  balanceRounds: true,
};
