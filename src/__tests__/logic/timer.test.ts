import { describe, it, expect } from 'vitest';
import {
  createTimerState,
  computeTimerDisplay,
  formatTime,
  formatElapsed,
  pauseTimer,
  resumeTimer,
  addTime as addTimeFn,
} from '../../logic/timer';

describe('formatTime', () => {
  it('formats seconds correctly', () => {
    expect(formatTime(0)).toBe('0:00');
    expect(formatTime(1000)).toBe('0:01');
    expect(formatTime(60000)).toBe('1:00');
    expect(formatTime(65000)).toBe('1:05');
    expect(formatTime(300000)).toBe('5:00');
    expect(formatTime(3599000)).toBe('59:59');
  });
});

describe('formatElapsed', () => {
  it('formats elapsed time', () => {
    expect(formatElapsed(30000)).toBe('0:30');
  });
});

describe('createTimerState', () => {
  it('creates a timer with duration', () => {
    const state = createTimerState(300);
    expect(state.totalSeconds).toBe(300);
    expect(state.isPaused).toBe(false);
  });

  it('creates a stopwatch when null', () => {
    const state = createTimerState(null);
    expect(state.totalSeconds).toBeNull();
  });
});

describe('computeTimerDisplay', () => {
  it('shows remaining time', () => {
    const state = createTimerState(300);
    const now = Date.now();
    const display = computeTimerDisplay(state, now);
    expect(display.remainingMs).not.toBeNull();
    expect(display.remainingMs!).toBeLessThanOrEqual(300000);
    expect(display.isExpired).toBe(false);
  });

  it('expires when time runs out', () => {
    const state = createTimerState(1);
    const now = Date.now() + 2000;
    const display = computeTimerDisplay(state, now);
    expect(display.isExpired).toBe(true);
    expect(display.remainingMs).toBe(0);
  });

  it('stopwatch always returns isExpired false', () => {
    const state = createTimerState(null);
    const display = computeTimerDisplay(state, Date.now());
    expect(display.isExpired).toBe(false);
    expect(display.remainingMs).toBeNull();
  });
});

describe('pauseTimer / resumeTimer', () => {
  it('pauses and resumes', () => {
    let state = createTimerState(300);
    state = pauseTimer(state);
    expect(state.isPaused).toBe(true);
    state = resumeTimer(state);
    expect(state.isPaused).toBe(false);
  });

  it('pause is idempotent', () => {
    let state = createTimerState(300);
    state = pauseTimer(state);
    const pausedAtAfterFirst = state.pausedAtMs;
    state = pauseTimer(state);
    expect(state.pausedAtMs).toBe(pausedAtAfterFirst);
  });
});

describe('addTime', () => {
  it('adds seconds to timer', () => {
    const state = createTimerState(300);
    const updated = addTimeFn(state, 30);
    expect(updated.totalSeconds).toBe(330);
  });

  it('handles null to add seconds', () => {
    const state = createTimerState(null);
    const updated = addTimeFn(state, 60);
    expect(updated.totalSeconds).toBe(60);
  });
});
