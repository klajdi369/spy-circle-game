import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GameProvider } from '../../hooks/gameProvider';
import { ResultsScreen } from '../../components/game/ResultsScreen';

// We can't easily set game state from outside the provider for the ResultsScreen,
// but we can render it and verify the component structure exists.
// A more complete test would use the dispatch to set state.

beforeEach(() => {
  localStorage.clear();
  localStorage.setItem(
    'spy-circle-word-library',
    JSON.stringify({
      version: 1,
      categories: [
        { id: 'cat1', name: 'Test', enabled: true, isPredefined: true, originalWords: ['Dog'], words: ['Dog'] },
      ],
    }),
  );
  localStorage.setItem(
    'spy-circle-settings',
    JSON.stringify({ showCategoryToSpies: false, sound: true, vibration: true, theme: 'dark', preventScreenSleep: true, confirmBeforeLeaving: true, lastTimerDuration: 300 }),
  );
});

describe('ResultsScreen', () => {
  it('renders results structure', () => {
    render(
      <GameProvider>
        <ResultsScreen />
      </GameProvider>,
    );
    // The component should render something (even if game state is initial)
    expect(screen.getByText('Results')).toBeInTheDocument();
  });
});
