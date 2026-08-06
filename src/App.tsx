import { useState, useCallback, useEffect } from 'react';
import { BottomNav } from './components/navigation/BottomNav';
import type { NavView } from './components/navigation/BottomNav';
import { PlayScreen } from './screens/PlayScreen';
import { WordLibraryScreen } from './screens/WordLibraryScreen';
import { HowToPlayScreen } from './screens/HowToPlayScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { GameProvider, useGame } from './hooks/useGame';
import { useSettings, useThemeEffect } from './hooks/useSettings';
import { HandoffScreen } from './components/game/HandoffScreen';
import { RoleCardConcealed, RoleCardRevealed, ReadyScreen } from './components/game/RoleCard';
import { DiscussionTimer } from './components/game/DiscussionTimer';
import { ResultsScreen } from './components/game/ResultsScreen';
import styles from './App.module.css';

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
    default:
      return <PlayScreen />;
  }
}

function AppContent() {
  const [view, setView] = useState<NavView>('play');
  const { state } = useGame();
  const { settings } = useSettings();

  useThemeEffect(settings.theme);

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

  const isInGame = state.phase !== 'setup' && state.phase !== 'results';

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
      if (isInGame && settings.confirmBeforeLeaving) {
        const confirmed = window.confirm(
          'A game is in progress. Leaving will lose the current round. Are you sure?',
        );
        if (!confirmed) return;
      }
      setView(newView);
    },
    [isInGame, settings.confirmBeforeLeaving],
  );

  // Show game flow or navigation screens
  if (isInGame) {
    return (
      <div className={styles.app}>
        <main className={styles.main}>
          <GameFlow />
        </main>
      </div>
    );
  }

  return (
    <div className={styles.app}>
      <main className={styles.main}>
        {view === 'play' && <PlayScreen />}
        {view === 'library' && <WordLibraryScreen />}
        {view === 'help' && <HowToPlayScreen />}
        {view === 'settings' && <SettingsScreen />}
      </main>
      <BottomNav active={view} onNavigate={handleNavigate} />
    </div>
  );
}

export default function App() {
  return (
    <GameProvider>
      <AppContent />
    </GameProvider>
  );
}
