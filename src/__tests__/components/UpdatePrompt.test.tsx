import { act, fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { RegisterSWOptions } from 'virtual:pwa-register/react';
import { UpdatePrompt } from '../../components/shared/UpdatePrompt';

const pwaMock = vi.hoisted(() => ({
  needRefresh: false,
  options: undefined as RegisterSWOptions | undefined,
  updateServiceWorker: vi.fn<() => Promise<void>>(),
}));

vi.mock('virtual:pwa-register/react', () => ({
  useRegisterSW: (options?: RegisterSWOptions) => {
    pwaMock.options = options;
    return {
      needRefresh: [pwaMock.needRefresh, vi.fn()],
      offlineReady: [false, vi.fn()],
      updateServiceWorker: pwaMock.updateServiceWorker,
    };
  },
}));

beforeEach(() => {
  pwaMock.needRefresh = false;
  pwaMock.options = undefined;
  pwaMock.updateServiceWorker.mockReset();
  pwaMock.updateServiceWorker.mockResolvedValue();
});

describe('UpdatePrompt', () => {
  it('checks for a new service worker when the app regains focus', () => {
    const update = vi.fn<() => Promise<void>>().mockResolvedValue();
    render(<UpdatePrompt />);

    act(() => {
      pwaMock.options?.onRegisteredSW?.(
        '/sw.js',
        { update } as unknown as ServiceWorkerRegistration,
      );
    });
    fireEvent.focus(window);

    expect(update).toHaveBeenCalledOnce();
  });

  it('activates a waiting worker from the update button', () => {
    pwaMock.needRefresh = true;
    render(<UpdatePrompt />);

    fireEvent.click(screen.getByRole('button', { name: 'Update' }));

    expect(pwaMock.updateServiceWorker).toHaveBeenCalledOnce();
    expect(screen.getByRole('button', { name: 'Updating…' })).toBeDisabled();
  });
});
