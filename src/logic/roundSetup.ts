import type { Player } from '../types/game';
import type { Category } from '../types/words';
import { generateDefaultNames } from './playerNames';
import { pickRandomIndices } from './random';
import { pickBalancedSpies } from './spySelection';
import { drawWord, pickRandomWord } from './wordSelection';

export interface RoundSetupInput {
  categories: Category[];
  playerCount: number;
  spyCount: number;
  usePlayerNames: boolean;
  playerNames: string[];
  /** When true, use the word bag and balanced spy selection. */
  balance: boolean;
}

export interface RoundSetupResult {
  category: Category;
  word: string;
  names: string[];
  players: Player[];
}

/**
 * Build everything needed to start a round. Shared by the setup screen and
 * "Play Again" so both paths use the same selection rules.
 */
export function createRoundSetup(input: RoundSetupInput): RoundSetupResult | undefined {
  const names = input.usePlayerNames
    ? input.playerNames
        .slice(0, input.playerCount)
        .map((name, index) => name.trim() || `Player ${index + 1}`)
    : generateDefaultNames(input.playerCount);

  // A stale name list must never leave the round with the wrong seat count.
  while (names.length < input.playerCount) {
    names.push(`Player ${names.length + 1}`);
  }

  const choice = input.balance
    ? drawWord(input.categories)
    : pickRandomWord(input.categories);
  if (!choice) return undefined;

  const spyIndices = input.balance
    ? pickBalancedSpies(names, input.spyCount)
    : pickRandomIndices(names.length, input.spyCount);

  const players: Player[] = names.map((name, index) => ({
    id: index,
    name,
    isSpy: spyIndices.includes(index),
  }));

  return {
    category: choice.category,
    word: choice.word,
    names,
    players,
  };
}
