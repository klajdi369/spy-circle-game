import { useState, useCallback } from 'react';
import { Monitor, Moon, Sun, AlertTriangle } from 'lucide-react';
import { Button } from '../components/shared/Button';
import { Toggle } from '../components/shared/Toggle';
import { Modal } from '../components/shared/Modal';
import { useSettings } from '../hooks/useSettings';
import { resetWordLibrary } from '../storage/wordLibrary';
import { resetSettings } from '../storage/settings';
import type { ThemeMode } from '../types/settings';
import styles from './SettingsScreen.module.css';

const THEME_OPTIONS: { value: ThemeMode; label: string; icon: typeof Sun }[] = [
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'system', label: 'System', icon: Monitor },
];

export function SettingsScreen() {
  const { settings, updateSetting, reset } = useSettings();
  const [resetConfirm, setResetConfirm] = useState(false);
  const [resetDone, setResetDone] = useState(false);

  const handleReset = useCallback(() => {
    resetWordLibrary();
    resetSettings();
    reset();
    setResetConfirm(false);
    setResetDone(true);
    setTimeout(() => setResetDone(false), 3000);
  }, [reset]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Settings</h1>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>Game</div>
        <div className={styles.card}>
          <div className={styles.row}>
            <Toggle
              label="Show category to spies"
              checked={settings.showCategoryToSpies}
              onChange={(v) => updateSetting('showCategoryToSpies', v)}
            />
          </div>
          <div className={styles.row}>
            <Toggle
              label="Show category in results"
              checked={settings.showCategoryInResults}
              onChange={(v) => updateSetting('showCategoryInResults', v)}
            />
          </div>
          <div className={styles.row}>
            <Toggle
              label="Sound"
              checked={settings.sound}
              onChange={(v) => updateSetting('sound', v)}
            />
          </div>
          <div className={styles.row}>
            <Toggle
              label="Vibration"
              checked={settings.vibration}
              onChange={(v) => updateSetting('vibration', v)}
            />
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>Appearance</div>
        <div className={styles.card}>
          <div className={styles.row}>
            <p style={{ fontSize: 'var(--text-sm)', fontWeight: 500, marginBottom: 'var(--space-sm)' }}>
              Theme
            </p>
            <div className={styles.themeGroup}>
              {THEME_OPTIONS.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  className={`${styles.themeButton} ${settings.theme === value ? styles.themeButtonActive : ''}`}
                  onClick={() => updateSetting('theme', value)}
                >
                  <Icon size={16} style={{ display: 'block', margin: '0 auto 4px' }} />
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className={styles.row}>
            <Toggle
              label="Prevent screen sleep during game"
              checked={settings.preventScreenSleep}
              onChange={(v) => updateSetting('preventScreenSleep', v)}
            />
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>Behavior</div>
        <div className={styles.card}>
          <div className={styles.row}>
            <Toggle
              label="Confirm before leaving an active game"
              checked={settings.confirmBeforeLeaving}
              onChange={(v) => updateSetting('confirmBeforeLeaving', v)}
            />
          </div>
        </div>
      </div>

      <div className={styles.dangerZone}>
        <div className={styles.sectionTitle} style={{ color: 'var(--color-danger)' }}>
          <AlertTriangle size={14} style={{ display: 'inline', marginRight: 4 }} />
          Danger Zone
        </div>
        <div className={styles.card}>
          <div className={styles.row}>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-sm)' }}>
              Reset all data to defaults. This removes all custom categories, words, and settings.
            </p>
            <Button variant="danger" size="small" onClick={() => setResetConfirm(true)}>
              Reset All Data
            </Button>
            {resetDone && (
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-success)', marginTop: 'var(--space-sm)' }}>
                All data has been reset to defaults.
              </p>
            )}
          </div>
        </div>
      </div>

      <p className={styles.version}>Spy Circle v1.0.0</p>

      <Modal
        open={resetConfirm}
        onClose={() => setResetConfirm(false)}
        title="Reset All Data?"
        actions={
          <>
            <Button variant="ghost" onClick={() => setResetConfirm(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleReset}>
              Reset Everything
            </Button>
          </>
        }
      >
        <p>
          This will permanently delete all custom categories, words, and settings.
          Everything will be restored to the original defaults. This cannot be undone.
        </p>
      </Modal>
    </div>
  );
}
