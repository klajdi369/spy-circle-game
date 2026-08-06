import { useState, useRef, useCallback, useEffect } from 'react';
import { Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { Button } from '../shared/Button';
import { useGame } from '../../hooks/useGame';
import { useSettings } from '../../hooks/useSettings';
import styles from './RoleCard.module.css';

const HOLD_DURATION = 600;

export function RoleCardConcealed() {
  const { dispatch } = useGame();
  const holdRef = useRef<number>(0);
  const startRef = useRef<number>(0);
  const [progress, setProgress] = useState(0);
  const [holding, setHolding] = useState(false);

  const startHold = useCallback(() => {
    setHolding(true);
    startRef.current = Date.now();
    holdRef.current = window.setInterval(() => {
      const elapsed = Date.now() - startRef.current;
      const pct = Math.min(100, (elapsed / HOLD_DURATION) * 100);
      setProgress(pct);
      if (elapsed >= HOLD_DURATION) {
        clearInterval(holdRef.current);
        setHolding(false);
        setProgress(0);
        dispatch({ type: 'REVEAL_ROLE' });
      }
    }, 16);
  }, [dispatch]);

  const cancelHold = useCallback(() => {
    clearInterval(holdRef.current);
    setHolding(false);
    setProgress(0);
  }, []);

  // Keyboard support
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if ((e.key === ' ' || e.key === 'Enter') && !holding) {
        e.preventDefault();
        startHold();
      }
    },
    [holding, startHold],
  );

  const handleKeyUp = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        cancelHold();
      }
    },
    [cancelHold],
  );

  useEffect(() => {
    return () => clearInterval(holdRef.current);
  }, []);

  return (
    <div className={styles.container}>
      <div
        className={`${styles.card} ${styles.cardFaceDown}`}
        onPointerDown={startHold}
        onPointerUp={cancelHold}
        onPointerLeave={cancelHold}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
        tabIndex={0}
        role="button"
        aria-label="Press and hold to reveal your role"
      >
        <EyeOff size={64} />
        <p style={{ marginTop: 16, fontWeight: 600 }}>Your Role Card</p>
        <p style={{ marginTop: 8, fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
          Press and hold to reveal
        </p>
      </div>

      {holding && (
        <div className={styles.holdProgress}>
          <div
            className={styles.holdProgressFill}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      <p className={styles.cardHint}>
        <Eye size={14} />
        Hold for about half a second
      </p>
    </div>
  );
}

export function RoleCardRevealed() {
  const { state, dispatch } = useGame();
  const { settings } = useSettings();
  const player = state.players[state.currentPlayerIndex];

  const showCategory = !player.isSpy || settings.showCategoryToSpies;

  return (
    <div className={styles.container}>
      <div className={`${styles.card} ${styles.cardRevealed}`}>
        {player.isSpy ? (
          <>
            <div className={`${styles.roleLabel} ${styles.spyLabel}`}>
              <AlertTriangle size={16} style={{ display: 'inline', marginRight: 4 }} />
              You are a spy
            </div>
            <p className={styles.spyMessage}>Your mission</p>
            <p className={styles.spyExplanation}>
              You don&apos;t know the secret word. Listen carefully to the discussion
              and try to blend in. If you discover the word, you can still win.
              If you get caught, you may get one chance to guess the word.
            </p>
            {showCategory && (
              <div className={styles.spyCategory}>
                Category: {state.category}
              </div>
            )}
          </>
        ) : (
          <>
            <div className={styles.roleLabel}>Your Secret Word</div>
            <div className={styles.secretWord}>{state.secretWord}</div>
            <div className={styles.category}>{state.category}</div>
            <p className={styles.reminder}>
              Don&apos;t say this word directly! Give hints and ask questions.
            </p>
          </>
        )}
      </div>

      <div className={styles.actions}>
        <Button
          variant="primary"
          size="large"
          fullWidth
          onClick={() => dispatch({ type: 'HIDE_ROLE' })}
        >
          Hide My Role
        </Button>
      </div>
    </div>
  );
}

export function TransitionScreen() {
  const { state, dispatch } = useGame();

  const handleNext = useCallback(() => {
    dispatch({ type: 'NEXT_PLAYER' });
  }, [dispatch]);

  const isLast = state.currentPlayerIndex >= state.players.length - 1;

  return (
    <div className={styles.container}>
      <Eye size={48} style={{ color: 'var(--color-text-muted)', marginBottom: 24 }} />
      <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, marginBottom: 8 }}>
        Role hidden
      </h2>
      <p style={{ color: 'var(--color-text-secondary)', marginBottom: 32 }}>
        Pass the device to the next player&apos;s left.
        <br />
        Don&apos;t let anyone see the screen.
      </p>
      <Button
        variant="primary"
        size="large"
        onClick={handleNext}
      >
        {isLast ? 'Continue' : 'Next Player'}
      </Button>
    </div>
  );
}

export function ReadyScreen() {
  const { dispatch } = useGame();

  return (
    <div className={styles.container}>
      <Eye size={48} style={{ color: 'var(--color-accent)', marginBottom: 24 }} />
      <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: 8 }}>
        Everyone has seen their role
      </h2>
      <p style={{ color: 'var(--color-text-secondary)', marginBottom: 32, textAlign: 'center' }}>
        The discussion phase is about to begin.
        <br />
        Ask questions, give hints, and find the spy!
      </p>
      <Button
        variant="primary"
        size="large"
        onClick={() => dispatch({ type: 'START_DISCUSSION' })}
      >
        Start Discussion
      </Button>
    </div>
  );
}
