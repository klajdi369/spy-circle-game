import type { GameState, GameAction, GamePhase, GameConfig, Player } from '../types/game';
import { VALID_TRANSITIONS } from '../types/game';

export const initialState: GameState = {
  phase: 'setup',
  players: [],
  secretWord: '',
  category: '',
  categoryId: '',
  currentPlayerIndex: 0,
  spyCount: 0,
  timerDuration: null,
  config: {
    playerCount: 4,
    spyCount: 1,
    timerDuration: 300,
    categoryId: '',
    usePlayerNames: false,
    playerNames: [],
  },
};

function isValidTransition(from: GamePhase, to: GamePhase): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}

interface RoundPayload {
  config: GameConfig;
  secretWord: string;
  category: string;
  players: Player[];
}

/** Begin a fresh round: same shape for START_GAME and PLAY_AGAIN. */
function startRound(state: GameState, round: RoundPayload): GameState {
  return {
    ...state,
    phase: 'handoff',
    config: round.config,
    players: round.players,
    secretWord: round.secretWord,
    category: round.category,
    categoryId: round.config.categoryId,
    spyCount: round.config.spyCount,
    timerDuration: round.config.timerDuration,
    currentPlayerIndex: 0,
  };
}

/** Back to the setup screen, keeping the last used config. */
function toSetup(state: GameState): GameState {
  return { ...initialState, config: state.config };
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'START_GAME': {
      if (!isValidTransition(state.phase, 'handoff')) return state;
      return startRound(state, action);
    }

    case 'SHOW_HANDOFF': {
      if (!isValidTransition(state.phase, 'concealed')) return state;
      return { ...state, phase: 'concealed' };
    }

    case 'REVEAL_ROLE': {
      if (!isValidTransition(state.phase, 'revealed')) return state;
      return { ...state, phase: 'revealed' };
    }

    case 'HIDE_ROLE': {
      // Hiding a role goes straight to the next player (or to "ready" after the last one).
      if (!isValidTransition(state.phase, 'handoff') && !isValidTransition(state.phase, 'ready')) return state;
      const nextIndex = state.currentPlayerIndex + 1;
      if (nextIndex >= state.players.length) {
        return { ...state, phase: 'ready' };
      }
      return { ...state, phase: 'handoff', currentPlayerIndex: nextIndex };
    }

    case 'START_DISCUSSION': {
      if (!isValidTransition(state.phase, 'discussion')) return state;
      return { ...state, phase: 'discussion' };
    }

    case 'END_DISCUSSION': {
      if (!isValidTransition(state.phase, 'finished')) return state;
      return { ...state, phase: 'finished' };
    }

    case 'SHOW_RESULTS': {
      if (!isValidTransition(state.phase, 'results')) return state;
      return { ...state, phase: 'results' };
    }

    case 'PLAY_AGAIN': {
      if (!isValidTransition(state.phase, 'handoff')) return state;
      return startRound(state, action);
    }

    case 'NEW_SETUP': {
      if (!isValidTransition(state.phase, 'setup')) return state;
      return toSetup(state);
    }

    case 'RETURN_HOME': {
      return toSetup(state);
    }

    default:
      return state;
  }
}
