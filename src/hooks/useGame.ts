import { createContext, useContext, type Dispatch } from 'react';
import type { GameState, GameAction, GameConfig, Player } from '../types/game';

export interface GameContextValue {
  state: GameState;
  dispatch: Dispatch<GameAction>;
  startGame: (config: GameConfig, secretWord: string, category: string, players: Player[]) => void;
  playAgain: (config: GameConfig, secretWord: string, category: string, players: Player[]) => void;
}

export const GameContext = createContext<GameContextValue | null>(null);

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}
