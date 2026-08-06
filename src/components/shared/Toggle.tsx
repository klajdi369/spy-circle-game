import styles from './Toggle.module.css';

interface ToggleProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  /** Accessible name when the visible label is empty or not descriptive enough */
  ariaLabel?: string;
}

export function Toggle({ label, checked, onChange, ariaLabel }: ToggleProps) {
  return (
    <label className={styles.toggle}>
      <span className={styles.label}>{label}</span>
      <span className={styles.switch}>
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          aria-label={ariaLabel}
        />
        <span className={styles.track} />
        <span className={styles.thumb} />
      </span>
    </label>
  );
}
