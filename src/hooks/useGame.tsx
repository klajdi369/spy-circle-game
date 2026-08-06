import { createContext, useContext, useReducer, useCallback, type Dispatch } from 'react';
import type { GameState, GameAction, GameConfig, Player } from '../types/game';
import { gameReducer, initialState } from '../logic/gameState';

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
