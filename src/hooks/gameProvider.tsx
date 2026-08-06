import { useReducer, useCallback } from 'react';
import type { GameConfig, Player } from '../types/game';
import { gameReducer, initialState } from '../logic/gameState';
import { GameContext } from './useGame';

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
