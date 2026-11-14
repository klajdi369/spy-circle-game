import { useCallback, useMemo } from 'react';
import { Eye, Users, Timer } from 'lucide-react';
import { Button } from '../shared/Button';
import { useGame } from '../../hooks/useGame';
import { useSettings } from '../../hooks/useSettings';
import { useWordLibrary } from '../../hooks/useWordLibrary';
import { createRoundSetup } from '../../logic/roundSetup';
import styles from './ResultsScreen.module.css';

function formatTimerDuration(seconds: number | null): string {
  if (seconds === null) return 'No timer';
  const m = Math.floor(seconds / 60);
  if (m < 2) return `${m} minute`;
  return `${m} minutes`;
}

export function ResultsScreen() {
  const { state, playAgain, dispatch } = useGame();
  const { library } = useWordLibrary();
  const { settings } = useSettings();

  const spies = useMemo(
    () => state.players.filter((p) => p.isSpy),
    [state.players],
  );

  const handlePlayAgain = useCallback(() => {
    const round = createRoundSetup({
      categories: library.categories,
      playerCount: state.config.playerCount,
      spyCount: state.config.spyCount,
      usePlayerNames: state.config.usePlayerNames,
      playerNames: state.config.playerNames,
      balance: settings.balanceRounds,
    });
    if (!round) return;

    playAgain(
      { ...state.config, categoryId: round.category.id, playerNames: round.names },
      round.word,
      round.category.name,
      round.players,
    );
  }, [state, library, settings.balanceRounds, playAgain]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerIcon}>
          <Eye size={40} />
        </div>
        <h2 className={styles.headerTitle}>Results</h2>
        <p className={styles.headerSub}>The truth is revealed</p>
      </div>

      <div className={styles.wordCard}>
        <div className={styles.wordLabel}>The Secret Word</div>
        <div className={styles.wordValue}>{state.secretWord}</div>
        {settings.showCategoryInResults && (
          <div className={styles.wordCategory}>{state.category}</div>
        )}
      </div>

      <div className={styles.spySection}>
        <div className={styles.spyTitle}>
          Spy{spies.length > 1 ? 's' : ''} ({spies.length})
        </div>
        <div className={styles.spyList}>
          {spies.map((spy) => (
            <div key={spy.id} className={styles.spyChip}>
              {spy.name}
            </div>
          ))}
        </div>
      </div>

      <div className={styles.stats}>
        <div className={styles.statCard}>
          <Users size={20} style={{ color: 'var(--color-text-muted)', marginBottom: 4 }} />
          <div className={styles.statValue}>{state.players.length}</div>
          <div className={styles.statLabel}>Players</div>
        </div>
        <div className={styles.statCard}>
          <Eye size={20} style={{ color: 'var(--color-text-muted)', marginBottom: 4 }} />
          <div className={styles.statValue}>{state.spyCount}</div>
          <div className={styles.statLabel}>Spies</div>
        </div>
        <div className={styles.statCard}>
          <Timer size={20} style={{ color: 'var(--color-text-muted)', marginBottom: 4 }} />
          <div className={styles.statValue}>{formatTimerDuration(state.timerDuration)}</div>
          <div className={styles.statLabel}>Discussion Timer</div>
        </div>
      </div>

      <div className={styles.actions}>
        <Button variant="primary" size="large" fullWidth onClick={handlePlayAgain}>
          Play Again
        </Button>
        <Button
          variant="secondary"
          size="large"
          fullWidth
          onClick={() => dispatch({ type: 'NEW_SETUP' })}
        >
          New Setup
        </Button>
        <Button
          variant="ghost"
          fullWidth
          onClick={() => dispatch({ type: 'RETURN_HOME' })}
        >
          Home
        </Button>
      </div>
    </div>
  );
}
