export type GamePhase =
  | 'setup'
  | 'handoff'
  | 'concealed'
  | 'revealed'
  | 'transition'
  | 'ready'
  | 'discussion'
  | 'finished'
  | 'results';

export interface Player {
  id: number;
  name: string;
  isSpy: boolean;
}

export interface GameConfig {
  playerCount: number;
  spyCount: number;
  timerDuration: number | null;
  categoryId: string;
  usePlayerNames: boolean;
  playerNames: string[];
}

export interface GameState {
  phase: GamePhase;
  players: Player[];
  secretWord: string;
  category: string;
  categoryId: string;
  currentPlayerIndex: number;
  spyCount: number;
  timerDuration: number | null;
  config: GameConfig;
}

export type GameAction =
  | { type: 'START_GAME'; config: GameConfig; secretWord: string; category: string; players: Player[] }
  | { type: 'SHOW_HANDOFF' }
  | { type: 'REVEAL_ROLE' }
  | { type: 'HIDE_ROLE' }
  | { type: 'NEXT_PLAYER' }
  | { type: 'ALL_PLAYERS_DONE' }
  | { type: 'START_DISCUSSION' }
  | { type: 'END_DISCUSSION' }
  | { type: 'SHOW_RESULTS' }
  | { type: 'PLAY_AGAIN'; config: GameConfig; secretWord: string; category: string; players: Player[] }
  | { type: 'NEW_SETUP' }
  | { type: 'RETURN_HOME' };

export const VALID_TRANSITIONS: Record<GamePhase, GamePhase[]> = {
  setup: ['handoff'],
  handoff: ['concealed'],
  concealed: ['revealed'],
  revealed: ['transition'],
  transition: ['handoff', 'ready'],
  ready: ['discussion'],
  discussion: ['finished'],
  finished: ['results'],
  results: ['handoff', 'setup'],
};
