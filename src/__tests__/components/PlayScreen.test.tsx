import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GameProvider } from '../../hooks/gameProvider';
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

  it('does not render a category picker — categories are managed in the Word Library', () => {
    renderPlayScreen();
    expect(screen.queryByText('All Categories')).not.toBeInTheDocument();
    expect(screen.queryByRole('combobox', { name: 'Word category' })).not.toBeInTheDocument();
  });

  it('disables Start Game and warns when no usable words exist', () => {
    localStorage.setItem(
      'spy-circle-word-library',
      JSON.stringify({ version: 1, categories: [] }),
    );
    renderPlayScreen();
    expect(screen.getByText(/No usable words available/)).toBeInTheDocument();
    expect(screen.getByText('Start Game')).toBeDisabled();
  });

  it('renders the player names row with the default summary', () => {
    renderPlayScreen();
    expect(
      screen.getByRole('button', { name: 'Player names: Default names' }),
    ).toBeInTheDocument();
  });

  it('does not show name inputs on the main screen', () => {
    renderPlayScreen();
    expect(screen.queryByLabelText('Player 1 name')).not.toBeInTheDocument();
  });

  it('opens the player names modal from the row', async () => {
    const user = userEvent.setup();
    renderPlayScreen();
    await user.click(screen.getByRole('button', { name: /Player names/ }));
    const dialog = screen.getByRole('dialog', { name: 'Player Names' });
    // Names off by default: hint shown, inputs hidden
    expect(within(dialog).getByText(/Default names/)).toBeInTheDocument();
    expect(screen.queryByLabelText('Player 1 name')).not.toBeInTheDocument();
  });

  it('reveals name inputs when custom names are enabled in the modal', async () => {
    const user = userEvent.setup();
    renderPlayScreen();
    await user.click(screen.getByRole('button', { name: /Player names/ }));
    await user.click(screen.getByRole('checkbox', { name: 'Use custom names' }));
    expect(screen.getByLabelText('Player 1 name')).toBeInTheDocument();
    expect(screen.getByLabelText('Player 2 name')).toBeInTheDocument();
    expect(screen.getByLabelText('Player 3 name')).toBeInTheDocument();
    // The row on the main screen reflects the new state (fields pre-fill
    // with default names)
    expect(
      screen.getByRole('button', { name: 'Player names: Player 1, Player 2, +2 more' }),
    ).toBeInTheDocument();
  });

  it('closes the player names modal via Done', async () => {
    const user = userEvent.setup();
    renderPlayScreen();
    await user.click(screen.getByRole('button', { name: /Player names/ }));
    await user.click(screen.getByText('Done'));
    expect(screen.queryByRole('dialog', { name: 'Player Names' })).not.toBeInTheDocument();
  });
});
