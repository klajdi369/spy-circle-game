import { describe, it, expect } from 'vitest';
import { gameReducer, initialState } from '../../logic/gameState';
import type { GameAction, GameConfig, GameState, Player } from '../../types/game';

function startedState(overrides: Partial<GameState> = {}): GameState {
  const config: GameConfig = {
    playerCount: 4,
    spyCount: 1,
    timerDuration: 300,
    categoryId: 'cat1',
    usePlayerNames: false,
    playerNames: [],
  };
  const players: Player[] = [
    { id: 0, name: 'Player 1', isSpy: true },
    { id: 1, name: 'Player 2', isSpy: false },
    { id: 2, name: 'Player 3', isSpy: false },
    { id: 3, name: 'Player 4', isSpy: false },
  ];
  return {
    ...initialState,
    phase: 'handoff',
    config,
    players,
    secretWord: 'Dog',
    category: 'Animals',
    categoryId: 'cat1',
    spyCount: 1,
    timerDuration: 300,
    currentPlayerIndex: 0,
    ...overrides,
  };
}

function dispatch(state: GameState, action: GameAction): GameState {
  return gameReducer(state, action);
}

describe('gameReducer state machine', () => {
  it('starts a game from setup', () => {
    const config: GameConfig = {
      playerCount: 4, spyCount: 1, timerDuration: 300, categoryId: 'c1',
      usePlayerNames: false, playerNames: [],
    };
    const players: Player[] = [
      { id: 0, name: 'Player 1', isSpy: true },
      { id: 1, name: 'Player 2', isSpy: false },
      { id: 2, name: 'Player 3', isSpy: false },
      { id: 3, name: 'Player 4', isSpy: false },
    ];
    const state = dispatch(initialState, {
      type: 'START_GAME', config, secretWord: 'Cat', category: 'Animals', players,
    });
    expect(state.phase).toBe('handoff');
    expect(state.secretWord).toBe('Cat');
    expect(state.players).toHaveLength(4);
  });

  it('walks through the full handoff flow', () => {
    let state = startedState();
    // handoff -> concealed -> revealed -> handoff (next player) on hide
    state = dispatch(state, { type: 'SHOW_HANDOFF' });
    expect(state.phase).toBe('concealed');
    state = dispatch(state, { type: 'REVEAL_ROLE' });
    expect(state.phase).toBe('revealed');
    state = dispatch(state, { type: 'HIDE_ROLE' });
    expect(state.phase).toBe('handoff');
    expect(state.currentPlayerIndex).toBe(1);
  });

  it('hiding the last player\'s role moves straight to ready', () => {
    let state = startedState({ currentPlayerIndex: 3 });
    state = dispatch(state, { type: 'SHOW_HANDOFF' });
    state = dispatch(state, { type: 'REVEAL_ROLE' });
    state = dispatch(state, { type: 'HIDE_ROLE' });
    expect(state.phase).toBe('ready');
  });

  it('rejects HIDE_ROLE from phases other than revealed', () => {
    const state = startedState({ phase: 'handoff' });
    expect(dispatch(state, { type: 'HIDE_ROLE' }).phase).toBe('handoff');
  });

  it('ends discussion and reveals results in order', () => {
    let state = startedState({ phase: 'discussion' });
    state = dispatch(state, { type: 'END_DISCUSSION' });
    expect(state.phase).toBe('finished');
    state = dispatch(state, { type: 'SHOW_RESULTS' });
    expect(state.phase).toBe('results');
  });

  it('rejects SHOW_RESULTS directly from discussion', () => {
    const state = startedState({ phase: 'discussion' });
    const result = dispatch(state, { type: 'SHOW_RESULTS' });
    expect(result.phase).toBe('discussion');
  });

  it('rejects impossible transitions', () => {
    // START_GAME from mid-game is a no-op
    const state = startedState({ phase: 'discussion' });
    expect(dispatch(state, { type: 'NEW_SETUP' }).phase).toBe('discussion');
    expect(dispatch(state, { type: 'REVEAL_ROLE' }).phase).toBe('discussion');
  });

  it('play again resets to handoff with fresh players', () => {
    let state = startedState({ phase: 'results' });
    const players: Player[] = [
      { id: 0, name: 'Player 1', isSpy: false },
      { id: 1, name: 'Player 2', isSpy: true },
      { id: 2, name: 'Player 3', isSpy: false },
      { id: 3, name: 'Player 4', isSpy: false },
    ];
    state = dispatch(state, {
      type: 'PLAY_AGAIN', config: state.config, secretWord: 'Fish', category: 'Food', players,
    });
    expect(state.phase).toBe('handoff');
    expect(state.currentPlayerIndex).toBe(0);
    expect(state.secretWord).toBe('Fish');
    expect(state.players[1].isSpy).toBe(true);
  });

  it('new setup returns to setup phase', () => {
    const state = dispatch(startedState({ phase: 'results' }), { type: 'NEW_SETUP' });
    expect(state.phase).toBe('setup');
  });
});
