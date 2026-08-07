import { RefreshCw } from 'lucide-react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { Button } from './Button';
import styles from './UpdatePrompt.module.css';

export function UpdatePrompt() {
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW();

  if (!needRefresh) return null;

  return (
    <div className={styles.banner} role="status" aria-live="polite">
      <span className={styles.label}>New version available</span>
      <Button
        variant="primary"
        size="small"
        onClick={() => updateServiceWorker(true)}
      >
        <RefreshCw size={14} />
        Update
      </Button>
    </div>
  );
}
