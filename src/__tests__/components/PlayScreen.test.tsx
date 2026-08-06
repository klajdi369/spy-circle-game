import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GameProvider } from '../../hooks/useGame';
import { PlayScreen } from '../../screens/PlayScreen';

// Mock localStorage
beforeEach(() => {
  localStorage.clear();
  // Seed word library so the screen doesn't show "no words" error
  const lib = {
    version: 1,
    categories: [
      {
        id: 'cat1',
        name: 'Test Category',
        enabled: true,
        isPredefined: true,
        originalWords: ['Dog', 'Cat'],
        words: ['Dog', 'Cat'],
      },
    ],
  };
  localStorage.setItem('spy-circle-word-library', JSON.stringify(lib));
  localStorage.setItem(
    'spy-circle-settings',
    JSON.stringify({ showCategoryToSpies: false, sound: true, vibration: true, theme: 'dark', preventScreenSleep: true, confirmBeforeLeaving: true, lastTimerDuration: 300 }),
  );
});

function renderPlayScreen() {
  return render(
    <GameProvider>
      <PlayScreen />
    </GameProvider>,
  );
}

describe('PlayScreen', () => {
  it('renders the game title', () => {
    renderPlayScreen();
    expect(screen.getByText('Spy Circle')).toBeInTheDocument();
  });

  it('renders Start Game button', () => {
    renderPlayScreen();
    expect(screen.getByText('Start Game')).toBeInTheDocument();
  });

  it('renders player and spy controls', () => {
    renderPlayScreen();
    const playersLabels = screen.getAllByText('Players');
    expect(playersLabels.length).toBeGreaterThan(0);
    expect(screen.getByText('Spies')).toBeInTheDocument();
  });

  it('renders timer options', () => {
    renderPlayScreen();
    expect(screen.getByText('1 min')).toBeInTheDocument();
    expect(screen.getByText('5 min')).toBeInTheDocument();
    expect(screen.getByText('None')).toBeInTheDocument();
  });

  it('renders category selection', () => {
    renderPlayScreen();
    expect(screen.getByText('All Categories')).toBeInTheDocument();
    expect(screen.getByText(/Test Category/)).toBeInTheDocument();
  });

  it('renders player name toggle', () => {
    renderPlayScreen();
    expect(screen.getByText('Enter player names')).toBeInTheDocument();
  });
});
