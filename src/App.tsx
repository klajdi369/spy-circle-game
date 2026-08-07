import { useState, useCallback, useEffect } from 'react';
import { BottomNav } from './components/navigation/BottomNav';
import type { NavView } from './components/navigation/BottomNav';
import { PlayScreen } from './screens/PlayScreen';
import { WordLibraryScreen } from './screens/WordLibraryScreen';
import { HowToPlayScreen } from './screens/HowToPlayScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { GameProvider } from './hooks/gameProvider';
import { useGame } from './hooks/useGame';
import { useSettings, useThemeEffect } from './hooks/useSettings';
import { HandoffScreen } from './components/game/HandoffScreen';
import { RoleCardConcealed, RoleCardRevealed, ReadyScreen } from './components/game/RoleCard';
import { DiscussionTimer } from './components/game/DiscussionTimer';
import { ResultsScreen } from './components/game/ResultsScreen';
import { InstallPromptModal } from './components/shared/InstallPromptModal';
import { UpdatePrompt } from './components/shared/UpdatePrompt';
import { useInstallPrompt } from './hooks/useInstallPrompt';
import styles from './App.module.css';

const HISTORY_VIEW_KEY = 'spyCircleView';
const HISTORY_GAME_KEY = 'spyCircleGame';

function historyView(state: unknown): NavView | null {
  if (!state || typeof state !== 'object') return null;
  const value = (state as Record<string, unknown>)[HISTORY_VIEW_KEY];
  return value === 'play' || value === 'library' || value === 'help' || value === 'settings'
    ? value
    : null;
}

function setHistoryView(view: NavView, mode: 'push' | 'replace') {
  const currentState = window.history.state;
  const state = {
    ...(currentState && typeof currentState === 'object' ? currentState : {}),
    [HISTORY_VIEW_KEY]: view,
  };
  if (mode === 'push') {
    window.history.pushState(state, '', window.location.href);
  } else {
    window.history.replaceState(state, '', window.location.href);
  }
}

function isGameHistoryState(state: unknown): boolean {
  return Boolean(
    state &&
      typeof state === 'object' &&
      (state as Record<string, unknown>)[HISTORY_GAME_KEY] === true,
  );
}

function pushGameHistoryState() {
  const currentState = window.history.state;
  window.history.pushState(
    {
      ...(currentState && typeof currentState === 'object' ? currentState : {}),
      [HISTORY_VIEW_KEY]: 'play',
      [HISTORY_GAME_KEY]: true,
    },
    '',
    window.location.href,
  );
}

function GameFlow() {
  const { state } = useGame();

  switch (state.phase) {
    case 'setup':
      return <PlayScreen />;
    case 'handoff':
      return <HandoffScreen />;
    case 'concealed':
      return <RoleCardConcealed />;
    case 'revealed':
      return <RoleCardRevealed />;
    case 'ready':
      return <ReadyScreen />;
    case 'discussion':
      return <DiscussionTimer />;
    case 'finished':
      return <DiscussionTimer />;
    case 'results':
      return <ResultsScreen />;
  }
}

function AppContent() {
  const [view, setView] = useState<NavView>(
    () => historyView(window.history.state) ?? 'play',
  );
  const { state, dispatch } = useGame();
  const { settings } = useSettings();
  const installPrompt = useInstallPrompt();

  useThemeEffect(settings.theme);

  // Give the initial Play screen a history state. Sub-screens can then add
  // one entry that the Android hardware back button can reliably pop.
  useEffect(() => {
    if (!historyView(window.history.state)) {
      setHistoryView('play', 'replace');
    }
  }, []);

  // Offer install shortly after load, when the browser supports it
  useEffect(() => {
    if (!installPrompt.promptReady) return;
    const timer = setTimeout(installPrompt.open, 2500);
    return () => clearTimeout(timer);
  }, [installPrompt.promptReady, installPrompt.open]);

  // Prevent screen sleep during active game
  useEffect(() => {
    if (!settings.preventScreenSleep) return;
    const isActive = state.phase !== 'setup' && state.phase !== 'results';
    if (!isActive) return;

    let wakeLock: WakeLockSentinel | null = null;
    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator) {
          wakeLock = await navigator.wakeLock.request('screen');
        }
      } catch {
        // WakeLock not supported or denied
      }
    };
    requestWakeLock();

    return () => {
      if (wakeLock) {
        wakeLock.release().catch(() => {});
      }
    };
  }, [state.phase, settings.preventScreenSleep]);

  const isInGame = state.phase !== 'setup';

  // Keep an in-app history entry during a round. Android Back pops this entry
  // and returns to setup instead of closing the standalone app.
  useEffect(() => {
    if (isInGame) {
      if (!isGameHistoryState(window.history.state)) pushGameHistoryState();
      return;
    }

    // Results-screen actions can also finish a game without a Back event.
    if (isGameHistoryState(window.history.state)) window.history.back();
  }, [isInGame]);

  // Confirm before closing/refreshing the tab during an active round
  useEffect(() => {
    if (!settings.confirmBeforeLeaving || !isInGame) return;
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [settings.confirmBeforeLeaving, isInGame]);

  const handleNavigate = useCallback(
    (newView: NavView) => {
      if (newView === view) return;
      if (isInGame && settings.confirmBeforeLeaving) {
        const confirmed = window.confirm(
          'A game is in progress. Leaving will lose the current round. Are you sure?',
        );
        if (!confirmed) return;
      }

      if (newView === 'play') {
        setView('play');
        if (historyView(window.history.state) !== 'play') {
          window.history.back();
        } else {
          setHistoryView('play', 'replace');
        }
        return;
      }

      setHistoryView(newView, view === 'play' ? 'push' : 'replace');
      setView(newView);
    },
    [isInGame, settings.confirmBeforeLeaving, view],
  );

  // Restore the destination represented by browser history. Switching between
  // sub-screens replaces their single entry, so Back always returns to Play.
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (isInGame) {
        const shouldQuit =
          !settings.confirmBeforeLeaving ||
          window.confirm('Quit the current game and return to setup?');
        if (shouldQuit) {
          dispatch({ type: 'RETURN_HOME' });
        } else {
          pushGameHistoryState();
        }
        return;
      }
      setView(historyView(event.state) ?? 'play');
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [dispatch, isInGame, settings.confirmBeforeLeaving]);

  // Show game flow or navigation screens
  const installModal = (
    <InstallPromptModal
      open={installPrompt.showPrompt}
      isIOS={installPrompt.isIOSHint}
      onClose={installPrompt.close}
      onInstall={installPrompt.install}
      onDismiss={installPrompt.dismiss}
    />
  );

  if (isInGame) {
    return (
      <div className={styles.app}>
        <main className={styles.main}>
          <GameFlow />
        </main>
        {installModal}
      </div>
    );
  }

  return (
    <div className={styles.app}>
      <main
        className={`${styles.main} ${styles.mainWithNav} ${
          view === 'play' ? styles.mainLocked : ''
        }`}
      >
        {view === 'play' && <PlayScreen />}
        {view === 'library' && <WordLibraryScreen />}
        {view === 'help' && <HowToPlayScreen />}
        {view === 'settings' && <SettingsScreen />}
      </main>
      <BottomNav active={view} onNavigate={handleNavigate} />
      {installModal}
    </div>
  );
}

export default function App() {
  return (
    <GameProvider>
      <AppContent />
      <UpdatePrompt />
    </GameProvider>
  );
}
