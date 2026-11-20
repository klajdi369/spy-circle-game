import { useCallback, useEffect, useRef, useState } from 'react';
import { Clock, Eye, Pause, Play, Plus, SkipForward } from 'lucide-react';
import { Button } from '../shared/Button';
import { useGame } from '../../hooks/useGame';
import { useSettings } from '../../hooks/useSettings';
import { useTimer } from '../../hooks/useTimer';
import { formatTime } from '../../logic/timer';
import { RoleReviewModal } from './RoleReview';
import styles from './DiscussionTimer.module.css';

export function DiscussionTimer() {
  const { state, dispatch } = useGame();
  const { settings } = useSettings();
  const {
    remainingMs,
    elapsedMs,
    totalMs,
    isExpired,
    isPaused,
    pause,
    resume,
    addTime,
  } = useTimer(state.timerDuration);

  const hasNoTimer = state.timerDuration === null;
  const starter = state.players[state.startingPlayerIndex];
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

  const progress = remainingMs !== null && totalMs !== null && totalMs > 0
    ? remainingMs / totalMs
    : 0;
  const circumference = 2 * Math.PI * 90;

  const isEnded = state.phase === 'finished';

  const [reviewOpen, setReviewOpen] = useState(false);
  const wasPausedBeforeReviewRef = useRef(false);

  // Pause the clock while a card is out so checking a word doesn't eat into
  // discussion time. Resume only if the timer wasn't already paused manually.
  const handleOpenReview = useCallback(() => {
    wasPausedBeforeReviewRef.current = isPaused;
    if (!isPaused) pause();
    setReviewOpen(true);
  }, [isPaused, pause]);

  const handleCloseReview = useCallback(() => {
    setReviewOpen(false);
    if (!wasPausedBeforeReviewRef.current) resume();
  }, [resume]);

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
            {hasNoTimer ? formatTime(elapsedMs) : formatTime(remainingMs ?? 0)}
          </div>
          <div className={styles.label}>
            {hasNoTimer ? 'Elapsed Time' : isPaused ? 'Paused' : 'Remaining'}
          </div>

          {starter && (
            <div className={`${styles.categoryTag} ${styles.starterTag}`}>
              <Play size={14} />
              {starter.name} starts
            </div>
          )}

          {settings.showCategoryToSpies && (
            <div className={styles.categoryTag}>
              <Clock size={14} />
              Category: {state.category}
            </div>
          )}

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
            <Button variant="secondary" onClick={handleOpenReview}>
              <Eye size={18} />
              Show My Card
            </Button>
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

      <RoleReviewModal
        open={reviewOpen}
        players={state.players}
        secretWord={state.secretWord}
        category={state.category}
        showCategoryToSpies={settings.showCategoryToSpies}
        onClose={handleCloseReview}
      />
    </div>
  );
}
