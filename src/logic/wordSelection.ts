import type { Category } from '../types/words';
import { pickRandom } from './random';

export interface WordChoice {
  category: Category;
  word: string;
}

/** Build one flat pool where every enabled word entry has equal weight. */
export function buildWordPool(categories: Category[]): WordChoice[] {
  return categories.filter((category) => category.enabled).flatMap((category) =>
    category.words
      .filter((word) => word.trim().length > 0)
      .map((word) => ({ category, word })),
  );
}

/** Independently select one word, with replacement between rounds. */
export function pickRandomWord(categories: Category[]): WordChoice | undefined {
  return pickRandom(buildWordPool(categories));
}
