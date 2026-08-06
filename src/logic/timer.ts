export interface TimerState {
  totalSeconds: number | null; // null = no timer (stopwatch mode)
  elapsedMs: number;
  isPaused: boolean;
  startTimestamp: number;
  pausedAtMs: number;
}

export function createTimerState(totalSeconds: number | null): TimerState {
  return {
    totalSeconds,
    elapsedMs: 0,
    isPaused: false,
    startTimestamp: Date.now(),
    pausedAtMs: 0,
  };
}

export function computeTimerDisplay(state: TimerState, now: number): {
  remainingMs: number | null;
  elapsedMs: number;
  isExpired: boolean;
} {
  const elapsedMs = state.isPaused
    ? state.pausedAtMs
    : state.pausedAtMs + (now - state.startTimestamp);

  if (state.totalSeconds === null) {
    return { remainingMs: null, elapsedMs, isExpired: false };
  }

  const remainingMs = Math.max(0, state.totalSeconds * 1000 - elapsedMs);
  return { remainingMs, elapsedMs, isExpired: remainingMs <= 0 };
}

export function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function formatElapsed(ms: number): string {
  return formatTime(ms);
}

export function pauseTimer(state: TimerState): TimerState {
  if (state.isPaused) return state;
  const now = Date.now();
  return {
    ...state,
    isPaused: true,
    pausedAtMs: state.pausedAtMs + (now - state.startTimestamp),
  };
}

export function resumeTimer(state: TimerState): TimerState {
  if (!state.isPaused) return state;
  return {
    ...state,
    isPaused: false,
    startTimestamp: Date.now(),
  };
}

export function addTime(state: TimerState, addedSeconds: number): TimerState {
  return {
    ...state,
    totalSeconds: state.totalSeconds !== null ? state.totalSeconds + addedSeconds : addedSeconds,
  };
}
