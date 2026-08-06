import { useEffect } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GameProvider, useGame } from '../../hooks/useGame';
import { RoleCardConcealed, RoleCardRevealed } from '../../components/game/RoleCard';
import type { GameConfig, Player } from '../../types/game';

const config: GameConfig = {
  playerCount: 2,
  spyCount: 1,
  timerDuration: 300,
  categoryId: 'cat1',
  usePlayerNames: false,
  playerNames: [],
};

const players: Player[] = [
  { id: 0, name: 'Player 1', isSpy: false },
  { id: 1, name: 'Player 2', isSpy: true },
];

/** Drives the game to the concealed card (and on to the next player's card). */
function Harness() {
  const { state, dispatch } = useGame();

  useEffect(() => {
    if (state.phase === 'setup') {
      dispatch({ type: 'START_GAME', config, secretWord: 'Dog', category: 'Animals', players });
    } else if (state.phase === 'handoff') {
      dispatch({ type: 'SHOW_HANDOFF' });
    }
  }, [state.phase, dispatch]);

  return (
    <div>
      <span data-testid="phase">{state.phase}</span>
      <span data-testid="index">{state.currentPlayerIndex}</span>
      {state.phase === 'concealed' && <RoleCardConcealed />}
      {state.phase === 'revealed' && <RoleCardRevealed />}
    </div>
  );
}

function renderHarness() {
  render(
    <GameProvider>
      <Harness />
    </GameProvider>,
  );
}

beforeEach(() => {
  localStorage.clear();
});

describe('RoleCard tap flow', () => {
  it('reveals the role with a single tap', async () => {
    const user = userEvent.setup();
    renderHarness();
    expect(screen.getByTestId('phase')).toHaveTextContent('concealed');
    expect(screen.queryByText('Dog')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /reveal/i }));

    expect(screen.getByTestId('phase')).toHaveTextContent('revealed');
    expect(screen.getByText('Dog')).toBeInTheDocument();
    expect(screen.getByText('Your Secret Word')).toBeInTheDocument();
  });

  it('hides on a second tap and advances to the next player', async () => {
    const nowSpy = vi.spyOn(Date, 'now').mockReturnValue(0);
    const user = userEvent.setup();
    try {
      renderHarness();
      await user.click(screen.getByRole('button', { name: /reveal/i }));
      nowSpy.mockReturnValue(1000);

      await user.click(screen.getByRole('button', { name: /hide/i }));

      // Hiding advances straight to the next player's concealed card
      expect(screen.getByTestId('phase')).toHaveTextContent('concealed');
      expect(screen.getByTestId('index')).toHaveTextContent('1');
      expect(screen.queryByText('Dog')).not.toBeInTheDocument();
    } finally {
      nowSpy.mockRestore();
    }
  });

  it('ignores a quick second tap right after the reveal', async () => {
    const nowSpy = vi.spyOn(Date, 'now').mockReturnValue(0);
    const user = userEvent.setup();
    try {
      renderHarness();
      await user.click(screen.getByRole('button', { name: /reveal/i }));

      // Double-tap: the second tap lands within the guard window and is ignored
      await user.click(screen.getByRole('button', { name: /hide/i }));
      expect(screen.getByTestId('phase')).toHaveTextContent('revealed');

      nowSpy.mockReturnValue(700);
      await user.click(screen.getByRole('button', { name: /hide/i }));
      expect(screen.getByTestId('phase')).toHaveTextContent('concealed');
      expect(screen.getByTestId('index')).toHaveTextContent('1');
    } finally {
      nowSpy.mockRestore();
    }
  });

  it('shows the spy message for a spy player, without the word', async () => {
    const nowSpy = vi.spyOn(Date, 'now').mockReturnValue(0);
    const user = userEvent.setup();
    try {
      renderHarness();
      await user.click(screen.getByRole('button', { name: /reveal/i }));
      nowSpy.mockReturnValue(1000);
      await user.click(screen.getByRole('button', { name: /hide/i }));
      expect(screen.getByTestId('index')).toHaveTextContent('1');

      await user.click(screen.getByRole('button', { name: /reveal/i }));

      expect(screen.getByText('You are a spy')).toBeInTheDocument();
      expect(screen.queryByText('Dog')).not.toBeInTheDocument();
    } finally {
      nowSpy.mockRestore();
    }
  });
});
