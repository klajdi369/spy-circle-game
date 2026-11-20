import { useCallback, useRef } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '../shared/Button';
import { useGame } from '../../hooks/useGame';
import { useSettings } from '../../hooks/useSettings';
import { randomInt } from '../../logic/random';
import type { Player } from '../../types/game';
import styles from './RoleCard.module.css';

/** Ignore a quick second tap right after the reveal so a double tap can't accidentally
 *  close the card before the player has read their role. */
const HIDE_GUARD_MS = 600;

export function RoleCardConcealed() {
  const { dispatch } = useGame();

  const handleReveal = useCallback(() => {
    dispatch({ type: 'REVEAL_ROLE' });
  }, [dispatch]);

  return (
    <div className={styles.container}>
      <div
        className={`${styles.card} ${styles.cardFaceDown}`}
        onClick={handleReveal}
        onKeyDown={(e) => {
          if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            handleReveal();
          }
        }}
        tabIndex={0}
        role="button"
        aria-label="Tap to reveal your role"
      >
        <EyeOff size={64} />
        <p style={{ marginTop: 16, fontWeight: 600 }}>Your Role Card</p>
        <p style={{ marginTop: 8, fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
          Tap to reveal
        </p>
      </div>

      <p className={styles.cardHint}>
        <Eye size={14} />
        Only you should look at the screen
      </p>
    </div>
  );
}

interface RoleCardContentProps {
  player: Player;
  secretWord: string;
  category: string;
  showCategory: boolean;
}

/** The inside of a revealed role card, shared by the setup flow and the
 *  in-discussion card review so both always show the same information. */
export function RoleCardContent({
  player,
  secretWord,
  category,
  showCategory,
}: RoleCardContentProps) {
  if (player.isSpy) {
    return (
      <>
        <div className={`${styles.roleLabel} ${styles.spyLabel}`}>
          <EyeOff size={16} style={{ display: 'inline', marginRight: 4 }} />
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
            Category: {category}
          </div>
        )}
      </>
    );
  }

  return (
    <>
      <div className={styles.roleLabel}>Your Secret Word</div>
      <div className={styles.secretWord}>{secretWord}</div>
      <div className={styles.category}>{category}</div>
      <p className={styles.reminder}>
        Don&apos;t say this word directly! Give hints and ask questions.
      </p>
    </>
  );
}

export function RoleCardRevealed() {
  const { state, dispatch } = useGame();
  const { settings } = useSettings();
  const player = state.players[state.currentPlayerIndex];
  const revealedAtRef = useRef<number>(Date.now());

  const showCategory = !player.isSpy || settings.showCategoryToSpies;

  const handleHide = useCallback(() => {
    if (Date.now() - revealedAtRef.current < HIDE_GUARD_MS) return;
    dispatch({ type: 'HIDE_ROLE' });
  }, [dispatch]);

  const ariaLabel = player.isSpy
    ? 'You are a spy. Tap again to hide and pass the device'
    : `Your secret word is ${state.secretWord}. Tap again to hide and pass the device`;

  return (
    <div className={styles.container}>
      <div
        className={`${styles.card} ${styles.cardRevealed}`}
        onClick={handleHide}
        onKeyDown={(e) => {
          if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            handleHide();
          }
        }}
        tabIndex={0}
        role="button"
        aria-label={ariaLabel}
      >
        <RoleCardContent
          player={player}
          secretWord={state.secretWord}
          category={state.category}
          showCategory={showCategory}
        />
      </div>

      <p className={styles.cardHint}>
        <Eye size={14} />
        Tap the card to hide it and pass the device
      </p>
    </div>
  );
}

export function ReadyScreen() {
  const { state, dispatch } = useGame();

  const handleStartDiscussion = useCallback(() => {
    if (state.players.length === 0) return;
    const startingPlayerIndex = randomInt(0, state.players.length);
    dispatch({ type: 'START_DISCUSSION', startingPlayerIndex });
  }, [dispatch, state.players.length]);

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
        onClick={handleStartDiscussion}
      >
        Start Discussion
      </Button>
    </div>
  );
}
