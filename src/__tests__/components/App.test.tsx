import { describe, it, expect, beforeEach } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../App';

beforeEach(() => {
  window.history.replaceState(null, '', '/');
  localStorage.clear();
  localStorage.setItem(
    'spy-circle-word-library',
    JSON.stringify({
      version: 1,
      categories: [
        {
          id: 'cat1',
          name: 'Animals',
          enabled: true,
          isPredefined: true,
          originalWords: ['Dog', 'Cat'],
          words: ['Dog', 'Cat'],
        },
      ],
    }),
  );
});

describe('App', () => {
  it('boots to the Play screen', () => {
    render(<App />);
    expect(screen.getByText('Spy Circle')).toBeInTheDocument();
    expect(screen.getByText('Start Game')).toBeInTheDocument();
  });

  it('navigates between all four tabs', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: 'Words' }));
    expect(screen.getByText('Word Library')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'How to Play' }));
    expect(screen.getAllByText('How to Play').length).toBeGreaterThan(0);

    await user.click(screen.getByRole('button', { name: 'Settings' }));
    expect(screen.getAllByText('Settings').length).toBeGreaterThan(0);

    await user.click(screen.getByRole('button', { name: 'Play' }));
    expect(screen.getByText('Start Game')).toBeInTheDocument();
  });

  it('uses one history entry for sub-screens and restores Play on back', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: 'Words' }));
    expect(window.history.state).toMatchObject({ spyCircleView: 'library' });

    const subScreenHistoryLength = window.history.length;
    await user.click(screen.getByRole('button', { name: 'How to Play' }));
    expect(window.history.state).toMatchObject({ spyCircleView: 'help' });
    expect(window.history.length).toBe(subScreenHistoryLength);

    act(() => {
      window.dispatchEvent(
        new PopStateEvent('popstate', { state: { spyCircleView: 'play' } }),
      );
    });
    expect(screen.getByText('Start Game')).toBeInTheDocument();
  });
});
