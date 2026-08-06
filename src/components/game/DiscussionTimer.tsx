import { useCallback, useEffect, useRef } from 'react';
import { Clock, Pause, Play, Plus, SkipForward } from 'lucide-react';
import { Button } from '../shared/Button';
import { useGame } from '../../hooks/useGame';
import { useSettings } from '../../hooks/useSettings';
import { useTimer } from '../../hooks/useTimer';
import { formatTime, formatElapsed } from '../../logic/timer';
import styles from './DiscussionTimer.module.css';

export function DiscussionTimer() {
  const { state, dispatch } = useGame();
  const { settings } = useSettings();
  const {
    remainingMs,
    elapsedMs,
    isExpired,
    isPaused,
    pause,
    resume,
    addTime,
  } = useTimer(state.timerDuration);

  const hasNoTimer = state.timerDuration === null;
  const vibratedRef = useRef(false);
  const endedRef = useRef(false);

  // When the timer runs out naturally, move to the 'finished' phase so the
  // "Reveal Results" transition is valid (discussion -> finished -> results).
  useEffect(() => {
    if (isExpired && state.phase === 'discussion' && !endedRef.current) {
      endedRef.current = true;
      dispatch({ type: 'END_DISCUSSION' });
    }
  }, [isExpired, state.phase, dispatch]);

  // Stop the ticking clock once the round is finished.
  useEffect(() => {
    if (state.phase === 'finished' && !isPaused) {
      pause();
    }
  }, [state.phase, isPaused, pause]);

  // Vibrate when the timer expires.
  useEffect(() => {
    if (isExpired && !vibratedRef.current) {
      vibratedRef.current = true;
      if (settings.vibration && navigator.vibrate) {
        navigator.vibrate([200, 100, 200, 100, 400]);
      }
    }
  }, [isExpired, settings.vibration]);

  const totalSec = state.timerDuration ?? 0;
  const progress = remainingMs !== null ? remainingMs / (totalSec * 1000) : 0;
  const circumference = 2 * Math.PI * 90;

  const isEnded = state.phase === 'finished';

  const handleEndEarly = useCallback(() => {
    dispatch({ type: 'END_DISCUSSION' });
  }, [dispatch]);

  const handleReveal = useCallback(() => {
    dispatch({ type: 'SHOW_RESULTS' });
  }, [dispatch]);

  return (
    <div className={styles.container}>
      {isEnded ? (
        <>
          <div className={styles.expiredMessage}>Time&apos;s Up!</div>
          <p className={styles.expiredSub}>Discussion has ended.</p>
          <Button
            variant="primary"
            size="large"
            onClick={handleReveal}
          >
            Reveal Results
          </Button>
        </>
      ) : (
        <>
          <div className={`${styles.timerDisplay} ${hasNoTimer ? styles.stopwatch : ''}`}>
            {hasNoTimer ? formatElapsed(elapsedMs) : formatTime(remainingMs ?? 0)}
          </div>
          <div className={styles.label}>
            {hasNoTimer ? 'Elapsed Time' : isPaused ? 'Paused' : 'Remaining'}
          </div>

          <div className={styles.categoryTag}>
            <Clock size={14} />
            Category: {state.category}
          </div>

          {!hasNoTimer && remainingMs !== null && (
            <div className={styles.progressRing}>
              <svg width="200" height="200" viewBox="0 0 200 200">
                <circle className={styles.progressBg} cx="100" cy="100" r="90" />
                <circle
                  className={styles.progressFill}
                  cx="100"
                  cy="100"
                  r="90"
                  strokeDasharray={circumference}
                  strokeDashoffset={circumference * (1 - progress)}
                />
              </svg>
            </div>
          )}

          <div className={styles.controls}>
            {!hasNoTimer && (
              <Button
                variant="secondary"
                onClick={isPaused ? resume : pause}
              >
                {isPaused ? <Play size={18} /> : <Pause size={18} />}
                {isPaused ? 'Resume' : 'Pause'}
              </Button>
            )}
            {!hasNoTimer && (
              <Button
                variant="ghost"
                onClick={() => addTime(30)}
              >
                <Plus size={18} />
                +30s
              </Button>
            )}
            <Button
              variant="ghost"
              onClick={handleEndEarly}
            >
              <SkipForward size={18} />
              End Round
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
