import { useCallback, useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { Button } from './Button';
import styles from './UpdatePrompt.module.css';

const UPDATE_CHECK_INTERVAL_MS = 60 * 60 * 1000;

export function UpdatePrompt() {
  const [registration, setRegistration] = useState<ServiceWorkerRegistration>();
  const [updating, setUpdating] = useState(false);
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    immediate: true,
    onRegisteredSW: (_swUrl, serviceWorkerRegistration) => {
      setRegistration(serviceWorkerRegistration);
    },
  });

  const checkForUpdate = useCallback(() => {
    if (!registration || !navigator.onLine) return;
    void registration.update().catch(() => {
      // A transient network or registration failure can be retried on the
      // next focus, visibility change, or interval.
    });
  }, [registration]);

  useEffect(() => {
    if (!registration) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') checkForUpdate();
    };
    const interval = window.setInterval(checkForUpdate, UPDATE_CHECK_INTERVAL_MS);

    window.addEventListener('focus', checkForUpdate);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener('focus', checkForUpdate);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [checkForUpdate, registration]);

  const installUpdate = async () => {
    setUpdating(true);
    try {
      await updateServiceWorker();
    } catch {
      setUpdating(false);
    }
  };

  if (!needRefresh) return null;

  return (
    <div className={styles.banner} role="status" aria-live="polite">
      <span className={styles.label}>New version available</span>
      <Button
        variant="primary"
        size="small"
        disabled={updating}
        onClick={() => void installUpdate()}
      >
        <RefreshCw size={14} />
        {updating ? 'Updating…' : 'Update'}
      </Button>
    </div>
  );
}
