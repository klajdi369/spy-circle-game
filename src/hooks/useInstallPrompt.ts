import { useState, useEffect, useCallback, useRef } from 'react';
import { safeGetItem, safeSetItem } from '../storage/safeStorage';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const STORAGE_KEY = 'spy-circle-install-prompt';
const REASK_AFTER_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

type StoredState = { dismissedAt: number } | { installed: true };

function isAlreadyInstalled(): boolean {
  const nav = navigator as Navigator & { standalone?: boolean };
  if (nav.standalone) return true;
  return window.matchMedia('(display-mode: standalone)').matches;
}

function isIOS(): boolean {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function loadStoredState(): StoredState | null {
  const raw = safeGetItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredState;
  } catch {
    return null;
  }
}

/**
 * Manages the "install this game" prompt. Only offers install when the
 * browser actually supports it (beforeinstallprompt or iOS Safari).
 * Dismissals are remembered for 7 days; a successful install is permanent.
 */
export function useInstallPrompt() {
  const deferredPrompt = useRef<BeforeInstallPromptEvent | null>(null);
  const [canInstall, setCanInstall] = useState(() => {
    if (isAlreadyInstalled()) return false;
    const stored = loadStoredState();
    if (stored) return 'installed' in stored ? false : Date.now() - stored.dismissedAt >= REASK_AFTER_MS;
    return true;
  });
  // True once the browser has told us it supports installing (or iOS was detected)
  const [promptReady, setPromptReady] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOSHint, setIsIOSHint] = useState(false);

  useEffect(() => {
    const onBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      deferredPrompt.current = e as BeforeInstallPromptEvent;
      setIsIOSHint(false);
      setCanInstall(true);
      setPromptReady(true);
    };
    const onAppInstalled = () => {
      safeSetItem(STORAGE_KEY, JSON.stringify({ installed: true }));
      setCanInstall(false);
      setShowPrompt(false);
    };
    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    window.addEventListener('appinstalled', onAppInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
      window.removeEventListener('appinstalled', onAppInstalled);
    };
  }, []);

  // iOS Safari never fires beforeinstallprompt — offer manual instructions instead.
  useEffect(() => {
    if (isIOS() && !isAlreadyInstalled() && loadStoredState() === null) {
      setIsIOSHint(true);
      setCanInstall(true);
      setPromptReady(true);
    }
  }, []);

  const open = useCallback(() => {
    if (!canInstall || isAlreadyInstalled()) return;
    setShowPrompt(true);
  }, [canInstall]);

  const close = useCallback(() => setShowPrompt(false), []);

  const install = useCallback(async () => {
    if (deferredPrompt.current) {
      const promptEvent = deferredPrompt.current;
      deferredPrompt.current = null;
      await promptEvent.prompt();
      const choice = await promptEvent.userChoice;
      if (choice.outcome === 'accepted') {
        safeSetItem(STORAGE_KEY, JSON.stringify({ installed: true }));
      } else {
        safeSetItem(STORAGE_KEY, JSON.stringify({ dismissedAt: Date.now() }));
      }
    } else {
      // iOS: no native prompt — dismiss and let the user follow instructions.
      safeSetItem(STORAGE_KEY, JSON.stringify({ dismissedAt: Date.now() }));
    }
    setShowPrompt(false);
  }, []);

  const dismiss = useCallback(() => {
    safeSetItem(STORAGE_KEY, JSON.stringify({ dismissedAt: Date.now() }));
    setShowPrompt(false);
  }, []);

  return { canInstall, promptReady, showPrompt, isIOSHint, open, close, install, dismiss };
}

export type { BeforeInstallPromptEvent };
