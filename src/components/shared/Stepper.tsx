import styles from './Stepper.module.css';

interface StepperProps {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  error?: string;
}

export function Stepper({ label, value, min, max, onChange, error }: StepperProps) {
  return (
    <div>
      <div className={styles.label}>{label}</div>
      <div className={styles.controls}>
        <button
          className={styles.button}
          onClick={() => onChange(value - 1)}
          disabled={value <= min}
          aria-label={`Decrease ${label.toLowerCase()}`}
        >
          −
        </button>
        <span className={styles.value} aria-live="polite">
          {value}
        </span>
        <button
          className={styles.button}
          onClick={() => onChange(value + 1)}
          disabled={value >= max}
          aria-label={`Increase ${label.toLowerCase()}`}
        >
          +
        </button>
      </div>
      {error && <div className={styles.error} role="alert">{error}</div>}
    </div>
  );
}
