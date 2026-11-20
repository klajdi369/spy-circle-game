import { useEffect } from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GameProvider } from '../../hooks/gameProvider';
import { useGame } from '../../hooks/useGame';
import { DiscussionTimer } from '../../components/game/DiscussionTimer';
import type { GameConfig, Player } from '../../types/game';

const config: GameConfig = {
  playerCount: 2,
  spyCount: 1,
  timerDuration: 300,
  categoryId: 'cat1',
  usePlayerNames: true,
  playerNames: ['Alice', 'Bob'],
};

const players: Player[] = [
  { id: 0, name: 'Alice', isSpy: false },
  { id: 1, name: 'Bob', isSpy: true },
];

/** Fast-forwards through the role reveal flow into the discussion phase. */
function Harness() {
  const { state, dispatch } = useGame();

  useEffect(() => {
    if (state.phase === 'setup') {
      dispatch({ type: 'START_GAME', config, secretWord: 'Dog', category: 'Animals', players });
    } else if (state.phase === 'handoff') {
      dispatch({ type: 'SHOW_HANDOFF' });
    } else if (state.phase === 'concealed') {
      dispatch({ type: 'REVEAL_ROLE' });
    } else if (state.phase === 'revealed') {
      dispatch({ type: 'HIDE_ROLE' });
    } else if (state.phase === 'ready') {
      dispatch({ type: 'START_DISCUSSION', startingPlayerIndex: 0 });
    }
  }, [state.phase, dispatch]);

  return state.phase === 'discussion' ? (
    <DiscussionTimer />
  ) : (
    <span data-testid="phase">{state.phase}</span>
  );
}

beforeEach(() => {
  localStorage.clear();
});

describe('DiscussionTimer card review', () => {
  it('reopens a specific player card and reports it in the paused state', async () => {
    const user = userEvent.setup();
    render(
      <GameProvider>
        <Harness />
      </GameProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText('5:00')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Show My Card' }));

    expect(screen.getByRole('dialog', { name: "Who's Checking?" })).toBeInTheDocument();
    // The timer auto-pauses so checking a word doesn't use discussion time.
    expect(screen.getByRole('button', { name: 'Resume' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Alice' }));
    expect(screen.getByText('Dog')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Hide Card' }));
    await user.click(screen.getByRole('button', { name: 'Done' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Pause' })).toBeInTheDocument();
  });

  it('leaves the timer paused after review if it was paused manually', async () => {
    const user = userEvent.setup();
    render(
      <GameProvider>
        <Harness />
      </GameProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText('5:00')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Pause' }));
    await user.click(screen.getByRole('button', { name: 'Show My Card' }));
    await user.click(screen.getByRole('button', { name: 'Done' }));

    expect(screen.getByRole('button', { name: 'Resume' })).toBeInTheDocument();
  });
});
