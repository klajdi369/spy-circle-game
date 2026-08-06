import { createContext, useContext, useReducer, useCallback, type Dispatch } from 'react';
import type { GameState, GameAction, GamePhase, GameConfig, Player } from '../types/game';
import { VALID_TRANSITIONS } from '../types/game';

const initialState: GameState = {
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

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'START_GAME': {
      if (!isValidTransition(state.phase, 'handoff')) return state;
      return {
        ...state,
        phase: 'handoff',
        config: action.config,
        players: action.players,
        secretWord: action.secretWord,
        category: action.category,
        categoryId: action.config.categoryId,
        spyCount: action.config.spyCount,
        timerDuration: action.config.timerDuration,
        currentPlayerIndex: 0,
      };
    }

    case 'SHOW_HANDOFF': {
      if (!isValidTransition(state.phase, 'concealed')) return state;
      return { ...state, phase: 'concealed' };
    }

    case 'READY_TO_REVEAL': {
      // valid from concealed
      if (state.phase !== 'concealed') return state;
      return state;
    }

    case 'REVEAL_ROLE': {
      if (!isValidTransition(state.phase, 'revealed')) return state;
      return { ...state, phase: 'revealed' };
    }

    case 'HIDE_ROLE': {
      if (!isValidTransition(state.phase, 'transition')) return state;
      return { ...state, phase: 'transition' };
    }

    case 'NEXT_PLAYER': {
      if (!isValidTransition(state.phase, 'handoff')) return state;
      const nextIndex = state.currentPlayerIndex + 1;
      if (nextIndex >= state.players.length) {
        return { ...state, phase: 'ready' };
      }
      return { ...state, phase: 'handoff', currentPlayerIndex: nextIndex };
    }

    case 'ALL_PLAYERS_DONE': {
      if (!isValidTransition(state.phase, 'ready')) return state;
      return { ...state, phase: 'ready' };
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
      return {
        ...state,
        phase: 'handoff',
        config: action.config,
        players: action.players,
        secretWord: action.secretWord,
        category: action.category,
        categoryId: action.config.categoryId,
        spyCount: action.config.spyCount,
        timerDuration: action.config.timerDuration,
        currentPlayerIndex: 0,
      };
    }

    case 'NEW_SETUP': {
      if (!isValidTransition(state.phase, 'setup')) return state;
      return { ...initialState, config: state.config };
    }

    case 'RETURN_HOME': {
      return { ...initialState, config: state.config };
    }

    default:
      return state;
  }
}

interface GameContextValue {
  state: GameState;
  dispatch: Dispatch<GameAction>;
  startGame: (config: GameConfig, secretWord: string, category: string, players: Player[]) => void;
  playAgain: (config: GameConfig, secretWord: string, category: string, players: Player[]) => void;
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  const startGame = useCallback(
    (config: GameConfig, secretWord: string, category: string, players: Player[]) => {
      dispatch({ type: 'START_GAME', config, secretWord, category, players });
    },
    [],
  );

  const playAgain = useCallback(
    (config: GameConfig, secretWord: string, category: string, players: Player[]) => {
      dispatch({ type: 'PLAY_AGAIN', config, secretWord, category, players });
    },
    [],
  );

  return (
    <GameContext.Provider value={{ state, dispatch, startGame, playAgain }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}
