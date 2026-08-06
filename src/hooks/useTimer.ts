import { useState, useRef, useCallback, useEffect } from 'react';
import {
  createTimerState,
  computeTimerDisplay,
  pauseTimer as pauseTimerFn,
  resumeTimer as resumeTimerFn,
  addTime as addTimeFn,
} from '../logic/timer';

interface TimerReturn {
  remainingMs: number | null;
  elapsedMs: number;
  totalMs: number | null;
  isExpired: boolean;
  isPaused: boolean;
  isRunning: boolean;
  pause: () => void;
  resume: () => void;
  addTime: (seconds: number) => void;
  reset: (totalSeconds: number | null) => void;
}

export function useTimer(initialTotalSeconds: number | null): TimerReturn {
  const stateRef = useRef(createTimerState(initialTotalSeconds));
  const [display, setDisplay] = useState(() =>
    computeTimerDisplay(stateRef.current, Date.now()),
  );
  const [isRunning, setIsRunning] = useState(true);
  const rafRef = useRef<number>(0);

  const tick = useCallback(() => {
    const now = Date.now();
    const result = computeTimerDisplay(stateRef.current, now);
    setDisplay(result);

    if (result.isExpired) {
      setIsRunning(false);
      stateRef.current = { ...stateRef.current, isPaused: true, pausedAtMs: stateRef.current.totalSeconds! * 1000 };
    } else {
      rafRef.current = requestAnimationFrame(tick);
    }
  }, []);

  useEffect(() => {
    if (isRunning) {
      rafRef.current = requestAnimationFrame(tick);
    }
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isRunning, tick]);

  // Handle visibility change (tab backgrounding)
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && isRunning) {
        // Recompute on resume from background
        const now = Date.now();
        setDisplay(computeTimerDisplay(stateRef.current, now));
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [isRunning]);

  const pause = useCallback(() => {
    stateRef.current = pauseTimerFn(stateRef.current);
    setIsRunning(false);
  }, []);

  const resume = useCallback(() => {
    stateRef.current = resumeTimerFn(stateRef.current);
    setIsRunning(true);
  }, []);

  const addTime = useCallback((seconds: number) => {
    stateRef.current = addTimeFn(stateRef.current, seconds);
    // Recompute immediately
    setDisplay(computeTimerDisplay(stateRef.current, Date.now()));
  }, []);

  const reset = useCallback((totalSeconds: number | null) => {
    stateRef.current = createTimerState(totalSeconds);
    setIsRunning(true);
    setDisplay(computeTimerDisplay(stateRef.current, Date.now()));
  }, []);

  const totalMs = stateRef.current.totalSeconds !== null
    ? stateRef.current.totalSeconds * 1000
    : null;

  return {
    remainingMs: display.remainingMs,
    elapsedMs: display.elapsedMs,
    totalMs,
    isExpired: display.isExpired,
    isPaused: stateRef.current.isPaused,
    isRunning,
    pause,
    resume,
    addTime,
    reset,
  };
}
