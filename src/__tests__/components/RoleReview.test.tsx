import { useState } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RoleReviewModal } from '../../components/game/RoleReview';
import type { Player } from '../../types/game';

const players: Player[] = [
  { id: 0, name: 'Alice', isSpy: false },
  { id: 1, name: 'Bob', isSpy: true },
];

function renderModal(overrides: Partial<React.ComponentProps<typeof RoleReviewModal>> = {}) {
  return render(
    <RoleReviewModal
      open
      players={players}
      secretWord="Dog"
      category="Animals"
      showCategoryToSpies={false}
      onClose={vi.fn()}
      {...overrides}
    />,
  );
}

describe('RoleReviewModal', () => {
  it('lists every player without revealing any roles', () => {
    renderModal();

    const dialog = screen.getByRole('dialog', { name: "Who's Checking?" });
    expect(dialog).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Alice' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Bob' })).toBeInTheDocument();
    expect(screen.queryByText('Dog')).not.toBeInTheDocument();
    expect(screen.queryByText('You are a spy')).not.toBeInTheDocument();
  });

  it('shows the secret word to a regular player', async () => {
    const user = userEvent.setup();
    renderModal();

    await user.click(screen.getByRole('button', { name: 'Alice' }));

    expect(screen.getByText("Alice's Card")).toBeInTheDocument();
    expect(screen.getByText('Your Secret Word')).toBeInTheDocument();
    expect(screen.getByText('Dog')).toBeInTheDocument();
    expect(screen.getByText('Animals')).toBeInTheDocument();
  });

  it('shows the spy message instead of the word to a spy', async () => {
    const user = userEvent.setup();
    renderModal();

    await user.click(screen.getByRole('button', { name: 'Bob' }));

    expect(screen.getByText('You are a spy')).toBeInTheDocument();
    expect(screen.queryByText('Dog')).not.toBeInTheDocument();
    expect(screen.queryByText(/Category:/)).not.toBeInTheDocument();
  });

  it('shows the category to a spy when the setting is enabled', async () => {
    const user = userEvent.setup();
    renderModal({ showCategoryToSpies: true });

    await user.click(screen.getByRole('button', { name: 'Bob' }));

    expect(screen.getByText('Category: Animals')).toBeInTheDocument();
    expect(screen.queryByText('Dog')).not.toBeInTheDocument();
  });

  it('returns to the player list when the card is hidden', async () => {
    const user = userEvent.setup();
    renderModal();

    await user.click(screen.getByRole('button', { name: 'Alice' }));
    await user.click(screen.getByRole('button', { name: 'Hide Card' }));

    expect(screen.getByText("Who's Checking?")).toBeInTheDocument();
    expect(screen.queryByText('Dog')).not.toBeInTheDocument();
  });

  it('forgets the selected player after closing and reopening', async () => {
    const user = userEvent.setup();

    function Harness() {
      const [open, setOpen] = useState(true);
      return (
        <>
          <button type="button" onClick={() => setOpen(true)}>
            Reopen
          </button>
          <RoleReviewModal
            open={open}
            players={players}
            secretWord="Dog"
            category="Animals"
            showCategoryToSpies={false}
            onClose={() => setOpen(false)}
          />
        </>
      );
    }

    render(<Harness />);

    await user.click(screen.getByRole('button', { name: 'Alice' }));
    expect(screen.getByText('Dog')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Close' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Reopen' }));
    expect(screen.getByText("Who's Checking?")).toBeInTheDocument();
    expect(screen.queryByText('Dog')).not.toBeInTheDocument();
  });
});
